import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { absoluteUrl, siteConfig } from "@/config/site";
import { buildMetadata, pageDescription, pageTitle } from "@/lib/seo/metadata";
import {
  breadcrumbSchema,
  collectionPageSchema,
  personSchema,
} from "@/lib/seo/schema";
import { listArticles } from "@/lib/queries/articles";
import { getActiveAuthors, getAuthorBySlug } from "@/lib/queries/taxonomy";
import { formatNumber, truncate } from "@/lib/format";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { SmartImage } from "@/components/ui/smart-image";
import { ArticleGrid } from "@/components/article/article-grid";
import { Pagination, archivePageHref } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/section-heading";

const SOCIAL_LABELS: Record<string, string> = {
  twitter: "إكس",
  instagram: "إنستغرام",
  linkedin: "لينكدإن",
  website: "الموقع الشخصي",
};

const basePathFor = (slug: string) => `/author/${slug}`;

/** حقل socialLinks من نوع Json فيحتاج تحقّقًا قبل الاستخدام. */
function readSocials(value: unknown): [string, string][] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];

  return Object.entries(value as Record<string, unknown>).filter(
    (entry): entry is [string, string] =>
      typeof entry[1] === "string" && /^https?:\/\//i.test(entry[1]),
  );
}

export async function authorArchiveMetadata(
  slug: string,
  page: number,
): Promise<Metadata> {
  const author = await getAuthorBySlug(slug);

  if (!author) {
    return { title: "الكاتبة غير موجودة", robots: { index: false, follow: false } };
  }

  const baseTitle = pageTitle(
    author.seoTitle,
    `${author.name}${author.specialization ? ` — ${author.specialization}` : ""}`,
  );

  return buildMetadata({
    title: page > 1 ? `${baseTitle} — الصفحة ${formatNumber(page)}` : baseTitle,
    description: pageDescription(author.metaDescription, author.bio),
    path: archivePageHref(basePathFor(author.slug), page),
    image: author.photo,
    imageAlt: author.photoAlt,
  });
}

export async function AuthorArchive({
  slug,
  page,
}: {
  slug: string;
  page: number;
}) {
  const author = await getAuthorBySlug(slug);
  if (!author) notFound();

  const basePath = basePathFor(author.slug);
  const result = await listArticles({
    page,
    perPage: siteConfig.articlesPerPage,
    authorSlug: author.slug,
  });

  if (page > 1 && result.items.length === 0) notFound();

  const socials = readSocials(author.socialLinks);

  const crumbs = [
    { label: "الرئيسية", href: "/" },
    { label: "فريق التحرير", href: "/about#team" },
    { label: author.name, href: basePath },
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
        id="author-schema"
        data={[
          personSchema({
            name: author.name,
            slug: author.slug,
            bio: author.bio,
            specialization: author.specialization,
            photo: author.photo,
            socialLinks: Object.fromEntries(socials),
          }),
          collectionPageSchema({
            url: absoluteUrl(archivePageHref(basePath, page)),
            name: `مقالات ${author.name}`,
            description: truncate(author.bio, 160),
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

        <header className="mb-12 rounded-3xl border border-line bg-surface p-6 sm:p-9">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <SmartImage
              src={author.photo}
              alt={author.photoAlt || `صورة ${author.name}`}
              width={128}
              height={128}
              priority
              sizes="128px"
              className="size-28 shrink-0 rounded-full object-cover"
            />

            <div className="min-w-0">
              <h1 className="font-display text-3xl font-extrabold text-ink">
                {author.name}
              </h1>
              {author.specialization && (
                <p className="mt-1 font-semibold text-accent">
                  {author.specialization}
                </p>
              )}
              <p className="mt-4 max-w-2xl leading-relaxed text-ink-muted">
                {author.bio}
              </p>
              <p className="mt-4 text-sm text-ink-faint">
                {formatNumber(result.total)} مقال منشور
              </p>

              {socials.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {socials.map(([key, href]) => (
                    <li key={key}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer me"
                        className="inline-block rounded-full border border-line px-4 py-1.5 text-xs text-ink-soft transition-colors hover:border-accent hover:text-accent"
                      >
                        {SOCIAL_LABELS[key] ?? key}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </header>

        <h2 className="mb-6 border-b border-line pb-4 font-display text-2xl font-bold text-ink">
          مقالات {author.name}
          {page > 1 && (
            <span className="text-ink-faint"> — الصفحة {formatNumber(page)}</span>
          )}
        </h2>

        {result.items.length === 0 ? (
          <EmptyState
            title="لا توجد مقالات منشورة لهذه الكاتبة بعد"
            description="عودي قريبًا لقراءة أعمالها."
          />
        ) : (
          <>
            <ArticleGrid articles={result.items} columns={3} headingLevel="h3" />
            <Pagination
              currentPage={result.page}
              totalPages={result.totalPages}
              basePath={basePath}
            />
          </>
        )}
      </div>
    </>
  );
}

export async function authorArchivePageParams(): Promise<
  { slug: string; number: string }[]
> {
  const authors = await getActiveAuthors().catch(() => []);
  const params: { slug: string; number: string }[] = [];

  for (const author of authors) {
    const totalPages = Math.max(
      1,
      Math.ceil(author._count.articles / siteConfig.articlesPerPage),
    );
    for (let page = 2; page <= totalPages; page += 1) {
      params.push({ slug: author.slug, number: String(page) });
    }
  }

  return params;
}
