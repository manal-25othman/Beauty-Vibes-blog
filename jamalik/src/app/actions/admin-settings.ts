"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guard";
import { settingsSchema, toFieldErrors } from "@/lib/validation";
import { formError, formSuccess, type FormState } from "@/lib/form-state";
import { updateSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

export async function saveSettings(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  // الإعدادات تمسّ الموقع كلّه (سكربتات القياس والإعلانات) — للمدير فقط.
  await requireAdmin();

  const parsed = settingsSchema.safeParse({
    siteName: formData.get("siteName") ?? "",
    siteDescription: formData.get("siteDescription") ?? "",
    contactEmail: formData.get("contactEmail") ?? "",
    gaMeasurementId: formData.get("gaMeasurementId") ?? "",
    googleSiteVerification: formData.get("googleSiteVerification") ?? "",
    adsensePublisherId: formData.get("adsensePublisherId") ?? "",
    adsenseEnabled: formData.get("adsenseEnabled") === "on",
    adSlotTop: formData.get("adSlotTop") ?? "",
    adSlotInContent: formData.get("adSlotInContent") ?? "",
    adSlotBetweenArticles: formData.get("adSlotBetweenArticles") ?? "",
    adSlotSidebar: formData.get("adSlotSidebar") ?? "",
    adSlotBottomArticle: formData.get("adSlotBottomArticle") ?? "",
    twitterHandle: formData.get("twitterHandle") ?? "",
    facebookUrl: formData.get("facebookUrl") ?? "",
    instagramUrl: formData.get("instagramUrl") ?? "",
    pinterestUrl: formData.get("pinterestUrl") ?? "",
    youtubeUrl: formData.get("youtubeUrl") ?? "",
  });

  if (!parsed.success) {
    return formError("راجعي الحقول أدناه.", toFieldErrors(parsed.error));
  }

  const { adsenseEnabled, ...rest } = parsed.data;

  try {
    await updateSettings({
      ...rest,
      adsenseEnabled: adsenseEnabled ? "true" : "false",
    });
  } catch (error) {
    console.error("[admin] فشل حفظ الإعدادات:", error);
    return formError("تعذّر حفظ الإعدادات. أعيدي المحاولة.");
  }

  // الإعدادات تظهر في التذييل والترويسة وسكربتات الرأس على كل الصفحات.
  revalidatePath("/", "layout");

  return formSuccess("تم حفظ الإعدادات وتطبيقها على الموقع.");
}

// ---------------------------------------------------------------------------
// صندوق الرسائل والمشتركون
// ---------------------------------------------------------------------------

export async function updateMessageStatus(formData: FormData): Promise<void> {
  await requireAdmin();

  const messageId = formData.get("messageId")?.toString();
  const status = formData.get("status")?.toString();

  if (!messageId) return;
  if (status !== "NEW" && status !== "READ" && status !== "ARCHIVED") return;

  await prisma.contactMessage.update({
    where: { id: messageId },
    data: { status },
  });

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export async function deleteMessage(formData: FormData): Promise<void> {
  await requireAdmin();

  const messageId = formData.get("messageId")?.toString();
  if (!messageId) return;

  await prisma.contactMessage.delete({ where: { id: messageId } }).catch(() => undefined);

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export async function unsubscribeSubscriber(formData: FormData): Promise<void> {
  await requireAdmin();

  const subscriberId = formData.get("subscriberId")?.toString();
  if (!subscriberId) return;

  await prisma.newsletterSubscriber.update({
    where: { id: subscriberId },
    data: { status: "UNSUBSCRIBED", unsubscribedAt: new Date() },
  });

  revalidatePath("/admin/subscribers");
  revalidatePath("/admin");
}
