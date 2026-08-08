import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUser, type SessionUser } from "@/lib/auth/session";

/**
 * تُستدعى في أعلى كل صفحة وكل Server Action داخل /admin.
 * الحماية تعتمد على هذه الدالة وليس على الـ middleware وحده: الـ middleware
 * يمنع الوصول مبكرًا، لكن التحقق الحقيقي يجب أن يتم في مكان قراءة البيانات.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    redirect("/admin?error=forbidden");
  }
  return user;
}

/** نسخة لا تُعيد التوجيه — للاستخدام داخل Route Handlers. */
export async function getAuthorizedUser(): Promise<SessionUser | null> {
  return getCurrentUser();
}
