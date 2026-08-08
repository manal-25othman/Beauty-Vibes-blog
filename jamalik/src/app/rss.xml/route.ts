import { absoluteUrl, getSiteUrl, siteConfig } from "@/config/site";
import { getLatestArticles } from "@/lib/queries/articles";
import { getSettings } from "@/lib/settings";

export const revalidate = 3600;

/** يهرب الأحرف الخمسة المحجوزة في XML — بديل عن CDATA يعمل في كل الحقول. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const [settings, articles] = await Promise.all([
    getSettings(),
    getLatestArticles(30).catch(() => []),
  ]);

  const siteUrl = getSiteUrl();
  const buildDate = new Date().toUTCString();

  const items = articles
    .map((article) => {
      const url = absoluteUrl(`/article/${article.slug}`);
      const pubDate = article.publishedAt
        ? new Date(article.publishedAt).toUTCString()
        : buildDate;

      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${escapeXml(article.excerpt)}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(article.category.name)}</category>
      <dc:creator>${escapeXml(article.author.name)}</dc:creator>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(settings.siteName)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(settings.siteDescription)}</description>
    <language>${siteConfig.lang}</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${escapeXml(absoluteUrl("/rss.xml"))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
