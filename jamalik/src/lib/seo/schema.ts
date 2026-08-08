import { absoluteUrl, getSiteUrl, siteConfig } from "@/config/site";
import { toIsoDate } from "@/lib/format";

/**
 * بناة البيانات المنظّمة (Schema.org).
 *
 * قاعدة ملتزم بها هنا: لا نُصرّح إلا بما هو موجود فعلًا على الصفحة.
 * FAQPage مثلًا لا يُضاف إلا حين تكون هناك أسئلة معروضة للزائر —
 * الترميز المضلّل يعرّض الموقع لعقوبات يدوية.
 */

const ORG_ID = `${"#organization"}`;
const SITE_ID = `${"#website"}`;

export function organizationSchema(siteName: string) {
  return {
    "@type": "Organization",
    "@id": absoluteUrl(`/${ORG_ID}`),
    name: siteName,
    url: getSiteUrl(),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/images/logo.svg"),
      width: 160,
      height: 48,
    },
    description: siteConfig.description,
  };
}

export function websiteSchema(siteName: string) {
  return {
    "@type": "WebSite",
    "@id": absoluteUrl(`/${SITE_ID}`),
    name: siteName,
    url: getSiteUrl(),
    inLanguage: "ar",
    publisher: { "@id": absoluteUrl(`/${ORG_ID}`) },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${getSiteUrl()}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function webPageSchema(options: {
  url: string;
  name: string;
  description: string;
}) {
  return {
    "@type": "WebPage",
    "@id": options.url,
    url: options.url,
    name: options.name,
    description: options.description,
    inLanguage: "ar",
    isPartOf: { "@id": absoluteUrl(`/${SITE_ID}`) },
    publisher: { "@id": absoluteUrl(`/${ORG_ID}`) },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function personSchema(author: {
  name: string;
  slug: string;
  bio?: string | null;
  specialization?: string | null;
  photo?: string | null;
  socialLinks?: Record<string, string> | null;
}) {
  const sameAs = Object.values(author.socialLinks ?? {}).filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  );

  return {
    "@type": "Person",
    "@id": absoluteUrl(`/author/${author.slug}#person`),
    name: author.name,
    url: absoluteUrl(`/author/${author.slug}`),
    ...(author.bio ? { description: author.bio } : {}),
    ...(author.specialization ? { jobTitle: author.specialization } : {}),
    ...(author.photo ? { image: absoluteUrl(author.photo) } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function blogPostingSchema(article: {
  title: string;
  slug: string;
  excerpt: string;
  image?: string | null;
  publishedAt: Date | string | null;
  updatedAt: Date | string | null;
  wordCount?: number;
  keywords?: string[];
  section?: string;
  author: { name: string; slug: string };
}) {
  const url = absoluteUrl(`/article/${article.slug}`);

  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: article.title.slice(0, 110),
    description: article.excerpt,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(article.image
      ? {
          image: {
            "@type": "ImageObject",
            url: absoluteUrl(article.image),
            width: 1200,
            height: 675,
          },
        }
      : {}),
    datePublished: toIsoDate(article.publishedAt),
    dateModified: toIsoDate(article.updatedAt ?? article.publishedAt),
    author: { "@id": absoluteUrl(`/author/${article.author.slug}#person`) },
    publisher: { "@id": absoluteUrl(`/${ORG_ID}`) },
    inLanguage: "ar",
    ...(article.section ? { articleSection: article.section } : {}),
    ...(article.keywords?.length ? { keywords: article.keywords.join(", ") } : {}),
    ...(article.wordCount ? { wordCount: article.wordCount } : {}),
    isAccessibleForFree: true,
  };
}

/** لا تُستدعى إلا عندما تكون الأسئلة معروضة فعلًا في الصفحة. */
export function faqPageSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function collectionPageSchema(options: {
  url: string;
  name: string;
  description: string;
  items: { name: string; url: string }[];
}) {
  return {
    "@type": "CollectionPage",
    "@id": options.url,
    url: options.url,
    name: options.name,
    description: options.description,
    inLanguage: "ar",
    isPartOf: { "@id": absoluteUrl(`/${SITE_ID}`) },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: options.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: item.url,
      })),
    },
  };
}
