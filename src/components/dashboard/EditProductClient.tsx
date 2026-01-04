"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ProductForm } from "@/components/dashboard/ProductForm";
import { useAuth } from "@/context/AuthContext";
import { getProduct } from "@/lib/products";
import type { Product } from "@/types/product";
import type { Dictionary } from "@/types/dictionary";

type EditProductClientProps = {
  id: string;
  locale: string;
  dict: Dictionary;
};

export function EditProductClient({ id, locale, dict }: EditProductClientProps) {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (authLoading) return;
      if (!token) {
        router.push(`/${locale}/auth/login`);
        return;
      }

      try {
        const data = await getProduct(id, token);
        if (!data) {
          // Handle not found or error
          console.error("Product not found");
          router.push(`/${locale}/dashboard/products`);
          return;
        }
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, token, authLoading, locale, router]);

  if (loading || authLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{dict.dashboard.productForm.titleEdit}</h2>
        <p className="text-slate-500">{dict.dashboard.productForm.subtitleEdit}</p>
      </div>

      <ProductForm initialData={product} locale={locale} dict={dict} />
    </div>
  );
}
