import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { updateArticle } from "@/app/actions/admin-articles";
import { ArticleEditor } from "@/components/admin/article-editor";
import { formatDateTime } from "@/lib/format";

type PageProps = { params: Promise<{ id: string }> };

/** قيمة datetime-local تحتاج "YYYY-MM-DDTHH:mm" بالتوقيت المحلي للمتصفّح. */
function toDateTimeLocal(date: Date | null): string {
  if (!date) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default async function EditArticlePage({ params }: PageProps) {
  const { id } = await params;

  const [article, categories, authors] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      include: {
        tags: { select: { name: true } },
        faqs: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
    prisma.author.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!article) notFound();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-ink-faint">
          <Link href="/admin/articles" className="hover:text-accent">
            المقالات
          </Link>{" "}
          ‹ تحرير
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-ink">
          {article.title}
        </h1>
        <p className="mt-1 text-xs text-ink-faint">
          آخر تعديل: {formatDateTime(article.updatedAt)}
        </p>
      </header>

      <ArticleEditor
        action={updateArticle.bind(null, article.id)}
        values={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          featuredImage: article.featuredImage ?? "",
          featuredImageAlt: article.featuredImageAlt ?? "",
          categoryId: article.categoryId,
          authorId: article.authorId,
          status: article.status,
          publishedAt: toDateTimeLocal(article.publishedAt),
          tags: article.tags.map((tag) => tag.name),
          seoTitle: article.seoTitle ?? "",
          metaDescription: article.metaDescription ?? "",
          focusKeyword: article.focusKeyword ?? "",
          secondaryKeywords: article.secondaryKeywords,
          canonicalUrl: article.canonicalUrl ?? "",
          noIndex: article.noIndex,
          isFeatured: article.isFeatured,
          isEditorPick: article.isEditorPick,
          faqs: article.faqs.map((faq) => ({
            question: faq.question,
            answer: faq.answer,
          })),
        }}
        categories={categories}
        authors={authors}
        submitLabel="حفظ التعديلات"
      />
    </div>
  );
}
