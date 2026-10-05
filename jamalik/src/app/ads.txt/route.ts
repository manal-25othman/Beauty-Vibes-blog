import { getSettings } from "@/lib/settings";

/**
 * ملف ads.txt — إعلان المُعلِنين المخوَّلين ببيع مخزون الموقع الإعلاني.
 *
 * ليس للتحقّق من الملكية فحسب: AdSense تُحذّر من غيابه وقد تحجب جزءًا من
 * الطلب الإعلاني على موقع لا يملكه، لأن المشترين لا يستطيعون التمييز بين
 * مخزونه الحقيقي ومخزون منتحَل باسمه.
 *
 * يُبنى من معرّف الناشر في لوحة التحكم، فلا يحتاج نشرًا عند تغييره. وبلا
 * معرّف لا يُقدَّم الملف أصلًا — ملف فارغ أسوأ من غيابه، إذ يُقرأ على أنه
 * "لا أحد مخوَّل" فيُرفض كل الطلب.
 */
// ديناميكي عمدًا لا ساكن: الملف يُبنى من إعداد تغيّره المحرّرة من اللوحة،
// والتوليد الساكن يجمّده على قيمة وقت البناء — أي فارغًا إلى أن يُنشر الموقع
// من جديد. القراءة رخيصة على أي حال: الإعدادات مخزّنة مؤقتًا تحت وسم يُبطَل
// عند الحفظ، وهذا المسار يُطلب نادرًا (زواحف الإعلانات لا الزوّار).
export const dynamic = "force-dynamic";

const EXCHANGE = "google.com";
/** معرّف Google الثابت في نظام TAG — ليس خاصًّا بناشر بعينه. */
const GOOGLE_TAG_ID = "f08c47fec0942fa0";

export async function GET() {
  const { adsensePublisherId } = await getSettings();

  if (!/^ca-pub-\d{10,20}$/.test(adsensePublisherId)) {
    return new Response("Not found", { status: 404 });
  }

  // الصيغة: <مجال المنصّة>, <معرّف الناشر بلا ca->, DIRECT, <معرّف TAG>
  const publisher = adsensePublisherId.replace(/^ca-/, "");

  return new Response(`${EXCHANGE}, ${publisher}, DIRECT, ${GOOGLE_TAG_ID}\n`, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      // قصيرة عمدًا: تغيير المعرّف يجب أن يظهر خلال دقائق لا ساعة.
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}
