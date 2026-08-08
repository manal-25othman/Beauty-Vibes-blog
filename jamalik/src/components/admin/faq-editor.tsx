"use client";

import { useState } from "react";

export type FaqDraft = { question: string; answer: string };

let nextKey = 0;

/**
 * محرّر الأسئلة الشائعة.
 *
 * تحذير مقصود في الواجهة: ترميز FAQPage لا يجوز إلا لأسئلة معروضة فعلًا
 * للزائر، وهو ما يحدث هنا — الأسئلة تظهر أسفل المقال.
 */
export function FaqEditor({ initial = [] }: { initial?: FaqDraft[] }) {
  const [rows, setRows] = useState(() =>
    initial.map((faq) => ({ ...faq, key: nextKey++ })),
  );

  function add() {
    setRows([...rows, { question: "", answer: "", key: nextKey++ }]);
  }

  function remove(key: number) {
    setRows(rows.filter((row) => row.key !== key));
  }

  function update(key: number, field: "question" | "answer", value: string) {
    setRows(rows.map((row) => (row.key === key ? { ...row, [field]: value } : row)));
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink">الأسئلة الشائعة</h3>
          <p className="text-xs text-ink-faint">
            تظهر أسفل المقال، ويُضاف لها ترميز FAQPage تلقائيًا.
          </p>
        </div>
        <button
          type="button"
          onClick={add}
          disabled={rows.length >= 12}
          className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
        >
          + إضافة سؤال
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line-strong p-4 text-center text-xs text-ink-faint">
          لا توجد أسئلة. أضيفيها فقط عندما تكون أسئلة حقيقية يطرحها القرّاء.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row, index) => (
            <li key={row.key} className="rounded-xl border border-line bg-canvas p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-faint">
                  سؤال {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => remove(row.key)}
                  className="text-xs text-danger transition-opacity hover:opacity-70"
                >
                  حذف
                </button>
              </div>

              <label className="sr-only" htmlFor={`faq-q-${row.key}`}>
                نص السؤال {index + 1}
              </label>
              <input
                id={`faq-q-${row.key}`}
                name="faqQuestion"
                value={row.question}
                onChange={(event) => update(row.key, "question", event.target.value)}
                placeholder="نص السؤال"
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />

              <label className="sr-only" htmlFor={`faq-a-${row.key}`}>
                إجابة السؤال {index + 1}
              </label>
              <textarea
                id={`faq-a-${row.key}`}
                name="faqAnswer"
                value={row.answer}
                onChange={(event) => update(row.key, "answer", event.target.value)}
                rows={3}
                placeholder="الإجابة — جملتان إلى ثلاث تكفيان"
                className="mt-2 w-full resize-y rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
