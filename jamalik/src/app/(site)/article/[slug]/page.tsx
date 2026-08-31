import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { absoluteUrl, siteConfig } from "@/config/site";
import { buildMetadata, pageDescription, pageTitle } from "@/lib/seo/metadata";
import {
  blogPostingSchema,
  breadcrumbSchema,
  faqPageSchema,
  personSchema,
  webPageSchema,
} from "@/lib/seo/schema";
import {
  getAllPublishedSlugs,
  getArticleBySlug,
  getRelatedArticles,
} from "@/lib/queries/articles";
import { renderMarkdown, markdownToPlainText } from "@/lib/markdown";
import { formatDate, formatReadingTime, toIsoDate } from "@/lib/format";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { SmartImage } from "@/components/ui/smart-image";
import { TableOfContents } from "@/components/article/table-of-contents";
import { ShareButtons } from "@/components/article/share-buttons";
import { AuthorBox } from "@/components/article/author-box";
import { ArticleFaq } from "@/components/article/article-faq";
import { ArticleGrid } from "@/components/article/article-grid";
import { ArticleViewTracker } from "@/components/article/article-view-tracker";
import { NewsletterCta } from "@/components/newsletter/newsletter-cta";
import { SectionHeading } from "@/components/ui/section-heading";
import { AdSlot } from "@/components/ads/ad-slot";

export const revalidate = 600;
/** المقالات المنشورة بعد البناء تُولَّد عند أول طلب لها. */
export const dynamicParams = true;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const articles = await getAllPublishedSlugs().catch(() => []);
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "المقال غير موجود", robots: { index: false, follow: false } };
  }

  return buildMetadata({
    title: pageTitle(article.seoTitle, article.title),
    description: pageDescription(article.metaDescription, article.excerpt),
    path: `/article/${article.slug}`,
    image: article.featuredImage,
    imageAlt: article.featuredImageAlt,
    canonicalOverride: article.canonicalUrl,
    noIndex: article.noIndex,
    type: "article",
    publishedTime: toIsoDate(article.publishedAt),
    modifiedTime: toIsoDate(article.updatedAt),
    authors: [article.author.name],
    section: article.category.name,
    tags: article.tags.map((tag) => tag.name),
  });
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  const [{ html, toc }, related] = await Promise.all([
    renderMarkdown(article.content),
    getRelatedArticles(article.id, article.categoryId, 3),
  ]);

  const url = absoluteUrl(`/article/${article.slug}`);
  const plainText = markdownToPlainText(article.content);
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  const crumbs = [
    { label: "الرئيسية", href: "/" },
    { label: "المقالات", href: "/articles" },
    { label: article.category.name, href: `/category/${article.category.slug}` },
    { label: article.title, href: `/article/${article.slug}` },
  ];

  const isUpdated =
    article.publishedAt &&
    article.updatedAt.getTime() - article.publishedAt.getTime() > 24 * 60 * 60 * 1000;

  return (
    <>
      <JsonLd
        id="article-schema"
        data={[
          webPageSchema({
            url,
            name: pageTitle(article.seoTitle, article.title),
            description: pageDescription(article.metaDescription, article.excerpt),
          }),
          breadcrumbSchema(
            crumbs.map((crumb) => ({
              name: crumb.label,
              url: absoluteUrl(crumb.href),
            })),
          ),
          personSchema({
            name: article.author.name,
            slug: article.author.slug,
            bio: article.author.bio,
            specialization: article.author.specialization,
            photo: article.author.photo,
            socialLinks:
              article.author.socialLinks &&
              typeof article.author.socialLinks === "object" &&
              !Array.isArray(article.author.socialLinks)
                ? (article.author.socialLinks as Record<string, string>)
                : null,
          }),
          blogPostingSchema({
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt,
            image: article.featuredImage,
            publishedAt: article.publishedAt,
            updatedAt: article.updatedAt,
            wordCount,
            keywords: [
              ...(article.focusKeyword ? [article.focusKeyword] : []),
              ...article.secondaryKeywords,
              ...article.tags.map((tag) => tag.name),
            ],
            section: article.category.name,
            author: { name: article.author.name, slug: article.author.slug },
          }),
          // FAQPage لا يُضاف إلا حين تكون الأسئلة معروضة فعلًا أسفل المقال.
          ...(article.faqs.length > 0
            ? [
                faqPageSchema(
                  article.faqs.map((faq) => ({
                    question: faq.question,
                    answer: faq.answer,
                  })),
                ),
              ]
            : []),
        ]}
      />

      <ArticleViewTracker
        slug={article.slug}
        title={article.title}
        category={article.category.name}
        author={article.author.name}
      />

      <div className="container-page py-8">
        <Breadcrumbs items={crumbs} />

        <div className="grid gap-10 lg:grid-cols-[1fr_18rem] lg:gap-12">
          {/* عمود المقال */}
          <article className="min-w-0">
            <header>
              <Link
                href={`/category/${article.category.slug}`}
                className="inline-block rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent transition-colors hover:bg-accent-line"
              >
                {article.category.name}
              </Link>

              <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
                {article.title}
              </h1>

              <p className="mt-5 text-lg leading-relaxed text-ink-muted">
                {article.excerpt}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-line py-4 text-sm text-ink-muted">
                <Link
                  href={`/author/${article.author.slug}`}
                  className="flex items-center gap-2 font-medium text-ink transition-colors hover:text-accent"
                >
                  <SmartImage
                    src={article.author.photo}
                    alt=""
                    width={32}
                    height={32}
                    sizes="32px"
                    className="size-8 rounded-full object-cover"
                  />
                  {article.author.name}
                </Link>

                <span aria-hidden="true">•</span>
                <span>
                  نُشر في{" "}
                  <time dateTime={toIsoDate(article.publishedAt)}>
                    {formatDate(article.publishedAt)}
                  </time>
                </span>

                {isUpdated && (
                  <>
                    <span aria-hidden="true">•</span>
                    <span>
                      حُدّث في{" "}
                      <time dateTime={toIsoDate(article.updatedAt)}>
                        {formatDate(article.updatedAt)}
                      </time>
                    </span>
                  </>
                )}

                <span aria-hidden="true">•</span>
                <span>{formatReadingTime(article.readingTime)}</span>
              </div>
            </header>

            {article.featuredImage && (
              <figure className="mt-8">
                <SmartImage
                  src={article.featuredImage}
                  alt={article.featuredImageAlt || article.title}
                  width={1200}
                  height={675}
                  priority
                  sizes="(max-width: 1024px) 100vw, 46rem"
                  className="aspect-16/9 w-full rounded-2xl object-cover"
                />
                {article.featuredImageAlt && (
                  <figcaption className="mt-2 text-center text-xs text-ink-faint">
                    {article.featuredImageAlt}
                  </figcaption>
                )}
              </figure>
            )}

            {/* فهرس المحتويات — يظهر داخل التدفّق على الشاشات الصغيرة */}
            <div className="mt-8 lg:hidden">
              <TableOfContents entries={toc} />
            </div>

            <AdSlot placement="top" />

            <div
              className="article-body mt-8"
              // المحتوى مُعقَّم في lib/markdown عبر rehype-sanitize بقائمة سماح صارمة.
              dangerouslySetInnerHTML={{ __html: html }}
            />

            <AdSlot placement="inContent" />

            {article.tags.length > 0 && (
              <section aria-labelledby="tags-heading" className="mt-10">
                <h2 id="tags-heading" className="sr-only">
                  وسوم المقال
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <li key={tag.slug}>
                      <Link
                        href={`/tag/${tag.slug}`}
                        className="inline-block rounded-full border border-line px-3 py-1.5 text-xs text-ink-muted transition-colors hover:border-accent hover:text-accent"
                      >
                        #{tag.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="mt-8 border-t border-line pt-6">
              <ShareButtons url={url} title={article.title} />
            </div>

            <ArticleFaq faqs={article.faqs} />

            <div className="mt-12">
              <AuthorBox author={article.author} />
            </div>

            <div className="mt-12">
              <NewsletterCta
                source={`article_${article.slug}`}
                title="أعجبك المقال؟"
                description="اشتركي لتصلك مقالة مختارة كل أسبوع من محررات Beauty Vibes."
              />
            </div>

            <AdSlot placement="bottomArticle" />
          </article>

          {/* العمود الجانبي */}
          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            <div className="hidden lg:block">
              <TableOfContents entries={toc} />
            </div>

            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="mb-2 font-display text-base font-bold text-ink">
                ملاحظة تحريرية
              </h2>
              <p className="text-sm leading-relaxed text-ink-muted">
                محتوى {siteConfig.name} تثقيفي وتحريري، ولا يُقصد به تشخيص أو
                علاج أي حالة. راجعي مختصًا قبل أي قرار يخصّ صحتك.
              </p>
              <Link
                href="/editorial-policy"
                className="mt-3 inline-block text-sm font-semibold text-accent hover:text-accent-hover"
              >
                سياستنا التحريرية ←
              </Link>
            </div>

            <AdSlot placement="sidebar" />
          </aside>
        </div>

        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="mt-20">
            <SectionHeading
              title="مقالات ذات صلة"
              description="اخترناها لك بناءً على موضوع هذا المقال."
            />
            <ArticleGrid articles={related} columns={3} />
          </section>
        )}
      </div>
    </>
  );
}
