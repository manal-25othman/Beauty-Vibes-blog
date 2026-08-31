import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الصفحة غير موجودة",
  robots: { index: false, follow: true },
};

/**
 * صفحة 404 على مستوى الجذر.
 * تعيش خارج مجموعة (site) لأن Next يعرضها للمسارات غير المطابقة لأي تخطيط،
 * ولذلك تحمل ترويسة وتذييلًا مبسّطين خاصين بها.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line bg-surface">
        <div className="container-page flex h-header items-center">
          <Link
            href="/"
            className="font-display text-2xl font-bold text-ink transition-colors hover:text-accent"
          >
            Beauty Vibes
          </Link>
        </div>
      </header>

      <main
        id="main-content"
        className="container-page flex flex-1 items-center justify-center py-20"
      >
        <div className="max-w-lg text-center">
          <p className="font-display text-6xl font-extrabold text-accent-line">404</p>

          <h1 className="mt-4 font-display text-3xl font-extrabold text-ink">
            لم نجد هذه الصفحة
          </h1>

          <p className="mt-4 leading-relaxed text-ink-muted">
            ربما تغيّر الرابط أو حُذفت الصفحة. يمكنك العودة إلى الرئيسية،
            أو تصفّح المقالات، أو البحث عمّا تريدين.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              الصفحة الرئيسية
            </Link>
            <Link
              href="/articles"
              className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent"
            >
              كل المقالات
            </Link>
            <Link
              href="/search"
              className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent"
            >
              البحث
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
