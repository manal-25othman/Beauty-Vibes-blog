import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";
import { getSettings } from "@/lib/settings";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <>
      {/* بيانات المنظّمة والموقع تُعرَّف مرة واحدة هنا، وتشير إليها بقية
          الصفحات بالمعرّف بدل تكرارها في كل صفحة. */}
      <JsonLd
        id="site-schema"
        data={[organizationSchema(settings.siteName), websiteSchema(settings.siteName)]}
      />

      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
