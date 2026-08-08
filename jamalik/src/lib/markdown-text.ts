/**
 * أدوات نصّية خفيفة على Markdown.
 *
 * تعيش بمعزل عن lib/markdown.ts عمدًا: ذاك الملف يستورد سلسلة unified
 * كاملة، واستيراده من مكوّن عميل (فحص السيو الحيّ مثلًا) كان سيضخّم
 * حزمة المتصفّح بلا داعٍ.
 */

/** نص خام للمقال — يُستخدم في حساب الطول وفحوص السيو. */
export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^:::.*$/gm, " ")
    .replace(/[#>*_`~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function countWords(markdown: string): number {
  return markdownToPlainText(markdown).split(/\s+/).filter(Boolean).length;
}
