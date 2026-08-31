import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: PageProps) {
  // الـ middleware يتحقّق من وجود الكوكي فقط؛ هنا نتأكّد من صلاحية الجلسة فعلًا.
  const user = await getCurrentUser();
  if (user) redirect("/admin");

  const { next } = await searchParams;

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link
            href="/"
            className="font-display text-3xl font-extrabold text-ink transition-colors hover:text-accent"
          >
            Beauty Vibes
          </Link>
          <h1 className="mt-6 font-display text-2xl font-bold text-ink">
            تسجيل الدخول إلى لوحة التحكم
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            هذه المنطقة مخصّصة لفريق التحرير.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <LoginForm next={next ?? ""} />
        </div>

        <p className="mt-6 text-center text-sm text-ink-faint">
          <Link href="/" className="transition-colors hover:text-accent">
            ← العودة إلى الموقع
          </Link>
        </p>
      </div>
    </div>
  );
}
