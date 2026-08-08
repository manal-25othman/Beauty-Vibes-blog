export type SeedCategory = {
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  metaDescription: string;
  sortOrder: number;
  color: string;
};

export type SeedAuthor = {
  name: string;
  slug: string;
  bio: string;
  specialization: string;
  socialLinks: Record<string, string>;
};

export type SeedFaq = {
  question: string;
  answer: string;
};

export type SeedArticle = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categorySlug: string;
  authorSlug: string;
  tags: string[];
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  featuredImageAlt: string;
  faqs?: SeedFaq[];
  isFeatured?: boolean;
  isEditorPick?: boolean;
  /** عدد الأيام قبل اليوم — لتوزيع تواريخ النشر بشكل واقعي. */
  daysAgo: number;
  viewCount: number;
};
