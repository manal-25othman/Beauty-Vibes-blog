"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

import { requireAdmin } from "@/lib/auth/guard";
import { formError, formSuccess, type FormState } from "@/lib/form-state";
import { prisma } from "@/lib/prisma";
import { newUserSchema, passwordSchema, toFieldErrors } from "@/lib/validation";

const HASH_ROUNDS = 12;

export async function createUser(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  // إنشاء حساب يمنح صلاحية الكتابة على الموقع — للمدير وحده.
  await requireAdmin();

  const parsed = newUserSchema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
    role: formData.get("role") ?? "EDITOR",
  });

  if (!parsed.success) {
    return formError("راجعي الحقول أدناه.", toFieldErrors(parsed.error));
  }

  const { name, email, password, role } = parsed.data;

  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
    return formError("هذا البريد مسجّل بالفعل.", { email: "البريد مستخدم" });
  }

  try {
    await prisma.user.create({
      data: { name, email, role, passwordHash: await bcrypt.hash(password, HASH_ROUNDS) },
    });
  } catch (error) {
    console.error("[admin] فشل إنشاء الحساب:", error);
    return formError("تعذّر إنشاء الحساب. أعيدي المحاولة.");
  }

  revalidatePath("/admin/users");
  return formSuccess(`تم إنشاء حساب ${name}.`);
}

/** تعطيل حساب أو إعادة تفعيله — لا نحذف، فالحذف يفقد أثر من كتب ماذا. */
export async function toggleUserActive(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");

  // لا يعطّل المدير نفسه: يفقد الدخول ولا أحد يعيده.
  if (!id || id === admin.id) return;

  const target = await prisma.user.findUnique({ where: { id }, select: { isActive: true } });
  if (!target) return;

  await prisma.user.update({ where: { id }, data: { isActive: !target.isActive } });
  // الجلسات القائمة لا تنتهي بتعطيل الحساب وحده، فتُحذف صراحةً.
  if (target.isActive) await prisma.session.deleteMany({ where: { userId: id } });

  revalidatePath("/admin/users");
}

export async function changeUserRole(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const role = formData.get("role") === "ADMIN" ? "ADMIN" : "EDITOR";

  // لا يُنزّل المدير رتبة نفسه — قد يبقى الموقع بلا مدير.
  if (!id || id === admin.id) return;

  await prisma.user.update({ where: { id }, data: { role } });
  revalidatePath("/admin/users");
}

/**
 * تعيين كلمة مرور جديدة لحساب آخر — لمن نسيت كلمتها ولا سبيل لاستعادتها.
 *
 * لا يُعاد تعيين كلمة مرور المديرة لنفسها من هنا: لها «حسابي» حيث تُطلب
 * كلمتها الحالية، وهو الفرق بين تغيير يملكه صاحبه وإعادة تعيين إدارية.
 */
export async function resetUserPassword(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!id || id === admin.id) redirect("/admin/users?error=self");

  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) redirect("/admin/users?error=weak");

  const user = await prisma.user.findUnique({ where: { id }, select: { name: true } });
  if (!user) redirect("/admin/users?error=missing");

  await prisma.user.update({
    where: { id },
    data: { passwordHash: await bcrypt.hash(parsed.data, HASH_ROUNDS) },
  });

  // الجلسات القائمة تبقى صالحة بعد تغيير الكلمة، فتُحذف حتى يبدأ الدخول من جديد.
  await prisma.session.deleteMany({ where: { userId: id } });

  revalidatePath("/admin/users");
  redirect(`/admin/users?reset=${encodeURIComponent(user.name)}`);
}
