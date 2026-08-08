import { unstable_cache, updateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";

export const SETTINGS_CACHE_TAG = "site-settings";

/**
 * الإعدادات التي يديرها المحرّر من لوحة التحكم.
 * كل قيمة نصية؛ الفراغ يعني «غير مفعّل» ويجب ألا يُحمَّل أي سكربت خارجي بسببه.
 */
export type SiteSettings = {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  /** Google Analytics 4 — G-XXXXXXXXXX */
  gaMeasurementId: string;
  /** قيمة ميتا التحقق من Google Search Console */
  googleSiteVerification: string;
  /** Google AdSense — ca-pub-XXXXXXXXXXXXXXXX */
  adsensePublisherId: string;
  /** مفتاح رئيسي لإيقاف كل الإعلانات دون حذف المعرّف */
  adsenseEnabled: boolean;
  adSlotTop: string;
  adSlotInContent: string;
  adSlotBetweenArticles: string;
  adSlotSidebar: string;
  adSlotBottomArticle: string;
  twitterHandle: string;
  facebookUrl: string;
  instagramUrl: string;
  pinterestUrl: string;
  youtubeUrl: string;
};

export const SETTINGS_KEYS = [
  "siteName",
  "siteDescription",
  "contactEmail",
  "gaMeasurementId",
  "googleSiteVerification",
  "adsensePublisherId",
  "adsenseEnabled",
  "adSlotTop",
  "adSlotInContent",
  "adSlotBetweenArticles",
  "adSlotSidebar",
  "adSlotBottomArticle",
  "twitterHandle",
  "facebookUrl",
  "instagramUrl",
  "pinterestUrl",
  "youtubeUrl",
] as const satisfies readonly (keyof SiteSettings)[];

/**
 * القيم الافتراضية تأتي من متغيرات البيئة، وتتفوق عليها قيمة قاعدة البيانات
 * عندما تكون غير فارغة — حتى يستطيع المحرّر التعديل دون إعادة نشر.
 */
function defaults(): SiteSettings {
  return {
    siteName: siteConfig.name,
    siteDescription: siteConfig.description,
    contactEmail: "",
    gaMeasurementId: process.env.NEXT_PUBLIC_GA_ID?.trim() ?? "",
    googleSiteVerification: process.env.GOOGLE_SITE_VERIFICATION?.trim() ?? "",
    adsensePublisherId: process.env.ADSENSE_PUBLISHER_ID?.trim() ?? "",
    adsenseEnabled: true,
    adSlotTop: "",
    adSlotInContent: "",
    adSlotBetweenArticles: "",
    adSlotSidebar: "",
    adSlotBottomArticle: "",
    twitterHandle: siteConfig.twitterHandle,
    facebookUrl: "",
    instagramUrl: "",
    pinterestUrl: "",
    youtubeUrl: "",
  };
}

async function loadSettings(): Promise<SiteSettings> {
  const base = defaults();

  let rows: { key: string; value: string }[] = [];
  try {
    rows = await prisma.setting.findMany({
      select: { key: true, value: true },
    });
  } catch {
    // قاعدة البيانات غير متاحة (بناء بدون DB مثلًا) — نكمل بالقيم الافتراضية
    // بدل إسقاط الصفحة بالكامل.
    return base;
  }

  const stored = new Map(rows.map((r) => [r.key, r.value]));
  const result = { ...base };

  for (const key of SETTINGS_KEYS) {
    const raw = stored.get(key);
    if (raw === undefined) continue;

    if (key === "adsenseEnabled") {
      result.adsenseEnabled = raw === "true";
      continue;
    }
    const trimmed = raw.trim();
    if (trimmed) {
      (result as Record<string, string | boolean>)[key] = trimmed;
    }
  }

  return result;
}

/**
 * تُقرأ الإعدادات في كل صفحة تقريبًا (GA / AdSense / التذييل)، لذلك تُخزَّن
 * مؤقتًا تحت وسم واحد يُبطَل عند الحفظ — وبذلك تبقى الصفحات قابلة للتوليد الساكن.
 */
export const getSettings = unstable_cache(loadSettings, ["site-settings"], {
  tags: [SETTINGS_CACHE_TAG],
  revalidate: 3600,
});

export async function updateSettings(
  values: Partial<Record<keyof SiteSettings, string>>,
): Promise<void> {
  const entries = Object.entries(values).filter(([key]) =>
    (SETTINGS_KEYS as readonly string[]).includes(key),
  );

  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        create: { key, value: value ?? "" },
        update: { value: value ?? "" },
      }),
    ),
  );

  // updateTag يُبطل الوسم فورًا ضمن نفس الطلب (read-your-own-writes)،
  // وهو المطلوب حتى ترى المحرّرة الإعداد الجديد مباشرة بعد الحفظ.
  updateTag(SETTINGS_CACHE_TAG);
}

/** الإعلانات تعمل فقط عند وجود معرّف ناشر صالح ومفتاح التفعيل مرفوع. */
export function isAdsEnabled(settings: SiteSettings): boolean {
  return (
    settings.adsenseEnabled && /^ca-pub-\d{10,20}$/.test(settings.adsensePublisherId)
  );
}

/** GA4 يعمل فقط عند وجود معرّف بالصيغة G-XXXXXXXXXX. */
export function isAnalyticsEnabled(settings: SiteSettings): boolean {
  return /^G-[A-Z0-9]{4,}$/i.test(settings.gaMeasurementId);
}
