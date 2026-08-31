"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { contactSchema, newsletterSchema, toFieldErrors } from "@/lib/validation";
import { getClientIp, hashIp, rateLimit } from "@/lib/rate-limit";
import { syncSubscriber } from "@/lib/email/provider";
import { formError, formSuccess, type FormState } from "@/lib/form-state";

/**
 * Server Actions في Next تتحقّق من الأصل تلقائيًا، وهو ما يغطي CSRF.
 * ما تبقى علينا: تحديد المعدّل، والحقل الخفي ضد الروبوتات، والتحقّق من المدخلات.
 */
async function guardSubmission(
  bucket: string,
  limit: number,
): Promise<{ ok: true; ipHash: string } | { ok: false; state: FormState }> {
  const ip = await getClientIp();
  const result = rateLimit(`${bucket}:${ip}`, limit, 60 * 60 * 1000);

  if (!result.ok) {
    return {
      ok: false,
      state: formError(
        "تم استقبال عدد كبير من المحاولات من هذا الاتصال. الرجاء المحاولة بعد قليل.",
      ),
    };
  }

  return { ok: true, ipHash: hashIp(ip) };
}

// ---------------------------------------------------------------------------
// النشرة البريدية
// ---------------------------------------------------------------------------

export async function subscribeToNewsletter(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = newsletterSchema.safeParse({
    email: formData.get("email") ?? "",
    source: formData.get("source") ?? "",
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    return formError("تعذّر إتمام الاشتراك.", toFieldErrors(parsed.error));
  }

  const guard = await guardSubmission("newsletter", 5);
  if (!guard.ok) return guard.state;

  const { email, source } = parsed.data;

  try {
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
      select: { id: true, status: true },
    });

    if (existing?.status === "SUBSCRIBED") {
      // رسالة محايدة: لا نؤكّد أو ننفي وجود البريد في القائمة.
      return formSuccess("تم تسجيل بريدك في النشرة. شكرًا لاشتراكك في Beauty Vibes!");
    }

    if (existing) {
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: { status: "SUBSCRIBED", unsubscribedAt: null, source: source || null },
      });
    } else {
      await prisma.newsletterSubscriber.create({
        data: {
          email,
          source: source || null,
          unsubscribeToken: randomBytes(24).toString("base64url"),
        },
      });
    }

    // المزامنة مع المزوّد الخارجي لا تُفشل الاشتراك — العنوان محفوظ لدينا.
    const sync = await syncSubscriber(email);
    if (!sync.ok) {
      console.error(`[newsletter] فشلت المزامنة مع ${sync.provider}: ${sync.error}`);
    }

    return formSuccess("تم تسجيل بريدك في النشرة. شكرًا لاشتراكك في Beauty Vibes!");
  } catch (error) {
    console.error("[newsletter] خطأ غير متوقّع:", error);
    return formError("حدث خطأ أثناء الحفظ. الرجاء المحاولة بعد قليل.");
  }
}

// ---------------------------------------------------------------------------
// نموذج التواصل
// ---------------------------------------------------------------------------

export async function submitContactMessage(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    subject: formData.get("subject") ?? "",
    message: formData.get("message") ?? "",
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    return formError(
      "الرجاء مراجعة الحقول المميّزة بالأحمر.",
      toFieldErrors(parsed.error),
    );
  }

  const guard = await guardSubmission("contact", 3);
  if (!guard.ok) return guard.state;

  try {
    const headerList = await headers();
    const referer = headerList.get("referer") ?? "";

    await prisma.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
        // نضمّ الصفحة المرسِلة إلى نصّ الرسالة بدل إضافة عمود لا يُستخدم إلا هنا.
        message: referer
          ? `${parsed.data.message}\n\n—\nأُرسلت من: ${referer}`
          : parsed.data.message,
        ipHash: guard.ipHash,
      },
    });

    return formSuccess(
      "وصلتنا رسالتك. سنردّ عليك على البريد الذي أدخلته في أقرب وقت.",
    );
  } catch (error) {
    console.error("[contact] خطأ غير متوقّع:", error);
    return formError("تعذّر إرسال الرسالة. الرجاء المحاولة بعد قليل.");
  }
}
