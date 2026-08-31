/**
 * تعبئة مشروطة تعمل ضمن بناء Vercel.
 *
 * لماذا مشروطة؟ سكربت التعبئة idempotent (يستخدم upsert)، لكنه **يعيد كتابة**
 * محتوى المقالات إلى نصوصها الأصلية. لو عمل مع كل نشر، لأُلغيت كل تعديلات
 * المحرّرة عند أول إعادة بناء.
 *
 * الاستخدام: عيّني RUN_SEED=true في متغيّرات Vercel قبل أول نشر، ثم
 * **احذفي المتغيّر** بعد نجاحه.
 */

import { spawnSync } from "node:child_process";

/**
 * التعبئة تعمل في حالتين:
 *
 * ١. `RUN_SEED=true` — أمر صريح، يعمل دائمًا.
 * ٢. القاعدة فارغة، أو ما زالت تحمل المحتوى التجريبي السابق لنقل مدونة العميلة.
 *    هذا الشرط يُلغي نفسه بنجاحه — المحتوى التجريبي يُحذف ضمن التعبئة — فلا
 *    تتكرّر ولا تُكتب فوق تعديلات المحرّرة في بناء لاحق.
 */
function shouldSeed() {
  if (process.env.RUN_SEED === "true") {
    console.log("▶ RUN_SEED=true — تعبئة بأمر صريح.");
    return true;
  }

  const probe = spawnSync("npx", ["tsx", "scripts/blogger/needs-seed.ts"], {
    encoding: "utf8",
    env: process.env,
  });

  if (probe.stderr) process.stderr.write(probe.stderr);

  if (probe.status !== 0) {
    console.log("↷ تخطّي التعبئة: تعذّر فحص حالة القاعدة.");
    return false;
  }

  // البحث عن العلامة لا مطابقة المخرجات كاملة: أي سطر إضافي يطبعه npx لا يُفسد
  // القرار. وغياب العلامة (فشل، أو مخرجات غير متوقّعة) يعني «لا تعبّئ».
  if (/NEEDS_SEED=yes/.test(probe.stdout)) {
    console.log("▶ القاعدة تحتاج تعبئة أولى — تشغيلها الآن.");
    return true;
  }

  console.log("↷ تخطّي التعبئة: القاعدة تحمل محتوى منقولًا بالفعل.");
  return false;
}

if (!shouldSeed()) {
  process.exit(0);
}

const result = spawnSync("npx", ["tsx", "prisma/seed.ts"], {
  stdio: "inherit",
  env: process.env,
});

if (result.status !== 0) {
  console.error(
    "\n✗ فشلت التعبئة. البناء متوقّف عمدًا حتى لا يُنشر موقع بقاعدة بيانات ناقصة.\n" +
      "  تحقّقي من DIRECT_URL و SEED_ADMIN_EMAIL و SEED_ADMIN_PASSWORD في إعدادات Vercel.",
  );
  process.exit(result.status ?? 1);
}

console.log(
  "\n✓ اكتملت التعبئة." +
    (process.env.RUN_SEED === "true"
      ? " احذفي متغيّر RUN_SEED الآن حتى لا تُلغى تعديلاتك التحريرية في النشر القادم."
      : " لن تتكرّر تلقائيًا: شرطها لم يعد متحقّقًا."),
);
