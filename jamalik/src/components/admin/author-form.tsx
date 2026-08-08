"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { initialFormState, type FormState } from "@/lib/form-state";
import { slugify } from "@/lib/slug";
import {
  CheckboxField,
  TextAreaField,
  TextField,
} from "@/components/admin/field";

export type AuthorFormValues = {
  name: string;
  slug: string;
  photo: string;
  photoAlt: string;
  bio: string;
  specialization: string;
  email: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  website: string;
  isActive: boolean;
};

export const emptyAuthorValues: AuthorFormValues = {
  name: "",
  slug: "",
  photo: "",
  photoAlt: "",
  bio: "",
  specialization: "",
  email: "",
  twitter: "",
  instagram: "",
  linkedin: "",
  website: "",
  isActive: true,
};

export function AuthorForm({
  action,
  values,
  submitLabel,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  values: AuthorFormValues;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialFormState);
  const [name, setName] = useState(values.name);
  const [slug, setSlug] = useState(values.slug);
  // نفس سلوك محرّر المقال: اقتراح أثناء الكتابة يتوقّف عند أول تعديل يدوي.
  const [slugTouched, setSlugTouched] = useState(Boolean(values.slug));

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          {state.message}
        </p>
      )}

      <fieldset className="space-y-5 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <legend className="px-2 font-display text-base font-bold text-ink">
          البيانات الأساسية
        </legend>

        <TextField
          label="الاسم"
          name="name"
          required
          value={name}
          onChange={(value) => {
            setName(value);
            if (!slugTouched) setSlug(slugify(value));
          }}
          error={state.errors.name}
        />

        <TextField
          label="الرابط (slug)"
          name="slug"
          required
          dir="ltr"
          value={slug}
          onChange={(value) => {
            setSlugTouched(true);
            setSlug(value);
          }}
          error={state.errors.slug}
        />

        <TextField
          label="التخصّص"
          name="specialization"
          defaultValue={values.specialization}
          error={state.errors.specialization}
          placeholder="محرّرة العناية بالبشرة"
        />

        <TextAreaField
          label="النبذة"
          name="bio"
          required
          rows={5}
          defaultValue={values.bio}
          error={state.errors.bio}
          hint="تظهر في صفحة الكاتبة وأسفل كل مقال لها. اذكري الخبرة ومنهج الكتابة."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="الصورة"
            name="photo"
            dir="ltr"
            defaultValue={values.photo}
            error={state.errors.photo}
            placeholder="/images/authors/name.svg"
          />
          <TextField
            label="النص البديل للصورة"
            name="photoAlt"
            defaultValue={values.photoAlt}
            error={state.errors.photoAlt}
          />
        </div>

        <TextField
          label="البريد الإلكتروني (داخلي)"
          name="email"
          type="email"
          dir="ltr"
          defaultValue={values.email}
          error={state.errors.email}
          hint="لا يُعرض في الموقع العام."
        />

        <CheckboxField
          name="isActive"
          label="كاتبة نشطة"
          hint="غير النشطة تختفي صفحتها من الموقع العام."
          defaultChecked={values.isActive}
        />
      </fieldset>

      <fieldset className="space-y-5 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <legend className="px-2 font-display text-base font-bold text-ink">
          روابط التواصل
        </legend>
        <p className="text-xs text-ink-faint">
          تُعرض في صندوق الكاتبة وتُضاف إلى بيانات Person المنظّمة. اتركي أي حقل
          فارغًا لإخفائه.
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="إكس"
            name="twitter"
            dir="ltr"
            defaultValue={values.twitter}
            error={state.errors.twitter}
            placeholder="https://x.com/username"
          />
          <TextField
            label="إنستغرام"
            name="instagram"
            dir="ltr"
            defaultValue={values.instagram}
            error={state.errors.instagram}
          />
          <TextField
            label="لينكدإن"
            name="linkedin"
            dir="ltr"
            defaultValue={values.linkedin}
            error={state.errors.linkedin}
          />
          <TextField
            label="الموقع الشخصي"
            name="website"
            dir="ltr"
            defaultValue={values.website}
            error={state.errors.website}
          />
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-3">
        <SubmitButton label={submitLabel} />
        <Link
          href="/admin/authors"
          className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent"
        >
          إلغاء
        </Link>
      </div>
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
    >
      {pending ? "جارٍ الحفظ…" : label}
    </button>
  );
}
