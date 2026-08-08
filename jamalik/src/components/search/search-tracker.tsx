"use client";

import { useEffect, useRef } from "react";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

/**
 * يرسل حدث البحث إلى GA4 مرة واحدة لكل استعلام.
 * الاسم `search` هو الحدث الموصى به من Google، وباراميتر `search_term` هو
 * ما تقرأه تقارير GA4 الجاهزة.
 */
export function SearchTracker({
  query,
  resultCount,
}: {
  query: string;
  resultCount: number;
}) {
  const lastQuery = useRef<string | null>(null);

  useEffect(() => {
    if (!query || lastQuery.current === query) return;
    lastQuery.current = query;

    trackEvent(ANALYTICS_EVENTS.search, {
      search_term: query,
      result_count: resultCount,
    });
  }, [query, resultCount]);

  return null;
}
