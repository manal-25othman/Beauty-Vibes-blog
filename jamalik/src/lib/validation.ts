import { z } from "zod";
import { isValidSlug } from "@/lib/slug";

const slugField = z
  .string()
  .trim()
  .min(2, "الرابط قصير جدًا")
  .max(96, "الرابط طويل جدًا")
  .refine(isValidSlug, "الرابط يقبل الحروف اللاتينية الصغيرة والأرقام والشرطة فقط");

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) => value === "" || /^https?:\/\/\S+$/i.test(value),
    "الرابط يجب أن يبدأ بـ http أو https",
  )
  .optional()
  .default("");

const optionalImagePath = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) => value === "" || /^(\/|https?:\/\/)/i.test(value),
    "مسار الصورة يجب أن يبدأ بـ / أو http",
  )
  .optional()
  .default("");

// ---------------------------------------------------------------------------
// المصادقة
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة").max(200),
});

export const passwordSchema = z
  .string()
  .min(12, "كلمة المرور يجب ألا تقل عن ١٢ حرفًا")
  .max(200, "كلمة المرور طويلة جدًا")
  .refine((v) => /[a-z]/.test(v), "يجب أن تحتوي على حرف صغير")
  .refine((v) => /[A-Z]/.test(v), "يجب أن تحتوي على حرف كبير")
  .refine((v) => /[0-9]/.test(v), "يجب أن تحتوي على رقم");

/** إنشاء حساب لمحرّرة جديدة. */
export const newUserSchema = z.object({
  name: z.string().trim().min(2, "الاسم مطلوب").max(80),
  email: z.string().trim().toLowerCase().email("البريد الإلكتروني غير صالح"),
  password: passwordSchema,
  role: z.enum(["ADMIN", "EDITOR"]),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "كلمة المرور الحالية مطلوبة"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

// ---------------------------------------------------------------------------
// المحتوى
// ---------------------------------------------------------------------------

export const articleStatusSchema = z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]);

export const faqItemSchema = z.object({
  question: z.string().trim().min(5, "السؤال قصير جدًا").max(300),
  answer: z.string().trim().min(10, "الإجابة قصيرة جدًا").max(2000),
});

export const articleSchema = z
  .object({
    title: z.string().trim().min(10, "العنوان قصير جدًا").max(200),
    slug: slugField,
    excerpt: z.string().trim().min(40, "المقتطف قصير جدًا").max(400),
    content: z.string().trim().min(200, "المحتوى قصير جدًا"),
    featuredImage: optionalImagePath,
    featuredImageAlt: z.string().trim().max(200).optional().default(""),
    categoryId: z.string().trim().min(1, "التصنيف مطلوب"),
    authorId: z.string().trim().min(1, "الكاتب مطلوب"),
    status: articleStatusSchema,
    publishedAt: z.string().trim().optional().default(""),
    tags: z.array(z.string().trim().min(1).max(60)).max(15).default([]),
    seoTitle: z.string().trim().max(70, "يفضّل ألا يتجاوز ٧٠ حرفًا").optional().default(""),
    metaDescription: z
      .string()
      .trim()
      .max(170, "يفضّل ألا يتجاوز ١٧٠ حرفًا")
      .optional()
      .default(""),
    focusKeyword: z.string().trim().max(80).optional().default(""),
    secondaryKeywords: z.array(z.string().trim().min(1).max(80)).max(10).default([]),
    canonicalUrl: optionalUrl,
    noIndex: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    isEditorPick: z.boolean().default(false),
    faqs: z.array(faqItemSchema).max(12).default([]),
  })
  .refine(
    (data) => data.status !== "SCHEDULED" || data.publishedAt !== "",
    {
      message: "المقال المجدول يحتاج تاريخ نشر",
      path: ["publishedAt"],
    },
  )
  .refine(
    (data) =>
      data.status !== "SCHEDULED" ||
      (data.publishedAt !== "" && new Date(data.publishedAt).getTime() > Date.now()),
    {
      message: "تاريخ الجدولة يجب أن يكون في المستقبل",
      path: ["publishedAt"],
    },
  );

export const categorySchema = z.object({
  name: z.string().trim().min(2, "الاسم قصير جدًا").max(80),
  slug: slugField,
  description: z.string().trim().max(500).optional().default(""),
  image: optionalImagePath,
  imageAlt: z.string().trim().max(200).optional().default(""),
  seoTitle: z.string().trim().max(70).optional().default(""),
  metaDescription: z.string().trim().max(170).optional().default(""),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isActive: z.boolean().default(true),
});

export const authorSchema = z.object({
  name: z.string().trim().min(2, "الاسم قصير جدًا").max(80),
  slug: slugField,
  photo: optionalImagePath,
  photoAlt: z.string().trim().max(200).optional().default(""),
  bio: z.string().trim().min(30, "النبذة قصيرة جدًا").max(1200),
  specialization: z.string().trim().max(120).optional().default(""),
  email: z
    .string()
    .trim()
    .max(160)
    .refine((v) => v === "" || z.string().email().safeParse(v).success, "بريد غير صالح")
    .optional()
    .default(""),
  twitter: optionalUrl,
  instagram: optionalUrl,
  linkedin: optionalUrl,
  website: optionalUrl,
  isActive: z.boolean().default(true),
});

// ---------------------------------------------------------------------------
// نماذج الزوار
// ---------------------------------------------------------------------------

export const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(5, "البريد الإلكتروني مطلوب")
    .max(160, "البريد الإلكتروني طويل جدًا")
    .email("الرجاء إدخال بريد إلكتروني صالح"),
  source: z.string().trim().max(80).optional().default(""),
  /** حقل خفي: البشر لا يملؤونه، الروبوتات تملؤه. */
  website: z.string().max(0, "تم رفض الطلب").optional().default(""),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "الاسم مطلوب").max(80, "الاسم طويل جدًا"),
  email: z.string().trim().toLowerCase().email("الرجاء إدخال بريد إلكتروني صالح").max(160),
  subject: z.string().trim().min(3, "الموضوع مطلوب").max(150),
  message: z
    .string()
    .trim()
    .min(20, "الرسالة قصيرة جدًا — اكتبي ٢٠ حرفًا على الأقل")
    .max(4000, "الرسالة طويلة جدًا"),
  website: z.string().max(0, "تم رفض الطلب").optional().default(""),
});

export const searchSchema = z.object({
  q: z.string().trim().max(120).optional().default(""),
  page: z.coerce.number().int().min(1).max(500).optional().default(1),
});

// ---------------------------------------------------------------------------
// الإعدادات
// ---------------------------------------------------------------------------

export const settingsSchema = z.object({
  siteName: z.string().trim().min(2).max(80),
  siteDescription: z.string().trim().max(300).optional().default(""),
  contactEmail: z
    .string()
    .trim()
    .max(160)
    .refine((v) => v === "" || z.string().email().safeParse(v).success, "بريد غير صالح")
    .optional()
    .default(""),
  gaMeasurementId: z
    .string()
    .trim()
    .max(30)
    .refine(
      (v) => v === "" || /^G-[A-Z0-9]{4,}$/i.test(v),
      "الصيغة المتوقعة: G-XXXXXXXXXX",
    )
    .optional()
    .default(""),
  googleSiteVerification: z
    .string()
    .trim()
    .max(200)
    .refine(
      (v) => v === "" || /^[A-Za-z0-9_-]+$/.test(v),
      "أدخلي قيمة الـ content من وسم التحقق فقط",
    )
    .optional()
    .default(""),
  adsensePublisherId: z
    .string()
    .trim()
    .max(40)
    .refine(
      (v) => v === "" || /^ca-pub-\d{10,20}$/.test(v),
      "الصيغة المتوقعة: ca-pub-XXXXXXXXXXXXXXXX",
    )
    .optional()
    .default(""),
  adsenseEnabled: z.boolean().default(true),
  adSlotTop: z.string().trim().max(30).optional().default(""),
  adSlotInContent: z.string().trim().max(30).optional().default(""),
  adSlotBetweenArticles: z.string().trim().max(30).optional().default(""),
  adSlotSidebar: z.string().trim().max(30).optional().default(""),
  adSlotBottomArticle: z.string().trim().max(30).optional().default(""),
  twitterHandle: z.string().trim().max(40).optional().default(""),
  facebookUrl: optionalUrl,
  instagramUrl: optionalUrl,
  pinterestUrl: optionalUrl,
  youtubeUrl: optionalUrl,
});

// ---------------------------------------------------------------------------
// أدوات مشتركة
// ---------------------------------------------------------------------------

export type FieldErrors = Record<string, string>;

/** يحوّل أخطاء zod إلى خريطة بسيطة تصلح للعرض بجانب كل حقل. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const result: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}
