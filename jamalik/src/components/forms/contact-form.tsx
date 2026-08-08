"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { useFormStatus } from "react-dom";
import { submitContactMessage } from "@/app/actions/public-forms";
import { initialFormState } from "@/lib/form-state";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

export function ContactForm() {
  const [state, formAction] = useActionState(
    submitContactMessage,
    initialFormState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const statusId = useId();
  const honeypotId = useId();

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      trackEvent(ANALYTICS_EVENTS.contactSubmit, {});
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5" noValidate>
      <div aria-hidden="true" className="offscreen">
        <label htmlFor={honeypotId}>لا تملئي هذا الحقل</label>
        <input id={honeypotId} type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          name="name"
          label="الاسم"
          autoComplete="name"
          required
          error={state.errors.name}
        />
        <Field
          name="email"
          label="البريد الإلكتروني"
          type="email"
          autoComplete="email"
          dir="ltr"
          required
          error={state.errors.email}
        />
      </div>

      <Field
        name="subject"
        label="الموضوع"
        required
        error={state.errors.subject}
      />

      <Field
        name="message"
        label="الرسالة"
        as="textarea"
        rows={7}
        required
        error={state.errors.message}
        hint="اكتبي رسالتك بوضوح (٢٠ حرفًا على الأقل)."
      />

      <div
        id={statusId}
        role="status"
        aria-live="polite"
        className="min-h-6 text-sm"
      >
        {state.status === "error" && (
          <p className="rounded-xl bg-danger-soft px-4 py-3 text-danger">
            {state.message}
          </p>
        )}
        {state.status === "success" && (
          <p className="rounded-xl bg-success-soft px-4 py-3 text-success">
            {state.message}
          </p>
        )}
      </div>

      <SubmitButton />
    </form>
  );
}

type FieldProps = {
  name: string;
  label: string;
  type?: string;
  as?: "input" | "textarea";
  rows?: number;
  required?: boolean;
  autoComplete?: string;
  dir?: "rtl" | "ltr";
  error?: string;
  hint?: string;
};

function Field({
  name,
  label,
  type = "text",
  as = "input",
  rows,
  required,
  autoComplete,
  dir,
  error,
  hint,
}: FieldProps) {
  const id = `contact-${name}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const shared = {
    id,
    name,
    required,
    autoComplete,
    dir,
    "aria-invalid": error ? (true as const) : undefined,
    "aria-describedby": describedBy,
    className: `w-full rounded-xl border bg-surface px-4 py-3 text-ink placeholder:text-ink-faint focus:outline-none ${
      error ? "border-danger focus:border-danger" : "border-line focus:border-accent"
    }`,
  };

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
        {required && (
          <span className="text-danger" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>

      {as === "textarea" ? (
        <textarea {...shared} rows={rows ?? 5} />
      ) : (
        <input {...shared} type={type} />
      )}

      {hint && (
        <p id={hintId} className="mt-1.5 text-xs text-ink-faint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "جارٍ الإرسال…" : "إرسال الرسالة"}
    </button>
  );
}
