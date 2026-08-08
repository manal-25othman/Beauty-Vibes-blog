/**
 * تنسيق التواريخ والأرقام بالعربية.
 * نستخدم `ar` بأرقام لاتينية (latn) لأن الأرقام الهندية تُقرأ بشكل غير متسق
 * عبر الأنظمة، وتُربك النسخ واللصق.
 */

const DATE_LOCALE = "ar-u-ca-gregory-nu-latn";

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return "";

  return new Intl.DateTimeFormat(DATE_LOCALE, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(value);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return "";

  return new Intl.DateTimeFormat(DATE_LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(value);
}

/** صيغة ISO المطلوبة في سمة `dateTime` وفي البيانات المنظّمة. */
export function toIsoDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const value = typeof date === "string" ? new Date(date) : date;
  return Number.isNaN(value.getTime()) ? "" : value.toISOString();
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("ar-u-nu-latn").format(value);
}

export function formatReadingTime(minutes: number): string {
  if (minutes <= 1) return "دقيقة واحدة";
  if (minutes === 2) return "دقيقتان";
  if (minutes <= 10) return `${formatNumber(minutes)} دقائق`;
  return `${formatNumber(minutes)} دقيقة`;
}

/** تقدير زمن القراءة بالعربية — نحو 180 كلمة في الدقيقة للنص التحريري. */
export function estimateReadingTime(content: string): number {
  const words = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`~\[\]()!-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.round(words / 180));
}

export function truncate(text: string, max: number): string {
  const clean = text.trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}
