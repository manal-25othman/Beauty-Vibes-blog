import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/config/site";
import { breadcrumbSchema, webPageSchema } from "@/lib/seo/schema";
import { formatDate } from "@/lib/format";

type Props = {
  title: string;
  description?: string;
  path: string;
  /** تاريخ آخر تحديث للصفحة القانونية — يُعرض ويُذكر في البيانات المنظّمة. */
  updatedAt?: string;
  children: React.ReactNode;
  wide?: boolean;
};

/**
 * هيكل موحّد للصفحات النصّية (من نحن، السياسات، النشرة…).
 * يوفّر مسار التنقّل والبيانات المنظّمة وتنسيق النص دون تكرار في كل صفحة.
 */
export function PageShell({
  title,
  description,
  path,
  updatedAt,
  children,
  wide = false,
}: Props) {
  const crumbs: Crumb[] = [
    { label: "الرئيسية", href: "/" },
    { label: title, href: path },
  ];

  return (
    <>
      <JsonLd
        id="page-schema"
        data={[
          webPageSchema({
            url: absoluteUrl(path),
            name: title,
            description: description ?? title,
          }),
          breadcrumbSchema(
            crumbs.map((crumb) => ({ name: crumb.label, url: absoluteUrl(crumb.href) })),
          ),
        ]}
      />

      <div className="container-page py-8">
        <Breadcrumbs items={crumbs} />

        <div className={wide ? "" : "mx-auto max-w-3xl"}>
          <header className="border-b border-line pb-6">
            <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="mt-3 text-lg leading-relaxed text-ink-muted">
                {description}
              </p>
            )}
            {updatedAt && (
              <p className="mt-4 text-sm text-ink-faint">
                آخر تحديث:{" "}
                <time dateTime={updatedAt}>{formatDate(updatedAt)}</time>
              </p>
            )}
          </header>

          <div className="article-body mt-8">{children}</div>
        </div>
      </div>
    </>
  );
}
