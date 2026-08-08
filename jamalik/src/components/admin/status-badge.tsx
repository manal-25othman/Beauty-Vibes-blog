import type { ArticleStatus } from "@prisma/client";
import { formatDateTime } from "@/lib/format";

/**
 * شارة حالة المقال.
 *
 * ملاحظة: المقال المجدول الذي حلّ موعده يصبح ظاهرًا على الموقع فعلًا
 * دون تغيير حالته في قاعدة البيانات، لذلك نعرضه هنا كـ«منشور».
 */
export function StatusBadge({
  status,
  publishedAt,
}: {
  status: ArticleStatus;
  publishedAt: Date | null;
}) {
  const isLive =
    status === "PUBLISHED" ||
    (status === "SCHEDULED" && publishedAt !== null && publishedAt <= new Date());

  if (status === "DRAFT") {
    return (
      <span className="shrink-0 rounded-full bg-surface-soft px-2.5 py-0.5 text-xs font-semibold text-ink-muted">
        مسودّة
      </span>
    );
  }

  if (!isLive) {
    return (
      <span
        className="shrink-0 rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-semibold text-warning"
        title={publishedAt ? `يُنشر في ${formatDateTime(publishedAt)}` : undefined}
      >
        مجدول
      </span>
    );
  }

  return (
    <span className="shrink-0 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success">
      منشور
    </span>
  );
}
