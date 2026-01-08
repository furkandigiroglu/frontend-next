"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getStats } from "@/lib/api/admin-invoices";
import { Loader2, TrendingUp, FileText, CheckCircle, AlertCircle } from "lucide-react";

interface InvoiceStats {
  total_invoices: number;
  total_revenue: number;
  total_tax: number;
  by_status: Record<string, number>;
  // ... other fields
}

export function AdminDashboardStats() {
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !token) {
        setLoading(false);
        return;
    }

    const fetchData = async () => {
      try {
        const data = await getStats(token);
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, isAuthenticated, authLoading]);

  if (loading) return <div className="h-32 animate-pulse rounded-lg bg-slate-100"></div>;
  
  if (!stats) {
    return (
      <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm text-center text-slate-500">
        <p>Tilastoja ei voitu ladata.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard 
        title="Total Revenue" 
        value={`${Number(stats.total_revenue ?? 0).toFixed(2)} €`}
        icon={TrendingUp}
        color="text-green-600"
        bg="bg-green-50"
      />
      <StatCard 
        title="Total Invoices" 
        value={stats.total_invoices.toString()}
        icon={FileText}
        color="text-blue-600"
        bg="bg-blue-50"
      />
      <StatCard 
        title="Paid Invoices" 
        value={stats.by_status['paid']?.toString() || '0'}
        icon={CheckCircle}
        color="text-indigo-600"
        bg="bg-indigo-50"
      />
      <StatCard 
        title="Overdue" 
        value={stats.by_status['overdue']?.toString() || '0'}
        icon={AlertCircle}
        color="text-red-600"
        bg="bg-red-50"
      />
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
    return (
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${bg} ${color}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    )
}
