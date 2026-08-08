"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { changePassword } from "@/app/actions/auth";
import { initialFormState } from "@/lib/form-state";
import { TextField } from "@/components/admin/field";

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(changePassword, initialFormState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <TextField
        label="كلمة المرور الحالية"
        name="currentPassword"
        type="password"
        required
        dir="ltr"
        autoComplete="current-password"
        error={state.errors.currentPassword}
      />

      <TextField
        label="كلمة المرور الجديدة"
        name="newPassword"
        type="password"
        required
        dir="ltr"
        autoComplete="new-password"
        error={state.errors.newPassword}
        hint="١٢ حرفًا على الأقل، وتشمل حرفًا كبيرًا وحرفًا صغيرًا ورقمًا."
      />

      <TextField
        label="تأكيد كلمة المرور الجديدة"
        name="confirmPassword"
        type="password"
        required
        dir="ltr"
        autoComplete="new-password"
        error={state.errors.confirmPassword}
      />

      <div role="status" aria-live="polite">
        {state.status === "success" && (
          <p className="rounded-xl bg-success-soft px-4 py-3 text-sm text-success">
            {state.message}
          </p>
        )}
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
      className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
    >
      {pending ? "جارٍ التغيير…" : "تغيير كلمة المرور"}
    </button>
  );
}
