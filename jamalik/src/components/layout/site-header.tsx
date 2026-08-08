import { mainNavigation } from "@/config/site";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { HeaderClient } from "./header-client";

/**
 * الترويسة: جزء الخادم يجلب التصنيفات والإعدادات،
 * والجزء التفاعلي (القائمة والبحث) في مكوّن عميل منفصل
 * حتى يبقى حجم الـ JavaScript المُرسل للمتصفّح صغيرًا.
 */
export async function SiteHeader() {
  const [settings, categories] = await Promise.all([
    getSettings(),
    prisma.category
      .findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: { name: true, slug: true },
      })
      .catch(() => []),
  ]);

  return (
    <HeaderClient
      siteName={settings.siteName}
      navigation={[...mainNavigation]}
      categories={categories}
    />
  );
}

export function HeaderSkeleton() {
  return (
    <header className="h-header border-b border-line bg-surface">
      <div className="container-page flex h-full items-center">
        <span className="font-display text-2xl font-bold text-ink">
          {"جمالِك"}
        </span>
      </div>
    </header>
  );
}
