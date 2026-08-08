import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Almarai, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

import { getSiteUrl, siteConfig } from "@/config/site";
import { getSettings, isAnalyticsEnabled } from "@/lib/settings";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { AdSenseScript } from "@/components/ads/adsense-script";

/**
 * خطان عربيان فقط، مع `display: swap` حتى لا يُحجب النص أثناء التحميل
 * (تجنّبًا لتأخير LCP). الأوزان محدودة عمدًا لتقليل حجم التحميل.
 */
const bodyFont = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const headingFont = Almarai({
  subsets: ["arabic"],
  weight: ["700", "800"],
  variable: "--font-heading",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: `${settings.siteName} — ${siteConfig.tagline}`,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.siteDescription,
    applicationName: settings.siteName,
    generator: "Next.js",
    referrer: "origin-when-cross-origin",
    formatDetection: { telephone: false, address: false, email: false },
    icons: {
      icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/icon.svg" }],
    },
    // يُحقن وسم التحقق تلقائيًا متى أُدخلت القيمة في لوحة التحكم.
    ...(settings.googleSiteVerification
      ? { verification: { google: settings.googleSiteVerification } }
      : {}),
    alternates: {
      canonical: getSiteUrl(),
      types: {
        "application/rss+xml": [
          { url: `${getSiteUrl()}/rss.xml`, title: settings.siteName },
        ],
      },
    },
    openGraph: {
      type: "website",
      siteName: settings.siteName,
      locale: siteConfig.locale,
      url: getSiteUrl(),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#fcfaf8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // لا نمنع التكبير — منعه يُخالف معايير الوصولية
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();
  const analyticsOn = isAnalyticsEnabled(settings);

  return (
    <html
      lang={siteConfig.lang}
      dir={siteConfig.direction}
      className={`${bodyFont.variable} ${headingFont.variable}`}
    >
      <body className="min-h-dvh antialiased">
        <a href="#main-content" className="skip-link">
          تخطّي إلى المحتوى الرئيسي
        </a>

        {children}

        {analyticsOn && (
          // useSearchParams داخل المكوّن يتطلّب حدود Suspense،
          // وإلا أُجبرت كل الصفحات على التصيير الديناميكي.
          <Suspense fallback={null}>
            <GoogleAnalytics measurementId={settings.gaMeasurementId} />
          </Suspense>
        )}
        <AdSenseScript />
      </body>
    </html>
  );
}
