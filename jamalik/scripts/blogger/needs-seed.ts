/**
 * هل تحتاج قاعدة البيانات تعبئة أولى؟
 *
 * تُطبع `yes` في حالتين فقط: قاعدة فارغة تمامًا، أو قاعدة ما زالت تحمل المحتوى
 * التجريبي الذي رافق بناء المشروع قبل نقل مدونة العميلة. وما عدا ذلك `no`.
 *
 * الغاية: أن تكتمل هجرة المحتوى من نفسها في أول نشر، دون أن تتحوّل التعبئة إلى
 * خطوة دائمة تعيد كتابة المقالات فوق تعديلات المحرّرة في كل بناء لاحق. الشرط
 * يُلغي نفسه بمجرّد نجاحه: المقال التجريبي يُحذف ضمن التعبئة، فلا يتحقّق ثانيةً.
 *
 * أي عطل في الفحص يُجيب `no` — تخطّي التعبئة أهون من الكتابة فوق محتوى قائم.
 */

import { PrismaClient } from "@prisma/client";

/** مقال من المحتوى التجريبي؛ وجوده يعني أن النقل لم يُطبَّق بعد. */
const DEMO_MARKER = "skincare-routine-for-beginners";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DIRECT_URL || process.env.DATABASE_URL,
});

async function main() {
  const [total, demo] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { slug: DEMO_MARKER } }),
  ]);

  if (total === 0) {
    console.error("قاعدة فارغة — تعبئة أولى.");
    return "yes";
  }
  if (demo > 0) {
    console.error("المحتوى التجريبي ما زال موجودًا — تشغيل هجرة المحتوى.");
    return "yes";
  }
  console.error(`القاعدة تحمل ${total} مقالًا ولا أثر للمحتوى التجريبي.`);
  return "no";
}

main()
  .then((answer) => process.stdout.write(answer))
  .catch((error) => {
    console.error("تعذّر فحص القاعدة:", error instanceof Error ? error.message : error);
    process.stdout.write("no");
  })
  .finally(() => prisma.$disconnect());
