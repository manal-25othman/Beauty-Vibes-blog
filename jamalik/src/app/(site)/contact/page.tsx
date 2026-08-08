import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata } from "@/lib/seo/metadata";
import { getSettings } from "@/lib/settings";
import { PageShell } from "@/components/layout/page-shell";
import { ContactForm } from "@/components/forms/contact-form";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "اتصلي بنا",
  description:
    "راسلي فريق جمالِك للاستفسارات التحريرية، أو الإبلاغ عن خطأ في مقال، أو اقتراح موضوع جديد.",
  path: "/contact",
});

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <PageShell
      title="اتصلي بنا"
      description="نقرأ كل رسالة تصلنا، ونردّ على ما يحتاج ردًّا خلال أيام العمل."
      path="/contact"
    >
      <p>
        استخدمي النموذج أدناه للتواصل معنا في أي من الحالات التالية: تصحيح
        معلومة في مقال، اقتراح موضوع، استفسار عن التعاون أو الإعلان، أو ملاحظة
        على تجربة استخدام الموقع.
      </p>

      <div className="not-prose my-8 rounded-2xl border border-accent-line bg-accent-soft p-5">
        <p className="text-sm font-semibold text-ink">قبل أن ترسلي</p>
        <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-ink-muted">
          <li>
            لا نقدّم استشارات شخصية عن البشرة أو الشعر — راجعي مختصًا لأي أمر
            صحي.
          </li>
          <li>
            طلبات الإعلان والمحتوى المموّل تخضع لـ{" "}
            <Link href="/advertising-policy" className="text-accent underline">
              سياسة الإعلانات
            </Link>
            .
          </li>
          <li>عند الإبلاغ عن خطأ، أرفقي رابط المقال إن أمكن ليصلنا التصحيح أسرع.</li>
        </ul>
      </div>

      <div className="not-prose">
        <ContactForm />
      </div>

      {settings.contactEmail && (
        <>
          <h2>البريد المباشر</h2>
          <p>
            يمكنك أيضًا مراسلتنا على{" "}
            <a href={`mailto:${settings.contactEmail}`} dir="ltr">
              {settings.contactEmail}
            </a>
            .
          </p>
        </>
      )}

      <h2>الخصوصية</h2>
      <p>
        نستخدم البيانات التي ترسلينها للردّ على رسالتك فقط، ولا نضيفك إلى النشرة
        البريدية تلقائيًا. التفاصيل في{" "}
        <Link href="/privacy-policy">سياسة الخصوصية</Link>.
      </p>
    </PageShell>
  );
}
