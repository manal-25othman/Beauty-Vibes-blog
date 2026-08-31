/**
 * تنزيل صور المقالات المنقولة من Blogger إلى public/ قبل البناء.
 *
 * لماذا وقت البناء؟ لأن الموقع يجب ألّا يعتمد على خوادم Blogger في تقديم صوره
 * للزائرات: الاعتماد الخارجي بطءٌ لا نتحكّم به، وانكسارٌ صامت لو حُذفت المدونة
 * الأصلية. بعد هذه الخطوة تُقدَّم الصور من نطاق الموقع نفسه عبر شبكة Vercel.
 *
 * البناء لا يفشل إذا تعذّر تنزيل صورة: يُطبع تحذير ظاهر ويستمرّ. صورة ناقصة
 * أهون من نشر معطّل — ويمكن رفعها لاحقًا من لوحة التحكم.
 */

import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const MANIFEST = "scripts/blogger/images.json";
const PUBLIC = join(process.cwd(), "public");

/** الصور تُطلب من شبكة عامة: بطء عابر أرجح من عطل دائم، فنعيد المحاولة. */
const ATTEMPTS = 3;
const TIMEOUT_MS = 25_000;
/** ٣٨ طلبًا متتابعًا تُطيل البناء بلا داعٍ؛ والتوازي المفرط يستدعي حظرًا. */
const CONCURRENCY = 6;

if (!existsSync(MANIFEST)) {
  console.log("↷ لا سجلّ صور — تخطّي التنزيل.");
  process.exit(0);
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function download(job) {
  const target = join(PUBLIC, job.local);
  if (existsSync(target)) return { ...job, status: "موجودة" };

  let lastError = "";

  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(job.remote, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { "user-agent": "jamalik-migration/1.0" },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      // صفحة خطأ بترويسة 200 تُحفظ صورةً معطوبة لو لم نتحقّق من النوع.
      const type = response.headers.get("content-type") ?? "";
      if (!type.startsWith("image/")) throw new Error(`نوع غير متوقّع: ${type || "مجهول"}`);

      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.byteLength < 1024) throw new Error(`حجم مريب: ${bytes.byteLength} بايت`);

      mkdirSync(dirname(target), { recursive: true });
      await writeFile(target, bytes);
      return { ...job, status: "نُزّلت", bytes: bytes.byteLength, type };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt < ATTEMPTS) await wait(attempt * 1500);
    }
  }

  return { ...job, status: "فشلت", reason: lastError };
}

const jobs = JSON.parse(readFileSync(MANIFEST, "utf8"));
const results = [];

for (let i = 0; i < jobs.length; i += CONCURRENCY) {
  results.push(...(await Promise.all(jobs.slice(i, i + CONCURRENCY).map(download))));
}

const by = (status) => results.filter((item) => item.status === status);
const failed = by("فشلت");
const fetched = by("نُزّلت");
const megabytes = (fetched.reduce((sum, item) => sum + (item.bytes ?? 0), 0) / 1048576).toFixed(1);

console.log(
  `✓ صور المقالات: ${fetched.length} نُزّلت (${megabytes} ميغابايت)، ` +
    `${by("موجودة").length} موجودة مسبقًا، ${failed.length} فشلت`,
);

if (failed.length) {
  console.warn(
    `\n⚠️  ${failed.length} صورة لم تُنزَّل. صفحاتها تعمل، لكن غلافها لن يظهر.\n` +
      "   المعالجة: أعيدي النشر (قد يكون العطل عابرًا)، أو ارفعي الصورة من لوحة التحكم.",
  );
  for (const item of failed) console.warn(`   ${item.local} — ${item.reason}`);
}
