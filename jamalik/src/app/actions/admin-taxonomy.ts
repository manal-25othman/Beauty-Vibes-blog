"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/guard";
import { authorSchema, categorySchema, toFieldErrors } from "@/lib/validation";
import { formError, type FormState } from "@/lib/form-state";

// ---------------------------------------------------------------------------
// التصنيفات
// ---------------------------------------------------------------------------

function parseCategory(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get("name") ?? "",
    slug: formData.get("slug") ?? "",
    description: formData.get("description") ?? "",
    image: formData.get("image") ?? "",
    imageAlt: formData.get("imageAlt") ?? "",
    seoTitle: formData.get("seoTitle") ?? "",
    metaDescription: formData.get("metaDescription") ?? "",
    sortOrder: formData.get("sortOrder") ?? 0,
    isActive: formData.get("isActive") === "on",
  });
}

function revalidateCategoryPaths(slug: string) {
  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath(`/category/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/categories");
}

export async function saveCategory(
  categoryId: string | null,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();
  const parsed = parseCategory(formData);

  if (!parsed.success) {
    return formError("راجعي الحقول أدناه.", toFieldErrors(parsed.error));
  }

  const data = parsed.data;

  const clash = await prisma.category.findFirst({
    where: { slug: data.slug, ...(categoryId ? { NOT: { id: categoryId } } : {}) },
    select: { id: true },
  });

  if (clash) {
    return formError("الرابط مستخدم في تصنيف آخر.", {
      slug: "الرابط مستخدم بالفعل",
    });
  }

  const payload = {
    name: data.name,
    slug: data.slug,
    description: data.description || null,
    image: data.image || null,
    imageAlt: data.imageAlt || null,
    seoTitle: data.seoTitle || null,
    metaDescription: data.metaDescription || null,
    sortOrder: data.sortOrder,
    isActive: data.isActive,
  };

  try {
    if (categoryId) {
      const previous = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { slug: true },
      });
      await prisma.category.update({ where: { id: categoryId }, data: payload });
      if (previous) revalidateCategoryPaths(previous.slug);
    } else {
      await prisma.category.create({ data: payload });
    }
  } catch (error) {
    console.error("[admin] فشل حفظ التصنيف:", error);
    return formError("تعذّر حفظ التصنيف. أعيدي المحاولة.");
  }

  revalidateCategoryPaths(data.slug);
  redirect("/admin/categories?saved=1");
}

export async function deleteCategory(formData: FormData): Promise<void> {
  await requireUser();

  const categoryId = formData.get("categoryId")?.toString();
  if (!categoryId) return;

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { slug: true, _count: { select: { articles: true } } },
  });

  if (!category) return;

  // العلاقة مقيّدة بـ Restrict في المخطّط؛ نتحقّق هنا لنعطي رسالة مفهومة
  // بدل خطأ قاعدة بيانات خام.
  if (category._count.articles > 0) {
    redirect("/admin/categories?error=has-articles");
  }

  await prisma.category.delete({ where: { id: categoryId } });

  revalidateCategoryPaths(category.slug);
  redirect("/admin/categories?deleted=1");
}

// ---------------------------------------------------------------------------
// الكتّاب
// ---------------------------------------------------------------------------

function parseAuthor(formData: FormData) {
  return authorSchema.safeParse({
    name: formData.get("name") ?? "",
    slug: formData.get("slug") ?? "",
    photo: formData.get("photo") ?? "",
    photoAlt: formData.get("photoAlt") ?? "",
    bio: formData.get("bio") ?? "",
    specialization: formData.get("specialization") ?? "",
    email: formData.get("email") ?? "",
    twitter: formData.get("twitter") ?? "",
    instagram: formData.get("instagram") ?? "",
    linkedin: formData.get("linkedin") ?? "",
    website: formData.get("website") ?? "",
    isActive: formData.get("isActive") === "on",
  });
}

function revalidateAuthorPaths(slug: string) {
  revalidatePath("/about");
  revalidatePath(`/author/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/authors");
}

export async function saveAuthor(
  authorId: string | null,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();
  const parsed = parseAuthor(formData);

  if (!parsed.success) {
    return formError("راجعي الحقول أدناه.", toFieldErrors(parsed.error));
  }

  const data = parsed.data;

  const clash = await prisma.author.findFirst({
    where: { slug: data.slug, ...(authorId ? { NOT: { id: authorId } } : {}) },
    select: { id: true },
  });

  if (clash) {
    return formError("الرابط مستخدم لكاتبة أخرى.", { slug: "الرابط مستخدم بالفعل" });
  }

  // الروابط الفارغة تُحذف حتى لا تظهر في sameAs ولا في صندوق الكاتبة.
  const socialLinks = Object.fromEntries(
    Object.entries({
      twitter: data.twitter,
      instagram: data.instagram,
      linkedin: data.linkedin,
      website: data.website,
    }).filter(([, value]) => Boolean(value)),
  );

  const payload = {
    name: data.name,
    slug: data.slug,
    photo: data.photo || null,
    photoAlt: data.photoAlt || null,
    bio: data.bio,
    specialization: data.specialization || null,
    email: data.email || null,
    socialLinks,
    isActive: data.isActive,
  };

  try {
    if (authorId) {
      const previous = await prisma.author.findUnique({
        where: { id: authorId },
        select: { slug: true },
      });
      await prisma.author.update({ where: { id: authorId }, data: payload });
      if (previous) revalidateAuthorPaths(previous.slug);
    } else {
      await prisma.author.create({ data: payload });
    }
  } catch (error) {
    console.error("[admin] فشل حفظ بيانات الكاتبة:", error);
    return formError("تعذّر الحفظ. أعيدي المحاولة.");
  }

  revalidateAuthorPaths(data.slug);
  redirect("/admin/authors?saved=1");
}

export async function deleteAuthor(formData: FormData): Promise<void> {
  await requireUser();

  const authorId = formData.get("authorId")?.toString();
  if (!authorId) return;

  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: { slug: true, _count: { select: { articles: true } } },
  });

  if (!author) return;

  if (author._count.articles > 0) {
    redirect("/admin/authors?error=has-articles");
  }

  await prisma.author.delete({ where: { id: authorId } });

  revalidateAuthorPaths(author.slug);
  redirect("/admin/authors?deleted=1");
}
