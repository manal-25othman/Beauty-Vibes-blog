"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/guard";
import { articleSchema, toFieldErrors } from "@/lib/validation";
import { formError, type FormState } from "@/lib/form-state";
import { estimateReadingTime } from "@/lib/format";
import { slugify } from "@/lib/slug";

/** يقرأ الحقول المتكرّرة (الوسوم، الأسئلة) من FormData بصيغتها المفهرسة. */
function readList(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .map((value) => value.toString().trim())
    .filter(Boolean);
}

function readFaqs(formData: FormData) {
  const questions = formData.getAll("faqQuestion").map((v) => v.toString().trim());
  const answers = formData.getAll("faqAnswer").map((v) => v.toString().trim());

  return questions
    .map((question, index) => ({ question, answer: answers[index] ?? "" }))
    // صف فارغ بالكامل يعني أن المحرّرة أضافته ثم تركته — نتجاهله بدل رفض النموذج.
    .filter((faq) => faq.question || faq.answer);
}

function parseForm(formData: FormData) {
  return articleSchema.safeParse({
    title: formData.get("title") ?? "",
    slug: formData.get("slug") ?? "",
    excerpt: formData.get("excerpt") ?? "",
    content: formData.get("content") ?? "",
    featuredImage: formData.get("featuredImage") ?? "",
    featuredImageAlt: formData.get("featuredImageAlt") ?? "",
    categoryId: formData.get("categoryId") ?? "",
    authorId: formData.get("authorId") ?? "",
    status: formData.get("status") ?? "DRAFT",
    publishedAt: formData.get("publishedAt") ?? "",
    tags: readList(formData, "tags"),
    seoTitle: formData.get("seoTitle") ?? "",
    metaDescription: formData.get("metaDescription") ?? "",
    focusKeyword: formData.get("focusKeyword") ?? "",
    secondaryKeywords: readList(formData, "secondaryKeywords"),
    canonicalUrl: formData.get("canonicalUrl") ?? "",
    noIndex: formData.get("noIndex") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    isEditorPick: formData.get("isEditorPick") === "on",
    faqs: readFaqs(formData),
  });
}

/**
 * تاريخ النشر:
 * - منشور بلا تاريخ ⇒ الآن.
 * - مجدول ⇒ التاريخ المُدخل (تحقّقت zod أنه في المستقبل).
 * - مسودّة ⇒ لا تاريخ، فلا تظهر في الموقع العام.
 */
function resolvePublishedAt(
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED",
  input: string,
  existing: Date | null,
): Date | null {
  if (status === "DRAFT") return existing;
  if (status === "SCHEDULED") return new Date(input);
  if (input) return new Date(input);
  return existing ?? new Date();
}

/** يربط الوسوم بأسمائها العربية، وينشئ ما لم يكن موجودًا. */
async function connectTags(names: string[]) {
  const unique = [...new Set(names.map((name) => name.trim()).filter(Boolean))];

  const records = await Promise.all(
    unique.map((name) =>
      prisma.tag.upsert({
        where: { slug: slugify(name) || name.slice(0, 40) },
        create: { name, slug: slugify(name) || name.slice(0, 40) },
        update: { name },
        select: { id: true },
      }),
    ),
  );

  return records.map((record) => ({ id: record.id }));
}

/** يُبطل مسارات الموقع العام التي يظهر فيها المقال. */
function revalidateArticlePaths(slug: string, categorySlug?: string) {
  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath(`/article/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/rss.xml");
  if (categorySlug) revalidatePath(`/category/${categorySlug}`);
}

export async function createArticle(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const parsed = parseForm(formData);

  if (!parsed.success) {
    return formError("راجعي الحقول المميّزة أدناه.", toFieldErrors(parsed.error));
  }

  const data = parsed.data;

  const existing = await prisma.article.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  });

  if (existing) {
    return formError("هذا الرابط مستخدم في مقال آخر.", {
      slug: "الرابط مستخدم بالفعل — اختاري رابطًا مختلفًا",
    });
  }

  let created: { slug: string; category: { slug: string } };

  try {
    created = await prisma.article.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        featuredImage: data.featuredImage || null,
        featuredImageAlt: data.featuredImageAlt || null,
        categoryId: data.categoryId,
        authorId: data.authorId,
        status: data.status,
        publishedAt: resolvePublishedAt(data.status, data.publishedAt, null),
        seoTitle: data.seoTitle || null,
        metaDescription: data.metaDescription || null,
        focusKeyword: data.focusKeyword || null,
        secondaryKeywords: data.secondaryKeywords,
        canonicalUrl: data.canonicalUrl || null,
        noIndex: data.noIndex,
        isFeatured: data.isFeatured,
        isEditorPick: data.isEditorPick,
        readingTime: estimateReadingTime(data.content),
        createdById: user.id,
        tags: { connect: await connectTags(data.tags) },
        faqs: {
          create: data.faqs.map((faq, index) => ({
            question: faq.question,
            answer: faq.answer,
            sortOrder: index,
          })),
        },
      },
      select: { slug: true, category: { select: { slug: true } } },
    });
  } catch (error) {
    console.error("[admin] فشل إنشاء المقال:", error);
    return formError("تعذّر حفظ المقال. تحقّقي من التصنيف والكاتبة ثم أعيدي المحاولة.");
  }

  revalidateArticlePaths(created.slug, created.category.slug);
  revalidatePath("/admin/articles");
  redirect("/admin/articles?saved=1");
}

export async function updateArticle(
  articleId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();
  const parsed = parseForm(formData);

  if (!parsed.success) {
    return formError("راجعي الحقول المميّزة أدناه.", toFieldErrors(parsed.error));
  }

  const data = parsed.data;

  const current = await prisma.article.findUnique({
    where: { id: articleId },
    select: { publishedAt: true, slug: true, category: { select: { slug: true } } },
  });

  if (!current) return formError("المقال غير موجود.");

  const clash = await prisma.article.findFirst({
    where: { slug: data.slug, NOT: { id: articleId } },
    select: { id: true },
  });

  if (clash) {
    return formError("هذا الرابط مستخدم في مقال آخر.", {
      slug: "الرابط مستخدم بالفعل — اختاري رابطًا مختلفًا",
    });
  }

  let updated: { slug: string; category: { slug: string } };

  try {
    const payload: Prisma.ArticleUpdateInput = {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      featuredImage: data.featuredImage || null,
      featuredImageAlt: data.featuredImageAlt || null,
      category: { connect: { id: data.categoryId } },
      author: { connect: { id: data.authorId } },
      status: data.status,
      publishedAt: resolvePublishedAt(data.status, data.publishedAt, current.publishedAt),
      seoTitle: data.seoTitle || null,
      metaDescription: data.metaDescription || null,
      focusKeyword: data.focusKeyword || null,
      secondaryKeywords: data.secondaryKeywords,
      canonicalUrl: data.canonicalUrl || null,
      noIndex: data.noIndex,
      isFeatured: data.isFeatured,
      isEditorPick: data.isEditorPick,
      readingTime: estimateReadingTime(data.content),
      // `set` يستبدل قائمة الوسوم بالكامل بدل أن يضيف إليها.
      tags: { set: await connectTags(data.tags) },
    };

    updated = await prisma.article.update({
      where: { id: articleId },
      data: payload,
      select: { slug: true, category: { select: { slug: true } } },
    });

    // الأسئلة تُستبدل كاملة: أبسط وأدقّ من مطابقة كل سؤال بمعرّفه.
    await prisma.faqItem.deleteMany({ where: { articleId } });
    if (data.faqs.length > 0) {
      await prisma.faqItem.createMany({
        data: data.faqs.map((faq, index) => ({
          articleId,
          question: faq.question,
          answer: faq.answer,
          sortOrder: index,
        })),
      });
    }
  } catch (error) {
    console.error("[admin] فشل تحديث المقال:", error);
    return formError("تعذّر حفظ التعديلات. أعيدي المحاولة.");
  }

  // الرابط قد يكون تغيّر: نُبطل القديم والجديد معًا.
  revalidateArticlePaths(current.slug, current.category.slug);
  revalidateArticlePaths(updated.slug, updated.category.slug);
  revalidatePath("/admin/articles");
  redirect("/admin/articles?saved=1");
}

export async function deleteArticle(formData: FormData): Promise<void> {
  await requireUser();

  const articleId = formData.get("articleId")?.toString();
  if (!articleId) return;

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { slug: true, category: { select: { slug: true } } },
  });

  if (!article) return;

  await prisma.article.delete({ where: { id: articleId } });

  revalidateArticlePaths(article.slug, article.category.slug);
  revalidatePath("/admin/articles");
  redirect("/admin/articles?deleted=1");
}

/** تبديل سريع للحالة من قائمة المقالات دون فتح المحرّر. */
export async function toggleArticleStatus(formData: FormData): Promise<void> {
  await requireUser();

  const articleId = formData.get("articleId")?.toString();
  const nextStatus = formData.get("status")?.toString();

  if (!articleId || (nextStatus !== "DRAFT" && nextStatus !== "PUBLISHED")) return;

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { publishedAt: true, slug: true, category: { select: { slug: true } } },
  });

  if (!article) return;

  await prisma.article.update({
    where: { id: articleId },
    data: {
      status: nextStatus,
      publishedAt:
        nextStatus === "PUBLISHED" ? (article.publishedAt ?? new Date()) : article.publishedAt,
    },
  });

  revalidateArticlePaths(article.slug, article.category.slug);
  revalidatePath("/admin/articles");
}
