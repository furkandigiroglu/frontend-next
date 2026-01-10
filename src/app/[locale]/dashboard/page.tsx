import { BarChart3, Package, ShoppingCart, Users, Plus, FileText, TrendingUp, Clock, Settings } from "lucide-react";
import { AdminDashboardStats } from "@/components/admin/AdminDashboardStats";
import { AdminProductStats } from "@/components/admin/AdminProductStats";
import Link from "next/link";

export default async function DashboardPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;

  const quickActions = [
    { 
      label: locale === 'fi' ? 'Uusi Lasku' : 'New Invoice', 
      href: `/${locale}/dashboard/invoices/new`,
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    { 
      label: locale === 'fi' ? 'Uusi Tuote' : 'New Product', 
      href: `/${locale}/dashboard/products/new`,
      icon: Package,
      color: 'bg-green-500 hover:bg-green-600'
    },
    { 
      label: locale === 'fi' ? 'Laskut' : 'Invoices', 
      href: `/${locale}/dashboard/invoices`,
      icon: FileText,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    { 
      label: locale === 'fi' ? 'Tuotteet' : 'Products', 
      href: `/${locale}/dashboard/products`,
      icon: ShoppingCart,
      color: 'bg-amber-500 hover:bg-amber-600'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900">
          {locale === 'fi' ? 'Tervetuloa Hallintapaneeliin' : 'Welcome to Dashboard'}
        </h2>
        <p className="text-slate-500 mt-1">
          {locale === 'fi' ? 'Hallitse liiketoimintaasi yhdestä paikasta' : 'Manage your business from one place'}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {locale === 'fi' ? 'Pikatoiminnot' : 'Quick Actions'}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`${action.color} text-white rounded-lg p-4 flex items-center gap-3 transition-all shadow-sm hover:shadow-md`}
            >
              <action.icon className="h-5 w-5" />
              <span className="font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Invoice Stats */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {locale === 'fi' ? 'Laskujen Tilanne' : 'Invoice Status'}
        </h3>
        <AdminDashboardStats />
      </div>

      {/* Product Stats */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Package className="h-5 w-5" />
          {locale === 'fi' ? 'Tuotteiden Tilanne' : 'Product Status'}
        </h3>
        <AdminProductStats locale={locale} />
      </div>

      {/* Recent Activity Placeholder */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {locale === 'fi' ? 'Viimeisimmät Tapahtumat' : 'Recent Activity'}
        </h3>
        <div className="mt-4 h-64 flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-slate-400">
          <Clock className="h-12 w-12 mb-3 text-slate-300" />
          <p className="text-sm">{locale === 'fi' ? 'Toimintahistoria tulossa pian' : 'Activity history coming soon'}</p>
        </div>
      </div>
    </div>
  );
}
