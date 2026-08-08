import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guard";
import { formatDateTime, formatNumber } from "@/lib/format";
import { deleteMessage, updateMessageStatus } from "@/app/actions/admin-settings";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";

const STATUS_LABELS = {
  NEW: "جديدة",
  READ: "مقروءة",
  ARCHIVED: "مؤرشفة",
} as const;

export default async function AdminMessagesPage() {
  await requireAdmin();

  const messages = await prisma.contactMessage.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  const newCount = messages.filter((message) => message.status === "NEW").length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-ink">الرسائل</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {formatNumber(messages.length)} رسالة، منها {formatNumber(newCount)} جديدة.
        </p>
      </header>

      {messages.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center text-sm text-ink-muted">
          لم تصل أي رسالة بعد.
        </p>
      ) : (
        <ul className="space-y-4">
          {messages.map((message) => (
            <li
              key={message.id}
              className={`rounded-2xl border bg-surface p-5 ${
                message.status === "NEW" ? "border-accent-line" : "border-line"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display text-base font-bold text-ink">
                    {message.subject}
                  </h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    {message.name} —{" "}
                    <a
                      href={`mailto:${message.email}`}
                      dir="ltr"
                      className="text-accent hover:underline"
                    >
                      {message.email}
                    </a>
                  </p>
                  <p className="text-xs text-ink-faint">
                    {formatDateTime(message.createdAt)}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    message.status === "NEW"
                      ? "bg-accent-soft text-accent"
                      : "bg-surface-soft text-ink-muted"
                  }`}
                >
                  {STATUS_LABELS[message.status]}
                </span>
              </div>

              <p className="mt-4 whitespace-pre-wrap border-t border-line pt-4 text-sm leading-relaxed text-ink-soft">
                {message.message}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {message.status !== "READ" && (
                  <form action={updateMessageStatus}>
                    <input type="hidden" name="messageId" value={message.id} />
                    <input type="hidden" name="status" value="READ" />
                    <button
                      type="submit"
                      className="rounded-lg border border-line px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-accent hover:text-accent"
                    >
                      تعليم كمقروءة
                    </button>
                  </form>
                )}

                {message.status !== "ARCHIVED" && (
                  <form action={updateMessageStatus}>
                    <input type="hidden" name="messageId" value={message.id} />
                    <input type="hidden" name="status" value="ARCHIVED" />
                    <button
                      type="submit"
                      className="rounded-lg border border-line px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-accent hover:text-accent"
                    >
                      أرشفة
                    </button>
                  </form>
                )}

                <form action={deleteMessage}>
                  <input type="hidden" name="messageId" value={message.id} />
                  <ConfirmSubmit
                    label="حذف"
                    message="سيُحذف نصّ الرسالة نهائيًا. هل تريدين المتابعة؟"
                  />
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
