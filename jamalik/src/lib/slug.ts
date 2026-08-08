/**
 * توليد slug صالح للروابط.
 *
 * روابط عربية مُرمَّزة (%D8%A7...) تصبح طويلة وصعبة المشاركة، لذلك نحوّل
 * الحروف العربية إلى مقابل لاتيني (transliteration) وننتج روابط نظيفة.
 * إن أدخل المحرّر slug يدويًا فهو المصدر، وهذه الدالة اقتراح فقط.
 */

const ARABIC_MAP: Record<string, string> = {
  ا: "a", أ: "a", إ: "i", آ: "a", ٱ: "a",
  ب: "b", ت: "t", ث: "th", ج: "j", ح: "h", خ: "kh",
  د: "d", ذ: "dh", ر: "r", ز: "z", س: "s", ش: "sh",
  ص: "s", ض: "d", ط: "t", ظ: "z", ع: "a", غ: "gh",
  ف: "f", ق: "q", ك: "k", ل: "l", م: "m", ن: "n",
  ه: "h", و: "w", ي: "y", ى: "a", ة: "h", ئ: "e", ؤ: "o", ء: "a",
  " ": "-",
};

/** التشكيل والتطويل لا يضيفان معنى في الرابط. */
const DIACRITICS = /[ً-ْٰـ]/g;

export function slugify(input: string): string {
  const normalized = input.trim().toLowerCase().replace(DIACRITICS, "");

  let out = "";
  for (const char of normalized) {
    if (ARABIC_MAP[char] !== undefined) {
      out += ARABIC_MAP[char];
    } else if (/[a-z0-9]/.test(char)) {
      out += char;
    } else if (/[\s\-_/\\.,،؛:؟!"'()[\]{}]/.test(char)) {
      out += "-";
    }
    // أي رمز آخر (إيموجي، حروف غير مدعومة) يُسقط بدل إنتاج رابط مشوّه.
  }

  return out
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90)
    .replace(/-+$/g, "");
}

/** يضمن عدم تصادم الـ slug مع القيم الموجودة بإضافة لاحقة رقمية. */
export function uniqueSlug(base: string, taken: Iterable<string>): string {
  const existing = new Set(taken);
  const seed = slugify(base) || "item";

  if (!existing.has(seed)) return seed;

  let counter = 2;
  while (existing.has(`${seed}-${counter}`)) counter += 1;
  return `${seed}-${counter}`;
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 96;
}
