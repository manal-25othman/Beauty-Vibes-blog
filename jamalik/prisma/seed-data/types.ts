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
  /** صورة الغلاف. عند غيابها تُستخدم الصورة النائبة الخاصة بالتصنيف. */
  featuredImage?: string | null;
  faqs?: SeedFaq[];
  isFeatured?: boolean;
  isEditorPick?: boolean;
  /** تاريخ النشر الأصلي (ISO). يتقدّم على daysAgo متى وُجد. */
  publishedAt?: string;
  /**
   * تاريخ آخر تعديل في المصدر — للتوثيق فقط. عمود updatedAt يحمل @updatedAt
   * في Prisma فتُدار قيمته آليًا ولا تُكتب يدويًا.
   */
  updatedAt?: string;
  /** عدد الأيام قبل اليوم — بديل daysAgo حين لا يوجد تاريخ حقيقي. */
  daysAgo?: number;
  viewCount: number;
};
