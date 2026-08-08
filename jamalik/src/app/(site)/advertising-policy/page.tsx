import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { getSettings, isAdsEnabled } from "@/lib/settings";
import { PageShell } from "@/components/layout/page-shell";
import { LEGAL_UPDATED_AT } from "@/config/legal";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "سياسة الإعلانات",
  description:
    "كيف نعرض الإعلانات في جمالِك: مواضعها، ما نرفضه، وكيف نفصل بين المحتوى التحريري والمحتوى المموّل.",
  path: "/advertising-policy",
});

export default async function AdvertisingPolicyPage() {
  const settings = await getSettings();
  const adsOn = isAdsEnabled(settings);

  return (
    <PageShell
      title="سياسة الإعلانات"
      description="قواعدنا في عرض الإعلانات والمحتوى المموّل، وحدود ما نقبله."
      path="/advertising-policy"
      updatedAt={LEGAL_UPDATED_AT}
    >
      <h2>لماذا نعرض إعلانات؟</h2>
      <p>
        الإعلانات هي ما يغطّي تكاليف الكتابة والمراجعة والاستضافة، ويسمح ببقاء
        المحتوى مجانيًا وبلا اشتراك. في المقابل نلتزم بألا يأتي هذا على حساب
        تجربة القراءة.
      </p>

      <div className="not-prose my-8 rounded-2xl border border-line bg-surface-soft p-5">
        <p className="text-sm font-semibold text-ink">الحالة الحالية</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          {adsOn
            ? "الإعلانات مفعّلة حاليًا على الموقع ضمن المواضع الموضّحة أدناه."
            : "الإعلانات غير مفعّلة حاليًا. الموقع مجهّز تقنيًا للربط مع شبكة إعلانية، لكن لا تُحمَّل أي سكربتات إعلانية ولا تُعرض أي إعلانات في الوقت الحالي."}
        </p>
      </div>

      <h2>المواضع الإعلانية المعتمدة</h2>
      <p>نحدّد مسبقًا خمسة مواضع فقط، وكلها ضمن تدفّق الصفحة:</p>
      <ul>
        <li>أعلى الصفحة، أسفل الترويسة.</li>
        <li>داخل نصّ المقال، بين الأقسام.</li>
        <li>بين مجموعات المقالات في الصفحات التي تعرض قوائم.</li>
        <li>العمود الجانبي على الشاشات الكبيرة.</li>
        <li>أسفل المقال، قبل المقالات ذات الصلة.</li>
      </ul>

      <h2>ما لا نفعله</h2>
      <ul>
        <li>
          <strong>لا إعلانات تغطّي المحتوى.</strong> لا طبقات عائمة ولا نوافذ
          منبثقة تحجب النص.
        </li>
        <li>
          <strong>لا تشغيل تلقائي للفيديو أو الصوت.</strong>
        </li>
        <li>
          <strong>لا إعلانات تتنكّر في صورة محتوى تحريري.</strong> كل مساحة
          إعلانية تحمل كلمة «إعلان» فوقها.
        </li>
        <li>
          <strong>لا انزياح في التخطيط.</strong> نحجز أبعاد كل مساحة إعلانية
          مسبقًا حتى لا يقفز النص أثناء التحميل.
        </li>
        <li>
          <strong>لا إعلانات في منتصف الجملة</strong> أو بين فقرتين مرتبطتين
          مباشرة.
        </li>
      </ul>

      <h2>فئات إعلانية نرفضها</h2>
      <ul>
        <li>منتجات تَعِد بنتائج طبية أو علاجية غير مثبتة.</li>
        <li>منتجات تبييض البشرة التي تروّج لمعايير جمال ضارّة.</li>
        <li>مكمّلات غذائية بادّعاءات علاجية.</li>
        <li>إعلانات مضلّلة أو ذات صياغة مخادعة.</li>
        <li>أي محتوى غير مناسب لجمهور مجلة عناية وجمال.</li>
      </ul>

      <h2>المحتوى المموّل</h2>
      <p>حين ننشر محتوى مموّلًا، نلتزم بما يلي:</p>
      <ul>
        <li>شارة واضحة أعلى المقال تشير إلى أنه محتوى مموّل أو بالشراكة مع جهة.</li>
        <li>ذكر اسم الجهة الراعية صراحة.</li>
        <li>
          الالتزام بنفس معايير الدقّة التحريرية الواردة في{" "}
          <Link href="/editorial-policy">السياسة التحريرية</Link>.
        </li>
        <li>عدم كتابة أي ادّعاء صحي لا نقبله في المحتوى العادي.</li>
        <li>روابط المعلن تحمل السمة المناسبة (<code>sponsored</code>).</li>
      </ul>

      <h2>الروابط التابعة (Affiliate)</h2>
      <p>
        إن استخدمنا روابط تابعة مستقبلًا، فسنعلن ذلك بوضوح في المقال نفسه. وجود
        الرابط لن يغيّر رأينا في المنتج ولن يكلّف القارئة أي مبلغ إضافي.
      </p>

      <h2>شبكات الإعلانات</h2>
      <p>
        عند تفعيل الإعلانات، يُعرض جزء منها عبر شبكات خارجية مثل Google AdSense.
        هذه الشبكات قد تستخدم ملفات تعريف ارتباط خاصة بها؛ التفاصيل في{" "}
        <Link href="/cookie-policy">سياسة ملفات تعريف الارتباط</Link> و{" "}
        <Link href="/privacy-policy">سياسة الخصوصية</Link>.
      </p>

      <h2>للمعلنين</h2>
      <p>
        للاستفسار عن الإعلان في {siteConfig.name}، راسلينا عبر{" "}
        <Link href="/contact">صفحة التواصل</Link> موضّحة الجهة والمنتج والفترة
        المقترحة. نراجع كل طلب وفق المعايير أعلاه، ولنا الحق في الرفض دون إبداء
        أسباب تفصيلية.
      </p>
    </PageShell>
  );
}
