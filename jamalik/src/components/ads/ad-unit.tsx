"use client";

import { useEffect, useRef } from "react";

type Props = {
  publisherId: string;
  slotId: string;
  minHeight: string;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * وحدة AdSense واحدة.
 *
 * سكربت AdSense نفسه يُحمَّل مرة واحدة في <head> (انظر AdSenseScript)؛
 * هذا المكوّن يكتفي بدفع الوحدة إلى الطابور.
 */
export function AdUnit({ publisherId, slotId, minHeight }: Props) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // حاجب إعلانات أو فشل تحميل السكربت — لا شيء نفعله، والصفحة تبقى سليمة.
    }
  }, []);

  return (
    <ins
      className="adsbygoogle block w-full overflow-hidden"
      style={{ display: "block", minHeight }}
      data-ad-client={publisherId}
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
