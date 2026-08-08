import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { absoluteUrl, siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/seo/schema";
import { listArticles } from "@/lib/queries/articles";
import { getTagBySlug, getUsedTags } from "@/lib/queries/taxonomy";
import { formatNumber } from "@/lib/format";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ArticleGrid } from "@/components/article/article-grid";
import { Pagination, archivePageHref } from "@/components/ui/pagination";

const basePathFor = (slug: string) => `/tag/${slug}`;

export async function tagArchiveMetadata(
  slug: string,
  page: number,
): Promise<Metadata> {
  const tag = await getTagBySlug(slug);

  if (!tag) {
    return { title: "الوسم غير موجود", robots: { index: false, follow: false } };
  }

  return buildMetadata({
    title:
      page > 1
        ? `مقالات عن ${tag.name} — الصفحة ${formatNumber(page)}`
        : `مقالات عن ${tag.name}`,
    description: `كل مقالات ${siteConfig.name} المرتبطة بـ«${tag.name}» في العناية والجمال.`,
    path: archivePageHref(basePathFor(tag.slug), page),
  });
}

export async function TagArchive({ slug, page }: { slug: string; page: number }) {
  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const basePath = basePathFor(tag.slug);

  const [result, popularTags] = await Promise.all([
    listArticles({ page, tagSlug: tag.slug }),
    getUsedTags(24),
  ]);

  // وسم بلا مقالات منشورة لا ينبغي أن يبقى صفحة قابلة للفهرسة.
  if (result.items.length === 0) notFound();

  const crumbs = [
    { label: "الرئيسية", href: "/" },
    { label: "المقالات", href: "/articles" },
    { label: tag.name, href: basePath },
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
        id="tag-schema"
        data={[
          collectionPageSchema({
            url: absoluteUrl(archivePageHref(basePath, page)),
            name: `مقالات عن ${tag.name}`,
            description: `مقالات ${siteConfig.name} المرتبطة بـ${tag.name}.`,
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
          <p className="text-sm font-semibold text-accent">وسم</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold text-ink sm:text-4xl">
            {tag.name}
            {page > 1 && (
              <span className="text-ink-faint"> — الصفحة {formatNumber(page)}</span>
            )}
          </h1>
          <p className="mt-2 text-sm text-ink-faint">
            {formatNumber(result.total)} مقال
          </p>
        </header>

        <ArticleGrid articles={result.items} columns={3} headingLevel="h2" />

        <Pagination
          currentPage={result.page}
          totalPages={result.totalPages}
          basePath={basePath}
        />

        <nav aria-labelledby="popular-tags" className="mt-16 border-t border-line pt-8">
          <h2 id="popular-tags" className="mb-4 font-display text-lg font-bold text-ink">
            وسوم شائعة
          </h2>
          <ul className="flex flex-wrap gap-2">
            {popularTags
              .filter((item) => item.slug !== tag.slug)
              .map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/tag/${item.slug}`}
                    className="inline-block rounded-full border border-line px-3.5 py-1.5 text-xs text-ink-muted transition-colors hover:border-accent hover:text-accent"
                  >
                    #{item.name}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      </div>
    </>
  );
}

export async function tagArchivePageParams(): Promise<
  { slug: string; number: string }[]
> {
  const tags = await getUsedTags(500).catch(() => []);
  const params: { slug: string; number: string }[] = [];

  for (const tag of tags) {
    const totalPages = Math.max(
      1,
      Math.ceil(tag._count.articles / siteConfig.articlesPerPage),
    );
    for (let page = 2; page <= totalPages; page += 1) {
      params.push({ slug: tag.slug, number: String(page) });
    }
  }

  return params;
}
