"use client";

import { useFormStatus } from "react-dom";

/**
 * زر إرسال يطلب تأكيدًا قبل التنفيذ.
 *
 * يُستخدم للإجراءات غير القابلة للتراجع (الحذف). التأكيد في الواجهة
 * ليس حماية أمنية — الحماية الفعلية في الـ Server Action الذي يتحقّق
 * من الجلسة قبل أي تعديل.
 */
export function ConfirmSubmit({
  label,
  message,
  variant = "danger",
}: {
  label: string;
  message: string;
  variant?: "danger" | "neutral";
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      className={`rounded-lg border px-2.5 py-1 text-xs transition-colors disabled:opacity-50 ${
        variant === "danger"
          ? "border-line text-danger hover:border-danger hover:bg-danger-soft"
          : "border-line text-ink-soft hover:border-accent hover:text-accent"
      }`}
    >
      {pending ? "…" : label}
    </button>
  );
}
