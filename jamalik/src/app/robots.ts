import type { MetadataRoute } from "next";
import { absoluteUrl, getSiteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin", // لوحة التحكم
          "/api/", // واجهات داخلية بلا قيمة للزحف
          "/search", // نتائج بحث داخلية — صفحات لا نهائية منخفضة القيمة
        ],
        // صفحات الترقيم مسموح بزحفها عمدًا: كل صفحة تحمل canonical لنفسها
        // ومقالات مختلفة، فحجبها يُخفي جزءًا من الأرشيف عن الفهرسة.
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: getSiteUrl(),
  };
}
