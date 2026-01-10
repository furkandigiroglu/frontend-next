"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchAdminProducts } from "@/lib/products";
import { Package, TrendingUp, CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { Product } from "@/types/product";

export function AdminProductStats({ locale }: { locale: string }) {
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !token) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const data = await fetchAdminProducts(token);
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, isAuthenticated, authLoading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center p-8 text-slate-500">
        {locale === 'fi' ? 'Kirjaudu sisään nähdäksesi tilastot' : 'Please log in to view stats'}
      </div>
    );
  }

  // Calculate stats
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const soldProducts = products.filter(p => p.status === 'sold').length;
  const draftProducts = products.filter(p => p.status === 'draft').length;
  
  const totalValue = products.reduce((sum, p) => {
    const price = Number(p.sale_price) || Number(p.regular_price) || 0;
    return sum + price;
  }, 0);

  const activeValue = products
    .filter(p => p.status === 'active')
    .reduce((sum, p) => {
      const price = Number(p.sale_price) || Number(p.regular_price) || 0;
      return sum + price;
    }, 0);

  const stats = [
    {
      label: locale === 'fi' ? 'Yhteensä Tuotteita' : 'Total Products',
      value: totalProducts,
      subtext: `${totalValue.toFixed(0)}€ ${locale === 'fi' ? 'kokonaisarvo' : 'total value'}`,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: locale === 'fi' ? 'Aktiiviset' : 'Active',
      value: activeProducts,
      subtext: `${activeValue.toFixed(0)}€ ${locale === 'fi' ? 'arvo' : 'value'}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: locale === 'fi' ? 'Myyty' : 'Sold',
      value: soldProducts,
      subtext: `${((soldProducts / totalProducts) * 100).toFixed(0)}% ${locale === 'fi' ? 'tuotteista' : 'of products'}`,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: locale === 'fi' ? 'Luonnos' : 'Draft',
      value: draftProducts,
      subtext: locale === 'fi' ? 'Julkaisematta' : 'Unpublished',
      icon: XCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div 
          key={stat.label} 
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {stat.subtext}
              </p>
            </div>
            <div className={`rounded-lg ${stat.bgColor} p-2.5`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
