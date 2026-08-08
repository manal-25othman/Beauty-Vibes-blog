import Link from "next/link";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { formatDateTime, formatNumber } from "@/lib/format";
import { deleteArticle, toggleArticleStatus } from "@/app/actions/admin-articles";
import { StatusBadge } from "@/components/admin/status-badge";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";

const PER_PAGE = 20;

type PageProps = {
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
    saved?: string;
    deleted?: string;
  }>;
};

const STATUS_FILTERS = [
  { value: "", label: "الكل" },
  { value: "PUBLISHED", label: "منشورة" },
  { value: "DRAFT", label: "مسودّات" },
  { value: "SCHEDULED", label: "مجدولة" },
];

export default async function AdminArticlesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const query = (params.q ?? "").trim();
  const statusFilter = STATUS_FILTERS.some((f) => f.value === params.status)
    ? params.status
    : "";

  const where: Prisma.ArticleWhereInput = {
    ...(statusFilter
      ? { status: statusFilter as "PUBLISHED" | "DRAFT" | "SCHEDULED" }
      : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
        viewCount: true,
        metaDescription: true,
        featuredImageAlt: true,
        focusKeyword: true,
        category: { select: { name: true } },
        author: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.article.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  function pageHref(target: number) {
    const search = new URLSearchParams();
    if (statusFilter) search.set("status", statusFilter);
    if (query) search.set("q", query);
    if (target > 1) search.set("page", String(target));
    const qs = search.toString();
    return qs ? `/admin/articles?${qs}` : "/admin/articles";
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">المقالات</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {formatNumber(total)} مقالًا
            {statusFilter || query ? " (نتيجة التصفية)" : ""}
          </p>
        </div>

        <Link
          href="/admin/articles/new"
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          + مقال جديد
        </Link>
      </header>

      {params.saved && (
        <p role="status" className="rounded-xl bg-success-soft px-4 py-3 text-sm text-success">
          تم حفظ المقال بنجاح.
        </p>
      )}
      {params.deleted && (
        <p role="status" className="rounded-xl bg-success-soft px-4 py-3 text-sm text-success">
          تم حذف المقال.
        </p>
      )}

      {/* التصفية والبحث */}
      <div className="flex flex-wrap items-center gap-3">
        <nav aria-label="تصفية حسب الحالة" className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((filter) => {
            const search = new URLSearchParams();
            if (filter.value) search.set("status", filter.value);
            if (query) search.set("q", query);
            const href = search.toString()
              ? `/admin/articles?${search}`
              : "/admin/articles";

            return (
              <Link
                key={filter.value || "all"}
                href={href}
                aria-current={statusFilter === filter.value ? "page" : undefined}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  statusFilter === filter.value
                    ? "bg-accent text-white"
                    : "border border-line text-ink-soft hover:border-accent hover:text-accent"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </nav>

        <form method="get" action="/admin/articles" role="search" className="flex gap-2">
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          <label htmlFor="admin-article-search" className="sr-only">
            بحث في المقالات
          </label>
          <input
            id="admin-article-search"
            type="search"
            name="q"
            defaultValue={query}
            placeholder="بحث بالعنوان أو الرابط…"
            className="rounded-full border border-line bg-surface px-4 py-1.5 text-sm text-ink focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent"
          >
            بحث
          </button>
        </form>
      </div>

      {/* الجدول */}
      {articles.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center text-sm text-ink-muted">
          لا توجد مقالات مطابقة.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[52rem] border-collapse text-sm">
            <caption className="sr-only">قائمة المقالات مع حالتها وإحصاءاتها</caption>
            <thead>
              <tr className="border-b border-line bg-surface-soft text-start">
                <th scope="col" className="p-3 text-start font-semibold text-ink">
                  العنوان
                </th>
                <th scope="col" className="p-3 text-start font-semibold text-ink">
                  التصنيف
                </th>
                <th scope="col" className="p-3 text-start font-semibold text-ink">
                  الحالة
                </th>
                <th scope="col" className="p-3 text-start font-semibold text-ink">
                  السيو
                </th>
                <th scope="col" className="p-3 text-start font-semibold text-ink">
                  القراءات
                </th>
                <th scope="col" className="p-3 text-start font-semibold text-ink">
                  إجراءات
                </th>
              </tr>
            </thead>

            <tbody>
              {articles.map((article) => {
                const gaps = [
                  !article.metaDescription && "وصف ميتا",
                  !article.featuredImageAlt && "نص بديل",
                  !article.focusKeyword && "كلمة مفتاحية",
                ].filter(Boolean) as string[];

                return (
                  <tr key={article.id} className="border-b border-line last:border-0">
                    <td className="p-3">
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="font-semibold text-ink transition-colors hover:text-accent"
                      >
                        {article.title}
                      </Link>
                      <span className="block text-xs text-ink-faint">
                        {article.author.name} • {formatDateTime(article.updatedAt)}
                      </span>
                    </td>

                    <td className="p-3 text-ink-muted">{article.category.name}</td>

                    <td className="p-3">
                      <StatusBadge
                        status={article.status}
                        publishedAt={article.publishedAt}
                      />
                    </td>

                    <td className="p-3">
                      {gaps.length === 0 ? (
                        <span className="text-xs text-success">مكتمل</span>
                      ) : (
                        <span className="text-xs text-warning">
                          ينقصه: {gaps.join("، ")}
                        </span>
                      )}
                    </td>

                    <td className="p-3 tabular-nums text-ink-muted">
                      {formatNumber(article.viewCount)}
                    </td>

                    <td className="p-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Link
                          href={`/admin/articles/${article.id}`}
                          className="rounded-lg border border-line px-2.5 py-1 text-xs text-ink-soft transition-colors hover:border-accent hover:text-accent"
                        >
                          تحرير
                        </Link>

                        {article.status !== "SCHEDULED" && (
                          <form action={toggleArticleStatus}>
                            <input type="hidden" name="articleId" value={article.id} />
                            <input
                              type="hidden"
                              name="status"
                              value={article.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"}
                            />
                            <button
                              type="submit"
                              className="rounded-lg border border-line px-2.5 py-1 text-xs text-ink-soft transition-colors hover:border-accent hover:text-accent"
                            >
                              {article.status === "PUBLISHED" ? "إلى مسودّة" : "نشر"}
                            </button>
                          </form>
                        )}

                        <form action={deleteArticle}>
                          <input type="hidden" name="articleId" value={article.id} />
                          <ConfirmSubmit
                            label="حذف"
                            message={`سيُحذف المقال «${article.title}» نهائيًا. هل تريدين المتابعة؟`}
                          />
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav aria-label="تصفّح صفحات المقالات" className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((target) => (
            <Link
              key={target}
              href={pageHref(target)}
              aria-current={target === page ? "page" : undefined}
              className={`inline-flex size-9 items-center justify-center rounded-lg text-sm ${
                target === page
                  ? "bg-accent font-semibold text-white"
                  : "border border-line text-ink-soft hover:border-accent hover:text-accent"
              }`}
            >
              {formatNumber(target)}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
