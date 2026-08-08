import Link from "next/link";

type Props = {
  title: string;
  description?: string;
  moreHref?: string;
  moreLabel?: string;
  /** مستوى العنوان الصحيح دلاليًا حسب موقع القسم في الصفحة. */
  as?: "h2" | "h3";
};

export function SectionHeading({
  title,
  description,
  moreHref,
  moreLabel = "عرض الكل",
  as: Tag = "h2",
}: Props) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
      <div>
        <Tag className="font-display text-2xl font-bold text-ink sm:text-[1.75rem]">
          {title}
        </Tag>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-ink-muted">{description}</p>
        )}
      </div>

      {moreHref && (
        <Link
          href={moreHref}
          className="shrink-0 text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
        >
          {moreLabel}
          <span aria-hidden="true"> ←</span>
        </Link>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
      <p className="font-display text-lg font-bold text-ink">{title}</p>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
