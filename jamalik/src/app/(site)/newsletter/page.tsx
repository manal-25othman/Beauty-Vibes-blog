import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata } from "@/lib/seo/metadata";
import { PageShell } from "@/components/layout/page-shell";
import { NewsletterForm } from "@/components/forms/newsletter-form";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "النشرة البريدية",
  description:
    "اشتركي في نشرة جمالِك الأسبوعية: مقالة مختارة وتوصية عملية واحدة كل أسبوع، دون إغراق لبريدك.",
  path: "/newsletter",
});

export default function NewsletterPage() {
  return (
    <PageShell
      title="نشرة جمالِك الأسبوعية"
      description="رسالة واحدة كل أسبوع: مقالة مختارة، ونصيحة عملية قابلة للتطبيق فورًا."
      path="/newsletter"
    >
      <div className="not-prose rounded-3xl border border-accent-line bg-accent-soft p-6 sm:p-8">
        <NewsletterForm source="newsletter_page" />
      </div>

      <h2>ما الذي ستصلك؟</h2>
      <ul>
        <li>
          <strong>مقالة الأسبوع.</strong> المقال الذي نعتبره الأجدر بالقراءة، مع
          سطرين يشرحان لماذا اخترناه.
        </li>
        <li>
          <strong>نصيحة واحدة قابلة للتطبيق.</strong> خطوة عملية صغيرة يمكن
          تجربتها في اليوم نفسه.
        </li>
        <li>
          <strong>إجابة عن سؤال متكرّر</strong> وصلنا من القارئات خلال الأسبوع.
        </li>
      </ul>

      <h2>ما الذي لن يصلك؟</h2>
      <ul>
        <li>رسائل يومية أو متعدّدة في الأسبوع.</li>
        <li>عروض ترويجية لا علاقة لها بمحتوى الموقع.</li>
        <li>مشاركة بريدك مع أي طرف ثالث لأغراض تسويقية.</li>
      </ul>

      <h2>إلغاء الاشتراك</h2>
      <p>
        كل رسالة تحتوي على رابط لإلغاء الاشتراك يعمل بضغطة واحدة ودون أسئلة. عند
        الإلغاء نوقف الإرسال فورًا، ونحتفظ بسجلّ الإلغاء فقط حتى لا يُعاد
        إدراجك عن طريق الخطأ.
      </p>

      <h2>خصوصية بريدك</h2>
      <p>
        نحفظ بريدك الإلكتروني لغرض إرسال النشرة فقط. لمعرفة تفاصيل ما نجمعه
        وكيف نعالجه، راجعي <Link href="/privacy-policy">سياسة الخصوصية</Link>.
      </p>
    </PageShell>
  );
}
