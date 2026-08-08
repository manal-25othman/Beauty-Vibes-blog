/**
 * اختبارات المتصفّح الشاملة لموقع «جمالِك».
 *
 * تتطلّب خادمًا يعمل وقاعدة بيانات معبّأة:
 *   npm run build && npm start
 *   E2E_ADMIN_EMAIL=... E2E_ADMIN_PASSWORD=... node tests/e2e.mjs
 *
 * بيانات الاعتماد تأتي من البيئة فقط — لا تُكتب في الملف.
 * تشمل التغطية: التجاوب على سبعة عروض، بنية الصفحة والوصولية، القوائم والبحث،
 * نماذج الزوار، المصادقة، ودورة إنشاء المقال وحذفه كاملة.
 */
import { chromium } from "playwright";

const BASE = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000";
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? process.env.SEED_ADMIN_EMAIL ?? "";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD ?? "";
const CHROMIUM_PATH = process.env.E2E_CHROMIUM_PATH;
const results = [];
let failures = 0;

function check(name, ok, detail = "") {
  results.push(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures += 1;
}

const VIEWPORTS = [320, 375, 390, 430, 768, 1024, 1440];
const PAGES = [
  "/",
  "/articles",
  "/article/skincare-routine-for-beginners",
  "/category/skin-care",
  "/author/layan-alharbi",
  "/search?q=%D8%A7%D9%84%D8%A8%D8%B4%D8%B1%D8%A9",
  "/about",
  "/contact",
  "/newsletter",
  "/privacy-policy",
];

// executablePath اختياري: Playwright يجد متصفّحه بنفسه عادة، لكن بعض البيئات
// تثبّت Chromium في مسار مخصّص.
const browser = await chromium.launch(
  CHROMIUM_PATH ? { executablePath: CHROMIUM_PATH } : {},
);

const consoleErrors = [];

async function newPage(width, height = 900) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(`${page.url()} :: ${msg.text()}`);
  });
  page.on("pageerror", (err) => consoleErrors.push(`${page.url()} :: ${err.message}`));
  return { context, page };
}

// ---------------------------------------------------------------- 1. التجاوب
for (const width of VIEWPORTS) {
  const { context, page } = await newPage(width);
  let overflowing = [];

  for (const path of PAGES) {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (overflow > 1) overflowing.push(`${path} (+${overflow}px)`);
  }

  check(`لا تمرير أفقي @ ${width}px`, overflowing.length === 0, overflowing.join(", "));
  await context.close();
}

// ------------------------------------------------------- 2. بنية الصفحة والوصولية
{
  const { context, page } = await newPage(1280);

  await page.goto(`${BASE}/article/skincare-routine-for-beginners`, {
    waitUntil: "networkidle",
  });

  check("عنوان H1 واحد فقط", (await page.locator("h1").count()) === 1);
  check("صندوق النصيحة يعرض عنوانًا", (await page.locator(".callout-title").count()) > 0);
  check("فهرس المحتويات ظاهر", (await page.locator("nav[aria-labelledby='toc-heading']").count()) > 0);

  // كل صور المحتوى تحمل نصًا بديلًا (alt موجود ولو فارغًا للزخرفية)
  const imagesWithoutAlt = await page.evaluate(
    () => [...document.querySelectorAll("img")].filter((img) => !img.hasAttribute("alt")).length,
  );
  check("كل الصور تحمل سمة alt", imagesWithoutAlt === 0, `بدون alt: ${imagesWithoutAlt}`);

  // رابط تخطّي المحتوى يعمل بلوحة المفاتيح
  await page.keyboard.press("Tab");
  const skipFocused = await page.evaluate(
    () => document.activeElement?.getAttribute("href") === "#main-content",
  );
  check("رابط تخطّي المحتوى أول عنصر في ترتيب التركيز", skipFocused);

  // التنقّل عبر فهرس المحتويات يصل إلى العنوان فعلًا
  const firstTocHref = await page
    .locator("nav[aria-labelledby='toc-heading'] a")
    .first()
    .getAttribute("href");
  const targetExists = await page.evaluate(
    (href) => Boolean(document.querySelector(`[id="${decodeURIComponent(href.slice(1))}"]`)),
    firstTocHref,
  );
  check("رابط الفهرس يطابق عنوانًا موجودًا", targetExists, firstTocHref ?? "");

  await context.close();
}

// --------------------------------------------------------- 3. قائمة الجوال والبحث
{
  const { context, page } = await newPage(375);
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

  await page.getByRole("button", { name: "فتح القائمة" }).click();
  check("قائمة الجوال تفتح", await page.getByRole("navigation", { name: "قائمة الجوال" }).isVisible());

  await page.keyboard.press("Escape");
  check(
    "Escape يغلق القائمة",
    (await page.getByRole("navigation", { name: "قائمة الجوال" }).count()) === 0,
  );

  await page.getByRole("button", { name: "البحث في الموقع" }).click();
  await page.locator("#header-search").fill("الشعر");
  await page.getByRole("button", { name: "بحث", exact: true }).click();
  await page.waitForURL("**/search**");
  check("البحث من الترويسة ينتقل لصفحة النتائج", page.url().includes("/search?q="));
  check("نتائج البحث ظاهرة", (await page.locator("article").count()) > 0);

  await context.close();
}

// ------------------------------------------------------------ 4. النشرة البريدية
{
  const { context, page } = await newPage(1280);
  const email = `test-${Date.now()}@example.com`;

  await page.goto(`${BASE}/newsletter`, { waitUntil: "networkidle" });
  await page.locator('input[name="email"]').first().fill(email);
  await page.getByRole("button", { name: "اشتركي" }).click();
  await page.waitForTimeout(2500);

  const text = await page.locator("form").first().innerText();
  check("الاشتراك في النشرة ينجح", text.includes("تم تسجيل بريدك"), text.slice(0, 120));

  // بريد غير صالح يجب أن يُرفض برسالة واضحة
  await page.goto(`${BASE}/newsletter`, { waitUntil: "networkidle" });
  await page.locator('input[name="email"]').first().fill("not-an-email");
  await page.getByRole("button", { name: "اشتركي" }).click();
  await page.waitForTimeout(2000);
  const invalidText = await page.locator("form").first().innerText();
  check("بريد غير صالح يُرفض", /صالح|مطلوب/.test(invalidText), invalidText.slice(0, 120));

  await context.close();
}

// -------------------------------------------------------------- 5. نموذج التواصل
{
  const { context, page } = await newPage(1280);
  await page.goto(`${BASE}/contact`, { waitUntil: "networkidle" });

  await page.locator("#contact-name").fill("سارة تجريبية");
  await page.locator("#contact-email").fill(`contact-${Date.now()}@example.com`);
  await page.locator("#contact-subject").fill("ملاحظة على مقال");
  await page
    .locator("#contact-message")
    .fill("هذه رسالة اختبار آلية للتحقق من عمل النموذج بشكل صحيح.");
  await page.getByRole("button", { name: "إرسال الرسالة" }).click();
  await page.waitForTimeout(2500);

  const text = await page.locator("form").first().innerText();
  check("إرسال نموذج التواصل ينجح", text.includes("وصلتنا رسالتك"), text.slice(0, 150));

  await context.close();
}

// ------------------------------------------------------------- 6. لوحة التحكم
// تحتاج بيانات اعتماد؛ تُمرَّر عبر البيئة ولا تُكتب في الملف أبدًا.
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  results.push(
    "SKIP  اختبارات لوحة التحكم — عيّني E2E_ADMIN_EMAIL و E2E_ADMIN_PASSWORD",
  );
} else {
  const { context, page } = await newPage(1440);

  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  check("زائر بلا جلسة يُحوَّل لصفحة الدخول", page.url().includes("/admin/login"));

  // بيانات خاطئة
  await page.locator("#login-email").fill(ADMIN_EMAIL);
  await page.locator("#login-password").fill("definitely-not-the-password-123");
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await page.waitForTimeout(2500);
  check(
    "كلمة مرور خاطئة تُرفض",
    (await page.locator("form:has(#login-email)").innerText()).includes("غير صحيحة"),
  );

  // بيانات صحيحة
  await page.locator("#login-email").fill(ADMIN_EMAIL);
  await page.locator("#login-password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await page.waitForURL("**/admin", { timeout: 15000 });
  check("تسجيل الدخول ينجح", await page.getByRole("heading", { name: "لوحة المعلومات" }).isVisible());

  // إنشاء مقال جديد
  const slug = `test-article-${Date.now()}`;
  await page.goto(`${BASE}/admin/articles/new`, { waitUntil: "networkidle" });

  await page.getByLabel("عنوان المقال").fill("مقال اختباري للتحقق من لوحة التحكم");
  await page.getByLabel("الرابط (slug)").fill(slug);
  await page
    .getByLabel("المقتطف")
    .fill("مقتطف اختباري طويل بما يكفي لتجاوز الحد الأدنى المطلوب في التحقق من صحة المدخلات.");
  await page
    .getByLabel("المحتوى (Markdown)")
    .fill(
      "## القسم الأول\n\n" +
        "نص تجريبي ".repeat(60) +
        "\n\n## القسم الثاني\n\nرابط [داخلي](/article/sunscreen-spf-guide) هنا.\n\n## القسم الثالث\n\nخاتمة.",
    );
  await page.getByLabel("التصنيف").selectOption({ index: 1 });
  await page.getByLabel("الكاتبة").selectOption({ index: 1 });
  await page.getByLabel("الحالة").selectOption("PUBLISHED");

  const scoreBefore = await page.locator("[role='progressbar']").getAttribute("aria-valuenow");
  check("فحص السيو يعرض نتيجة حيّة", scoreBefore !== null, `النتيجة: ${scoreBefore}`);

  await page.getByRole("button", { name: "حفظ المقال" }).click();
  await page.waitForURL("**/admin/articles?saved=1", { timeout: 20000 });
  check(
    "إنشاء مقال من اللوحة ينجح",
    (await page.locator("body").innerText()).includes("مقال اختباري للتحقق"),
  );

  // المقال المنشور يظهر على الموقع العام
  const publicResponse = await page.goto(`${BASE}/article/${slug}`, {
    waitUntil: "networkidle",
  });
  check("المقال الجديد يظهر على الموقع", publicResponse?.status() === 200);

  // حذفه لتنظيف قاعدة البيانات
  await page.goto(`${BASE}/admin/articles?q=${slug}`, { waitUntil: "networkidle" });
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "حذف" }).first().click();
  await page.waitForTimeout(2500);
  check(
    "حذف المقال ينجح",
    !(await page.locator("body").innerText()).includes("مقال اختباري للتحقق"),
  );

  // صفحة الإعدادات
  await page.goto(`${BASE}/admin/settings`, { waitUntil: "networkidle" });
  check("صفحة الإعدادات تفتح", await page.getByRole("heading", { name: "الإعدادات" }).isVisible());

  // معرّف قياس بصيغة خاطئة يجب أن يُرفض
  await page.getByLabel("معرّف القياس").fill("BAD-ID");
  await page.getByRole("button", { name: "حفظ الإعدادات" }).click();
  await page.waitForTimeout(2500);
  check(
    "معرّف GA بصيغة خاطئة يُرفض",
    (await page.locator("form:has([name='gaMeasurementId'])").innerText()).includes("G-XXXXXXXXXX"),
  );

  await context.close();
}

// ----------------------------------------------------------------------- النتائج
await browser.close();

console.log("\n".concat(results.join("\n")));
if (consoleErrors.length > 0) {
  console.log(`\nأخطاء وحدة التحكم (${consoleErrors.length}):`);
  console.log(consoleErrors.slice(0, 10).join("\n"));
}
console.log(`\nالنتيجة: ${results.length - failures}/${results.length} ناجح`);
process.exit(failures > 0 ? 1 : 0);
