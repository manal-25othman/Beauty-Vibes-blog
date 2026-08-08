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

export type CategoryFormValues = {
  name: string;
  slug: string;
  description: string;
  image: string;
  imageAlt: string;
  seoTitle: string;
  metaDescription: string;
  sortOrder: number;
  isActive: boolean;
};

export const emptyCategoryValues: CategoryFormValues = {
  name: "",
  slug: "",
  description: "",
  image: "",
  imageAlt: "",
  seoTitle: "",
  metaDescription: "",
  sortOrder: 0,
  isActive: true,
};

export function CategoryForm({
  action,
  values,
  submitLabel,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  values: CategoryFormValues;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialFormState);
  const [name, setName] = useState(values.name);
  const [slug, setSlug] = useState(values.slug);
  // نفس سلوك محرّر المقال: اقتراح أثناء الكتابة يتوقّف عند أول تعديل يدوي.
  const [slugTouched, setSlugTouched] = useState(Boolean(values.slug));
  const [metaDescription, setMetaDescription] = useState(values.metaDescription);
  const [seoTitle, setSeoTitle] = useState(values.seoTitle);

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
          label="اسم التصنيف"
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
          hint="حروف لاتينية صغيرة وأرقام وشرطات فقط."
        />

        <TextAreaField
          label="الوصف"
          name="description"
          rows={3}
          defaultValue={values.description}
          error={state.errors.description}
          hint="يظهر أعلى صفحة التصنيف وفي وصف الميتا عند غيابه."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="صورة التصنيف"
            name="image"
            dir="ltr"
            defaultValue={values.image}
            error={state.errors.image}
            placeholder="/images/covers/skin-care.svg"
          />
          <TextField
            label="النص البديل للصورة"
            name="imageAlt"
            defaultValue={values.imageAlt}
            error={state.errors.imageAlt}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="ترتيب العرض"
            name="sortOrder"
            type="number"
            dir="ltr"
            defaultValue={String(values.sortOrder)}
            error={state.errors.sortOrder}
            hint="الأصغر يظهر أولًا."
          />
          <div className="flex items-end pb-2.5">
            <CheckboxField
              name="isActive"
              label="تصنيف مفعّل"
              hint="التصنيف غير المفعّل يختفي من الموقع العام."
              defaultChecked={values.isActive}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-5 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <legend className="px-2 font-display text-base font-bold text-ink">
          تحسين محركات البحث
        </legend>

        <TextField
          label="عنوان السيو"
          name="seoTitle"
          value={seoTitle}
          onChange={setSeoTitle}
          counter={{ value: seoTitle.length, max: 70 }}
          error={state.errors.seoTitle}
        />

        <TextAreaField
          label="وصف الميتا"
          name="metaDescription"
          rows={3}
          value={metaDescription}
          onChange={setMetaDescription}
          counter={{ value: metaDescription.length, max: 160 }}
          error={state.errors.metaDescription}
        />
      </fieldset>

      <div className="flex flex-wrap gap-3">
        <SubmitButton label={submitLabel} />
        <Link
          href="/admin/categories"
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
