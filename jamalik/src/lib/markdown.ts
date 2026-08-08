import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import { headingRank } from "hast-util-heading-rank";
import { toString as hastToString } from "hast-util-to-string";
import type { Root as HastRoot, Element } from "hast";
import type { Root as MdastRoot } from "mdast";
import { getSiteUrl } from "@/config/site";

// يُعاد التصدير للحفاظ على نقطة استيراد واحدة لمن يحتاج الاثنين معًا.
export { markdownToPlainText, countWords } from "@/lib/markdown-text";

export type TocEntry = {
  id: string;
  text: string;
  level: 2 | 3;
};

export type RenderedMarkdown = {
  html: string;
  toc: TocEntry[];
};

/**
 * صناديق النصائح والتحذيرات تُكتب بصيغة directives:
 *
 *   :::tip[عنوان اختياري]
 *   نص النصيحة
 *   :::
 *
 * المسموح به محدود عمدًا؛ أي directive غير معروف يُعرض كنص عادي.
 */
const DIRECTIVE_VARIANTS: Record<string, { label: string; className: string }> = {
  tip: { label: "نصيحة", className: "callout callout-tip" },
  note: { label: "ملاحظة", className: "callout callout-note" },
  warning: { label: "تنبيه", className: "callout callout-warning" },
};

function remarkCallouts() {
  return (tree: MdastRoot) => {
    visit(tree, (node) => {
      if (
        node.type !== "containerDirective" &&
        node.type !== "leafDirective" &&
        node.type !== "textDirective"
      ) {
        return;
      }

      const directive = node as unknown as {
        name: string;
        type: string;
        children: unknown[];
        data?: Record<string, unknown>;
      };

      const variant = DIRECTIVE_VARIANTS[directive.name];
      if (!variant || directive.type !== "containerDirective") return;

      // العنوان الاختياري يأتي كأول عنصر بـ directiveLabel.
      const children = directive.children as {
        type: string;
        data?: { directiveLabel?: boolean };
        children?: unknown[];
      }[];

      let title = variant.label;
      const first = children[0];
      if (first?.data?.directiveLabel) {
        title = hastToString(first as never) || variant.label;
        children.shift();
      }

      // العنوان عنصر حقيقي في الشجرة لا محتوى مولّد بـ CSS: المحتوى المولّد
      // لا تنطقه بعض قارئات الشاشة، ولا ينجو من التعقيم كسمة data مخصّصة.
      children.unshift({
        type: "paragraph",
        data: { hProperties: { className: "callout-title" } },
        children: [{ type: "text", value: title }],
      } as never);

      directive.data = {
        hName: "aside",
        hProperties: {
          className: variant.className,
          role: "note",
        },
      };
    });
  };
}

/**
 * يضيف السلوك المطلوب للروابط والصور:
 * - الروابط الخارجية تُفتح في تبويب جديد مع rel آمن.
 * - الصور تُحمَّل بكسل (lazy) مع أبعاد افتراضية لتقليل انزياح التخطيط.
 */
function rehypeEnhance() {
  return (tree: HastRoot) => {
    const siteHost = (() => {
      try {
        return new URL(getSiteUrl()).host;
      } catch {
        return "";
      }
    })();

    visit(tree, "element", (node: Element) => {
      if (node.tagName === "a") {
        const href = String(node.properties?.href ?? "");
        const isExternal = /^https?:\/\//i.test(href);

        if (isExternal) {
          let external = true;
          try {
            external = new URL(href).host !== siteHost;
          } catch {
            external = true;
          }

          if (external) {
            node.properties = {
              ...node.properties,
              target: "_blank",
              // hast يتوقّع قائمة للسمات المفصولة بمسافات مثل rel
              rel: ["noopener", "noreferrer", "nofollow"],
            };
          }
        }
      }

      if (node.tagName === "img") {
        node.properties = {
          loading: "lazy",
          decoding: "async",
          ...node.properties,
        };
        // نص بديل فارغ أفضل من غيابه: يخبر القارئ الصوتي أن الصورة زخرفية
        // بدل أن ينطق اسم الملف.
        if (node.properties.alt === undefined) {
          node.properties.alt = "";
        }
      }
    });
  };
}

function rehypeCollectToc(collector: TocEntry[]) {
  return (tree: HastRoot) => {
    visit(tree, "element", (node: Element) => {
      const rank = headingRank(node);
      if (rank !== 2 && rank !== 3) return;

      const id = typeof node.properties?.id === "string" ? node.properties.id : "";
      if (!id) return;

      const text = hastToString(node).trim();
      if (!text) return;

      collector.push({ id, text, level: rank as 2 | 3 });
    });
  };
}

/**
 * قائمة بيضاء صارمة: لا script ولا style ولا iframe ولا معالجات أحداث.
 * محتوى المقال يأتي من محرّر موثوق، لكن التعقيم يبقى خط الدفاع الأخير
 * لو صار الإدخال أوسع لاحقًا (كتّاب ضيوف مثلًا).
 */
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []).filter(
      (tag) => !["script", "style", "iframe", "object", "embed", "form", "input"].includes(tag),
    ),
    "aside",
    "figure",
    "figcaption",
    "mark",
  ],
  attributes: {
    ...defaultSchema.attributes,
    "*": [
      ...(defaultSchema.attributes?.["*"] ?? []),
      "className",
      "id",
      "dir",
    ],
    a: [
      ...(defaultSchema.attributes?.a ?? []),
      "target",
      "rel",
    ],
    img: [
      ...(defaultSchema.attributes?.img ?? []),
      "loading",
      "decoding",
      "width",
      "height",
    ],
    aside: ["className", "role"],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ["http", "https", "mailto", "tel"],
    src: ["http", "https"],
  },
};

export async function renderMarkdown(
  markdown: string,
): Promise<RenderedMarkdown> {
  const toc: TocEntry[] = [];

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkCallouts)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSlug)
    .use(rehypeEnhance)
    .use(rehypeSanitize, sanitizeSchema)
    // بعد التعقيم لا قبله: rehype-sanitize يسبق معرّفات العناوين بـ
    // clobberPrefix، فجمعها قبله كان ينتج روابط فهرس لا تطابق أي عنصر.
    .use(rehypeCollectToc, toc)
    .use(rehypeStringify)
    .process(markdown ?? "");

  return { html: String(file), toc };
}
