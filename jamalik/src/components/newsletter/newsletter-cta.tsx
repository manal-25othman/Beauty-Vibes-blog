import { NewsletterForm } from "@/components/forms/newsletter-form";

type Props = {
  source: string;
  title?: string;
  description?: string;
  compact?: boolean;
};

export function NewsletterCta({
  source,
  title = "نشرة Beauty Vibes الأسبوعية",
  description = "مقال مختار وتوصية عملية واحدة كل أسبوع، دون إغراق بريدك.",
  compact = false,
}: Props) {
  return (
    <section
      aria-labelledby={`newsletter-${source}`}
      className={`rounded-3xl border border-accent-line bg-accent-soft ${
        compact ? "p-6" : "px-6 py-10 sm:px-10 sm:py-12"
      }`}
    >
      <div className={compact ? "" : "mx-auto max-w-2xl text-center"}>
        <h2
          id={`newsletter-${source}`}
          className={`font-display font-bold text-ink ${
            compact ? "text-lg" : "text-2xl sm:text-3xl"
          }`}
        >
          {title}
        </h2>
        <p
          className={`mt-2 text-ink-muted ${compact ? "text-sm" : "text-base"}`}
        >
          {description}
        </p>

        <div className={compact ? "mt-4" : "mx-auto mt-6 max-w-lg"}>
          <NewsletterForm source={source} variant={compact ? "card" : "inline"} />
        </div>
      </div>
    </section>
  );
}
