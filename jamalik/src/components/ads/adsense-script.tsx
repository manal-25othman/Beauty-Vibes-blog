import Script from "next/script";
import { getSettings, isAdsEnabled } from "@/lib/settings";

/**
 * سكربت AdSense الرئيسي — يُحمَّل مرة واحدة فقط لكل صفحة،
 * وفقط عندما يكون معرّف الناشر مضبوطًا في لوحة التحكم.
 *
 * ملاحظة: تجهيز الموقع تقنيًا للربط مع AdSense لا يعني قبوله في البرنامج؛
 * القبول قرار من Google بعد مراجعة المحتوى والسياسات.
 */
export async function AdSenseScript() {
  const settings = await getSettings();

  if (!isAdsEnabled(settings)) return null;

  return (
    <Script
      id="adsense-loader"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.adsensePublisherId}`}
    />
  );
}
