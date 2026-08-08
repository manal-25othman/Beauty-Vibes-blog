/**
 * أحداث GA4 المستخدمة في الموقع.
 * التسمية موحّدة هنا حتى لا تتفرّق النصوص الحرفية في المكوّنات.
 */
export const ANALYTICS_EVENTS = {
  pageView: "page_view",
  articleView: "article_view",
  search: "search",
  outboundClick: "outbound_click",
  newsletterSignup: "newsletter_signup",
  contactSubmit: "contact_submit",
  shareClick: "share_click",
} as const;

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

type GtagFn = (
  command: "config" | "event" | "js" | "set",
  targetOrName: string | Date,
  params?: Record<string, unknown>,
) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
  }
}

/**
 * يرسل حدثًا إلى GA4 إن كان محمّلًا فعلًا.
 * الصمت المتعمّد عند غياب gtag يجعل استدعاء الدالة آمنًا في كل مكان،
 * سواء أُدخل معرّف القياس أم لا.
 */
export function trackEvent(
  name: AnalyticsEvent | string,
  params: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

/** يُستدعى عند الضغط على رابط خارجي داخل نص المقال. */
export function trackOutboundClick(url: string, context?: string): void {
  trackEvent(ANALYTICS_EVENTS.outboundClick, {
    link_url: url,
    link_domain: safeHost(url),
    context: context ?? "",
  });
}

function safeHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}
