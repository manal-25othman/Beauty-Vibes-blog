import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { searchArticles } from "@/lib/queries/articles";
import { getActiveCategories, getUsedTags } from "@/lib/queries/taxonomy";
import { formatNumber } from "@/lib/format";
import { searchSchema } from "@/lib/validation";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ArticleCard } from "@/components/article/article-card";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/section-heading";
import { SearchTracker } from "@/components/search/search-tracker";

/**
 * صفحة البحث ديناميكية بطبيعتها (تعتمد على معامل الاستعلام)،
 * ولا تُفهرَس: نتائج البحث الداخلي محتوى منخفض القيمة لمحركات البحث
 * ويولّد صفحات لا نهائية.
 */
export const metadata: Metadata = {
  ...buildMetadata({
    title: "البحث في المقالات",
    description: `ابحثي في مقالات ${siteConfig.name} عن العناية بالبشرة والشعر والمكياج والعطور.`,
    path: "/search",
    noIndex: true,
  }),
};

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const parsed = searchSchema.safeParse({ q: raw.q ?? "", page: raw.page ?? 1 });

  const query = parsed.success ? parsed.data.q : "";
  const pageNumber = parsed.success ? parsed.data.page : 1;

  const result = query
    ? await searchArticles(query, pageNumber, siteConfig.searchResultsPerPage)
    : { items: [], total: 0, page: 1, perPage: 10, totalPages: 1 };

  const [categories, tags] = await Promise.all([
    getActiveCategories(),
    getUsedTags(14),
  ]);

  return (
    <div className="container-page py-8">
      <Breadcrumbs
        items={[
          { label: "الرئيسية", href: "/" },
          { label: "البحث", href: "/search" },
        ]}
      />

      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
          البحث في المقالات
        </h1>
        <p className="mt-2 text-ink-muted">
          يشمل البحث العنوان والمقتطف والمحتوى والوسوم والتصنيفات.
        </p>
      </header>

      {/* نموذج GET: الرابط قابل للمشاركة، ويعمل بدون JavaScript */}
      <form
        method="get"
        action="/search"
        role="search"
        className="flex flex-col gap-3 sm:flex-row"
      >
        <label htmlFor="search-query" className="sr-only">
          كلمة البحث
        </label>
        <input
          id="search-query"
          type="search"
          name="q"
          defaultValue={query}
          placeholder="مثال: واقي الشمس، الشعر الجاف، كريم الأساس…"
          className="min-w-0 flex-1 rounded-full border border-line bg-surface px-6 py-3.5 text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          ابحثي
        </button>
      </form>

      {query && <SearchTracker query={query} resultCount={result.total} />}

      <div className="mt-10">
        {!query ? (
          <EmptyState
            title="اكتبي كلمة للبحث"
            description="أو تصفّحي التصنيفات والوسوم الشائعة أدناه."
          />
        ) : result.items.length === 0 ? (
          <EmptyState
            title={`لا توجد نتائج لـ «${query}»`}
            description="جرّبي كلمة أقصر أو مرادفًا مختلفًا، أو تصفّحي التصنيفات أدناه."
            action={
              <Link
                href="/articles"
                className="inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white"
              >
                تصفّح كل المقالات
              </Link>
            }
          />
        ) : (
          <>
            <p className="mb-6 text-sm text-ink-muted">
              {formatNumber(result.total)} نتيجة لـ{" "}
              <strong className="text-ink">«{query}»</strong>
            </p>

            <ul className="space-y-8">
              {result.items.map((article, index) => (
                <li key={article.id} className="border-b border-line pb-8 last:border-0">
                  <ArticleCard
                    article={article}
                    variant="wide"
                    index={index}
                    headingLevel="h2"
                  />
                </li>
              ))}
            </ul>

            {/* البحث يحتفظ بالترقيم في معاملات الاستعلام: الصفحة غير مفهرسة
                أصلًا، ومسار حقيقي لكل استعلام سيولّد صفحات بلا حصر. */}
            <Pagination
              currentPage={result.page}
              totalPages={result.totalPages}
              buildHref={(page) =>
                page <= 1
                  ? `/search?q=${encodeURIComponent(query)}`
                  : `/search?q=${encodeURIComponent(query)}&page=${page}`
              }
            />
          </>
        )}
      </div>

      {/* اقتراحات تصفّح — تعطي مخرجًا مفيدًا عند غياب النتائج */}
      <div className="mt-16 grid gap-10 border-t border-line pt-10 sm:grid-cols-2">
        <nav aria-labelledby="search-categories">
          <h2
            id="search-categories"
            className="mb-4 font-display text-lg font-bold text-ink"
          >
            التصنيفات
          </h2>
          <ul className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/category/${category.slug}`}
                  className="inline-block rounded-full border border-line px-4 py-2 text-sm text-ink-muted transition-colors hover:border-accent hover:text-accent"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="search-tags">
          <h2 id="search-tags" className="mb-4 font-display text-lg font-bold text-ink">
            وسوم شائعة
          </h2>
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag.slug}>
                <Link
                  href={`/tag/${tag.slug}`}
                  className="inline-block rounded-full border border-line px-3.5 py-1.5 text-xs text-ink-muted transition-colors hover:border-accent hover:text-accent"
                >
                  #{tag.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
