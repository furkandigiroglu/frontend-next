import { BarChart3, Package, ShoppingCart, Users } from "lucide-react";
import { AdminDashboardStats } from "@/components/admin/AdminDashboardStats";

const stats = [
  { label: "Kokonaismyynti", value: "12,450 €", change: "+12%", icon: BarChart3 },
  { label: "Aktiiviset Tuotteet", value: "45", change: "+2", icon: Package },
  { label: "Avoimet Tilaukset", value: "8", change: "-1", icon: ShoppingCart },
  { label: "Asiakkaat", value: "1,203", change: "+18%", icon: Users },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Yleiskatsaus</h2>
        <p className="text-slate-500">Tervetuloa takaisin! Tässä on päivän tilanne.</p>
      </div>

      <div className="mb-8">
        <h3 className="mb-4 text-lg font-semibold text-slate-700">Fatura Durumu (Canlı)</h3>
        <AdminDashboardStats />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className="rounded-full bg-slate-50 p-3">
                <stat.icon className="h-6 w-6 text-slate-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}>
                {stat.change}
              </span>
              <span className="ml-2 text-slate-500">edelliseen kuuhun verrattuna</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Viimeisimmät tapahtumat</h3>
        <div className="mt-4 h-64 flex items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-slate-400">
          Kaavio tai lista tulee tähän
        </div>
      </div>
    </div>
  );
}
