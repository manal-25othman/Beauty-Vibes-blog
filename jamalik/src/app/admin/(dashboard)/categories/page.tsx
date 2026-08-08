import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/format";
import { deleteCategory } from "@/app/actions/admin-taxonomy";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";

type PageProps = {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
};

export default async function AdminCategoriesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      sortOrder: true,
      metaDescription: true,
      _count: { select: { articles: true } },
    },
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">التصنيفات</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {formatNumber(categories.length)} تصنيفًا
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          + تصنيف جديد
        </Link>
      </header>

      {params.saved && (
        <p role="status" className="rounded-xl bg-success-soft px-4 py-3 text-sm text-success">
          تم حفظ التصنيف.
        </p>
      )}
      {params.deleted && (
        <p role="status" className="rounded-xl bg-success-soft px-4 py-3 text-sm text-success">
          تم حذف التصنيف.
        </p>
      )}
      {params.error === "has-articles" && (
        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          لا يمكن حذف تصنيف يحتوي مقالات. انقلي مقالاته إلى تصنيف آخر أولًا.
        </p>
      )}

      {categories.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center text-sm text-ink-muted">
          لا توجد تصنيفات بعد.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[44rem] border-collapse text-sm">
            <caption className="sr-only">قائمة التصنيفات</caption>
            <thead>
              <tr className="border-b border-line bg-surface-soft">
                <th scope="col" className="p-3 text-start font-semibold text-ink">الترتيب</th>
                <th scope="col" className="p-3 text-start font-semibold text-ink">الاسم</th>
                <th scope="col" className="p-3 text-start font-semibold text-ink">الرابط</th>
                <th scope="col" className="p-3 text-start font-semibold text-ink">المقالات</th>
                <th scope="col" className="p-3 text-start font-semibold text-ink">الحالة</th>
                <th scope="col" className="p-3 text-start font-semibold text-ink">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-line last:border-0">
                  <td className="p-3 tabular-nums text-ink-faint">
                    {formatNumber(category.sortOrder)}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/admin/categories/${category.id}`}
                      className="font-semibold text-ink transition-colors hover:text-accent"
                    >
                      {category.name}
                    </Link>
                    {!category.metaDescription && (
                      <span className="block text-xs text-warning">ينقصه وصف ميتا</span>
                    )}
                  </td>
                  <td className="p-3 text-ink-muted" dir="ltr">
                    {category.slug}
                  </td>
                  <td className="p-3 tabular-nums text-ink-muted">
                    {formatNumber(category._count.articles)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        category.isActive
                          ? "bg-success-soft text-success"
                          : "bg-surface-soft text-ink-muted"
                      }`}
                    >
                      {category.isActive ? "مفعّل" : "معطّل"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Link
                        href={`/admin/categories/${category.id}`}
                        className="rounded-lg border border-line px-2.5 py-1 text-xs text-ink-soft transition-colors hover:border-accent hover:text-accent"
                      >
                        تحرير
                      </Link>
                      <Link
                        href={`/category/${category.slug}`}
                        target="_blank"
                        rel="noopener"
                        className="rounded-lg border border-line px-2.5 py-1 text-xs text-ink-soft transition-colors hover:border-accent hover:text-accent"
                      >
                        عرض ↗
                      </Link>
                      <form action={deleteCategory}>
                        <input type="hidden" name="categoryId" value={category.id} />
                        <ConfirmSubmit
                          label="حذف"
                          message={`سيُحذف التصنيف «${category.name}». هل تريدين المتابعة؟`}
                        />
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
