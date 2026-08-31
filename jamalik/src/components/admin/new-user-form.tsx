"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createUser } from "@/app/actions/admin-users";
import { SelectField, TextField } from "@/components/admin/field";
import { initialFormState } from "@/lib/form-state";

export function NewUserForm() {
  const [state, formAction] = useActionState(createUser, initialFormState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <TextField label="الاسم" name="name" required error={state.errors.name} />

      <TextField
        label="البريد الإلكتروني"
        name="email"
        type="email"
        required
        dir="ltr"
        autoComplete="off"
        error={state.errors.email}
        hint="به تسجّل الدخول."
      />

      <TextField
        label="كلمة مرور مبدئية"
        name="password"
        type="password"
        required
        dir="ltr"
        autoComplete="new-password"
        error={state.errors.password}
        hint="١٢ حرفًا على الأقل، وتشمل حرفًا كبيرًا وحرفًا صغيرًا ورقمًا. تغيّرها هي من «حسابي» بعد أول دخول."
      />

      <SelectField
        label="الصلاحية"
        name="role"
        defaultValue="EDITOR"
        error={state.errors.role}
        options={[
          { value: "EDITOR", label: "محرّرة — تكتب وتنشر المحتوى" },
          { value: "ADMIN", label: "مديرة — كل الصلاحيات، ومنها الإعدادات والحسابات" },
        ]}
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
      className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
    >
      {pending ? "جارٍ الإنشاء…" : "إنشاء الحساب"}
    </button>
  );
}
