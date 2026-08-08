import Link from "next/link";
import type { ArticleCardData } from "@/lib/queries/articles";
import { formatDate, formatReadingTime, toIsoDate } from "@/lib/format";
import { SmartImage } from "@/components/ui/smart-image";

/**
 * مقال الغلاف في أعلى الرئيسية.
 *
 * العنوان هنا هو h1 الوحيد في الصفحة — عنوان الموقع في الترويسة مجرّد رابط،
 * فلا يتنازع مع بنية العناوين.
 */
export function HeroArticle({ article }: { article: ArticleCardData }) {
  const href = `/article/${article.slug}`;

  return (
    <section aria-labelledby="hero-title" className="pt-8 sm:pt-10">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden="true"
          className="group order-1 block overflow-hidden rounded-3xl bg-surface-soft lg:order-2"
        >
          <SmartImage
            src={article.featuredImage}
            alt={article.featuredImageAlt || ""}
            width={1200}
            height={800}
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="aspect-3/2 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </Link>

        <div className="order-2 lg:order-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
              مقال مختار
            </span>
            <Link
              href={`/category/${article.category.slug}`}
              className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent transition-colors hover:bg-accent-line"
            >
              {article.category.name}
            </Link>
          </div>

          <h1
            id="hero-title"
            className="mt-5 font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl lg:text-[2.75rem]"
          >
            <Link href={href} className="transition-colors hover:text-accent">
              {article.title}
            </Link>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
            {article.excerpt}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-faint">
            <Link
              href={`/author/${article.author.slug}`}
              className="font-medium text-ink-soft transition-colors hover:text-accent"
            >
              {article.author.name}
            </Link>
            <span aria-hidden="true">•</span>
            <time dateTime={toIsoDate(article.publishedAt)}>
              {formatDate(article.publishedAt)}
            </time>
            <span aria-hidden="true">•</span>
            <span>{formatReadingTime(article.readingTime)}</span>
          </div>

          <Link
            href={href}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-accent"
          >
            اقرئي المقال
            <span aria-hidden="true">←</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
