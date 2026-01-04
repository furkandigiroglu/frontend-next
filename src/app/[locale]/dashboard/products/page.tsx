"use client";

import { useEffect, useState, use } from "react";
import { fetchAdminProducts } from "@/lib/products";
import { ProductsTable } from "@/components/dashboard/ProductsTable";
import type { Locale } from "@/i18n/config";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import type { Product } from "@/types/product";

export default function ProductsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = use(params);
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        const data = await fetchAdminProducts(token);
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Tuotteet</h2>
        <p className="text-slate-500">Hallitse varastoa ja tuotetietoja.</p>
      </div>

      <ProductsTable products={products} locale={locale} />
    </div>
  );
}
