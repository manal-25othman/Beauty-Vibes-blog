import Link from "next/link";
import type { ArticleCardData } from "@/lib/queries/articles";
import { formatDate, formatReadingTime, toIsoDate } from "@/lib/format";
import { SmartImage } from "@/components/ui/smart-image";

type Variant = "default" | "compact" | "wide";

type Props = {
  article: ArticleCardData;
  variant?: Variant;
  /** رقم الترتيب في القائمة — يُستخدم لتحميل أول صورتين بأولوية. */
  index?: number;
  headingLevel?: "h2" | "h3";
};

export function ArticleCard({
  article,
  variant = "default",
  index = 99,
  headingLevel: Heading = "h3",
}: Props) {
  const href = `/article/${article.slug}`;
  const priority = index < 2;

  if (variant === "compact") {
    return (
      <article className="group flex gap-4">
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden="true"
          className="shrink-0 overflow-hidden rounded-xl bg-surface-soft"
        >
          <SmartImage
            src={article.featuredImage}
            alt=""
            width={112}
            height={84}
            sizes="112px"
            className="h-21 w-28 object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        <div className="min-w-0">
          <Heading className="font-display text-[0.95rem] font-bold leading-snug">
            <Link
              href={href}
              className="line-clamp-c-3 text-ink transition-colors hover:text-accent"
            >
              {article.title}
            </Link>
          </Heading>
          <p className="mt-1.5 text-xs text-ink-faint">
            <time dateTime={toIsoDate(article.publishedAt)}>
              {formatDate(article.publishedAt)}
            </time>
          </p>
        </div>
      </article>
    );
  }

  if (variant === "wide") {
    return (
      <article className="group grid gap-5 sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-6">
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden="true"
          className="block overflow-hidden rounded-2xl bg-surface-soft"
        >
          <SmartImage
            src={article.featuredImage}
            alt=""
            width={480}
            height={320}
            priority={priority}
            sizes="(max-width: 640px) 100vw, 15rem"
            className="aspect-3/2 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        <div className="flex flex-col">
          <CategoryBadge article={article} />
          <Heading className="mt-2 font-display text-xl font-bold leading-snug">
            <Link href={href} className="text-ink transition-colors hover:text-accent">
              {article.title}
            </Link>
          </Heading>
          <p className="mt-2 line-clamp-c-2 text-sm leading-relaxed text-ink-muted">
            {article.excerpt}
          </p>
          <CardMeta article={article} className="mt-3" />
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-shadow duration-300 hover:shadow-[0_8px_28px_-16px_rgba(33,30,28,0.25)]">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="block overflow-hidden bg-surface-soft"
      >
        <SmartImage
          src={article.featuredImage}
          alt=""
          width={600}
          height={400}
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="aspect-3/2 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <CategoryBadge article={article} />

        <Heading className="mt-2.5 font-display text-lg font-bold leading-snug">
          <Link href={href} className="text-ink transition-colors hover:text-accent">
            {article.title}
          </Link>
        </Heading>

        <p className="mt-2.5 line-clamp-c-3 flex-1 text-sm leading-relaxed text-ink-muted">
          {article.excerpt}
        </p>

        <CardMeta article={article} className="mt-4 border-t border-line pt-3.5" />
      </div>
    </article>
  );
}

function CategoryBadge({ article }: { article: ArticleCardData }) {
  return (
    <Link
      href={`/category/${article.category.slug}`}
      className="inline-flex w-fit rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent transition-colors hover:bg-accent-line"
    >
      {article.category.name}
    </Link>
  );
}

function CardMeta({
  article,
  className = "",
}: {
  article: ArticleCardData;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-faint ${className}`}
    >
      <Link
        href={`/author/${article.author.slug}`}
        className="font-medium text-ink-muted transition-colors hover:text-accent"
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
  );
}
