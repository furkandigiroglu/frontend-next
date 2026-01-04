import { SettingsTabs } from "@/components/dashboard/SettingsTabs";
import type { Locale } from "@/i18n/config";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Ayarlar</h1>
        <p className="text-sm text-slate-500">Kategorileri ve genel sistem ayarlarını yönetin.</p>
      </div>
      
      <SettingsTabs />
    </div>
  );
}
