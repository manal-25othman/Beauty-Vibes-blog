import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { createArticle } from "@/app/actions/admin-articles";
import {
  ArticleEditor,
  emptyArticleValues,
} from "@/components/admin/article-editor";

export default async function NewArticlePage() {
  const [categories, authors] = await Promise.all([
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

  // لا يمكن إنشاء مقال بلا تصنيف وكاتبة — نوجّه المحرّرة لإنشائهما أولًا.
  if (categories.length === 0 || authors.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-line bg-surface p-8 text-center">
        <h1 className="font-display text-xl font-bold text-ink">
          خطوة ناقصة قبل الكتابة
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          كل مقال يحتاج تصنيفًا وكاتبة. أنشئي
          {categories.length === 0 ? " تصنيفًا" : ""}
          {categories.length === 0 && authors.length === 0 ? " و" : ""}
          {authors.length === 0 ? " كاتبة" : ""} أولًا.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {categories.length === 0 && (
            <Link
              href="/admin/categories/new"
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white"
            >
              إضافة تصنيف
            </Link>
          )}
          {authors.length === 0 && (
            <Link
              href="/admin/authors/new"
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white"
            >
              إضافة كاتبة
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-ink-faint">
          <Link href="/admin/articles" className="hover:text-accent">
            المقالات
          </Link>{" "}
          ‹ مقال جديد
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-ink">
          مقال جديد
        </h1>
      </header>

      <ArticleEditor
        action={createArticle}
        values={emptyArticleValues}
        categories={categories}
        authors={authors}
        submitLabel="حفظ المقال"
      />
    </div>
  );
}
