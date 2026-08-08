import { requireUser } from "@/lib/auth/guard";
import { AdminShell } from "@/components/admin/admin-shell";

/**
 * كل صفحات اللوحة ديناميكية: تعرض بيانات لحظية وتخصّ مستخدمًا مسجّلًا،
 * فلا معنى لتوليدها ساكنة ولا لتخزينها مؤقتًا.
 */
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // التحقّق الفعلي من الجلسة — الـ middleware يفحص وجود الكوكي فقط.
  const user = await requireUser();

  return <AdminShell user={user}>{children}</AdminShell>;
}
