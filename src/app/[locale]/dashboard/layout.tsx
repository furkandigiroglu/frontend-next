import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import type { Locale } from "@/i18n/config";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params as { locale: Locale };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-slate-50">
        <DashboardSidebar locale={locale} />
        <div className="pl-64">
          <DashboardHeader />
          <main className="p-8">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}
