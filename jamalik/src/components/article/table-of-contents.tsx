"use client";

import { useEffect, useState } from "react";
import type { TocEntry } from "@/lib/markdown";

/**
 * فهرس المحتويات.
 *
 * التنقّل يعمل بروابط مرساة عادية، فلا يعتمد على JavaScript إطلاقًا؛
 * الـ JS هنا يضيف تمييز القسم الحالي فقط، وهو تحسين اختياري.
 */
export function TableOfContents({ entries }: { entries: TocEntry[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (entries.length === 0) return;

    const observer = new IntersectionObserver(
      (records) => {
        const visible = records
          .filter((record) => record.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]?.target.id) setActiveId(visible[0].target.id);
      },
      // الهامش العلوي يعوّض الترويسة اللاصقة، والسفلي يجعل القسم
      // "نشطًا" وهو في أعلى الشاشة لا عند منتصفها.
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );

    for (const entry of entries) {
      const element = document.getElementById(entry.id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [entries]);

  if (entries.length < 3) return null;

  return (
    <nav
      aria-labelledby="toc-heading"
      className="rounded-2xl border border-line bg-surface p-5"
    >
      <h2
        id="toc-heading"
        className="mb-3 font-display text-base font-bold text-ink"
      >
        محتويات المقال
      </h2>
      <ol className="space-y-1.5 text-sm">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className={entry.level === 3 ? "ps-4" : undefined}
          >
            <a
              href={`#${entry.id}`}
              aria-current={activeId === entry.id ? "location" : undefined}
              className={`block border-e-2 pe-3 leading-relaxed transition-colors ${
                activeId === entry.id
                  ? "border-accent font-semibold text-accent"
                  : "border-transparent text-ink-muted hover:border-line-strong hover:text-ink"
              }`}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
