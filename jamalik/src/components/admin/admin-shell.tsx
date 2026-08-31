"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/actions/auth";
import type { SessionUser } from "@/lib/auth/session";

const NAV_ITEMS = [
  { href: "/admin", label: "لوحة المعلومات", exact: true },
  { href: "/admin/articles", label: "المقالات" },
  { href: "/admin/categories", label: "التصنيفات" },
  { href: "/admin/authors", label: "الكتّاب" },
  { href: "/admin/messages", label: "الرسائل" },
  { href: "/admin/subscribers", label: "المشتركون" },
  { href: "/admin/settings", label: "الإعدادات", adminOnly: true },
  { href: "/admin/account", label: "حسابي" },
];

export function AdminShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // إغلاق قائمة الجوال عند الانتقال — تعديل أثناء التصيير بدل effect،
  // فلا تظهر القائمة مفتوحة للحظة فوق الصفحة الجديدة.
  const [renderedPath, setRenderedPath] = useState(pathname);
  if (renderedPath !== pathname) {
    setRenderedPath(pathname);
    setMenuOpen(false);
  }

  const items = NAV_ITEMS.filter(
    (item) => !item.adminOnly || user.role === "ADMIN",
  );

  function isActive(item: (typeof NAV_ITEMS)[number]) {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      {/* الشريط الجانبي */}
      <aside className="border-b border-line bg-surface lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto lg:border-b-0 lg:border-s lg:border-s-line">
        <div className="flex items-center justify-between p-5">
          <div>
            <Link
              href="/admin"
              className="font-display text-xl font-extrabold text-ink"
            >
              Beauty Vibes
            </Link>
            <p className="text-xs text-ink-faint">لوحة التحكم</p>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="admin-nav"
            className="rounded-lg border border-line px-3 py-1.5 text-xs text-ink-soft lg:hidden"
          >
            {menuOpen ? "إغلاق" : "القائمة"}
          </button>
        </div>

        <nav
          id="admin-nav"
          aria-label="تنقّل لوحة التحكم"
          className={`${menuOpen ? "block" : "hidden"} border-t border-line px-3 pb-4 pt-3 lg:block lg:border-t-0`}
        >
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item) ? "page" : undefined}
                  className={`block rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive(item)
                      ? "bg-accent-soft font-semibold text-accent"
                      : "text-ink-soft hover:bg-surface-soft"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-line pt-4">
            <p className="px-3 text-sm font-semibold text-ink">{user.name}</p>
            <p className="px-3 text-xs text-ink-faint" dir="ltr">
              {user.email}
            </p>
            <p className="mt-1 px-3 text-xs text-ink-faint">
              {user.role === "ADMIN" ? "مدير" : "محرّر"}
            </p>

            <Link
              href="/"
              target="_blank"
              rel="noopener"
              className="mt-3 block rounded-lg px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-surface-soft"
            >
              عرض الموقع ↗
            </Link>

            <form action={logout}>
              <button
                type="submit"
                className="w-full rounded-lg px-3 py-2 text-start text-sm text-danger transition-colors hover:bg-danger-soft"
              >
                تسجيل الخروج
              </button>
            </form>
          </div>
        </nav>
      </aside>

      <main id="main-content" className="min-w-0 p-5 sm:p-8">
        {children}
      </main>
    </div>
  );
}
