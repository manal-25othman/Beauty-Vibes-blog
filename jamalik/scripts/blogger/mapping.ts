/**
 * مطابقة وسوم Blogger بتصنيفات المدونة.
 *
 * وسوم المصدر متداخلة ومتكرّرة («صحة» و«جمال و صحة» و«الصحة و الجمال» ثلاثة
 * أسماء لمعنى واحد تقريبًا)، ولا يكفي وسم واحد لتحديد قسم المقال. لذلك:
 *   ١. تُستشار قائمة الاستثناءات أولًا (مقال بعينه، بمعرّفه في Blogger).
 *   ٢. ثم أول وسم له مقابل في الجدول أدناه.
 *   ٣. ثم التصنيف الافتراضي.
 *
 * الوسوم الأصلية كلها تُحفظ كـ tags على المقال، فلا يضيع شيء من تصنيف الكاتبة.
 */

export const DEFAULT_CATEGORY = "natural-beauty";

export const CATEGORY_OF_LABEL: Record<string, string> = {
  "العناية بالشعر": "hair-care",
  "جمال الشعر": "hair-care",
  "العناية بالجلد": "skin-care",
  "جمال البشرة": "skin-care",
  "جمال البشرة و تبييض الجلد": "skin-care",
  "جمال البشرة و الشعر": "natural-beauty",
  "الصحة و الجمال": "natural-beauty",
  "فوائد": "natural-beauty",
  "صحة": "health-nutrition",
  "الطاقة و الصحة": "health-nutrition",
  "الطاقة": "health-nutrition",
  "صحة الجهاز التنفسي": "health-nutrition",
  "جمال و صحة": "womens-health",
  "العلاقة الزوجية": "womens-health",
  "نظافة الابط": "body-care",
  "‏health": "hair-care",
};

/**
 * استثناءات على مستوى المقال — حين يكون الوسم أعمّ من موضوع المقال.
 * المفتاح هو مسار Blogger الأصلي، وهو ثابت لا يتغيّر.
 */
export const CATEGORY_OF_FILENAME: Record<string, string> = {
  "/2026/07/blog-post_21.html": "hair-care", // أفضل الزيوت لتطويل الشعر
  "/2026/07/blog-post_07.html": "hair-care", // إكليل الجبل للشعر
  "/2026/05/blog-post_12.html": "beauty-products", // كريم شيا مويستشر
  "/2026/05/blog-post.html": "beauty-products", // كريم كينيا مع زيت الورد
  "/2026/07/blog-post.html": "body-care", // طين البحر الميت
  "/2026/06/blog-post_18.html": "health-nutrition", // الليمون
  "/2026/08/blog-post_29.html": "health-nutrition", // خل التفاح
  "/2026/05/blog-post_380.html": "health-nutrition", // الكولاجين البقري و البحري
  "/2026/08/blog-post_08.html": "natural-beauty", // المَرّة
  "/2026/05/blog-post_19.html": "body-care", // زبدة الشيا للشعر و الجسم
};
