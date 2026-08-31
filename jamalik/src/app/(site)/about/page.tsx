import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { getActiveAuthors } from "@/lib/queries/taxonomy";
import { getSettings } from "@/lib/settings";
import { formatNumber } from "@/lib/format";
import { PageShell } from "@/components/layout/page-shell";
import { SmartImage } from "@/components/ui/smart-image";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "من نحن",
  description:
    "تعرّفي على Beauty Vibes: مجلة عربية للعناية والجمال تكتب بمنهج تحريري واضح، بعيدًا عن المبالغات التسويقية والوعود العلاجية.",
  path: "/about",
});

export default async function AboutPage() {
  const [authors, settings] = await Promise.all([
    getActiveAuthors(),
    getSettings(),
  ]);

  return (
    <PageShell
      title={`من نحن — ${settings.siteName}`}
      description="مجلة عربية متخصصة في العناية والجمال، تكتب بلغة واضحة وتحترم عقل قارئتها."
      path="/about"
    >
      <h2>لماذا أنشأنا {settings.siteName}؟</h2>
      <p>
        المحتوى العربي في مجال الجمال والعناية يعاني مشكلتين متكرّرتين: مبالغة
        تسويقية تَعِد بنتائج غير واقعية، ونقل حرفي لمحتوى أجنبي دون مراعاة
        للمناخ والعادات وأنواع البشرة الشائعة في منطقتنا. أنشأنا {settings.siteName}{" "}
        لتقديم بديل: مقالات مكتوبة أصلًا بالعربية، بلغة واضحة، وبتوقّعات صادقة عمّا
        يمكن أن يفعله المنتج وما لا يفعله.
      </p>

      <h2>ما الذي يميّز محتوانا؟</h2>
      <ul>
        <li>
          <strong>وضوح قبل الإبهار.</strong> نشرح الخطوة وسببها، ولا نُغرق النص
          بمصطلحات لا تفيد القارئة.
        </li>
        <li>
          <strong>توقّعات واقعية.</strong> نذكر المدة المتوقّعة لظهور النتيجة،
          ونقول صراحة حين لا يكون هناك دليل كافٍ.
        </li>
        <li>
          <strong>حدود واضحة.</strong> لا نقدّم تشخيصًا ولا علاجًا. عند أي علامة
          تستدعي الانتباه، نوجّه القارئة إلى مختص.
        </li>
        <li>
          <strong>استقلال تحريري.</strong> المحتوى الإعلاني يُعلَّم بوضوح ولا
          يُكتب كأنه رأي تحريري.
        </li>
      </ul>

      <h2>كيف نكتب مقالاتنا؟</h2>
      <p>
        كل مقال يمرّ بمراجعة تحريرية قبل النشر: التأكد من دقّة المعلومة، ومراجعة
        الصياغة لتجنّب أي ادّعاء صحي غير مدعوم، وإضافة الروابط الداخلية التي
        تساعد القارئة على إكمال الصورة. نحدّث المقالات عند تغيّر المعلومة، ونعرض
        تاريخ التحديث على الصفحة. التفاصيل الكاملة في{" "}
        <Link href="/editorial-policy">سياستنا التحريرية</Link>.
      </p>

      <h2 id="team">فريق التحرير</h2>
      <p>
        نكتب باسمنا الحقيقي ونعرض تخصّص كل كاتبة وسجلّ مقالاتها — لأن معرفة من
        يكتب جزء من تقييم ما تقرئين.
      </p>

      <ul className="plain-list mt-6 grid gap-5 sm:grid-cols-2">
        {authors.map((author) => (
          <li
            key={author.id}
            className="rounded-2xl border border-line bg-surface p-5"
          >
            <div className="flex items-start gap-4">
              <SmartImage
                src={author.photo}
                alt={author.photoAlt || `صورة ${author.name}`}
                width={64}
                height={64}
                sizes="64px"
                className="size-16 shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0">
                <p className="font-display text-base font-bold text-ink">
                  <Link
                    href={`/author/${author.slug}`}
                    className="no-underline transition-colors hover:text-accent"
                  >
                    {author.name}
                  </Link>
                </p>
                {author.specialization && (
                  <p className="mt-0.5 text-sm text-accent">
                    {author.specialization}
                  </p>
                )}
                <p className="mt-1 text-xs text-ink-faint">
                  {formatNumber(author._count.articles)} مقال منشور
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              {author.bio}
            </p>
          </li>
        ))}
      </ul>

      <h2>تنويه مهم</h2>
      <p>
        {siteConfig.name} موقع تحريري وتثقيفي. ما ننشره ليس استشارة طبية، ولا
        يُغني عن تقييم شخصي من طبيب أو صيدلي مختص، خاصة في حالات الحمل والرضاعة
        والحالات الجلدية المزمنة أو عند استخدام علاجات موصوفة.
      </p>

      <h2>تواصلي معنا</h2>
      <p>
        نرحّب بالملاحظات والتصحيحات واقتراحات المواضيع. راسلينا عبر{" "}
        <Link href="/contact">صفحة التواصل</Link>، أو اشتركي في{" "}
        <Link href="/newsletter">النشرة البريدية</Link> لتصلك مقالة مختارة كل
        أسبوع.
      </p>
    </PageShell>
  );
}
