type Faq = { id: string; question: string; answer: string };

/**
 * الأسئلة الشائعة.
 *
 * تُستخدم عناصر details/summary الأصلية: تعمل بدون JavaScript، ويدعمها
 * القارئ الصوتي ولوحة المفاتيح افتراضيًا دون أي ARIA إضافي.
 */
export function ArticleFaq({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null;

  return (
    <section aria-labelledby="faq-heading" className="mt-14">
      <h2
        id="faq-heading"
        className="font-display text-2xl font-bold text-ink"
      >
        أسئلة شائعة
      </h2>

      <div className="mt-5 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {faqs.map((faq) => (
          <details key={faq.id} className="group">
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-start font-semibold text-ink transition-colors hover:bg-surface-soft">
              <span>{faq.question}</span>
              <span
                aria-hidden="true"
                className="shrink-0 text-accent transition-transform duration-200 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="px-5 pb-5 text-[0.95rem] leading-relaxed text-ink-muted">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
