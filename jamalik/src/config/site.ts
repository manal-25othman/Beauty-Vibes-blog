/**
 * ثوابت الموقع التي لا تتغير من لوحة التحكم.
 * كل ما يمكن للمحرّر تعديله يعيش في جدول `settings` (انظر src/lib/settings.ts).
 */

export const siteConfig = {
  name: "Beauty Vibes",
  nameEn: "Beauty Vibes",
  tagline: "مجلة الجمال والصحة العربية",
  description:
    "مدونة عربية متخصصة في الوصفات الصحية والتغذية السليمة وفوائد الأعشاب والعناية بالبشرة والشعر والصحة النسائية والجمال الطبيعي.",
  locale: "ar_AR",
  lang: "ar",
  direction: "rtl",
  /** يُستخدم عند غياب NEXT_PUBLIC_SITE_URL — يمنع روابط canonical المكسورة. */
  fallbackUrl: "http://localhost:3000",
  /** يبقى فارغًا حتى يوجد حساب فعلي — بطاقة X لا تُنسب إلى حساب لا نملكه. */
  twitterHandle: "",
  /** عدد المقالات في كل صفحة من صفحات الأرشيف والتصنيفات. */
  articlesPerPage: 12,
  searchResultsPerPage: 10,
} as const;

/** العنوان المطلق للموقع، دون شرطة في النهاية. */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || siteConfig.fallbackUrl;
  return raw.replace(/\/+$/, "");
}

/** يبني رابطًا مطلقًا من مسار نسبي — مطلوب لـ canonical و Open Graph و sitemap. */
export function absoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized === "/" ? "" : normalized}`;
}

export const mainNavigation = [
  { label: "الرئيسية", href: "/" },
  { label: "المقالات", href: "/articles" },
  { label: "الجمال الطبيعي", href: "/category/natural-beauty" },
  { label: "العناية بالشعر", href: "/category/hair-care" },
  { label: "العناية بالبشرة", href: "/category/skin-care" },
  { label: "الصحة والتغذية", href: "/category/health-nutrition" },
  { label: "من نحن", href: "/about" },
] as const;

export const legalNavigation = [
  { label: "سياسة الخصوصية", href: "/privacy-policy" },
  { label: "شروط الاستخدام", href: "/terms" },
  { label: "سياسة ملفات تعريف الارتباط", href: "/cookie-policy" },
  { label: "إخلاء المسؤولية", href: "/disclaimer" },
  { label: "السياسة التحريرية", href: "/editorial-policy" },
  { label: "سياسة الإعلانات", href: "/advertising-policy" },
] as const;

export const siteNavigation = [
  { label: "من نحن", href: "/about" },
  { label: "اتصل بنا", href: "/contact" },
  { label: "النشرة البريدية", href: "/newsletter" },
  { label: "خريطة الموقع", href: "/sitemap.xml" },
] as const;
