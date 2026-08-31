import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { absoluteUrl, siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/seo/schema";
import { listArticles } from "@/lib/queries/articles";
import { formatNumber } from "@/lib/format";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ArticleGrid } from "@/components/article/article-grid";
import { Pagination, archivePageHref } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/section-heading";
import { NewsletterCta } from "@/components/newsletter/newsletter-cta";
import { AdSlot } from "@/components/ads/ad-slot";

/**
 * أرشيف كل المقالات.
 *
 * المنطق مشترك بين "/articles" و "/articles/page/N" حتى لا يتكرّر
 * بناء البيانات ولا الميتا في ملفّي مسار.
 */

const BASE_PATH = "/articles";

export async function articlesArchiveMetadata(page: number): Promise<Metadata> {
  return buildMetadata({
    title:
      page > 1 ? `كل المقالات — الصفحة ${formatNumber(page)}` : "كل المقالات",
    description:
      "أرشيف مقالات Beauty Vibes في العناية بالبشرة والشعر والمكياج والعطور، مرتّبة من الأحدث إلى الأقدم.",
    // كل صفحة ترقيم canonical لنفسها: محتواها مختلف، وتوجيهها كلها
    // إلى الصفحة الأولى يُخفي بقية الأرشيف عن الفهرسة.
    path: archivePageHref(BASE_PATH, page),
  });
}

export async function ArticlesArchive({ page }: { page: number }) {
  const result = await listArticles({
    page,
    perPage: siteConfig.articlesPerPage,
  });

  // صفحة ترقيم خارج النطاق يجب أن تعطي 404 لا صفحة فارغة تُفهرَس.
  if (page > 1 && result.items.length === 0) notFound();

  const crumbs = [
    { label: "الرئيسية", href: "/" },
    { label: "المقالات", href: BASE_PATH },
    ...(page > 1
      ? [
          {
            label: `الصفحة ${formatNumber(page)}`,
            href: archivePageHref(BASE_PATH, page),
          },
        ]
      : []),
  ];

  return (
    <>
      <JsonLd
        id="articles-schema"
        data={[
          collectionPageSchema({
            url: absoluteUrl(archivePageHref(BASE_PATH, page)),
            name: page > 1 ? `كل المقالات — الصفحة ${formatNumber(page)}` : "كل المقالات",
            description: "أرشيف مقالات Beauty Vibes.",
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
            كل المقالات
            {page > 1 && (
              <span className="text-ink-faint"> — الصفحة {formatNumber(page)}</span>
            )}
          </h1>
          <p className="mt-3 max-w-2xl text-ink-muted">
            {formatNumber(result.total)} مقالًا في العناية والجمال، مرتّبة من
            الأحدث إلى الأقدم.
          </p>
        </header>

        <AdSlot placement="top" />

        {result.items.length === 0 ? (
          <EmptyState
            title="لا توجد مقالات منشورة بعد"
            description="عودي قريبًا — نعمل على إضافة محتوى جديد باستمرار."
          />
        ) : (
          <>
            <ArticleGrid articles={result.items} columns={3} headingLevel="h2" />
            <Pagination
              currentPage={result.page}
              totalPages={result.totalPages}
              basePath={BASE_PATH}
            />
          </>
        )}

        <div className="mt-20">
          <NewsletterCta source="articles_archive" />
        </div>
      </div>
    </>
  );
}

/** أرقام الصفحات (من ٢ فأعلى) لتوليدها ساكنة. */
export async function articlesArchivePageNumbers(): Promise<{ number: string }[]> {
  const { totalPages } = await listArticles({ page: 1 }).catch(() => ({
    totalPages: 1,
  }));

  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => ({
    number: String(index + 2),
  }));
}
