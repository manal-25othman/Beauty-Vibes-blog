"use client";

import { useId, useState } from "react";

type Props = {
  /** اسم الحقل — تُرسل كل قيمة في مُدخل مخفي مستقل بنفس الاسم. */
  name: string;
  label: string;
  hint?: string;
  initial?: string[];
  max?: number;
  placeholder?: string;
};

/**
 * حقل إدخال متعدّد القيم (الوسوم، الكلمات المفتاحية الثانوية).
 *
 * القيم تُرسل كـ inputs مخفية بنفس الاسم، فيقرأها الخادم عبر
 * formData.getAll(name) دون الحاجة إلى ترميز JSON.
 */
export function ChipsInput({
  name,
  label,
  hint,
  initial = [],
  max = 15,
  placeholder = "اكتبي ثم اضغطي Enter",
}: Props) {
  const [items, setItems] = useState<string[]>(initial);
  const [draft, setDraft] = useState("");
  const id = useId();

  function add(raw: string) {
    const value = raw.trim().replace(/,+$/, "");
    if (!value) return;
    if (items.length >= max) return;
    // المقارنة غير حسّاسة للمسافات الزائدة حتى لا يتكرّر الوسم نفسه بصيغتين.
    if (items.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setDraft("");
      return;
    }
    setItems([...items, value]);
    setDraft("");
  }

  function remove(index: number) {
    setItems(items.filter((_, position) => position !== index));
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      // Enter داخل حقل نصّي يُرسل النموذج افتراضيًا — نمنع ذلك هنا.
      event.preventDefault();
      add(draft);
      return;
    }
    if (event.key === "Backspace" && !draft && items.length > 0) {
      remove(items.length - 1);
    }
  }

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
        <span dir="ltr" className="text-xs text-ink-faint">
          {items.length} / {max}
        </span>
      </div>

      {items.map((item) => (
        <input key={item} type="hidden" name={name} value={item} />
      ))}

      <div className="rounded-xl border border-line bg-canvas p-2 focus-within:border-accent">
        {items.length > 0 && (
          <ul className="mb-2 flex flex-wrap gap-1.5">
            {items.map((item, index) => (
              <li key={item}>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs text-accent">
                  {item}
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-accent transition-colors hover:text-danger"
                  >
                    <span aria-hidden="true">×</span>
                    <span className="sr-only">إزالة {item}</span>
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}

        <input
          id={id}
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => add(draft)}
          disabled={items.length >= max}
          placeholder={items.length >= max ? "بلغتِ الحد الأقصى" : placeholder}
          className="w-full bg-transparent px-2 py-1 text-sm text-ink placeholder:text-ink-faint focus:outline-none"
        />
      </div>

      {hint && <p className="mt-1.5 text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}
