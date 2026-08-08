import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { absoluteUrl, siteConfig } from "@/config/site";
import { buildMetadata, pageDescription, pageTitle } from "@/lib/seo/metadata";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/seo/schema";
import { listArticles } from "@/lib/queries/articles";
import { getActiveCategories, getCategoryBySlug } from "@/lib/queries/taxonomy";
import { formatNumber } from "@/lib/format";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ArticleGrid } from "@/components/article/article-grid";
import { Pagination, archivePageHref } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/section-heading";
import { NewsletterCta } from "@/components/newsletter/newsletter-cta";
import { AdSlot } from "@/components/ads/ad-slot";

const basePathFor = (slug: string) => `/category/${slug}`;

export async function categoryArchiveMetadata(
  slug: string,
  page: number,
): Promise<Metadata> {
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: "التصنيف غير موجود", robots: { index: false, follow: false } };
  }

  const baseTitle = pageTitle(category.seoTitle, category.name);

  return buildMetadata({
    title: page > 1 ? `${baseTitle} — الصفحة ${formatNumber(page)}` : baseTitle,
    description: pageDescription(category.metaDescription, category.description),
    path: archivePageHref(basePathFor(category.slug), page),
    image: category.image,
    imageAlt: category.imageAlt,
  });
}

export async function CategoryArchive({
  slug,
  page,
}: {
  slug: string;
  page: number;
}) {
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const basePath = basePathFor(category.slug);

  const [result, allCategories] = await Promise.all([
    listArticles({
      page,
      perPage: siteConfig.articlesPerPage,
      categorySlug: category.slug,
    }),
    getActiveCategories(),
  ]);

  if (page > 1 && result.items.length === 0) notFound();

  const crumbs = [
    { label: "الرئيسية", href: "/" },
    { label: "المقالات", href: "/articles" },
    { label: category.name, href: basePath },
    ...(page > 1
      ? [
          {
            label: `الصفحة ${formatNumber(page)}`,
            href: archivePageHref(basePath, page),
          },
        ]
      : []),
  ];

  return (
    <>
      <JsonLd
        id="category-schema"
        data={[
          collectionPageSchema({
            url: absoluteUrl(archivePageHref(basePath, page)),
            name: category.name,
            description: category.description ?? siteConfig.description,
            items: result.items.map((article) => ({
              name: article.title,
              url: absoluteUrl(`/article/${article.slug}`),
            })),
          }),
          breadcrumbSchema(
            crumbs.map((crumb) => ({ name: crumb.label, url: absoluteUrl(crumb.href) })),
          ),
        ]}
      />

      <div className="container-page py-8">
        <Breadcrumbs items={crumbs} />

        <header className="mb-10 border-b border-line pb-6">
          <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
            {category.name}
            {page > 1 && (
              <span className="text-ink-faint"> — الصفحة {formatNumber(page)}</span>
            )}
          </h1>
          {category.description && (
            <p className="mt-3 max-w-2xl leading-relaxed text-ink-muted">
              {category.description}
            </p>
          )}
          <p className="mt-3 text-sm text-ink-faint">
            {formatNumber(result.total)} مقال في هذا التصنيف
          </p>
        </header>

        <AdSlot placement="top" />

        {result.items.length === 0 ? (
          <EmptyState
            title="لا توجد مقالات في هذا التصنيف بعد"
            description="جرّبي تصفّح تصنيف آخر أو تصفّح كل المقالات."
            action={
              <Link
                href="/articles"
                className="inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white"
              >
                كل المقالات
              </Link>
            }
          />
        ) : (
          <>
            <ArticleGrid articles={result.items} columns={3} headingLevel="h2" />
            <Pagination
              currentPage={result.page}
              totalPages={result.totalPages}
              basePath={basePath}
            />
          </>
        )}

        {/* روابط داخلية بين التصنيفات — تفيد الزائرة والزحف معًا */}
        <nav
          aria-labelledby="other-categories"
          className="mt-16 border-t border-line pt-8"
        >
          <h2
            id="other-categories"
            className="mb-4 font-display text-lg font-bold text-ink"
          >
            تصنيفات أخرى
          </h2>
          <ul className="flex flex-wrap gap-2">
            {allCategories
              .filter((item) => item.slug !== category.slug)
              .map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/category/${item.slug}`}
                    className="inline-block rounded-full border border-line px-4 py-2 text-sm text-ink-muted transition-colors hover:border-accent hover:text-accent"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>

        <div className="mt-16">
          <NewsletterCta source={`category_${category.slug}`} />
        </div>
      </div>
    </>
  );
}

/** كل أزواج (تصنيف، رقم صفحة ≥ ٢) الموجودة فعلًا. */
export async function categoryArchivePageParams(): Promise<
  { slug: string; number: string }[]
> {
  const categories = await getActiveCategories().catch(() => []);
  const params: { slug: string; number: string }[] = [];

  for (const category of categories) {
    const totalPages = Math.max(
      1,
      Math.ceil(category._count.articles / siteConfig.articlesPerPage),
    );
    for (let page = 2; page <= totalPages; page += 1) {
      params.push({ slug: category.slug, number: String(page) });
    }
  }

  return params;
}
