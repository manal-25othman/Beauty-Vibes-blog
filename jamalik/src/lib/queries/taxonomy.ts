import { prisma } from "@/lib/prisma";
import { publishedWhere } from "@/lib/queries/articles";

export async function getActiveCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,
      imageAlt: true,
      color: true,
      _count: { select: { articles: { where: publishedWhere() } } },
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findFirst({
    where: { slug, isActive: true },
  });
}

export async function getActiveAuthors() {
  return prisma.author.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      photo: true,
      photoAlt: true,
      specialization: true,
      bio: true,
      _count: { select: { articles: { where: publishedWhere() } } },
    },
  });
}

export async function getAuthorBySlug(slug: string) {
  return prisma.author.findFirst({ where: { slug, isActive: true } });
}

/** الوسوم التي تملك مقالًا منشورًا واحدًا على الأقل. */
export async function getUsedTags(limit = 30) {
  return prisma.tag.findMany({
    where: { articles: { some: publishedWhere() } },
    select: {
      name: true,
      slug: true,
      _count: { select: { articles: { where: publishedWhere() } } },
    },
    orderBy: { articles: { _count: "desc" } },
    take: limit,
  });
}

export async function getTagBySlug(slug: string) {
  return prisma.tag.findUnique({ where: { slug } });
}
