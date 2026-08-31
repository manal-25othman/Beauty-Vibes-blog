import type { NextConfig } from "next";

import { bloggerRedirects } from "./src/config/blogger-redirects";

/** ترويسات أمنية تُطبَّق على كل استجابة. */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    // يُفعَّل فقط خلف HTTPS؛ لا أثر له في التطوير المحلي.
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
    // AVIF أولًا ثم WebP — يختار المتصفّح أول صيغة يدعمها.
    formats: ["image/avif", "image/webp"],
    // الصور النائبة في هذا المشروع بصيغة SVG. الترويسات أدناه تمنع
    // تنفيذ أي سكربت بداخلها إن استُبدلت لاحقًا بملف غير موثوق.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox; style-src 'unsafe-inline'",
    deviceSizes: [360, 420, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 80, 112, 128, 200, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  /**
   * روابط مدونة Blogger المنقولة.
   *
   * الروابط القديمة (‏/2026/05/blog-post_870.html) مفهرسة في محركات البحث
   * ومنشورة في أماكن لا نتحكّم بها. تحويل ٣٠١ دائم ينقل قيمتها إلى الرابط
   * الجديد بدل أن تنتهي إلى صفحة ٤٠٤.
   */
  async redirects() {
    // 301 صراحةً لا permanent: هذه الأخيرة تُخرج 308، وهي مكافئة لدى Google
    // لكنّ أدوات السيو والزواحف القديمة تتعامل مع 301 بلا التباس.
    return bloggerRedirects.map(({ from, to }) => ({
      source: from,
      destination: to,
      statusCode: 301 as const,
    }));
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // لا تُفهرَس نتائج البحث ولا واجهات API — محتوى متغيّر بلا قيمة للزحف.
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },

  experimental: {
    // يقلّل حجم الحزمة بتحميل ما يُستعمل فعلًا من هذه المكتبات.
    optimizePackageImports: ["@prisma/client"],
  },
};

export default nextConfig;
