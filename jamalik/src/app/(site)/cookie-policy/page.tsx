import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata } from "@/lib/seo/metadata";
import { getSettings, isAdsEnabled, isAnalyticsEnabled } from "@/lib/settings";
import { PageShell } from "@/components/layout/page-shell";
import { LEGAL_UPDATED_AT } from "@/config/legal";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "سياسة ملفات تعريف الارتباط",
  description:
    "ما ملفات تعريف الارتباط التي يستخدمها موقع جمالِك، وما الغرض من كل منها، وكيف تتحكّمين بها من متصفحك.",
  path: "/cookie-policy",
});

export default async function CookiePolicyPage() {
  const settings = await getSettings();
  const analyticsOn = isAnalyticsEnabled(settings);
  const adsOn = isAdsEnabled(settings);

  return (
    <PageShell
      title="سياسة ملفات تعريف الارتباط"
      description="شرح واضح لما يُحفَظ في متصفحك عند زيارة الموقع، ولماذا."
      path="/cookie-policy"
      updatedAt={LEGAL_UPDATED_AT}
    >
      <h2>ما ملفات تعريف الارتباط؟</h2>
      <p>
        هي ملفات نصية صغيرة يحفظها المتصفح على جهازك عند زيارة موقع ما، وتُستخدم
        لتذكّر إعداد أو قياس استخدام أو تمييز جلسة تسجيل دخول.
      </p>

      <h2>ما نستخدمه فعلًا</h2>

      <h3>١. ملفات ضرورية</h3>
      <p>
        ملف واحد باسم <code>jamalik_session</code> يُنشأ فقط عند تسجيل الدخول إلى
        لوحة التحكم، ويُحذف عند تسجيل الخروج. لا يُنشأ إطلاقًا للزائرة العادية،
        ولا يُستخدم في التتبّع.
      </p>

      <h3>٢. ملفات تحليلية</h3>
      {analyticsOn ? (
        <p>
          نستخدم Google Analytics 4 لقياس عدد الزيارات والصفحات الأكثر قراءة
          بشكل مجمّع. يضع GA ملفات مثل <code>_ga</code> و <code>_ga_*</code>.
          نفعّل إخفاء عنوان IP، ولا نربط هذه البيانات بهويتك الشخصية.
        </p>
      ) : (
        <p>
          التحليلات غير مفعّلة حاليًا على هذا الموقع، ولا يُحمَّل أي سكربت قياس
          ولا تُوضع ملفات تحليلية.
        </p>
      )}

      <h3>٣. ملفات إعلانية</h3>
      {adsOn ? (
        <p>
          نعرض إعلانات عبر Google AdSense. قد يستخدم Google ومزوّدوه ملفات تعريف
          ارتباط لعرض إعلانات بناءً على زياراتك لهذا الموقع أو مواقع أخرى. يمكنك
          تعطيل الإعلانات المخصّصة من{" "}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            إعدادات إعلانات Google
          </a>
          .
        </p>
      ) : (
        <p>
          الإعلانات غير مفعّلة حاليًا. لا يُحمَّل أي سكربت إعلاني ولا تُوضع أي
          ملفات تعريف ارتباط إعلانية من طرفنا.
        </p>
      )}

      <h2>ما لا نستخدمه</h2>
      <ul>
        <li>لا نستخدم بكسلات تتبّع من الشبكات الاجتماعية.</li>
        <li>لا نبيع بيانات التصفّح لأي جهة.</li>
        <li>لا نضع ملفات تتبّع عبر المواقع من طرفنا مباشرة.</li>
      </ul>

      <h2>كيف تتحكّمين بها؟</h2>
      <p>
        كل المتصفحات الحديثة تتيح حذف ملفات تعريف الارتباط أو منعها من الإعدادات:
      </p>
      <ul>
        <li>
          <strong>Chrome</strong>: الإعدادات ← الخصوصية والأمان ← ملفات تعريف
          الارتباط.
        </li>
        <li>
          <strong>Safari</strong>: التفضيلات ← الخصوصية.
        </li>
        <li>
          <strong>Firefox</strong>: الإعدادات ← الخصوصية والأمان.
        </li>
        <li>
          <strong>Edge</strong>: الإعدادات ← ملفات تعريف الارتباط وأذونات الموقع.
        </li>
      </ul>
      <p>
        حذف الملفات لا يمنعك من تصفّح الموقع؛ الأثر الوحيد هو الحاجة إلى تسجيل
        الدخول مجددًا إن كنتِ من فريق التحرير.
      </p>

      <h2>مزيد من التفاصيل</h2>
      <p>
        لمعرفة ما نجمعه من بيانات عمومًا وكيف نعالجه، راجعي{" "}
        <Link href="/privacy-policy">سياسة الخصوصية</Link>. ولأي استفسار، تواصلي
        معنا عبر <Link href="/contact">صفحة التواصل</Link>.
      </p>
    </PageShell>
  );
}
