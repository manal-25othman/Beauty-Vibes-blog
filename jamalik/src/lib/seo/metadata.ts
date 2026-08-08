import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/config/site";
import { truncate } from "@/lib/format";

export type BuildMetadataOptions = {
  title: string;
  description: string;
  /** المسار النسبي للصفحة — يُستخدم في canonical و Open Graph. */
  path: string;
  image?: string | null;
  imageAlt?: string | null;
  /** رابط canonical مخصّص يتجاوز المسار (لصفحة أُعيد نشرها من مصدر آخر). */
  canonicalOverride?: string | null;
  noIndex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
  tags?: string[];
  siteName?: string;
};

const DEFAULT_IMAGE = "/images/og-default.svg";

/**
 * مصدر واحد لبيانات الميتا في كل الصفحات.
 *
 * canonical يُضبط دائمًا — غيابه على صفحات القوائم المرقّمة أو صفحات
 * البحث يفتح الباب أمام محتوى مكرّر في نظر محركات البحث.
 */
export function buildMetadata(options: BuildMetadataOptions): Metadata {
  const siteName = options.siteName || siteConfig.name;
  const canonical = options.canonicalOverride?.trim() || absoluteUrl(options.path);
  const image = options.image || DEFAULT_IMAGE;
  const imageUrl = image.startsWith("http") ? image : absoluteUrl(image);
  const description = truncate(options.description || siteConfig.description, 165);

  return {
    title: options.title,
    description,
    alternates: {
      canonical,
      types: {
        "application/rss+xml": [{ url: absoluteUrl("/rss.xml"), title: siteName }],
      },
    },
    robots: options.noIndex
      ? {
          index: false,
          follow: true,
          googleBot: { index: false, follow: true },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: options.type ?? "website",
      title: options.title,
      description,
      url: canonical,
      siteName,
      locale: siteConfig.locale,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: options.imageAlt || options.title,
        },
      ],
      ...(options.type === "article"
        ? {
            publishedTime: options.publishedTime,
            modifiedTime: options.modifiedTime,
            authors: options.authors,
            section: options.section,
            tags: options.tags,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: truncate(options.title, 70),
      description: truncate(description, 200),
      images: [imageUrl],
      ...(siteConfig.twitterHandle ? { site: siteConfig.twitterHandle } : {}),
    },
  };
}

/**
 * عنوان الصفحة كما يظهر في نتائج البحث.
 * يفضّل seoTitle إن وُجد، وإلا العنوان التحريري.
 */
export function pageTitle(seoTitle: string | null | undefined, fallback: string): string {
  const value = seoTitle?.trim() || fallback;
  return truncate(value, 70);
}

/** وصف الميتا: seo أولًا، ثم المقتطف، ثم وصف الموقع. */
export function pageDescription(
  metaDescription: string | null | undefined,
  fallback: string | null | undefined,
): string {
  return truncate(metaDescription?.trim() || fallback?.trim() || siteConfig.description, 165);
}
