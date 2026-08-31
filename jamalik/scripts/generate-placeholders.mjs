/**
 * يولّد صور SVG نائبة (placeholders) للمقالات والتصنيفات والكتّاب.
 *
 * السبب: المشروع يجب أن يعمل دون أي طلبات لخوادم خارجية — الصور الحقيقية
 * تُرفع لاحقًا من لوحة التحكم. SVG خفيف جدًا ولا يسبب انزياح تخطيط.
 *
 * التشغيل: node scripts/generate-placeholders.mjs
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(process.cwd(), "public", "images");

/** لوحة ألوان هادئة مشتقة من هوية الموقع. */
const CATEGORY_THEMES = {
  "skin-care": { from: "#F6EDE7", to: "#E7D3C6", accent: "#B08968", label: "العناية بالبشرة" },
  "hair-care": { from: "#EFE9F2", to: "#DCCFE4", accent: "#8A6F9E", label: "العناية بالشعر" },
  makeup: { from: "#F8E9EC", to: "#EDCFD7", accent: "#C0798D", label: "المكياج" },
  perfumes: { from: "#EDF0EA", to: "#D6DECF", accent: "#7E8F6B", label: "العطور" },
  "body-care": { from: "#EAF0F2", to: "#CFDDE2", accent: "#6E8C99", label: "الجسم" },
  nails: { from: "#FBEDE6", to: "#F2D6C4", accent: "#C98A63", label: "الأظافر" },
  "natural-beauty": { from: "#EDF2EC", to: "#D3E0D2", accent: "#6F8F72", label: "الجمال الطبيعي" },
  "beauty-products": { from: "#F1EEEA", to: "#DED7CE", accent: "#9A8B77", label: "منتجات الجمال" },
  "health-nutrition": { from: "#EDF3EE", to: "#D2E2D6", accent: "#7C9885", label: "الصحة والتغذية" },
  "womens-health": { from: "#F8E9EC", to: "#EDCFD7", accent: "#C0798D", label: "صحة المرأة" },
  default: { from: "#F5F0EB", to: "#E3D8CE", accent: "#A28A75", label: "جمالِك" },
};

/** شكل زخرفي هادئ: دوائر متداخلة توحي بقطرات العناية دون ضجيج بصري. */
function coverSvg({ from, to, accent, label }, width = 1200, height = 675) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <g fill="none" stroke="${accent}" stroke-opacity="0.28">
    <circle cx="${width * 0.78}" cy="${height * 0.3}" r="${height * 0.34}" stroke-width="1.5"/>
    <circle cx="${width * 0.78}" cy="${height * 0.3}" r="${height * 0.22}" stroke-width="1.5"/>
    <circle cx="${width * 0.2}" cy="${height * 0.78}" r="${height * 0.26}" stroke-width="1.5"/>
  </g>
  <circle cx="${width * 0.78}" cy="${height * 0.3}" r="${height * 0.09}" fill="${accent}" fill-opacity="0.16"/>
  <!-- النص موسّط: محاذاته إلى إحدى الحافتين تعتمد على تفسير المتصفّح
       لاتجاه النص داخل SVG، وقد يخرج النص العربي خارج الإطار. -->
  <text x="50%" y="${height * 0.52}" text-anchor="middle" font-family="'Segoe UI', Tahoma, sans-serif" font-size="${height * 0.075}" fill="${accent}" fill-opacity="0.85">${label}</text>
  <text x="50%" y="${height * 0.52 + height * 0.085}" text-anchor="middle" font-family="'Segoe UI', Tahoma, sans-serif" font-size="${height * 0.036}" fill="${accent}" fill-opacity="0.6">جمالِك — مجلة الجمال والعناية</text>
</svg>`;
}

function avatarSvg(initials, { from, to, accent }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" role="img" aria-label="${initials}">
  <defs>
    <linearGradient id="a" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#a)"/>
  <circle cx="200" cy="158" r="62" fill="${accent}" fill-opacity="0.3"/>
  <path d="M78 400c0-67 55-121 122-121s122 54 122 121z" fill="${accent}" fill-opacity="0.3"/>
</svg>`;
}

function logoSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="48" viewBox="0 0 160 48" role="img" aria-label="جمالِك">
  <text x="158" y="34" text-anchor="end" font-family="'Segoe UI', Tahoma, sans-serif" font-size="30" font-weight="700" fill="#2E2A27" direction="rtl">جمالِك</text>
</svg>`;
}

const AUTHOR_AVATARS = {
  "layan-alharbi": ["ل", CATEGORY_THEMES["skin-care"]],
  "razan-alkhatib": ["ر", CATEGORY_THEMES["hair-care"]],
  "nour-alqasimi": ["ن", CATEGORY_THEMES.makeup],
  "salma-benamor": ["س", CATEGORY_THEMES.perfumes],
};

async function main() {
  await mkdir(path.join(ROOT, "covers"), { recursive: true });
  await mkdir(path.join(ROOT, "authors"), { recursive: true });

  for (const [slug, theme] of Object.entries(CATEGORY_THEMES)) {
    await writeFile(path.join(ROOT, "covers", `${slug}.svg`), coverSvg(theme), "utf8");
  }

  for (const [slug, [initials, theme]] of Object.entries(AUTHOR_AVATARS)) {
    await writeFile(
      path.join(ROOT, "authors", `${slug}.svg`),
      avatarSvg(initials, theme),
      "utf8",
    );
  }

  // صورة المشاركة الافتراضية (Open Graph) بنسبة 1.91:1
  await writeFile(
    path.join(ROOT, "og-default.svg"),
    coverSvg(CATEGORY_THEMES.default, 1200, 630),
    "utf8",
  );
  await writeFile(path.join(ROOT, "logo.svg"), logoSvg(), "utf8");

  console.log(
    `تم توليد ${Object.keys(CATEGORY_THEMES).length + Object.keys(AUTHOR_AVATARS).length + 2} صورة نائبة.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
