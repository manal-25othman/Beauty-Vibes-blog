"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  dummyPasswordCompare,
  hashPassword,
  verifyPassword,
} from "@/lib/auth/password";
import {
  createSession,
  destroySession,
  pruneExpiredSessions,
} from "@/lib/auth/session";
import { requireUser } from "@/lib/auth/guard";
import { changePasswordSchema, loginSchema, toFieldErrors } from "@/lib/validation";
import { formError, formSuccess, type FormState } from "@/lib/form-state";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

/** رسالة موحّدة: لا تكشف إن كان البريد مسجّلًا أم كلمة المرور خاطئة. */
const INVALID_CREDENTIALS = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";

/** يقبل المسارات الداخلية فقط — يمنع إعادة التوجيه المفتوح إلى نطاق خارجي. */
function safeRedirectPath(value: string | null | undefined): string {
  if (!value) return "/admin";
  if (!value.startsWith("/") || value.startsWith("//")) return "/admin";
  if (value.startsWith("/admin/login")) return "/admin";
  return value;
}

export async function login(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
  });

  if (!parsed.success) {
    return formError("تحقّقي من البيانات المُدخلة.", toFieldErrors(parsed.error));
  }

  const ip = await getClientIp();

  // حدّان: واحد لكل عنوان اتصال، وآخر لكل بريد — حتى لا يُجرَّب حساب واحد
  // من عناوين متعدّدة، ولا تُجرَّب حسابات متعدّدة من عنوان واحد.
  const byIp = rateLimit(`login:ip:${ip}`, 10, 15 * 60 * 1000);
  const byEmail = rateLimit(`login:email:${parsed.data.email}`, 5, 15 * 60 * 1000);

  if (!byIp.ok || !byEmail.ok) {
    return formError(
      "محاولات تسجيل دخول كثيرة. الرجاء الانتظار بضع دقائق قبل المحاولة مجددًا.",
    );
  }

  const user = await prisma.user
    .findUnique({
      where: { email: parsed.data.email },
      select: { id: true, passwordHash: true, isActive: true },
    })
    .catch(() => null);

  if (!user) {
    // مقارنة وهمية حتى يستغرق الرد زمنًا مماثلًا، فلا يُستدلّ على وجود البريد.
    await dummyPasswordCompare();
    return formError(INVALID_CREDENTIALS);
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid || !user.isActive) {
    return formError(INVALID_CREDENTIALS);
  }

  const headerList = await headers();

  await pruneExpiredSessions();
  await createSession(user.id, {
    userAgent: headerList.get("user-agent"),
    ip,
  });

  await prisma.user
    .update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
    .catch(() => undefined);

  redirect(safeRedirectPath(formData.get("next")?.toString()));
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

export async function changePassword(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword") ?? "",
    newPassword: formData.get("newPassword") ?? "",
    confirmPassword: formData.get("confirmPassword") ?? "",
  });

  if (!parsed.success) {
    return formError("تحقّقي من الحقول أدناه.", toFieldErrors(parsed.error));
  }

  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (!record) return formError("تعذّر العثور على الحساب.");

  const valid = await verifyPassword(parsed.data.currentPassword, record.passwordHash);
  if (!valid) {
    return formError("كلمة المرور الحالية غير صحيحة.", {
      currentPassword: "كلمة المرور الحالية غير صحيحة",
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });

  // إنهاء بقية الجلسات: تغيير كلمة المرور يجب أن يُخرج أي جهاز آخر.
  await prisma.session.deleteMany({ where: { userId: user.id } });
  await destroySession();

  return formSuccess(
    "تم تغيير كلمة المرور وإنهاء كل الجلسات. سجّلي الدخول من جديد.",
  );
}
