import { changeUserRole, toggleUserActive } from "@/app/actions/admin-users";
import { NewUserForm } from "@/components/admin/new-user-form";
import { requireAdmin } from "@/lib/auth/guard";
import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "الحسابات" };

export default async function AdminUsersPage() {
  const admin = await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      _count: { select: { authored: true } },
    },
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-ink">الحسابات</h1>
        <p className="mt-1 text-sm text-ink-muted">
          من يدخل لوحة التحكم وبأي صلاحية. الحسابات تُعطَّل ولا تُحذف، فيبقى أثر من كتب كل مقال.
        </p>
      </header>

      <section className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[44rem] text-sm">
          <thead className="border-b border-line text-ink-muted">
            <tr>
              <th className="px-4 py-3 text-start font-medium">الحساب</th>
              <th className="px-4 py-3 text-start font-medium">الصلاحية</th>
              <th className="px-4 py-3 text-start font-medium">مقالات</th>
              <th className="px-4 py-3 text-start font-medium">آخر دخول</th>
              <th className="px-4 py-3 text-start font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user.id === admin.id;

              return (
                <tr key={user.id} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-3">
                    <span className="block font-semibold text-ink">{user.name}</span>
                    <span className="block text-xs text-ink-muted" dir="ltr">
                      {user.email}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {isSelf ? (
                      // لا يُنزّل المدير رتبة نفسه — قد يبقى الموقع بلا مدير.
                      <span className="text-ink-muted">
                        {user.role === "ADMIN" ? "مديرة" : "محرّرة"} (أنت)
                      </span>
                    ) : (
                      <form action={changeUserRole} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={user.id} />
                        <select
                          name="role"
                          defaultValue={user.role}
                          className="rounded-lg border border-line bg-surface px-2 py-1 text-sm"
                          aria-label={`صلاحية ${user.name}`}
                        >
                          <option value="EDITOR">محرّرة</option>
                          <option value="ADMIN">مديرة</option>
                        </select>
                        <button
                          type="submit"
                          className="rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
                        >
                          حفظ
                        </button>
                      </form>
                    )}
                  </td>

                  <td className="px-4 py-3 text-ink-muted" dir="ltr">
                    {user._count.authored}
                  </td>

                  <td className="px-4 py-3 text-ink-muted">
                    {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "لم تدخل بعد"}
                  </td>

                  <td className="px-4 py-3">
                    {isSelf ? (
                      <span className="text-ink-muted">—</span>
                    ) : (
                      <form action={toggleUserActive}>
                        <input type="hidden" name="id" value={user.id} />
                        <button
                          type="submit"
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                            user.isActive
                              ? "bg-danger-soft text-danger hover:opacity-80"
                              : "bg-success-soft text-success hover:opacity-80"
                          }`}
                        >
                          {user.isActive ? "تعطيل" : "تفعيل"}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="max-w-xl rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-display text-lg font-bold text-ink">حساب جديد</h2>
        <p className="mb-5 mt-1 text-sm text-ink-muted">
          أنشئي الحساب بكلمة مرور مبدئية وسلّميها لصاحبته، ثم تغيّرها هي من «حسابي».
        </p>
        <NewUserForm />
      </section>
    </div>
  );
}
