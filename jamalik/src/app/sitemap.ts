import type { MetadataRoute } from "next";
import { absoluteUrl, siteConfig } from "@/config/site";
import { getAllPublishedSlugs } from "@/lib/queries/articles";
import { getActiveAuthors, getActiveCategories, getUsedTags } from "@/lib/queries/taxonomy";
import { archivePageHref } from "@/components/ui/pagination";

/** يُعاد توليد الخريطة كل ساعة لتشمل المقالات الجديدة والمجدولة. */
export const revalidate = 3600;

/**
 * صفحات ثابتة. صفحة /search مستبعدة عمدًا — نتائج البحث الداخلي
 * لا يجب أن تُفهرَس، وهي معلّمة بـ noindex أصلًا.
 */
const STATIC_PAGES: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" | "yearly" }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/articles", priority: 0.9, changeFrequency: "daily" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/newsletter", priority: 0.5, changeFrequency: "yearly" },
  { path: "/editorial-policy", priority: 0.4, changeFrequency: "yearly" },
  { path: "/advertising-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cookie-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/disclaimer", priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // قاعدة البيانات قد تكون غير متاحة أثناء البناء؛ الصفحات الثابتة
  // يجب أن تظهر في الخريطة على أي حال.
  const [articles, categories, authors, tags] = await Promise.all([
    getAllPublishedSlugs().catch(() => []),
    getActiveCategories().catch(() => []),
    getActiveAuthors().catch(() => []),
    getUsedTags(200).catch(() => []),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: absoluteUrl(`/article/${article.slug}`),
    lastModified: article.updatedAt ?? article.publishedAt ?? now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: absoluteUrl(`/category/${category.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // صفحات الترقيم تُدرَج أيضًا: كل واحدة تحمل مقالات مختلفة و canonical لنفسها،
  // فإسقاطها من الخريطة يُبطئ اكتشاف المقالات الأقدم.
  const paginatedEntries: MetadataRoute.Sitemap = [
    ...paginationUrls("/articles", articles.length, 0.6),
    ...categories.flatMap((category) =>
      paginationUrls(`/category/${category.slug}`, category._count.articles, 0.5),
    ),
  ].map((url) => ({ ...url, lastModified: now, changeFrequency: "weekly" as const }));

  const authorEntries: MetadataRoute.Sitemap = authors.map((author) => ({
    url: absoluteUrl(`/author/${author.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const tagEntries: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: absoluteUrl(`/tag/${tag.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  return [
    ...staticEntries,
    ...articleEntries,
    ...categoryEntries,
    ...paginatedEntries,
    ...authorEntries,
    ...tagEntries,
  ];
}

/** روابط صفحات الترقيم (من ٢ فأعلى) لأرشيف معيّن. */
function paginationUrls(
  basePath: string,
  totalItems: number,
  priority: number,
): { url: string; priority: number }[] {
  const totalPages = Math.ceil(totalItems / siteConfig.articlesPerPage);
  const urls: { url: string; priority: number }[] = [];

  for (let page = 2; page <= totalPages; page += 1) {
    urls.push({ url: absoluteUrl(archivePageHref(basePath, page)), priority });
  }

  return urls;
}
