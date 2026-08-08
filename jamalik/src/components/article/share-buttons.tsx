"use client";

import { useState } from "react";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

type Props = {
  url: string;
  title: string;
};

/**
 * أزرار المشاركة.
 *
 * روابط مباشرة بلا أي سكربتات طرف ثالث — لا widgets ولا تتبّع خارجي،
 * وهو ما يبقي الصفحة خفيفة ويحترم خصوصية الزائر.
 */
export function ShareButtons({ url, title }: Props) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const targets = [
    {
      name: "واتساب",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: "إكس",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      name: "فيسبوك",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "بينتريست",
      href: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackEvent(ANALYTICS_EVENTS.shareClick, { method: "copy_link", item: title });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // الحافظة غير متاحة (سياق غير آمن أو رفض الإذن) — نبقي الأزرار الأخرى تعمل.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="me-1 text-sm font-semibold text-ink">شاركي المقال:</span>

      {targets.map((target) => (
        <a
          key={target.name}
          href={target.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            trackEvent(ANALYTICS_EVENTS.shareClick, {
              method: target.name,
              item: title,
            })
          }
          className="rounded-full border border-line px-3.5 py-1.5 text-xs text-ink-soft transition-colors hover:border-accent hover:text-accent"
        >
          {target.name}
        </a>
      ))}

      <button
        type="button"
        onClick={copyLink}
        className="rounded-full border border-line px-3.5 py-1.5 text-xs text-ink-soft transition-colors hover:border-accent hover:text-accent"
      >
        {copied ? "تم النسخ ✓" : "نسخ الرابط"}
      </button>
    </div>
  );
}
