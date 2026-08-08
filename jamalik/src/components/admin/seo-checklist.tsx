import type { SeoAudit, CheckStatus } from "@/lib/seo/audit";
import { scoreLabel } from "@/lib/seo/audit";
import { formatNumber } from "@/lib/format";

const STATUS_ICON: Record<CheckStatus, string> = {
  pass: "✓",
  warn: "!",
  fail: "✗",
};

const STATUS_CLASS: Record<CheckStatus, string> = {
  pass: "bg-success-soft text-success",
  warn: "bg-warning-soft text-warning",
  fail: "bg-danger-soft text-danger",
};

function scoreColor(score: number): string {
  if (score >= 85) return "text-success";
  if (score >= 70) return "text-warning";
  return "text-danger";
}

/**
 * قائمة فحص السيو للمقال.
 *
 * النتيجة تقدير داخلي إرشادي مبني على معايير تحريرية متعارف عليها —
 * ليست تقييمًا من Google ولا مؤشرًا على الترتيب في نتائج البحث.
 */
export function SeoChecklist({ audit }: { audit: SeoAudit }) {
  return (
    <section
      aria-labelledby="seo-checklist-heading"
      className="rounded-2xl border border-line bg-surface p-5"
    >
      <h2
        id="seo-checklist-heading"
        className="font-display text-base font-bold text-ink"
      >
        فحص السيو
      </h2>

      <div className="mt-4 flex items-baseline gap-2">
        <span className={`font-display text-4xl font-extrabold ${scoreColor(audit.score)}`}>
          {formatNumber(audit.score)}
        </span>
        <span className="text-sm text-ink-faint">/ ١٠٠</span>
        <span className={`ms-auto text-sm font-semibold ${scoreColor(audit.score)}`}>
          {scoreLabel(audit.score)}
        </span>
      </div>

      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-soft"
        role="progressbar"
        aria-valuenow={audit.score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="نتيجة فحص السيو الإرشادية"
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            audit.score >= 85
              ? "bg-success"
              : audit.score >= 70
                ? "bg-warning"
                : "bg-danger"
          }`}
          style={{ width: `${audit.score}%` }}
        />
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-surface-soft p-2">
          <dt className="text-[0.7rem] text-ink-faint">الكلمات</dt>
          <dd className="text-sm font-semibold text-ink">
            {formatNumber(audit.wordCount)}
          </dd>
        </div>
        <div className="rounded-lg bg-surface-soft p-2">
          <dt className="text-[0.7rem] text-ink-faint">روابط داخلية</dt>
          <dd className="text-sm font-semibold text-ink">
            {formatNumber(audit.internalLinks)}
          </dd>
        </div>
        <div className="rounded-lg bg-surface-soft p-2">
          <dt className="text-[0.7rem] text-ink-faint">روابط خارجية</dt>
          <dd className="text-sm font-semibold text-ink">
            {formatNumber(audit.externalLinks)}
          </dd>
        </div>
      </dl>

      <ul className="mt-5 space-y-2.5">
        {audit.checks.map((check) => (
          <li key={check.id} className="flex gap-2.5">
            <span
              aria-hidden="true"
              className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${STATUS_CLASS[check.status]}`}
            >
              {STATUS_ICON[check.status]}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">
                {check.label}
                <span className="sr-only">
                  {check.status === "pass"
                    ? " — مستوفى"
                    : check.status === "warn"
                      ? " — يحتاج انتباهًا"
                      : " — غير مستوفى"}
                </span>
              </p>
              <p className="text-xs leading-relaxed text-ink-muted">{check.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-5 border-t border-line pt-3 text-[0.7rem] leading-relaxed text-ink-faint">
        هذه نتيجة إرشادية داخلية مبنية على معايير تحريرية شائعة. ليست تقييمًا من
        Google ولا ضمانًا لأي ترتيب في نتائج البحث.
      </p>
    </section>
  );
}
