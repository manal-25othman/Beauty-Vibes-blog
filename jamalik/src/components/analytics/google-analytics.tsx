"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { ANALYTICS_EVENTS } from "@/lib/analytics";

type Props = { measurementId: string };

/**
 * تحميل GA4 مرة واحدة فقط.
 *
 * `send_page_view: false` مقصود: موجّه App Router لا يعيد تحميل الصفحة،
 * فلو تُرك الإرسال التلقائي لسجّل زيارة واحدة فقط طوال الجلسة. نرسل
 * page_view يدويًا عند كل تغيّر في المسار بدلًا من ذلك.
 */
export function GoogleAnalytics({ measurementId }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!measurementId || typeof window.gtag !== "function") return;

    const query = searchParams.toString();
    const url = query ? `${pathname}?${query}` : pathname;

    // الحارس يمنع إرسالًا مزدوجًا عند إعادة التركيب في وضع التطوير الصارم.
    if (lastPath.current === url) return;
    lastPath.current = url;

    window.gtag("event", ANALYTICS_EVENTS.pageView, {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams, measurementId]);

  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            send_page_view: false,
            anonymize_ip: true
          });
        `}
      </Script>
    </>
  );
}
