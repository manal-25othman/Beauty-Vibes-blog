/**
 * إعادة تعيين كلمة مرور المدير — مخرج الطوارئ الوحيد.
 *
 * لا يوجد في المشروع «نسيت كلمة المرور» عبر البريد، لأن ذلك يستلزم مزوّد بريد
 * وطبقة رموز مؤقتة. فإن ضاعت كلمة مرور المدير الوحيد، لا سبيل للدخول إطلاقًا.
 *
 * الاستخدام: عيّني في متغيّرات المنصّة
 *     RESET_ADMIN_PASSWORD=true
 *     SEED_ADMIN_PASSWORD=<كلمة المرور الجديدة>
 * ثم أعيدي النشر، ثم **احذفي RESET_ADMIN_PASSWORD فورًا**.
 *
 * لماذا لا يعمل تلقائيًا؟ لأنه يمنح الدخول. اشتراط متغيّر صريح يجعله فعلًا
 * مقصودًا لا أثرًا جانبيًا لبناء عابر.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DIRECT_URL || process.env.DATABASE_URL,
});

async function main() {
  if (process.env.RESET_ADMIN_PASSWORD !== "true") {
    console.log("↷ لا إعادة تعيين لكلمة مرور المدير.");
    return;
  }

  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn("⚠️  إعادة التعيين تحتاج SEED_ADMIN_EMAIL و SEED_ADMIN_PASSWORD.");
    return;
  }
  if (password.length < 12) {
    console.warn("⚠️  كلمة المرور الجديدة أقصر من ١٢ حرفًا — أُلغيت العملية.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.update({
    where: { email },
    data: { passwordHash, isActive: true, role: "ADMIN" },
    select: { id: true },
  });

  // جلسات قائمة قد تكون بيد من لا نريد — تُنهى كلها مع تغيير كلمة المرور.
  const { count } = await prisma.session.deleteMany({ where: { userId: user.id } });

  console.log(
    `✓ أُعيد تعيين كلمة مرور ${email}، وأُنهيت ${count} جلسة.\n` +
      "  احذفي RESET_ADMIN_PASSWORD الآن.",
  );
}

main()
  .catch((error) => {
    // لا يُفشل البناء: تعذّر إعادة التعيين أهون من نشر متوقّف.
    console.warn("⚠️  تعذّرت إعادة التعيين:", error instanceof Error ? error.message : error);
  })
  .finally(() => prisma.$disconnect());
