"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { saveSettings } from "@/app/actions/admin-settings";
import { initialFormState } from "@/lib/form-state";
import type { SiteSettings } from "@/lib/settings";
import {
  CheckboxField,
  TextAreaField,
  TextField,
} from "@/components/admin/field";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction] = useActionState(saveSettings, initialFormState);
  const [adsEnabled, setAdsEnabled] = useState(settings.adsenseEnabled);
  const [publisherId, setPublisherId] = useState(settings.adsensePublisherId);
  const [gaId, setGaId] = useState(settings.gaMeasurementId);
  const [verification, setVerification] = useState(settings.googleSiteVerification);

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
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

      {/* هوية الموقع */}
      <fieldset className="space-y-5 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <legend className="px-2 font-display text-base font-bold text-ink">
          هوية الموقع
        </legend>

        <TextField
          label="اسم الموقع"
          name="siteName"
          required
          defaultValue={settings.siteName}
          error={state.errors.siteName}
        />

        <TextAreaField
          label="وصف الموقع"
          name="siteDescription"
          rows={3}
          defaultValue={settings.siteDescription}
          error={state.errors.siteDescription}
          hint="يظهر في التذييل وفي وصف الميتا الافتراضي."
        />

        <TextField
          label="بريد التواصل"
          name="contactEmail"
          type="email"
          dir="ltr"
          defaultValue={settings.contactEmail}
          error={state.errors.contactEmail}
          hint="يظهر في صفحة اتصلي بنا عند تعبئته."
        />
      </fieldset>

      {/* التحليلات */}
      <fieldset className="space-y-5 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <legend className="px-2 font-display text-base font-bold text-ink">
          Google Analytics 4
        </legend>

        <TextField
          label="معرّف القياس"
          name="gaMeasurementId"
          dir="ltr"
          value={gaId}
          onChange={setGaId}
          error={state.errors.gaMeasurementId}
          placeholder="G-XXXXXXXXXX"
          hint="اتركيه فارغًا لتعطيل التحليلات تمامًا — لن يُحمَّل أي سكربت."
        />

        <StatusNote
          active={/^G-[A-Z0-9]{4,}$/i.test(gaId.trim())}
          activeText="التحليلات ستعمل: يُحمَّل سكربت GA4 وتُرسَل أحداث page_view و article_view و search و newsletter_signup."
          inactiveText="التحليلات معطّلة: لا يُحمَّل أي سكربت قياس ولا تُوضع ملفات تعريف ارتباط تحليلية."
        />
      </fieldset>

      {/* Search Console */}
      <fieldset className="space-y-5 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <legend className="px-2 font-display text-base font-bold text-ink">
          Google Search Console
        </legend>

        <TextField
          label="قيمة وسم التحقق"
          name="googleSiteVerification"
          dir="ltr"
          value={verification}
          onChange={setVerification}
          error={state.errors.googleSiteVerification}
          hint='من طريقة التحقق «وسم HTML»، انسخي قيمة content فقط — لا الوسم كاملًا.'
        />

        <StatusNote
          active={Boolean(verification.trim())}
          activeText="سيُضاف وسم google-site-verification تلقائيًا داخل <head> في كل الصفحات."
          inactiveText="لن يُضاف وسم تحقق. يمكنك أيضًا التحقّق عبر سجلّ DNS بدل الوسم."
        />
      </fieldset>

      {/* AdSense */}
      <fieldset className="space-y-5 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <legend className="px-2 font-display text-base font-bold text-ink">
          Google AdSense
        </legend>

        <p className="rounded-xl bg-surface-soft px-4 py-3 text-xs leading-relaxed text-ink-muted">
          هذه الإعدادات تجهّز الموقع تقنيًا للربط مع AdSense فقط. قبول الموقع في
          البرنامج قرار من Google بعد مراجعة المحتوى والسياسات، ولا علاقة له
          بإكمال هذه الحقول.
        </p>

        <TextField
          label="معرّف الناشر"
          name="adsensePublisherId"
          dir="ltr"
          value={publisherId}
          onChange={setPublisherId}
          error={state.errors.adsensePublisherId}
          placeholder="ca-pub-XXXXXXXXXXXXXXXX"
          hint="اتركيه فارغًا لإخفاء كل المساحات الإعلانية ومنع تحميل سكربت AdSense."
        />

        <CheckboxField
          name="adsenseEnabled"
          label="تفعيل الإعلانات"
          hint="مفتاح رئيسي لإيقاف الإعلانات مؤقتًا دون حذف المعرّف."
          checked={adsEnabled}
          onChange={setAdsEnabled}
        />

        <StatusNote
          active={adsEnabled && /^ca-pub-\d{10,20}$/.test(publisherId.trim())}
          activeText="الإعلانات ستُعرض في المواضع التي أُدخل لها معرّف وحدة إعلانية أدناه."
          inactiveText="الإعلانات معطّلة: لا يُحمَّل سكربت AdSense ولا تُحجز أي مساحة في الصفحة."
        />

        <div className="grid gap-5 border-t border-line pt-5 sm:grid-cols-2">
          <TextField
            label="وحدة أعلى الصفحة"
            name="adSlotTop"
            dir="ltr"
            defaultValue={settings.adSlotTop}
            error={state.errors.adSlotTop}
          />
          <TextField
            label="وحدة داخل المقال"
            name="adSlotInContent"
            dir="ltr"
            defaultValue={settings.adSlotInContent}
            error={state.errors.adSlotInContent}
          />
          <TextField
            label="وحدة بين المقالات"
            name="adSlotBetweenArticles"
            dir="ltr"
            defaultValue={settings.adSlotBetweenArticles}
            error={state.errors.adSlotBetweenArticles}
          />
          <TextField
            label="وحدة العمود الجانبي"
            name="adSlotSidebar"
            dir="ltr"
            defaultValue={settings.adSlotSidebar}
            error={state.errors.adSlotSidebar}
          />
          <TextField
            label="وحدة أسفل المقال"
            name="adSlotBottomArticle"
            dir="ltr"
            defaultValue={settings.adSlotBottomArticle}
            error={state.errors.adSlotBottomArticle}
          />
        </div>

        <p className="text-xs text-ink-faint">
          كل موضع يحتاج معرّف وحدة إعلانية (data-ad-slot) من حساب AdSense.
          الموضع بلا معرّف لا يُعرض إطلاقًا حتى لا تبقى مساحة فارغة في الصفحة.
        </p>
      </fieldset>

      {/* الشبكات الاجتماعية */}
      <fieldset className="space-y-5 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <legend className="px-2 font-display text-base font-bold text-ink">
          الشبكات الاجتماعية
        </legend>
        <p className="text-xs text-ink-faint">
          تظهر في تذييل الموقع. اتركي أي حقل فارغًا لإخفاء الرابط.
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="حساب إكس"
            name="twitterHandle"
            dir="ltr"
            defaultValue={settings.twitterHandle}
            error={state.errors.twitterHandle}
            placeholder="@jamalik"
            hint="يُستخدم في بطاقات المشاركة."
          />
          <TextField
            label="رابط إنستغرام"
            name="instagramUrl"
            dir="ltr"
            defaultValue={settings.instagramUrl}
            error={state.errors.instagramUrl}
          />
          <TextField
            label="رابط فيسبوك"
            name="facebookUrl"
            dir="ltr"
            defaultValue={settings.facebookUrl}
            error={state.errors.facebookUrl}
          />
          <TextField
            label="رابط بينتريست"
            name="pinterestUrl"
            dir="ltr"
            defaultValue={settings.pinterestUrl}
            error={state.errors.pinterestUrl}
          />
          <TextField
            label="رابط يوتيوب"
            name="youtubeUrl"
            dir="ltr"
            defaultValue={settings.youtubeUrl}
            error={state.errors.youtubeUrl}
          />
        </div>
      </fieldset>

      <SubmitButton />
    </form>
  );
}

function StatusNote({
  active,
  activeText,
  inactiveText,
}: {
  active: boolean;
  activeText: string;
  inactiveText: string;
}) {
  return (
    <p
      className={`flex gap-2 rounded-xl px-4 py-3 text-xs leading-relaxed ${
        active ? "bg-success-soft text-success" : "bg-surface-soft text-ink-muted"
      }`}
    >
      <span aria-hidden="true">{active ? "●" : "○"}</span>
      <span>{active ? activeText : inactiveText}</span>
    </p>
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
      {pending ? "جارٍ الحفظ…" : "حفظ الإعدادات"}
    </button>
  );
}
