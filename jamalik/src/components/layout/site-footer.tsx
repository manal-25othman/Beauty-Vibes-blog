import Link from "next/link";
import { legalNavigation, siteNavigation } from "@/config/site";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export async function SiteFooter() {
  const [settings, categories] = await Promise.all([
    getSettings(),
    prisma.category
      .findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: { name: true, slug: true },
        take: 10,
      })
      .catch(() => []),
  ]);

  const socials = [
    { label: "إنستغرام", href: settings.instagramUrl },
    { label: "فيسبوك", href: settings.facebookUrl },
    { label: "بينتريست", href: settings.pinterestUrl },
    { label: "يوتيوب", href: settings.youtubeUrl },
  ].filter((item) => item.href);

  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="container-page py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* عن الموقع */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-display text-2xl font-bold text-ink">
              {settings.siteName}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
              {settings.siteDescription}
            </p>
            {socials.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-accent hover:text-accent"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <FooterColumn title="التصنيفات">
            {categories.map((category) => (
              <FooterLink
                key={category.slug}
                href={`/category/${category.slug}`}
                label={category.name}
              />
            ))}
          </FooterColumn>

          <FooterColumn title="الموقع">
            {siteNavigation.map((item) => (
              <FooterLink key={item.href} href={item.href} label={item.label} />
            ))}
            <FooterLink href="/articles" label="كل المقالات" />
            <FooterLink href="/rss.xml" label="خلاصة RSS" />
          </FooterColumn>

          <FooterColumn title="السياسات">
            {legalNavigation.map((item) => (
              <FooterLink key={item.href} href={item.href} label={item.label} />
            ))}
          </FooterColumn>
        </div>

        <div className="mt-12 border-t border-line pt-6">
          <p className="text-xs leading-relaxed text-ink-faint">
            المحتوى المنشور في {settings.siteName} لأغراض تثقيفية وتحريرية عامة،
            ولا يُغني عن استشارة مختص في أي أمر صحي أو جلدي.
          </p>
          <p className="mt-3 text-sm text-ink-muted">
            © {year} {settings.siteName}. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <nav aria-label={title}>
      <h2 className="mb-4 text-sm font-bold tracking-wide text-ink">{title}</h2>
      <ul className="space-y-2.5">{children}</ul>
    </nav>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-ink-muted transition-colors hover:text-accent"
      >
        {label}
      </Link>
    </li>
  );
}
