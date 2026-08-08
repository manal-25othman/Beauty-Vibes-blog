import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/format";
import { deleteAuthor } from "@/app/actions/admin-taxonomy";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";

type PageProps = {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
};

export default async function AdminAuthorsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const authors = await prisma.author.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      specialization: true,
      isActive: true,
      _count: { select: { articles: true } },
    },
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">الكتّاب</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {formatNumber(authors.length)} كاتبة
          </p>
        </div>
        <Link
          href="/admin/authors/new"
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          + كاتبة جديدة
        </Link>
      </header>

      {params.saved && (
        <p role="status" className="rounded-xl bg-success-soft px-4 py-3 text-sm text-success">
          تم الحفظ.
        </p>
      )}
      {params.deleted && (
        <p role="status" className="rounded-xl bg-success-soft px-4 py-3 text-sm text-success">
          تم الحذف.
        </p>
      )}
      {params.error === "has-articles" && (
        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          لا يمكن حذف كاتبة لها مقالات منشورة. انقلي مقالاتها إلى كاتبة أخرى، أو
          عطّلي حسابها بدل الحذف.
        </p>
      )}

      {authors.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center text-sm text-ink-muted">
          لا يوجد كتّاب بعد.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[44rem] border-collapse text-sm">
            <caption className="sr-only">قائمة الكتّاب</caption>
            <thead>
              <tr className="border-b border-line bg-surface-soft">
                <th scope="col" className="p-3 text-start font-semibold text-ink">الاسم</th>
                <th scope="col" className="p-3 text-start font-semibold text-ink">التخصّص</th>
                <th scope="col" className="p-3 text-start font-semibold text-ink">الرابط</th>
                <th scope="col" className="p-3 text-start font-semibold text-ink">المقالات</th>
                <th scope="col" className="p-3 text-start font-semibold text-ink">الحالة</th>
                <th scope="col" className="p-3 text-start font-semibold text-ink">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {authors.map((author) => (
                <tr key={author.id} className="border-b border-line last:border-0">
                  <td className="p-3">
                    <Link
                      href={`/admin/authors/${author.id}`}
                      className="font-semibold text-ink transition-colors hover:text-accent"
                    >
                      {author.name}
                    </Link>
                  </td>
                  <td className="p-3 text-ink-muted">{author.specialization ?? "—"}</td>
                  <td className="p-3 text-ink-muted" dir="ltr">{author.slug}</td>
                  <td className="p-3 tabular-nums text-ink-muted">
                    {formatNumber(author._count.articles)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        author.isActive
                          ? "bg-success-soft text-success"
                          : "bg-surface-soft text-ink-muted"
                      }`}
                    >
                      {author.isActive ? "نشطة" : "معطّلة"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Link
                        href={`/admin/authors/${author.id}`}
                        className="rounded-lg border border-line px-2.5 py-1 text-xs text-ink-soft transition-colors hover:border-accent hover:text-accent"
                      >
                        تحرير
                      </Link>
                      <Link
                        href={`/author/${author.slug}`}
                        target="_blank"
                        rel="noopener"
                        className="rounded-lg border border-line px-2.5 py-1 text-xs text-ink-soft transition-colors hover:border-accent hover:text-accent"
                      >
                        عرض ↗
                      </Link>
                      <form action={deleteAuthor}>
                        <input type="hidden" name="authorId" value={author.id} />
                        <ConfirmSubmit
                          label="حذف"
                          message={`سيُحذف ملف «${author.name}». هل تريدين المتابعة؟`}
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
