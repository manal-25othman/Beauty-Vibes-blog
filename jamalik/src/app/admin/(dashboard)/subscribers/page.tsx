import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guard";
import { formatDateTime, formatNumber } from "@/lib/format";
import { unsubscribeSubscriber } from "@/app/actions/admin-settings";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";

const STATUS_LABELS = {
  SUBSCRIBED: "مشترِكة",
  PENDING: "بانتظار التأكيد",
  UNSUBSCRIBED: "ألغت الاشتراك",
} as const;

export default async function AdminSubscribersPage() {
  await requireAdmin();

  const [subscribers, activeCount] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        email: true,
        status: true,
        source: true,
        createdAt: true,
      },
    }),
    prisma.newsletterSubscriber.count({ where: { status: "SUBSCRIBED" } }),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-ink">المشتركون</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {formatNumber(activeCount)} اشتراكًا نشطًا من أصل{" "}
          {formatNumber(subscribers.length)} سجلًا معروضًا.
        </p>
      </header>

      <p className="rounded-xl bg-surface-soft px-4 py-3 text-xs leading-relaxed text-ink-muted">
        قاعدة البيانات هي مصدر الحقيقة لقائمة المشتركين. عند ضبط مزوّد بريد في
        متغيرات البيئة تُزامَن العناوين معه تلقائيًا عند الاشتراك، وفشل المزامنة
        لا يُفقد العنوان.
      </p>

      {subscribers.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center text-sm text-ink-muted">
          لا يوجد مشتركون بعد.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[40rem] border-collapse text-sm">
            <caption className="sr-only">قائمة المشتركين في النشرة البريدية</caption>
            <thead>
              <tr className="border-b border-line bg-surface-soft">
                <th scope="col" className="p-3 text-start font-semibold text-ink">البريد</th>
                <th scope="col" className="p-3 text-start font-semibold text-ink">الحالة</th>
                <th scope="col" className="p-3 text-start font-semibold text-ink">المصدر</th>
                <th scope="col" className="p-3 text-start font-semibold text-ink">تاريخ الاشتراك</th>
                <th scope="col" className="p-3 text-start font-semibold text-ink">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="border-b border-line last:border-0">
                  <td className="p-3 text-ink" dir="ltr">{subscriber.email}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        subscriber.status === "SUBSCRIBED"
                          ? "bg-success-soft text-success"
                          : "bg-surface-soft text-ink-muted"
                      }`}
                    >
                      {STATUS_LABELS[subscriber.status]}
                    </span>
                  </td>
                  <td className="p-3 text-ink-muted">{subscriber.source ?? "—"}</td>
                  <td className="p-3 text-ink-muted">
                    {formatDateTime(subscriber.createdAt)}
                  </td>
                  <td className="p-3">
                    {subscriber.status === "SUBSCRIBED" && (
                      <form action={unsubscribeSubscriber}>
                        <input type="hidden" name="subscriberId" value={subscriber.id} />
                        <ConfirmSubmit
                          variant="neutral"
                          label="إلغاء الاشتراك"
                          message={`سيتوقّف إرسال النشرة إلى ${subscriber.email}. هل تريدين المتابعة؟`}
                        />
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
