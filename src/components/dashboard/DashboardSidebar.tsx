"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, FileText, BarChart3, LogOut, Settings, Truck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { Locale } from "@/i18n/config";

type DashboardSidebarProps = {
  locale: Locale;
};

export function DashboardSidebar({ locale }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isActive = (path: string) => {
    const fullPath = `/${locale}${path}`;
    if (path === "/dashboard" && pathname === fullPath) return true;
    if (path !== "/dashboard" && pathname.startsWith(fullPath)) return true;
    return false;
  };

  const menuItems = [
    { label: "Yleiskatsaus", href: "/dashboard", icon: LayoutDashboard },
    { label: "Tuotteet", href: "/dashboard/products", icon: Package },
    { label: "Laskut", href: "/dashboard/invoices", icon: FileText },
    { label: "Toimitus", href: "/dashboard/shipping", icon: Truck },
    { label: "Tilastot", href: "/dashboard/stats", icon: BarChart3 },
    { label: "Ayarlar", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white transition-transform">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b border-slate-200 px-6">
          <Link href={`/${locale}`} className="flex items-center gap-2 font-bold text-slate-900">
            <span className="text-xl">Ehankki</span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            Kirjaudu ulos
          </button>
        </div>
      </div>
    </aside>
  );
}
