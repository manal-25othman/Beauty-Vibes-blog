import Link from "next/link";
import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { getSettings } from "@/lib/settings";
import {
  getEditorPicks,
  getHeroArticle,
  getLatestArticles,
  getPopularArticles,
} from "@/lib/queries/articles";
import { getActiveCategories } from "@/lib/queries/taxonomy";
import { formatNumber } from "@/lib/format";

import { HeroArticle } from "@/components/article/hero-article";
import { ArticleGrid } from "@/components/article/article-grid";
import { ArticleCard } from "@/components/article/article-card";
import { SectionHeading, EmptyState } from "@/components/ui/section-heading";
import { NewsletterCta } from "@/components/newsletter/newsletter-cta";
import { SmartImage } from "@/components/ui/smart-image";
import { AdSlot } from "@/components/ads/ad-slot";

/** إعادة توليد الصفحة كل خمس دقائق: يلتقط المقالات المجدولة دون بناء جديد. */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  return buildMetadata({
    title: `${settings.siteName} — ${siteConfig.tagline}`,
    // العنوان يحمل اسم الموقع، فلا يُضاف إليه القالب مرة ثانية.
    titleIsAbsolute: true,
    description: settings.siteDescription,
    path: "/",
    siteName: settings.siteName,
  });
}

const BEAUTY_TIPS = [
  {
    title: "واقي الشمس أولًا",
    body: "أكثر خطوة تؤثر في مظهر بشرتك على المدى الطويل، وأكثرها إهمالًا. اجعليها جزءًا ثابتًا من روتين الصباح.",
  },
  {
    title: "منتج جديد واحد فقط",
    body: "أضيفي منتجًا واحدًا كل أسبوعين. إن ظهر تهيّج ستعرفين المتسبّب فورًا بدل التخمين.",
  },
  {
    title: "رطّبي على بشرة رطبة",
    body: "ضعي المرطّب خلال ثلاث دقائق من الغسل أو الاستحمام، فيُحبَس الماء بدل أن يتبخّر.",
  },
  {
    title: "قلّلي التقشير",
    body: "مرّة أو مرّتان أسبوعيًا حدّ معقول. الزيادة تُضعف حاجز البشرة بدل أن تحسّنه.",
  },
];

export default async function HomePage() {
  const hero = await getHeroArticle();
  const heroId = hero ? [hero.id] : [];

  const [latest, popular, picks, categories] = await Promise.all([
    getLatestArticles(6, heroId),
    getPopularArticles(5, heroId),
    getEditorPicks(3, heroId),
    getActiveCategories(),
  ]);

  if (!hero) {
    return (
      <div className="container-page py-20">
        <h1 className="mb-6 font-display text-3xl font-bold text-ink">
          {siteConfig.name}
        </h1>
        <EmptyState
          title="لا توجد مقالات منشورة بعد"
          description="ابدئي بإضافة أول مقال من لوحة التحكم ليظهر المحتوى هنا."
          action={
            <Link
              href="/admin"
              className="inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white"
            >
              الذهاب إلى لوحة التحكم
            </Link>
          }
        />
      </div>
    );
  }

  const shown = new Set([hero.id, ...latest.map((a) => a.id)]);
  const popularFiltered = popular.filter((a) => !shown.has(a.id)).slice(0, 5);

  return (
    <div className="container-page pb-16">
      <HeroArticle article={hero} />

      <AdSlot placement="top" />

      {/* أحدث المقالات + الأكثر قراءة */}
      <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-10">
        <section aria-labelledby="latest-heading">
          <SectionHeading
            title="أحدث المقالات"
            description="آخر ما نشرناه في العناية والجمال."
            moreHref="/articles"
          />
          <ArticleGrid articles={latest} columns={2} />
        </section>

        <aside className="space-y-10 lg:sticky lg:top-24 lg:self-start">
          {popularFiltered.length > 0 && (
            <section aria-labelledby="popular-heading">
              <h2
                id="popular-heading"
                className="mb-5 border-b border-line pb-3 font-display text-xl font-bold text-ink"
              >
                الأكثر قراءة
              </h2>
              <ol className="space-y-5">
                {popularFiltered.map((article, index) => (
                  <li key={article.id} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 font-display text-2xl font-extrabold text-line-strong"
                    >
                      {formatNumber(index + 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <ArticleCard article={article} variant="compact" />
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <AdSlot placement="sidebar" className="hidden lg:block" />

          <NewsletterCta source="homepage_sidebar" compact />
        </aside>
      </div>

      {/* اختيارات المحررين */}
      {picks.length > 0 && (
        <section aria-labelledby="picks-heading" className="mt-20">
          <SectionHeading
            title="اختيارات المحررات"
            description="مقالات نعتبرها الأجدر بالقراءة هذا الشهر."
          />
          <ArticleGrid articles={picks} columns={3} />
        </section>
      )}

      <AdSlot placement="betweenArticles" />

      {/* التصنيفات */}
      <section aria-labelledby="categories-heading" className="mt-20">
        <SectionHeading
          title="تصفّحي حسب التصنيف"
          description="كل ما يخصّ العناية والجمال، مرتّبًا في أقسام واضحة."
        />
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/category/${category.slug}`}
                className="group block overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-[0_8px_28px_-16px_rgba(33,30,28,0.25)]"
              >
                <SmartImage
                  src={category.image}
                  alt=""
                  width={400}
                  height={225}
                  sizes="(max-width: 640px) 50vw, 20vw"
                  className="aspect-16/9 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="p-3.5">
                  <h3 className="font-display text-sm font-bold text-ink transition-colors group-hover:text-accent">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-xs text-ink-faint">
                    {formatNumber(category._count.articles)} مقال
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* نصائح سريعة */}
      <section aria-labelledby="tips-heading" className="mt-20">
        <SectionHeading
          title="نصائح جمال سريعة"
          description="أربع قواعد عملية تصلح لأي روتين مهما كان بسيطًا."
          moreHref="/category/beauty-tips"
          moreLabel="المزيد من النصائح"
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BEAUTY_TIPS.map((tip, index) => (
            <li
              key={tip.title}
              className="rounded-2xl border border-line bg-surface p-5"
            >
              <span
                aria-hidden="true"
                className="font-display text-sm font-bold text-accent"
              >
                {formatNumber(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-display text-base font-bold text-ink">
                {tip.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {tip.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-20">
        <NewsletterCta source="homepage_footer" />
      </div>
    </div>
  );
}
