"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login } from "@/app/actions/auth";
import { initialFormState } from "@/lib/form-state";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(login, initialFormState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next} />

      <div>
        <label
          htmlFor="login-email"
          className="mb-1.5 block text-sm font-semibold text-ink"
        >
          البريد الإلكتروني
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="username"
          dir="ltr"
          aria-invalid={state.errors.email ? true : undefined}
          aria-describedby={state.errors.email ? "login-email-error" : undefined}
          className={`w-full rounded-xl border bg-canvas px-4 py-3 text-ink focus:outline-none ${
            state.errors.email
              ? "border-danger focus:border-danger"
              : "border-line focus:border-accent"
          }`}
        />
        {state.errors.email && (
          <p id="login-email-error" className="mt-1.5 text-xs text-danger">
            {state.errors.email}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="login-password"
          className="mb-1.5 block text-sm font-semibold text-ink"
        >
          كلمة المرور
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          dir="ltr"
          aria-invalid={state.errors.password ? true : undefined}
          className={`w-full rounded-xl border bg-canvas px-4 py-3 text-ink focus:outline-none ${
            state.errors.password
              ? "border-danger focus:border-danger"
              : "border-line focus:border-accent"
          }`}
        />
        {state.errors.password && (
          <p className="mt-1.5 text-xs text-danger">{state.errors.password}</p>
        )}
      </div>

      <div role="alert" aria-live="assertive" className="min-h-5">
        {state.status === "error" && state.message && (
          <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
            {state.message}
          </p>
        )}
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "جارٍ التحقق…" : "تسجيل الدخول"}
    </button>
  );
}
