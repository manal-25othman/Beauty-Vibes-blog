"use client";

import { useEffect, useRef } from "react";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

type Props = {
  slug: string;
  title: string;
  category: string;
  author: string;
};

/**
 * يسجّل قراءة المقال مرة واحدة لكل تحميل صفحة:
 * حدث article_view في GA4، وزيادة عدّاد المشاهدات في قاعدة البيانات.
 *
 * `keepalive` يسمح للطلب بالاكتمال حتى لو غادرت الزائرة الصفحة فورًا.
 */
export function ArticleViewTracker({ slug, title, category, author }: Props) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    trackEvent(ANALYTICS_EVENTS.articleView, {
      article_slug: slug,
      article_title: title,
      article_category: category,
      article_author: author,
    });

    fetch("/api/articles/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
      keepalive: true,
    }).catch(() => {
      // العدّاد ليس حرجًا؛ فشل الطلب لا يجب أن يُظهر أي خطأ للزائرة.
    });
  }, [slug, title, category, author]);

  return null;
}
