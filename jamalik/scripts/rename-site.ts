/**
 * تصحيح لمرة واحدة لاسم الموقع المخزّن في قاعدة البيانات.
 *
 * الاسم الظاهر للزائرة يأتي من جدول `settings` لا من الكود، فتغييره في المصدر
 * لا يمسّ قاعدة تعمل منذ نشرٍ سابق. وهذا السكربت يصحّحها.
 *
 * الشرط ضيّق عمدًا: لا يُستبدل إلا الاسم القديم بحرفه. فإن اختارت المحرّرة اسمًا
 * غير هذا من لوحة التحكم فلن يُلمس، ولن يتكرّر التصحيح بعد نجاحه مرة.
 *
 * يمكن حذف هذه الخطوة من `vercel-build` بعد أن تعمل مرة على الإنتاج.
 */

import { PrismaClient } from "@prisma/client";

import { siteConfig } from "../src/config/site";

/** الاسم الذي حمله المشروع قبل نقل مدونة العميلة. */
const PREVIOUS_NAME = "جمالِك";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DIRECT_URL || process.env.DATABASE_URL,
});

async function main() {
  const updated = await prisma.setting.updateMany({
    where: { key: "siteName", value: PREVIOUS_NAME },
    data: { value: siteConfig.name },
  });

  console.log(
    updated.count
      ? `✓ اسم الموقع: «${PREVIOUS_NAME}» ← «${siteConfig.name}»`
      : "↷ اسم الموقع لا يحتاج تصحيحًا.",
  );
}

main()
  .catch((error) => {
    // لا يُفشل البناء: اسم غير محدَّث أهون من نشر متوقّف.
    console.warn("⚠️  تعذّر تصحيح اسم الموقع:", error instanceof Error ? error.message : error);
  })
  .finally(() => prisma.$disconnect());
