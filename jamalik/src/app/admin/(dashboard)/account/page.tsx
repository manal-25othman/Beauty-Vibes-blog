import { requireUser } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import { ChangePasswordForm } from "@/components/admin/change-password-form";

export default async function AdminAccountPage() {
  const user = await requireUser();

  const [record, sessionCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { createdAt: true, lastLoginAt: true },
    }),
    prisma.session.count({ where: { userId: user.id } }),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-ink">حسابي</h1>
        <p className="mt-1 text-sm text-ink-muted">
          بيانات الحساب وتغيير كلمة المرور.
        </p>
      </header>

      <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="font-display text-base font-bold text-ink">البيانات</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-ink-faint">الاسم</dt>
            <dd className="text-sm text-ink">{user.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-faint">البريد الإلكتروني</dt>
            <dd className="text-sm text-ink" dir="ltr">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-faint">الصلاحية</dt>
            <dd className="text-sm text-ink">
              {user.role === "ADMIN" ? "مدير" : "محرّر"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-faint">آخر تسجيل دخول</dt>
            <dd className="text-sm text-ink">
              {record?.lastLoginAt ? formatDateTime(record.lastLoginAt) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-faint">تاريخ الإنشاء</dt>
            <dd className="text-sm text-ink">
              {record?.createdAt ? formatDateTime(record.createdAt) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-faint">الجلسات النشطة</dt>
            <dd className="text-sm text-ink">{sessionCount}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="font-display text-base font-bold text-ink">
          تغيير كلمة المرور
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-ink-faint">
          تغيير كلمة المرور يُنهي كل الجلسات على جميع الأجهزة، وستحتاجين إلى
          تسجيل الدخول من جديد.
        </p>

        <div className="mt-5">
          <ChangePasswordForm />
        </div>
      </section>
    </div>
  );
}
