import { markdownToPlainText } from "@/lib/markdown-text";
import { isValidSlug } from "@/lib/slug";

export type CheckStatus = "pass" | "warn" | "fail";

export type SeoCheck = {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
  /** وزن الفحص في النتيجة الإجمالية. */
  weight: number;
};

export type SeoAudit = {
  checks: SeoCheck[];
  /** نتيجة إرشادية من ١٠٠ — تقدير داخلي وليس تقييمًا من Google. */
  score: number;
  passed: number;
  total: number;
  wordCount: number;
  internalLinks: number;
  externalLinks: number;
};

export type AuditInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seoTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
  featuredImage?: string | null;
  featuredImageAlt?: string | null;
  canonicalUrl?: string | null;
};

/** يزيل التشكيل والهمزات المختلفة حتى تُطابق الكلمة المفتاحية صيغها الشائعة. */
function normalizeArabic(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ً-ْٰـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

function includesKeyword(haystack: string, keyword: string): boolean {
  if (!keyword.trim()) return false;
  return normalizeArabic(haystack).includes(normalizeArabic(keyword));
}

/**
 * فحص إرشادي لجودة تهيئة المقال لمحركات البحث.
 *
 * مهم: هذه معايير تحريرية متعارف عليها، وليست تقييمًا رسميًا من Google
 * ولا ضمانًا لأي ترتيب. الغرض منها تذكير المحرّرة بما قد تكون نسيته.
 */
export function auditArticle(input: AuditInput): SeoAudit {
  const checks: SeoCheck[] = [];

  const plain = markdownToPlainText(input.content);
  const wordCount = plain.split(/\s+/).filter(Boolean).length;

  const linkMatches = [...input.content.matchAll(/\[[^\]]*\]\(([^)\s]+)[^)]*\)/g)];
  const internalLinks = linkMatches.filter((match) =>
    match[1].startsWith("/"),
  ).length;
  const externalLinks = linkMatches.filter((match) =>
    /^https?:\/\//i.test(match[1]),
  ).length;

  const seoTitle = (input.seoTitle || "").trim();
  const metaDescription = (input.metaDescription || "").trim();
  const focusKeyword = (input.focusKeyword || "").trim();

  // --- عنوان السيو ---
  if (!seoTitle) {
    checks.push({
      id: "seo-title",
      label: "عنوان السيو",
      status: "warn",
      detail: "غير محدّد — سيُستخدم عنوان المقال. يفضّل كتابة عنوان مخصّص للبحث.",
      weight: 10,
    });
  } else if (seoTitle.length > 70) {
    checks.push({
      id: "seo-title",
      label: "عنوان السيو",
      status: "warn",
      detail: `${seoTitle.length} حرفًا — قد يُقتطع في نتائج البحث (الحدّ المريح ٦٠–٧٠).`,
      weight: 10,
    });
  } else if (seoTitle.length < 25) {
    checks.push({
      id: "seo-title",
      label: "عنوان السيو",
      status: "warn",
      detail: `${seoTitle.length} حرفًا — قصير، يمكن إضافة سياق مفيد.`,
      weight: 10,
    });
  } else {
    checks.push({
      id: "seo-title",
      label: "عنوان السيو",
      status: "pass",
      detail: `${seoTitle.length} حرفًا — طول مناسب.`,
      weight: 10,
    });
  }

  // --- وصف الميتا ---
  if (!metaDescription) {
    checks.push({
      id: "meta-description",
      label: "وصف الميتا",
      status: "fail",
      detail: "غير محدّد — سيُستخدم المقتطف. اكتبي وصفًا يشجّع على النقر.",
      weight: 12,
    });
  } else if (metaDescription.length > 165) {
    checks.push({
      id: "meta-description",
      label: "وصف الميتا",
      status: "warn",
      detail: `${metaDescription.length} حرفًا — سيُقتطع غالبًا (الحدّ المريح ١٢٠–١٦٠).`,
      weight: 12,
    });
  } else if (metaDescription.length < 70) {
    checks.push({
      id: "meta-description",
      label: "وصف الميتا",
      status: "warn",
      detail: `${metaDescription.length} حرفًا — قصير، يضيّع مساحة مفيدة في النتيجة.`,
      weight: 12,
    });
  } else {
    checks.push({
      id: "meta-description",
      label: "وصف الميتا",
      status: "pass",
      detail: `${metaDescription.length} حرفًا — طول مناسب.`,
      weight: 12,
    });
  }

  // --- الكلمة المفتاحية ---
  if (!focusKeyword) {
    checks.push({
      id: "focus-keyword",
      label: "الكلمة المفتاحية",
      status: "fail",
      detail: "غير محدّدة — حدّديها ليُقاس بقية الفحص عليها.",
      weight: 10,
    });
  } else {
    checks.push({
      id: "focus-keyword",
      label: "الكلمة المفتاحية",
      status: "pass",
      detail: `«${focusKeyword}»`,
      weight: 10,
    });

    checks.push({
      id: "keyword-in-title",
      label: "الكلمة المفتاحية في العنوان",
      status: includesKeyword(seoTitle || input.title, focusKeyword) ? "pass" : "warn",
      detail: includesKeyword(seoTitle || input.title, focusKeyword)
        ? "موجودة في العنوان."
        : "غير موجودة في العنوان — أدرجيها بصياغة طبيعية إن أمكن.",
      weight: 8,
    });

    checks.push({
      id: "keyword-in-intro",
      label: "الكلمة المفتاحية في المقدمة",
      status:
        includesKeyword(input.excerpt, focusKeyword) ||
        includesKeyword(plain.slice(0, 400), focusKeyword)
          ? "pass"
          : "warn",
      detail:
        includesKeyword(input.excerpt, focusKeyword) ||
        includesKeyword(plain.slice(0, 400), focusKeyword)
          ? "موجودة في المقتطف أو أول فقرة."
          : "لم تظهر في المقتطف ولا في أول ٤٠٠ حرف من المحتوى.",
      weight: 6,
    });

    checks.push({
      id: "keyword-in-meta",
      label: "الكلمة المفتاحية في وصف الميتا",
      status: includesKeyword(metaDescription, focusKeyword) ? "pass" : "warn",
      detail: includesKeyword(metaDescription, focusKeyword)
        ? "موجودة في وصف الميتا."
        : "غير موجودة في وصف الميتا.",
      weight: 4,
    });
  }

  // --- الصورة البارزة ---
  checks.push({
    id: "featured-image",
    label: "الصورة البارزة",
    status: input.featuredImage?.trim() ? "pass" : "fail",
    detail: input.featuredImage?.trim()
      ? "محدّدة."
      : "غير محدّدة — ستُستخدم صورة افتراضية عند المشاركة.",
    weight: 8,
  });

  checks.push({
    id: "image-alt",
    label: "النص البديل للصورة",
    status: input.featuredImageAlt?.trim()
      ? input.featuredImageAlt.trim().length >= 10
        ? "pass"
        : "warn"
      : "fail",
    detail: input.featuredImageAlt?.trim()
      ? input.featuredImageAlt.trim().length >= 10
        ? "وصف واضح متوفّر."
        : "قصير جدًا — اكتبي وصفًا يشرح ما في الصورة."
      : "مفقود — مطلوب للوصولية ولفهم الصورة.",
    weight: 8,
  });

  // --- بنية العناوين ---
  const h2Count = (input.content.match(/^##\s+\S/gm) || []).length;
  const h1InContent = (input.content.match(/^#\s+\S/gm) || []).length;

  checks.push({
    id: "single-h1",
    label: "عنوان H1 واحد",
    status: h1InContent === 0 ? "pass" : "fail",
    detail:
      h1InContent === 0
        ? "عنوان المقال هو H1 الوحيد في الصفحة."
        : `المحتوى يحتوي ${h1InContent} عنوانًا بمستوى # — استخدمي ## بدلًا منه.`,
    weight: 10,
  });

  checks.push({
    id: "headings",
    label: "العناوين الفرعية",
    status: h2Count >= 3 ? "pass" : h2Count >= 1 ? "warn" : "fail",
    detail:
      h2Count === 0
        ? "لا توجد عناوين ## — النص كتلة واحدة يصعب تصفّحها."
        : `${h2Count} عنوانًا من مستوى H2.`,
    weight: 8,
  });

  // --- طول المحتوى ---
  checks.push({
    id: "content-length",
    label: "طول المحتوى",
    status: wordCount >= 600 ? "pass" : wordCount >= 300 ? "warn" : "fail",
    detail: `${wordCount} كلمة${
      wordCount < 600 ? " — المقالات الإرشادية عادة ٦٠٠ كلمة فأكثر." : "."
    }`,
    weight: 8,
  });

  // --- الروابط الداخلية ---
  checks.push({
    id: "internal-links",
    label: "روابط داخلية",
    status: internalLinks >= 2 ? "pass" : internalLinks === 1 ? "warn" : "fail",
    detail:
      internalLinks === 0
        ? "لا توجد روابط داخلية — اربطي المقال بمقالات ذات صلة."
        : `${internalLinks} رابطًا داخليًا.`,
    weight: 8,
  });

  // --- الرابط (slug) ---
  const slug = input.slug.trim();
  checks.push({
    id: "slug",
    label: "الرابط",
    status: !slug
      ? "fail"
      : !isValidSlug(slug)
        ? "fail"
        : slug.length > 60
          ? "warn"
          : "pass",
    detail: !slug
      ? "غير محدّد."
      : !isValidSlug(slug)
        ? "يحتوي رموزًا غير مسموحة — استخدمي حروفًا لاتينية صغيرة وأرقامًا وشرطات."
        : slug.length > 60
          ? `${slug.length} حرفًا — طويل، يفضّل اختصاره.`
          : "صالح ومختصر.",
    weight: 6,
  });

  // --- المقتطف ---
  checks.push({
    id: "excerpt",
    label: "المقتطف",
    status: input.excerpt.trim().length >= 80 ? "pass" : "warn",
    detail:
      input.excerpt.trim().length >= 80
        ? `${input.excerpt.trim().length} حرفًا.`
        : "قصير — يظهر في البطاقات وصفحات القوائم، فاجعليه جذّابًا.",
    weight: 4,
  });

  // --- canonical ---
  checks.push({
    id: "canonical",
    label: "الرابط المعياري (canonical)",
    status: "pass",
    detail: input.canonicalUrl?.trim()
      ? `مخصّص: ${input.canonicalUrl.trim()}`
      : "تلقائي — يشير إلى رابط المقال نفسه.",
    weight: 2,
  });

  const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
  const earned = checks.reduce(
    (sum, check) =>
      sum + check.weight * (check.status === "pass" ? 1 : check.status === "warn" ? 0.5 : 0),
    0,
  );

  return {
    checks,
    score: totalWeight === 0 ? 0 : Math.round((earned / totalWeight) * 100),
    passed: checks.filter((check) => check.status === "pass").length,
    total: checks.length,
    wordCount,
    internalLinks,
    externalLinks,
  };
}

export function scoreLabel(score: number): string {
  if (score >= 85) return "ممتاز";
  if (score >= 70) return "جيد";
  if (score >= 50) return "يحتاج تحسينًا";
  return "ضعيف";
}
