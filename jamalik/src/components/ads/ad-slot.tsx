import { getSettings, isAdsEnabled } from "@/lib/settings";
import { AdUnit } from "./ad-unit";

export type AdPlacement =
  | "top"
  | "inContent"
  | "betweenArticles"
  | "sidebar"
  | "bottomArticle";

const PLACEMENT_LABELS: Record<AdPlacement, string> = {
  top: "إعلان أعلى الصفحة",
  inContent: "إعلان داخل المقال",
  betweenArticles: "إعلان بين المقالات",
  sidebar: "إعلان جانبي",
  bottomArticle: "إعلان أسفل المقال",
};

/** أبعاد محجوزة مسبقًا لكل موضع — تمنع انزياح التخطيط (CLS) عند تحميل الإعلان. */
const PLACEMENT_MIN_HEIGHT: Record<AdPlacement, string> = {
  top: "90px",
  inContent: "250px",
  betweenArticles: "250px",
  sidebar: "600px",
  bottomArticle: "250px",
};

type Props = {
  placement: AdPlacement;
  className?: string;
};

/**
 * مساحة إعلانية.
 *
 * لا تُعرَض إطلاقًا ما لم يُدخَل معرّف ناشر AdSense صالح من لوحة التحكم،
 * ولا تُحمَّل أي سكربتات في هذه الحالة. المواضع كلها ضمن تدفّق الصفحة —
 * لا طبقات عائمة فوق المحتوى ولا نوافذ منبثقة.
 */
export async function AdSlot({ placement, className = "" }: Props) {
  const settings = await getSettings();

  if (!isAdsEnabled(settings)) return null;

  const slotId = {
    top: settings.adSlotTop,
    inContent: settings.adSlotInContent,
    betweenArticles: settings.adSlotBetweenArticles,
    sidebar: settings.adSlotSidebar,
    bottomArticle: settings.adSlotBottomArticle,
  }[placement];

  // معرّف الوحدة الإعلانية مطلوب أيضًا: بدونه لن يعرض AdSense شيئًا،
  // فالأفضل ألا نحجز مساحة فارغة في الصفحة.
  if (!slotId) return null;

  return (
    <div
      className={`my-8 ${className}`}
      role="complementary"
      aria-label={PLACEMENT_LABELS[placement]}
    >
      <p className="mb-1 text-center text-[0.7rem] tracking-wide text-ink-faint">
        إعلان
      </p>
      <AdUnit
        publisherId={settings.adsensePublisherId}
        slotId={slotId}
        minHeight={PLACEMENT_MIN_HEIGHT[placement]}
      />
    </div>
  );
}
