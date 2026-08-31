/**
 * تحويل تصدير Blogger إلى بنية بذور المشروع.
 *
 * المبدأ الحاكم: نصّ الكاتبة يُنقل حرفيًا. ما يتغيّر هو **التمثيل** لا المحتوى —
 * وسم HTML يصير Markdown، وعنوان كتبته بخطّ عريض ملوّن يصير `##`، وفقرات تبدأ
 * بنجمة تصير قائمة. لا كلمة تُضاف ولا تُحذف ولا يُعاد صوغها.
 *
 * التشغيل: npx tsx scripts/blogger/convert.ts
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname } from "node:path";

import type { Element, ElementContent, Root as HastRoot, RootContent } from "hast";
import type { RootContent as MdastContent, Root as MdastRoot } from "mdast";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { visit } from "unist-util-visit";

import { slugify } from "../../src/lib/slug";
import { CATEGORY_OF_FILENAME, CATEGORY_OF_LABEL, DEFAULT_CATEGORY } from "./mapping";

type RawPost = {
  id: string;
  status: string;
  title: string;
  html: string;
  metaDescription: string;
  author: string;
  published: string;
  updated: string;
  filename: string;
  labels: string[];
};

const IN = "scripts/blogger/raw.json";
const OUT_DIR = "scripts/blogger/out";

/* ------------------------------------------------------------------ الصور */

/** سجلّ الصور: عنوان Blogger الأصلي ← مسار محلي على موقعنا. */
export class ImageRegistry {
  readonly map = new Map<string, string>();
  readonly alts = new Map<string, string>();
  private counter = 0;

  constructor(private readonly slug: string) {}

  register(remote: string): string {
    const known = this.map.get(remote);
    if (known) return known;

    this.counter += 1;
    const ext = (extname(new URL(remote).pathname) || ".jpg").toLowerCase();
    const local = `/images/blog/${this.slug}-${this.counter}${ext}`;
    this.map.set(remote, local);
    return local;
  }
}

/* ------------------------------------------------------ أدوات على شجرة hast */

function nodeText(node: RootContent | HastRoot): string {
  if (node.type === "text") return node.value;
  if ("children" in node && node.children) {
    return node.children.map((child) => nodeText(child)).join("");
  }
  return "";
}

function hasBreak(node: RootContent): boolean {
  if (node.type !== "element") return false;
  if (node.tagName === "br") return true;
  // نبحث داخل الأغلفة النصّية فقط؛ الفقرة الأخرى تُعالَج بنفسها.
  if (!["span", "font", "b", "strong", "i", "em", "a"].includes(node.tagName)) return false;
  return (node.children ?? []).some((child) => hasBreak(child));
}

function hasImage(node: RootContent): boolean {
  if (node.type !== "element") return false;
  if (node.tagName === "img") return true;
  return (node.children ?? []).some((child) => hasImage(child));
}

/** فارغ = بلا نصّ وبلا صورة. الصورة لا نصّ لها، فلولا هذا الشرط لحُذفت. */
const isBlank = (node: RootContent) =>
  !hasImage(node) && nodeText(node).replace(/ /g, " ").trim() === "";

/* ------------------------------------------------------------- خطوات المعالجة */

/** يفكّ أغلفة Blogger ويسجّل الصور. لا يمسّ الأنماط — العناوين تُقرأ منها لاحقًا. */
export function normalizeBlogger(images: ImageRegistry) {
  return (tree: HastRoot) => {
    /*
     * غلاف توسيط حول الصور. يُفكّ فيُرفع محتواه إلى مكانه — ولا يُحوَّل إلى <p>:
     * محوّل Markdown يعامل ما داخل الفقرة محتوىً سطريًا، فلو كان الغلاف يضمّ
     * عناصر كتلية التصقت الفقرات وضاعت الفواصل بين الأقسام.
     */
    visit(tree, "element", (node: Element, index, parent) => {
      if (!parent || index === null || index === undefined) return;
      const className = node.properties?.className;
      if (node.tagName !== "div" || !Array.isArray(className)) return;
      if (!className.includes("separator")) return;

      parent.children.splice(index, 1, ...node.children);
      return index;
    });

    // <a href="النسخة الكاملة"><img src="مصغّرة"></a> ← نُبقي الأصل بحجمه الكامل.
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "a" || !parent || index === null || index === undefined) return;
      const kids = node.children.filter((child) => !isBlank(child));
      const img = kids.find(
        (child): child is Element => child.type === "element" && child.tagName === "img",
      );
      if (kids.length !== 1 || !img) return;

      const href = node.properties?.href;
      if (typeof href === "string" && /\.(png|jpe?g|webp|gif)(\?|$)/i.test(href)) {
        img.properties.src = href;
      }
      parent.children[index] = img;
    });

    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "img") return;
      const src = node.properties?.src;
      if (typeof src !== "string" || !/^https?:/.test(src)) return;

      const alt = node.properties?.alt;
      const local = images.register(src);
      if (typeof alt === "string" && alt.trim()) images.alts.set(local, alt.trim());
      node.properties = { src: local, alt: typeof alt === "string" ? alt : "" };
    });
  };
}

/** الحدّ الذي يفصل عنوان قسم عن جملة عادية. */
const HEADING_MAX = 120;

/** فاصل أقسام تكتبه الكاتبة سطرًا مستقلًا في بعض المقالات. */
const SEPARATOR = /^[⸻—–_*·•\s]+$/;

/** رموز تزيينية تسبق العنوان أحيانًا؛ تُتجاوَز عند فحص الترقيم. */
const stripLeadingSymbols = (value: string) =>
  value.replace(/^[^\p{L}\p{N}]+/u, "").trim();

function styleOf(node: Element): string {
  const value = node.properties?.style;
  return typeof value === "string" ? value.toLowerCase() : "";
}

/**
 * Blogger يميّز العناوين بصريًا لا بنيويًا، وبثلاث طرق مختلفة حسب مصدر النصّ:
 * وسم <b>، أو لون مخالف، أو ثقل خطّ داخل <span> (نصّ ملصوق من محرّر نصوص).
 * أمّا font-kerning ونحوه فسمات ترث كلَّ فقرة، فلا تدلّ على شيء.
 */
function looksLikeHeadingMark(node: Element): boolean {
  if (node.tagName === "b" || node.tagName === "strong") return true;
  if (node.tagName !== "span" && node.tagName !== "font") return false;

  const style = styleOf(node);
  if (/font-weight:\s*(bold|[6-9]00)/.test(style)) return true;
  if (/font-size:\s*(x{1,2}-large|larger)/.test(style)) return true;

  const size = style.match(/font-size:\s*(\d+(?:\.\d+)?)px/);
  if (size && Number(size[1]) >= 18) return true;

  // لون مخالف للأسود الافتراضي.
  const color = style.match(/(?:^|;)\s*color:\s*([^;]+)/);
  if (color) {
    const value = color[1].trim();
    return !/^(inherit|initial|currentcolor|#000000|#000|black|rgb\(0,\s*0,\s*0\))$/.test(value);
  }
  return false;
}

/**
 * فقرة واحدة تحوي عدة أسطر مفصولة بـ <br> — شائع في النصّ الملصوق. فصلها إلى
 * فقرات يتيح التعرّف على القوائم، ويطابق ما كان يظهر للقارئة في Blogger.
 */
export function splitOnBreaks() {
  return (tree: HastRoot) => {
    const walk = (node: HastRoot | Element) => {
      if (!("children" in node) || !node.children) return;

      const out: RootContent[] = [];
      for (const child of node.children) {
        if (
          child.type !== "element" ||
          child.tagName !== "p" ||
          !child.children.some((c) => hasBreak(c))
        ) {
          out.push(child);
          if (child.type === "element") walk(child);
          continue;
        }

        const segments: ElementContent[][] = [[]];
        const collect = (nodes: ElementContent[]) => {
          for (const item of nodes) {
            if (item.type === "element" && item.tagName === "br") segments.push([]);
            else if (item.type === "element" && item.tagName === "span" &&
                     item.children.some((c) => c.type === "element" && c.tagName === "br")) {
              collect(item.children);
            } else segments[segments.length - 1].push(item);
          }
        };
        collect(child.children);

        const parts = segments
          .filter((seg) => seg.some((item) => !isBlank(item)))
          .map((seg): RootContent => ({
            type: "element",
            tagName: "p",
            properties: { ...child.properties },
            children: seg,
          }));

        out.push(...(parts.length ? parts : [child]));
      }
      node.children = out;
    };
    walk(tree);
  };
}

/**
 * ترقية العناوين إلى وسوم حقيقية.
 *
 * الكاتبة تكتب عناوين أقسامها بخطّ عريض أو ملوّن أو أكبر حجمًا — عناوين بصريًا
 * لا بنيويًا. بلا هذه الترقية يصير المقال جدارًا من الفقرات: بلا فهرس محتويات،
 * وبلا بنية يقرأها زاحف البحث. النصّ يُنقل حرفيًا؛ يتغيّر مستواه فقط.
 */
export function promoteHeadings() {
  return (tree: HastRoot) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (!parent || index === null || index === undefined) return;
      if (node.tagName !== "p" && node.tagName !== "div") return;
      if (hasImage(node)) return;

      const line = nodeText(node).trim();
      if (!line || line.length > HEADING_MAX || /\.$/.test(line)) return;
      if (SEPARATOR.test(line)) return;

      // بند مرقّم كتبته الكاتبة فقرة: «1. تنظيف البشرة بعمق» يتبعه شرحه.
      const bare = stripLeadingSymbols(line);
      const numbered = /^\d{1,2}[.)]\s*\S/.test(bare) && line.length <= 90;

      const kids = node.children.filter((child) => !isBlank(child));
      const marked =
        kids.length === 1 && kids[0].type === "element" && looksLikeHeadingMark(kids[0]);

      // بعض المقالات بلا أي تمييز بصري: تفصل أقسامها بسطر «⸻»، فما بعده عنوان.
      let afterSeparator = false;
      for (let i = index - 1; i >= 0; i -= 1) {
        const sibling = parent.children[i];
        if (isBlank(sibling)) continue;
        afterSeparator = SEPARATOR.test(nodeText(sibling).trim());
        break;
      }

      if (!numbered && !marked && !afterSeparator) return;

      parent.children[index] = {
        type: "element",
        tagName: numbered ? "h3" : "h2",
        properties: {},
        children: [{ type: "text", value: line }],
      };
    });
  };
}

/** بادئات تُكتب يدويًا بدل القوائم في محرّر Blogger. */
const BULLET = /^[*•\-–—]\s+(?=\S)/;

/**
 * فقرات متتابعة تبدأ بنجمة أو نقطة هي قائمة كتبتها الكاتبة يدويًا. تجميعها في
 * قائمة حقيقية يمنع خروجها نجومًا مهرّبة (\*) في المحرّر ويعطيها دلالة صحيحة.
 */
export function buildLists() {
  return (tree: HastRoot) => {
    const walk = (node: HastRoot | Element) => {
      if (!("children" in node) || !node.children) return;

      const out: RootContent[] = [];
      let run: Element[] = [];

      const flush = () => {
        if (run.length < 2) {
          out.push(...run);
        } else {
          out.push({
            type: "element",
            tagName: "ul",
            properties: {},
            children: run.map((item) => ({
              type: "element" as const,
              tagName: "li",
              properties: {},
              children: [
                { type: "text" as const, value: nodeText(item).trim().replace(BULLET, "") },
              ],
            })),
          });
        }
        run = [];
      };

      for (const child of node.children) {
        const text = child.type === "element" ? nodeText(child).trim() : "";
        const isItem =
          child.type === "element" &&
          child.tagName === "p" &&
          !hasImage(child) &&
          BULLET.test(text) &&
          text.length <= 220;

        if (isItem) {
          run.push(child as Element);
          continue;
        }
        flush();
        out.push(child);
        if (child.type === "element") walk(child);
      }
      flush();
      node.children = out;
    };
    walk(tree);
  };
}

/** سمات عرض بحتة: لا تُترجم إلى Markdown وتُشوّش المحوّل. */
export function stripAttributes() {
  return (tree: HastRoot) => {
    visit(tree, "element", (node: Element) => {
      if (!node.properties) return;
      for (const key of Object.keys(node.properties)) {
        if (key === "src" || key === "alt" || key === "href") continue;
        delete node.properties[key];
      }
    });
  };
}

/** محرّر Blogger يولّد فقرات فارغة بغزارة — تصير أسطرًا بيضاء بلا معنى. */
export function pruneEmpty() {
  return (tree: HastRoot) => {
    const walk = (node: HastRoot | Element) => {
      if (!("children" in node) || !node.children) return;
      node.children = node.children.filter(
        (child) =>
          !(
            child.type === "element" &&
            ["p", "div", "span", "b", "strong", "br"].includes(child.tagName) &&
            isBlank(child)
          ),
      );
      for (const child of node.children) if (child.type === "element") walk(child);
    };
    walk(tree);
  };
}

/**
 * إخراج المسافات من حواف النصّ العريض والمائل.
 *
 * حين ينتهي نصّ عريض بمسافة يضطر المولّد إلى ترميزها (‎&#x20;‎) لئلا يلتبس
 * محدّد التوكيد بما بعده — فيظهر ترميز خام في المحرّر. نقل المسافة خارج
 * التوكيد يعطي النتيجة نفسها بلا ترميز.
 */
function tidyEmphasis() {
  return (tree: MdastRoot) => {
    visit(tree, (node, index, parent) => {
      if (!parent || index === null || index === undefined) return;
      if (node.type !== "strong" && node.type !== "emphasis") return;

      const children = (node as { children: { type: string; value?: string }[] }).children;
      const first = children[0];
      const last = children[children.length - 1];
      const before: MdastContent[] = [];
      const after: MdastContent[] = [];

      if (first?.type === "text" && typeof first.value === "string") {
        const trimmed = first.value.replace(/^\s+/, "");
        if (trimmed !== first.value) {
          before.push({ type: "text", value: first.value.slice(0, first.value.length - trimmed.length) });
          first.value = trimmed;
        }
      }
      if (last?.type === "text" && typeof last.value === "string") {
        const trimmed = last.value.replace(/\s+$/, "");
        if (trimmed !== last.value) {
          after.push({ type: "text", value: last.value.slice(trimmed.length) });
          last.value = trimmed;
        }
      }

      if (!before.length && !after.length) return;
      if (!children.some((child) => child.type !== "text" || child.value)) {
        // لم يبقَ داخل التوكيد شيء — يُستبدل بنصّه.
        parent.children.splice(index, 1, ...before, ...after);
        return index;
      }
      parent.children.splice(index, 1, ...before, node as MdastContent, ...after);
      return index + before.length + 1;
    });
  };
}

function htmlToMarkdown(html: string, images: ImageRegistry): string {
  const processed = unified()
    .use(rehypeParse, { fragment: true })
    .use(normalizeBlogger, images)
    .use(splitOnBreaks)
    .use(promoteHeadings)
    .use(buildLists)
    .use(stripAttributes)
    .use(pruneEmpty)
    .use(rehypeRemark)
    .use(tidyEmphasis)
    .use(remarkGfm)
    .use(remarkStringify, { bullet: "-", emphasis: "_", strong: "*", rule: "-" })
    .processSync(html);

  return String(processed)
    .replace(/\\([؀-ۿ])/g, "$1") // remark يهرب أحرفًا عربية بلا داعٍ
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* ------------------------------------------------------------------ التنفيذ */

const raw = JSON.parse(readFileSync(IN, "utf8")) as { posts: RawPost[] };
const live = raw.posts.filter((post) => post.status === "LIVE");

const takenSlugs = new Set<string>();
const articles: unknown[] = [];
const redirects: { from: string; to: string; title: string }[] = [];
const imageJobs: { remote: string; local: string }[] = [];
const warnings: string[] = [];

for (const post of live) {
  // روابط Blogger آلية (blog-post_870) بلا دلالة — نشتقّ الرابط من العنوان.
  let base = slugify(post.title).slice(0, 60).replace(/-+$/g, "");
  if (!base) base = slugify(post.filename.replace(/\.html$/, "")) || "article";
  let slug = base;
  let counter = 2;
  while (takenSlugs.has(slug)) slug = `${base}-${counter++}`;
  takenSlugs.add(slug);

  const images = new ImageRegistry(slug);
  const content = htmlToMarkdown(post.html, images);

  for (const [remote, local] of images.map) imageJobs.push({ remote, local });

  // أول صورة تصير صورة الغلاف وتُرفع من المتن كي لا تظهر مرتين في الصفحة.
  const firstLocal = [...images.map.values()][0] ?? null;
  // الصورة البارزة تُعرض في رأس الصفحة، فتُرفع من المتن كي لا تظهر مرتين.
  // بعض المقالات تكرّر الصورة نفسها في المتن؛ تُرفع كلّ نسخها لا الأولى فقط.
  let body = content;
  if (firstLocal) {
    const close = `](${firstLocal})`;
    for (;;) {
      const at = body.indexOf(close);
      if (at === -1) break;
      const open = body.lastIndexOf("![", at);
      if (open === -1) break;
      body = body.slice(0, open) + body.slice(at + close.length);
    }
  }
  body = body
    .replace(/^[-*]\s*$/gm, "") // بند قائمة فرغ بعد رفع الصورة منه
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const category =
    CATEGORY_OF_FILENAME[post.filename] ??
    post.labels.map((label) => CATEGORY_OF_LABEL[label]).find(Boolean) ??
    DEFAULT_CATEGORY;

  if (!post.labels.length) warnings.push(`بلا وسم: «${post.title}»`);
  if (post.title.length > 90)
    warnings.push(`عنوان طويل (${post.title.length} حرفًا): «${post.title.slice(0, 55)}…»`);
  if (!post.metaDescription) warnings.push(`بلا وصف: «${post.title}»`);
  if (!firstLocal) warnings.push(`بلا صورة: «${post.title}»`);

  articles.push({
    title: post.title,
    slug,
    excerpt: post.metaDescription,
    content: body,
    categorySlug: category,
    authorSlug: "miss-manal",
    tags: post.labels,
    seoTitle: "",
    metaDescription: post.metaDescription,
    focusKeyword: "",
    secondaryKeywords: [],
    featuredImage: firstLocal,
    featuredImageAlt: firstLocal ? images.alts.get(firstLocal) ?? "" : "",
    publishedAt: post.published,
    updatedAt: post.updated,
    viewCount: 0,
  });

  redirects.push({ from: post.filename, to: `/article/${slug}`, title: post.title });
}

/* ------------------------------------------------ إعادة كتابة الروابط الداخلية */

/**
 * صفحات Blogger الثابتة تقابلها صفحات في المشروع أصلًا، فتُوجَّه إليها بدل أن
 * تُنقل نسخة ثانية منها.
 */
const PAGE_REDIRECTS: Record<string, string> = {
  "/p/blog-page.html": "/about",
  "/p/blog-page_25.html": "/privacy-policy",
  "/p/blog-page_21.html": "/terms",
  "/p/blog-page_23.html": "/disclaimer",
  "/p/0508517675-redgalaxy70gmail.html": "/contact",
};

const pathToNew = new Map<string, string>();
for (const entry of redirects) pathToNew.set(entry.from, entry.to);
for (const [from, to] of Object.entries(PAGE_REDIRECTS)) pathToNew.set(from, to);

// المنشور المحذوف نسخة مكرّرة من مقال منشور؛ من يصل إليه يُوجَّه إلى الأصل.
const trashedDuplicate = redirects.find((entry) => entry.title.includes("الليمون رفيقك"));
if (trashedDuplicate) pathToNew.set("/2026/06/blog-post_346.html", trashedDuplicate.to);

const OLD_HOST = /^https?:\/\/(?:www\.)?mushattcareforhair\.blogspot\.com/i;
const unresolved: string[] = [];
let rewritten = 0;

for (const article of articles as { content: string }[]) {
  article.content = article.content.replace(/\]\((https?:\/\/[^)\s]+)\)/g, (match, url: string) => {
    if (!OLD_HOST.test(url)) return match;

    const path = url.replace(OLD_HOST, "").replace(/[?#].*$/, "") || "/";
    const target = path === "/" ? "/" : pathToNew.get(path);

    if (!target) {
      unresolved.push(url);
      return match;
    }
    rewritten += 1;
    return `](${target})`;
  });
}

if (unresolved.length) {
  warnings.push(
    `روابط للمدونة القديمة بلا مقابل جديد (${unresolved.length}): ` +
      [...new Set(unresolved)].join(" ، "),
  );
}

for (const [from, to] of Object.entries(PAGE_REDIRECTS)) {
  redirects.push({ from, to, title: "صفحة ثابتة" });
}
if (trashedDuplicate) {
  redirects.push({
    from: "/2026/06/blog-post_346.html",
    to: trashedDuplicate.to,
    title: "نسخة مكرّرة محذوفة",
  });
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(`${OUT_DIR}/articles.json`, JSON.stringify(articles, null, 1), "utf8");
writeFileSync(`${OUT_DIR}/redirects.json`, JSON.stringify(redirects, null, 1), "utf8");
writeFileSync(`${OUT_DIR}/images.json`, JSON.stringify(imageJobs, null, 1), "utf8");
writeFileSync(`${OUT_DIR}/warnings.json`, JSON.stringify(warnings, null, 1), "utf8");

console.log(`مقالات محوّلة: ${articles.length}`);
console.log(`روابط داخلية أُعيدت كتابتها: ${rewritten}`);
console.log(`صور: ${imageJobs.length}`);
console.log(`تحويلات: ${redirects.length}`);
console.log(`تنبيهات: ${warnings.length}`);
