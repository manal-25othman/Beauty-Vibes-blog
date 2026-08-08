import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";

/**
 * الشرط الوحيد لاعتبار المقال منشورًا.
 *
 * المقالات المجدولة تُعامَل كمنشورة تلقائيًا بمجرّد أن يحلّ موعدها،
 * دون الحاجة إلى مهمة دورية تغيّر الحالة في قاعدة البيانات.
 */
export function publishedWhere(): Prisma.ArticleWhereInput {
  return {
    status: { in: ["PUBLISHED", "SCHEDULED"] },
    publishedAt: { lte: new Date() },
  };
}

/** الحقول اللازمة لعرض بطاقة مقال — نتجنّب جلب المحتوى الكامل في القوائم. */
export const articleCardSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  featuredImage: true,
  featuredImageAlt: true,
  publishedAt: true,
  readingTime: true,
  viewCount: true,
  category: { select: { name: true, slug: true, color: true } },
  author: { select: { name: true, slug: true, photo: true } },
} satisfies Prisma.ArticleSelect;

export type ArticleCardData = Prisma.ArticleGetPayload<{
  select: typeof articleCardSelect;
}>;

type ListOptions = {
  page?: number;
  perPage?: number;
  categorySlug?: string;
  authorSlug?: string;
  tagSlug?: string;
  excludeIds?: string[];
};

export async function listArticles(options: ListOptions = {}) {
  const perPage = options.perPage ?? siteConfig.articlesPerPage;
  const page = Math.max(1, options.page ?? 1);

  const where: Prisma.ArticleWhereInput = {
    ...publishedWhere(),
    ...(options.categorySlug ? { category: { slug: options.categorySlug } } : {}),
    ...(options.authorSlug ? { author: { slug: options.authorSlug } } : {}),
    ...(options.tagSlug ? { tags: { some: { slug: options.tagSlug } } } : {}),
    ...(options.excludeIds?.length ? { id: { notIn: options.excludeIds } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      select: articleCardSelect,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.article.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getLatestArticles(limit = 6, excludeIds: string[] = []) {
  return prisma.article.findMany({
    where: {
      ...publishedWhere(),
      ...(excludeIds.length ? { id: { notIn: excludeIds } } : {}),
    },
    select: articleCardSelect,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getPopularArticles(limit = 5, excludeIds: string[] = []) {
  return prisma.article.findMany({
    where: {
      ...publishedWhere(),
      ...(excludeIds.length ? { id: { notIn: excludeIds } } : {}),
    },
    select: articleCardSelect,
    orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
    take: limit,
  });
}

export async function getEditorPicks(limit = 4, excludeIds: string[] = []) {
  return prisma.article.findMany({
    where: {
      ...publishedWhere(),
      isEditorPick: true,
      ...(excludeIds.length ? { id: { notIn: excludeIds } } : {}),
    },
    select: articleCardSelect,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

/** مقال الغلاف: أحدث مقال مميّز، وإن لم يوجد فأحدث مقال منشور. */
export async function getHeroArticle() {
  const featured = await prisma.article.findFirst({
    where: { ...publishedWhere(), isFeatured: true },
    select: articleCardSelect,
    orderBy: { publishedAt: "desc" },
  });

  if (featured) return featured;

  return prisma.article.findFirst({
    where: publishedWhere(),
    select: articleCardSelect,
    orderBy: { publishedAt: "desc" },
  });
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findFirst({
    where: { slug, ...publishedWhere() },
    include: {
      category: { select: { id: true, name: true, slug: true, color: true } },
      author: {
        select: {
          id: true,
          name: true,
          slug: true,
          photo: true,
          photoAlt: true,
          bio: true,
          specialization: true,
          socialLinks: true,
        },
      },
      tags: { select: { name: true, slug: true } },
      faqs: { orderBy: { sortOrder: "asc" } },
    },
  });
}

/**
 * مقالات ذات صلة: من نفس التصنيف أولًا، ثم تُستكمل من الأحدث عمومًا
 * حتى لا تظهر المساحة فارغة في التصنيفات قليلة المحتوى.
 */
export async function getRelatedArticles(
  articleId: string,
  categoryId: string,
  limit = 3,
) {
  const sameCategory = await prisma.article.findMany({
    where: {
      ...publishedWhere(),
      categoryId,
      id: { not: articleId },
    },
    select: articleCardSelect,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  if (sameCategory.length >= limit) return sameCategory;

  const fillers = await prisma.article.findMany({
    where: {
      ...publishedWhere(),
      id: { notIn: [articleId, ...sameCategory.map((a) => a.id)] },
    },
    select: articleCardSelect,
    orderBy: { publishedAt: "desc" },
    take: limit - sameCategory.length,
  });

  return [...sameCategory, ...fillers];
}

/**
 * بحث نصّي بسيط عبر العنوان والمقتطف والمحتوى والوسوم والتصنيف.
 *
 * `mode: "insensitive"` كافٍ للعربية هنا لأنها لا تفرّق بين حالة الأحرف؛
 * الغرض الأساسي منه تغطية الكلمات اللاتينية المخلوطة في النص.
 * عند نمو المحتوى، البديل الطبيعي هو الفهرسة الكاملة في PostgreSQL.
 */
export async function searchArticles(query: string, page = 1, perPage = 10) {
  const term = query.trim();

  if (term.length < 2) {
    return { items: [], total: 0, page: 1, perPage, totalPages: 1 };
  }

  const where: Prisma.ArticleWhereInput = {
    ...publishedWhere(),
    OR: [
      { title: { contains: term, mode: "insensitive" } },
      { excerpt: { contains: term, mode: "insensitive" } },
      { content: { contains: term, mode: "insensitive" } },
      { focusKeyword: { contains: term, mode: "insensitive" } },
      { tags: { some: { name: { contains: term, mode: "insensitive" } } } },
      { category: { name: { contains: term, mode: "insensitive" } } },
    ],
  };

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      select: articleCardSelect,
      orderBy: [{ publishedAt: "desc" }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.article.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getAllPublishedSlugs() {
  return prisma.article.findMany({
    where: publishedWhere(),
    select: { slug: true, updatedAt: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
  });
}

/** يزيد عدّاد المشاهدات دون إسقاط الطلب إن فشل — العدّاد ليس حرجًا. */
export async function incrementViewCount(slug: string): Promise<void> {
  await prisma.article
    .updateMany({
      where: { slug, ...publishedWhere() },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => undefined);
}
