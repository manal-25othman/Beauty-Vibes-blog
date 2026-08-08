"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { initialFormState, type FormState } from "@/lib/form-state";
import { auditArticle } from "@/lib/seo/audit";
import { slugify } from "@/lib/slug";
import { estimateReadingTime, formatReadingTime } from "@/lib/format";

import {
  CheckboxField,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/admin/field";
import { ChipsInput } from "@/components/admin/chips-input";
import { FaqEditor, type FaqDraft } from "@/components/admin/faq-editor";
import { SeoChecklist } from "@/components/admin/seo-checklist";

export type ArticleFormValues = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  featuredImageAlt: string;
  categoryId: string;
  authorId: string;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
  publishedAt: string;
  tags: string[];
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  canonicalUrl: string;
  noIndex: boolean;
  isFeatured: boolean;
  isEditorPick: boolean;
  faqs: FaqDraft[];
};

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  values: ArticleFormValues;
  categories: { id: string; name: string }[];
  authors: { id: string; name: string }[];
  submitLabel: string;
};

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "مسودّة — غير ظاهر في الموقع" },
  { value: "PUBLISHED", label: "منشور — ظاهر فورًا" },
  { value: "SCHEDULED", label: "مجدول — يظهر تلقائيًا في موعده" },
];

export function ArticleEditor({
  action,
  values,
  categories,
  authors,
  submitLabel,
}: Props) {
  const [state, formAction] = useActionState(action, initialFormState);

  // الحقول التي يعتمد عليها فحص السيو الحيّ تُدار بالحالة؛
  // بقيتها غير مُدارة (defaultValue) لتقليل إعادة التصيير أثناء الكتابة.
  const [title, setTitle] = useState(values.title);
  const [slug, setSlug] = useState(values.slug);
  const [excerpt, setExcerpt] = useState(values.excerpt);
  const [content, setContent] = useState(values.content);
  const [seoTitle, setSeoTitle] = useState(values.seoTitle);
  const [metaDescription, setMetaDescription] = useState(values.metaDescription);
  const [focusKeyword, setFocusKeyword] = useState(values.focusKeyword);
  const [featuredImage, setFeaturedImage] = useState(values.featuredImage);
  const [featuredImageAlt, setFeaturedImageAlt] = useState(values.featuredImageAlt);
  const [canonicalUrl, setCanonicalUrl] = useState(values.canonicalUrl);
  const [status, setStatus] = useState(values.status);

  const audit = useMemo(
    () =>
      auditArticle({
        title,
        slug,
        excerpt,
        content,
        seoTitle,
        metaDescription,
        focusKeyword,
        featuredImage,
        featuredImageAlt,
        canonicalUrl,
      }),
    [
      title,
      slug,
      excerpt,
      content,
      seoTitle,
      metaDescription,
      focusKeyword,
      featuredImage,
      featuredImageAlt,
      canonicalUrl,
    ],
  );

  /**
   * الرابط يُقترح من العنوان أثناء الكتابة، ويتوقّف الاقتراح نهائيًا بمجرّد
   * أن تعدّل المحرّرة الحقل بنفسها. الاقتراح عند فقدان التركيز بدل ذلك كان
   * يملأ الحقل في اللحظة التي تبدأ فيها الكتابة، فيلتصق النصّان.
   */
  const [slugTouched, setSlugTouched] = useState(Boolean(values.slug));

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function onSlugChange(value: string) {
    setSlugTouched(true);
    setSlug(value);
  }

  return (
    <form action={formAction} className="grid gap-8 xl:grid-cols-[1fr_22rem]">
      <div className="min-w-0 space-y-8">
        {state.status === "error" && state.message && (
          <p
            role="alert"
            className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
          >
            {state.message}
          </p>
        )}

        {/* المحتوى الأساسي */}
        <fieldset className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <legend className="px-2 font-display text-base font-bold text-ink">
            المحتوى
          </legend>

          <div className="space-y-5">
            <TextField
              label="عنوان المقال"
              name="title"
              required
              value={title}
              onChange={onTitleChange}
              error={state.errors.title}
              counter={{ value: title.length, max: 90 }}
            />

            <TextField
              label="الرابط (slug)"
              name="slug"
              required
              dir="ltr"
              value={slug}
              onChange={onSlugChange}
              error={state.errors.slug}
              hint="حروف لاتينية صغيرة وأرقام وشرطات فقط. يُقترح تلقائيًا من العنوان."
            />

            <TextAreaField
              label="المقتطف"
              name="excerpt"
              required
              rows={3}
              value={excerpt}
              onChange={setExcerpt}
              error={state.errors.excerpt}
              counter={{ value: excerpt.length, max: 300 }}
              hint="يظهر في بطاقات المقالات ونتائج البحث الداخلي."
            />

            <TextAreaField
              label="المحتوى (Markdown)"
              name="content"
              required
              rows={26}
              mono
              value={content}
              onChange={setContent}
              error={state.errors.content}
              hint="استخدمي ## للعناوين الفرعية، و ### للفرعية الأصغر. صناديق النصائح: ‎:::tip[عنوان]‎ … ‎:::‎"
            />

            <p className="text-xs text-ink-faint">
              زمن القراءة التقديري: {formatReadingTime(estimateReadingTime(content))}
            </p>
          </div>
        </fieldset>

        {/* الصورة */}
        <fieldset className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <legend className="px-2 font-display text-base font-bold text-ink">
            الصورة البارزة
          </legend>

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="مسار الصورة"
              name="featuredImage"
              dir="ltr"
              value={featuredImage}
              onChange={setFeaturedImage}
              error={state.errors.featuredImage}
              placeholder="/images/covers/skin-care.svg"
              hint="مسار داخلي يبدأ بـ / أو رابط كامل."
            />
            <TextField
              label="النص البديل (alt)"
              name="featuredImageAlt"
              value={featuredImageAlt}
              onChange={setFeaturedImageAlt}
              error={state.errors.featuredImageAlt}
              hint="صفي ما تُظهره الصورة، لا اسم الملف."
            />
          </div>
        </fieldset>

        {/* السيو */}
        <fieldset className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <legend className="px-2 font-display text-base font-bold text-ink">
            تحسين محركات البحث
          </legend>

          <div className="space-y-5">
            <TextField
              label="عنوان السيو"
              name="seoTitle"
              value={seoTitle}
              onChange={setSeoTitle}
              error={state.errors.seoTitle}
              counter={{ value: seoTitle.length, max: 70 }}
              hint="يظهر في نتائج البحث. اتركيه فارغًا لاستخدام عنوان المقال."
            />

            <TextAreaField
              label="وصف الميتا"
              name="metaDescription"
              rows={3}
              value={metaDescription}
              onChange={setMetaDescription}
              error={state.errors.metaDescription}
              counter={{ value: metaDescription.length, max: 160 }}
            />

            <TextField
              label="الكلمة المفتاحية الرئيسية"
              name="focusKeyword"
              value={focusKeyword}
              onChange={setFocusKeyword}
              error={state.errors.focusKeyword}
              hint="تُستخدم في فحص السيو الجانبي فقط، ولا تُنشر في الصفحة."
            />

            <ChipsInput
              name="secondaryKeywords"
              label="كلمات مفتاحية ثانوية"
              initial={values.secondaryKeywords}
              max={10}
            />

            <TextField
              label="الرابط المعياري (canonical)"
              name="canonicalUrl"
              dir="ltr"
              value={canonicalUrl}
              onChange={setCanonicalUrl}
              error={state.errors.canonicalUrl}
              hint="اتركيه فارغًا إلا إذا كان المقال منشورًا أصلًا في مكان آخر."
            />

            <CheckboxField
              name="noIndex"
              label="منع فهرسة هذا المقال (noindex)"
              hint="استخدميه للصفحات المؤقتة أو المكرّرة فقط."
              defaultChecked={values.noIndex}
            />
          </div>
        </fieldset>

        {/* الأسئلة الشائعة */}
        <fieldset className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <legend className="px-2 font-display text-base font-bold text-ink">
            الأسئلة الشائعة
          </legend>
          <FaqEditor initial={values.faqs} />
        </fieldset>
      </div>

      {/* العمود الجانبي */}
      <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
        <fieldset className="rounded-2xl border border-line bg-surface p-5">
          <legend className="px-2 font-display text-base font-bold text-ink">
            النشر
          </legend>

          <div className="space-y-5">
            <SelectField
              label="الحالة"
              name="status"
              required
              value={status}
              onChange={(value) => setStatus(value as ArticleFormValues["status"])}
              options={STATUS_OPTIONS}
              error={state.errors.status}
            />

            <TextField
              label={status === "SCHEDULED" ? "موعد النشر" : "تاريخ النشر"}
              name="publishedAt"
              type="datetime-local"
              dir="ltr"
              defaultValue={values.publishedAt}
              error={state.errors.publishedAt}
              required={status === "SCHEDULED"}
              hint={
                status === "SCHEDULED"
                  ? "يجب أن يكون في المستقبل. يظهر المقال تلقائيًا في موعده."
                  : "اتركيه فارغًا لاستخدام وقت الحفظ."
              }
            />

            <SelectField
              label="التصنيف"
              name="categoryId"
              required
              defaultValue={values.categoryId}
              placeholder="اختاري التصنيف"
              options={categories.map((category) => ({
                value: category.id,
                label: category.name,
              }))}
              error={state.errors.categoryId}
            />

            <SelectField
              label="الكاتبة"
              name="authorId"
              required
              defaultValue={values.authorId}
              placeholder="اختاري الكاتبة"
              options={authors.map((author) => ({
                value: author.id,
                label: author.name,
              }))}
              error={state.errors.authorId}
            />

            <ChipsInput
              name="tags"
              label="الوسوم"
              initial={values.tags}
              max={15}
              hint="بالعربية. تُنشأ الوسوم الجديدة تلقائيًا."
            />

            <div className="space-y-2.5 border-t border-line pt-4">
              <CheckboxField
                name="isFeatured"
                label="مقال مميّز"
                hint="يظهر في أعلى الصفحة الرئيسية."
                defaultChecked={values.isFeatured}
              />
              <CheckboxField
                name="isEditorPick"
                label="اختيار المحررات"
                defaultChecked={values.isEditorPick}
              />
            </div>

            <div className="flex flex-wrap gap-2 border-t border-line pt-4">
              <SubmitButton label={submitLabel} />
              <Link
                href="/admin/articles"
                className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent"
              >
                إلغاء
              </Link>
            </div>

            {values.id && (
              <Link
                href={`/article/${values.slug}`}
                target="_blank"
                rel="noopener"
                className="block text-center text-sm text-accent hover:text-accent-hover"
              >
                معاينة على الموقع ↗
              </Link>
            )}
          </div>
        </fieldset>

        <SeoChecklist audit={audit} />
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
      className="flex-1 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "جارٍ الحفظ…" : label}
    </button>
  );
}

export const emptyArticleValues: ArticleFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featuredImage: "",
  featuredImageAlt: "",
  categoryId: "",
  authorId: "",
  status: "DRAFT",
  publishedAt: "",
  tags: [],
  seoTitle: "",
  metaDescription: "",
  focusKeyword: "",
  secondaryKeywords: [],
  canonicalUrl: "",
  noIndex: false,
  isFeatured: false,
  isEditorPick: false,
  faqs: [],
};
