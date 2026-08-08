"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { useFormStatus } from "react-dom";
import { subscribeToNewsletter } from "@/app/actions/public-forms";
import { initialFormState } from "@/lib/form-state";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

type Props = {
  /** من أي صفحة جاء الاشتراك — يُحفظ للتحليل لاحقًا. */
  source: string;
  variant?: "inline" | "card";
};

export function NewsletterForm({ source, variant = "inline" }: Props) {
  const [state, formAction] = useActionState(
    subscribeToNewsletter,
    initialFormState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const emailId = useId();
  const statusId = useId();

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      trackEvent(ANALYTICS_EVENTS.newsletterSignup, { source });
    }
  }, [state.status, source]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-3"
      noValidate
    >
      <input type="hidden" name="source" value={source} />

      {/* مصيدة الروبوتات: مخفية بصريًا وعن القارئ الصوتي معًا. */}
      <div aria-hidden="true" className="offscreen">
        <label htmlFor={`${emailId}-website`}>لا تملئي هذا الحقل</label>
        <input
          id={`${emailId}-website`}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div
        className={
          variant === "card"
            ? "flex flex-col gap-2"
            : "flex flex-col gap-2 sm:flex-row"
        }
      >
        <div className="min-w-0 flex-1">
          <label htmlFor={emailId} className="sr-only">
            بريدك الإلكتروني
          </label>
          <input
            id={emailId}
            type="email"
            name="email"
            required
            autoComplete="email"
            dir="ltr"
            placeholder="you@example.com"
            aria-describedby={statusId}
            aria-invalid={state.errors.email ? true : undefined}
            className={`w-full rounded-full border bg-surface px-5 py-3 text-start text-ink placeholder:text-ink-faint focus:outline-none ${
              state.errors.email
                ? "border-danger focus:border-danger"
                : "border-line focus:border-accent"
            }`}
          />
        </div>

        <SubmitButton />
      </div>

      <p id={statusId} role="status" aria-live="polite" className="min-h-5 text-sm">
        {state.errors.email && (
          <span className="text-danger">{state.errors.email}</span>
        )}
        {!state.errors.email && state.status === "error" && (
          <span className="text-danger">{state.message}</span>
        )}
        {state.status === "success" && (
          <span className="text-success">{state.message}</span>
        )}
      </p>

      <p className="text-xs leading-relaxed text-ink-faint">
        نرسل رسالة واحدة أسبوعيًا. يمكنك إلغاء الاشتراك في أي وقت، ولا نشارك
        بريدك مع أي جهة أخرى.
      </p>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "جارٍ الاشتراك…" : "اشتركي"}
    </button>
  );
}
