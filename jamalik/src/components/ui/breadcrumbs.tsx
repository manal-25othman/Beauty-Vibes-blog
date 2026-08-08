import Link from "next/link";

export type Crumb = { label: string; href: string };

/**
 * مسار التنقّل. العنصر الأخير يمثّل الصفحة الحالية فلا يكون رابطًا،
 * ويحمل aria-current ليعرف القارئ الصوتي موقعه.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="مسار التنقل" className="mb-6">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.href} className="flex items-center gap-2">
              {isLast ? (
                <span aria-current="page" className="text-ink-faint">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="transition-colors hover:text-accent">
                  {item.label}
                </Link>
              )}
              {!isLast && (
                <span aria-hidden="true" className="text-line-strong">
                  ‹
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
