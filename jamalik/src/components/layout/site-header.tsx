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
        {/* الهيكل العظمي يحاكي مقاس الشعار كي لا تنزاح الترويسة عند ظهوره. */}
        <span className="h-9 w-[9.5rem] rounded bg-line/40 sm:h-10" />
      </div>
    </header>
  );
}
