"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

type NavItem = { label: string; href: string };
type Category = { name: string; slug: string };

type Props = {
  siteName: string;
  navigation: NavItem[];
  categories: Category[];
};

export function HeaderClient({ siteName, navigation, categories }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuId = useId();
  const searchId = useId();

  // إغلاق القوائم عند الانتقال لصفحة أخرى، وإلا بقيت مفتوحة فوق المحتوى الجديد.
  // التعديل أثناء التصيير (لا داخل effect) يتجنّب وميض القائمة المفتوحة
  // على الصفحة الجديدة قبل إغلاقها.
  const [renderedPath, setRenderedPath] = useState(pathname);
  if (renderedPath !== pathname) {
    setRenderedPath(pathname);
    setMenuOpen(false);
    setSearchOpen(false);
  }

  // منع تمرير الصفحة خلف القائمة المفتوحة على الجوال.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    setSearchOpen(false);
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/95 backdrop-blur-sm">
      <div className="container-page">
        <div className="flex h-header items-center justify-between gap-4">
          {/* الشعار */}
          <Link href="/" className="shrink-0" aria-label={siteName}>
            {/*
              صورة لا نصّ: الشعار حروفه محوّلة إلى مسارات، فلا يعتمد على خطّ
              مثبَّت ويظهر متطابقًا في كل جهاز. والاسم يبقى في aria-label
              لقارئات الشاشة ولمحركات البحث.
            */}
            <Image
              src="/brand/logo.svg"
              alt={siteName}
              width={1077}
              height={275}
              // SVG لا يمرّ بمحسّن الصور بفائدة، فيُخدَم كما هو بلا طلب إضافي.
              unoptimized
              // الشعار أول ما يُرسم، فلا يُؤجَّل تحميله.
              priority
              className="h-9 w-auto sm:h-10"
            />
          </Link>

          {/* التنقّل — سطح المكتب */}
          <nav aria-label="التنقل الرئيسي" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`rounded-full px-3 py-2 text-[0.95rem] transition-colors ${
                      isActive(item.href)
                        ? "bg-accent-soft font-semibold text-accent"
                        : "text-ink-soft hover:bg-surface-soft hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              aria-expanded={searchOpen}
              aria-controls={searchId}
              className="rounded-full p-2.5 text-ink-soft transition-colors hover:bg-surface-soft hover:text-accent"
            >
              <SearchIcon />
              <span className="sr-only">البحث في الموقع</span>
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              className="rounded-full p-2.5 text-ink-soft transition-colors hover:bg-surface-soft hover:text-accent lg:hidden"
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
              <span className="sr-only">
                {menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
              </span>
            </button>
          </div>
        </div>

        {/* شريط البحث */}
        {searchOpen && (
          <div id={searchId} className="border-t border-line py-3">
            <form onSubmit={submitSearch} role="search" className="flex gap-2">
              <label htmlFor="header-search" className="sr-only">
                ابحثي في المقالات
              </label>
              <input
                id="header-search"
                ref={searchInputRef}
                type="search"
                name="q"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ابحثي عن مقال، تصنيف، أو موضوع…"
                className="min-w-0 flex-1 rounded-full border border-line bg-canvas px-5 py-2.5 text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
              >
                بحث
              </button>
            </form>
          </div>
        )}
      </div>

      {/* القائمة — الجوال */}
      {menuOpen && (
        <div
          id={menuId}
          className="fixed inset-x-0 top-header bottom-0 z-40 overflow-y-auto border-t border-line bg-surface lg:hidden"
        >
          <nav aria-label="قائمة الجوال" className="container-page py-6">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`block rounded-xl px-4 py-3 text-lg transition-colors ${
                      isActive(item.href)
                        ? "bg-accent-soft font-semibold text-accent"
                        : "text-ink-soft hover:bg-surface-soft"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {categories.length > 0 && (
              <div className="mt-8 border-t border-line pt-6">
                <h2 className="mb-3 px-4 text-sm font-semibold text-ink-faint">
                  كل التصنيفات
                </h2>
                <ul className="grid grid-cols-2 gap-1">
                  {categories.map((category) => (
                    <li key={category.slug}>
                      <Link
                        href={`/category/${category.slug}`}
                        className="block rounded-lg px-4 py-2.5 text-ink-soft transition-colors hover:bg-surface-soft hover:text-accent"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
