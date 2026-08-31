/**
 * يكتب مخرجات التحويل في هيئة بذور المشروع.
 *
 * التشغيل: npx tsx scripts/blogger/emit-seed.ts   (بعد convert.ts)
 */

import { readFileSync, writeFileSync } from "node:fs";

type Article = Record<string, unknown>;

const articles = JSON.parse(
  readFileSync("scripts/blogger/out/articles.json", "utf8"),
) as Article[];

const redirects = JSON.parse(
  readFileSync("scripts/blogger/out/redirects.json", "utf8"),
) as { from: string; to: string; title: string }[];

const header = `// ⚠️ ملف مُولَّد — لا يُحرَّر يدويًا.
// المصدر: تصدير Blogger في scripts/blogger/blogger-export.atom
// التوليد: npx tsx scripts/blogger/convert.ts && npx tsx scripts/blogger/emit-seed.ts
// نصّ المقالات منقول حرفيًا من المدونة الأصلية.

import type { SeedArticle } from "./types";

export const bloggerArticles: SeedArticle[] = `;

writeFileSync(
  "prisma/seed-data/articles-blogger.ts",
  `${header}${JSON.stringify(articles, null, 2)};\n`,
  "utf8",
);

const redirectHeader = `// ⚠️ ملف مُولَّد — لا يُحرَّر يدويًا. انظر scripts/blogger/emit-seed.ts
//
// خريطة تحويل روابط Blogger القديمة إلى روابط المقالات الجديدة. تُقرأ في
// next.config.ts وتُصدَر تحويلات ٣٠١ دائمة، فتحتفظ الروابط المفهرسة بقيمتها
// ولا يقع زائر قديم على صفحة ٤٠٤.

export type BloggerRedirect = { from: string; to: string };

export const bloggerRedirects: BloggerRedirect[] = `;

writeFileSync(
  "src/config/blogger-redirects.ts",
  `${redirectHeader}${JSON.stringify(
    redirects.map(({ from, to }) => ({ from, to })),
    null,
    2,
  )};\n`,
  "utf8",
);

console.log(`✓ prisma/seed-data/articles-blogger.ts — ${articles.length} مقالًا`);
console.log(`✓ src/config/blogger-redirects.ts — ${redirects.length} تحويلًا`);
