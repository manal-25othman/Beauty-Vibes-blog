import { requireAdmin } from "@/lib/auth/guard";
import { getSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  // صفحة المدير فقط — المحرّر لا يرى رابطها ولا يستطيع فتحها مباشرة.
  await requireAdmin();
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-ink">الإعدادات</h1>
        <p className="mt-1 text-sm text-ink-muted">
          هوية الموقع والتكاملات الخارجية. القيم المحفوظة هنا تتقدّم على متغيرات
          البيئة.
        </p>
      </header>

      <SettingsForm settings={settings} />
    </div>
  );
}
