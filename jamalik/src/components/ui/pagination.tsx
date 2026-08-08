import Link from "next/link";
import { formatNumber } from "@/lib/format";

type Props = {
  currentPage: number;
  totalPages: number;
  /**
   * المسار الأساس للأرشيف، مثل "/articles" أو "/category/skin-care".
   * الصفحة الأولى تبقى على المسار نفسه، وما بعدها يأخذ /page/N —
   * مسارات حقيقية بدل معاملات استعلام، فتُولَّد الصفحات ساكنة وتُزحف بوضوح.
   */
  basePath?: string;
  /** بديل عن basePath حين يكون الترقيم عبر معاملات استعلام (البحث مثلًا). */
  buildHref?: (page: number) => string;
};

function defaultHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}/page/${page}`;
}

/**
 * ترقيم الصفحات بروابط حقيقية (<a>) لا أزرار — حتى تتمكّن محركات البحث
 * من الزحف إلى صفحات الأرشيف، ويعمل التنقّل بدون JavaScript.
 */
export function Pagination({
  currentPage,
  totalPages,
  basePath = "",
  buildHref,
}: Props) {
  if (totalPages <= 1) return null;

  const href = buildHref ?? ((page: number) => defaultHref(basePath, page));
  const pages = pageWindow(currentPage, totalPages);

  return (
    <nav aria-label="تصفّح الصفحات" className="mt-12">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          {currentPage > 1 ? (
            <Link
              href={href(currentPage - 1)}
              rel="prev"
              className="inline-flex h-10 items-center rounded-full border border-line px-4 text-sm text-ink-soft transition-colors hover:border-accent hover:text-accent"
            >
              السابق
            </Link>
          ) : (
            <span className="inline-flex h-10 items-center rounded-full border border-line px-4 text-sm text-ink-faint opacity-50">
              السابق
            </span>
          )}
        </li>

        {pages.map((page, index) =>
          page === null ? (
            <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-ink-faint">
              …
            </li>
          ) : (
            <li key={page}>
              <Link
                href={href(page)}
                aria-current={page === currentPage ? "page" : undefined}
                aria-label={`الصفحة ${formatNumber(page)}`}
                className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm transition-colors ${
                  page === currentPage
                    ? "bg-accent font-semibold text-white"
                    : "border border-line text-ink-soft hover:border-accent hover:text-accent"
                }`}
              >
                {formatNumber(page)}
              </Link>
            </li>
          ),
        )}

        <li>
          {currentPage < totalPages ? (
            <Link
              href={href(currentPage + 1)}
              rel="next"
              className="inline-flex h-10 items-center rounded-full border border-line px-4 text-sm text-ink-soft transition-colors hover:border-accent hover:text-accent"
            >
              التالي
            </Link>
          ) : (
            <span className="inline-flex h-10 items-center rounded-full border border-line px-4 text-sm text-ink-faint opacity-50">
              التالي
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}

/** يعرض أول صفحة وآخر صفحة ونافذة حول الصفحة الحالية، مع فواصل بينها. */
function pageWindow(current: number, total: number): (number | null)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, total, current]);
  if (current - 1 > 1) pages.add(current - 1);
  if (current + 1 < total) pages.add(current + 1);

  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | null)[] = [];

  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push(null);
    result.push(page);
  });

  return result;
}

/** مسار الصفحة N من أرشيف — مصدر واحد للصيغة يمنع اختلافها بين المكوّنات. */
export function archivePageHref(basePath: string, page: number): string {
  return defaultHref(basePath, page);
}
