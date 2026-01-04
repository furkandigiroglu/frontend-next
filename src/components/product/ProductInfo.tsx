"use client";

import { ShoppingCart, Truck, ShieldCheck, RefreshCw, Calendar } from "lucide-react";
import { Product } from "@/types/product";
import { Dictionary } from "@/types/dictionary";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/siteConfig";
import { useCart } from "@/context/CartContext";

interface ProductInfoProps {
  product: Product;
  locale: string;
  dict: Dictionary;
  categoryName?: string | null;
}

export function ProductInfo({ product, locale, dict, categoryName }: ProductInfoProps) {
  const { addItem } = useCart();
  const isSold = product.status === "sold";
  const isReserved = product.status === "archived"; 

  const regularPrice = product.regular_price;
  const salePrice = product.sale_price;
  const hasDiscount = salePrice && regularPrice && salePrice < regularPrice;
  const discountPercentage = hasDiscount 
    ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) 
    : 0;

  const formatPrice = (price: number) => price.toLocaleString(locale === "fi" ? "fi-FI" : "en-US", {
    style: "currency",
    currency: "EUR",
  });

  // Helper to format attribute keys (e.g., "screen_size" -> "Screen Size")
  const formatKey = (key: string) => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{product.name}</h1>
        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-baseline gap-2">
            {hasDiscount ? (
              <>
                <p className="text-3xl tracking-tight text-slate-900">{formatPrice(salePrice)}</p>
                <p className="text-lg text-slate-500 line-through">{formatPrice(regularPrice)}</p>
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-semibold text-red-600">
                  -{discountPercentage}%
                </span>
              </>
            ) : (
              <p className="text-3xl tracking-tight text-slate-900">
                {regularPrice ? formatPrice(regularPrice) : "–"}
              </p>
            )}
          </div>
          
          {isSold && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600">
              {dict.product.status.sold}
            </span>
          )}
        </div>
      </div>

      {/* Short Details */}
      <div className="border-t border-slate-200 py-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          {product.brand && (
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-slate-500">{dict.product.details.brand}</dt>
              <dd className="mt-1 text-sm text-slate-900">{product.brand}</dd>
            </div>
          )}
          {categoryName && (
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-slate-500">{dict.product.details.category}</dt>
              <dd className="mt-1 text-sm text-slate-900">{categoryName}</dd>
            </div>
          )}
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-slate-500">{dict.product.details.condition}</dt>
            <dd className="mt-1 text-sm text-slate-900 capitalize">
              {product.condition_type === "new" 
                ? dict.product.condition.new
                : dict.product.condition.used}
            </dd>
          </div>
          {product.sku && (
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-slate-500">{dict.product.details.sku}</dt>
              <dd className="mt-1 text-sm text-slate-900">{product.sku}</dd>
            </div>
          )}
          {product.metadata && Object.entries(product.metadata).map(([key, value]) => (
            <div key={key} className="sm:col-span-1">
              <dt className="text-sm font-medium text-slate-500">{formatKey(key)}</dt>
              <dd className="mt-1 text-sm text-slate-900">{String(value)}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        <button
          type="button"
          onClick={() => addItem(product)}
          disabled={isSold}
          className={cn(
            "flex w-full items-center justify-center rounded-full border border-transparent px-8 py-3 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2",
            isSold 
              ? "bg-slate-300 cursor-not-allowed" 
              : "bg-slate-900 hover:bg-slate-800"
          )}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {isSold 
            ? dict.product.actions.soldOut
            : dict.product.actions.addToCart}
        </button>

        {/* Reservation Request Button */}
        <button
          type="button"
          className="flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-3 text-base font-medium text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          <Calendar className="mr-2 h-5 w-5" />
          {locale === "fi" ? "Varauspyyntö" : "Reservation Request"}
        </button>

        {/* Klarna Logo */}
        <div className="flex justify-center pt-2">
          <img src="/klarna.png" alt="Klarna" className="h-10 object-contain" />
        </div>
      </div>

      {/* Value Props */}
      <div className="mt-10 grid grid-cols-1 gap-y-4 border-t border-slate-200 py-6">
        <div className="flex items-center gap-3">
          <Truck className="h-5 w-5 text-slate-400" />
          <span className="text-sm text-slate-600">
            {dict.product.valueProps.delivery}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-slate-400" />
          <span className="text-sm text-slate-600">
            {dict.product.valueProps.checked}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 text-slate-400" />
          <span className="text-sm text-slate-600">
            {dict.product.valueProps.returns}
          </span>
        </div>
      </div>
    </div>
  );
}
