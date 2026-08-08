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

const shouldSeed = process.env.RUN_SEED === "true";

if (!shouldSeed) {
  console.log("↷ تخطّي التعبئة (RUN_SEED غير مضبوط على true).");
  process.exit(0);
}

console.log("▶ RUN_SEED=true — تشغيل التعبئة لمرة واحدة…");

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
  "\n✓ اكتملت التعبئة. احذفي متغيّر RUN_SEED الآن حتى لا تُلغى تعديلاتك التحريرية في النشر القادم.",
);
