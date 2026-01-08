"use client";

import { ShoppingCart, Truck, ShieldCheck, RefreshCw, Calendar, ArrowLeftRight } from "lucide-react";
import { Product } from "@/types/product";
import { Dictionary } from "@/types/dictionary";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/siteConfig";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { ReservationDialog } from "./ReservationDialog";
import { TradeRequestDialog } from "./TradeRequestDialog";

interface ProductInfoProps {
  product: Product;
  locale: string;
  dict: Dictionary;
  categoryName?: string | null;
}

export function ProductInfo({ product, locale, dict, categoryName }: ProductInfoProps) {
  const { addItem } = useCart();
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isTradeOpen, setIsTradeOpen] = useState(false);

  const isSold = product.status === "sold" || (product.quantity !== undefined && product.quantity === 0);
  const isReserved = product.is_reserved || product.status === "archived";

  const parsePrice = (val: string | number | null | undefined) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    // Replace comma with dot just in case, removing whitespace
    const normalized = val.toString().replace(',', '.').replace(/\s/g, ''); 
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  };

  const regularPrice = parsePrice(product.regular_price);
  const salePrice = parsePrice(product.sale_price);

  const hasDiscount = salePrice > 0 && regularPrice > 0 && salePrice < regularPrice;
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

  const whatsappPhone = siteConfig.phone.replace(/[^0-9]/g, "");
  // Ensure we handle URL construction safely on client side
  const currentUrl = typeof window !== 'undefined' ? window.location.href : `${siteConfig.url}/${locale}/products/${product.category_slug || 'general'}/${product.slug || product.id}`;
  const whatsappText = locale === 'fi' 
      ? `Hei, olen kiinnostunut tästä tuotteesta: ${product.name}\n${currentUrl}`
      : `Hello, I am interested in this product: ${product.name}\n${currentUrl}`;
  const whatsappLink = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappText)}`;

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
                {salePrice > 0 ? formatPrice(salePrice) : (regularPrice > 0 ? formatPrice(regularPrice) : "–")}
              </p>
            )}
          </div>
          
          {isSold && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600">
              {dict.product.status.sold}
            </span>
          )}
          {!isSold && isReserved && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-600">
               {locale === "fi" ? "Varattu" : "Reserved"}
            </span>
          )}
        </div>
        {/* Stock Status */}
        {!isSold && !isReserved && product.quantity !== undefined && (
          <p className="mt-2 text-sm font-medium text-emerald-600">
            {product.quantity > 5 
               ? (locale === "fi" ? "Varastossa" : "In Stock") 
               : (locale === "fi" ? `Vain ${product.quantity} jäljellä!` : `Only ${product.quantity} left!`)}
          </p>
        )}
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
          {product.metadata && Object.entries(product.metadata).map(([key, value]) => {
             const lowerKey = key.toLowerCase();
             // Skip internal flags or unwanted metadata
             if (lowerKey === 'featured' || lowerKey === 'condition' || lowerKey === 'pet friendly' || lowerKey === 'sku') return null;

             const stringValue = String(value).toLowerCase();
             if (!value || stringValue === 'no' || stringValue === 'false' || stringValue === 'null' || stringValue === '') {
                 return null;
             }
             return (
              <div key={key} className="sm:col-span-1">
                <dt className="text-sm font-medium text-slate-500">{formatKey(key)}</dt>
                <dd className="mt-1 text-sm text-slate-900">{String(value)}</dd>
              </div>
            );
          })}
        </dl>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        <button
          type="button"
          onClick={() => addItem(product)}
          disabled={isSold || isReserved}
          className={cn(
            "flex w-full items-center justify-center rounded-full border border-transparent px-8 py-3 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2",
            (isSold || isReserved)
              ? "bg-slate-300 cursor-not-allowed" 
              : "bg-slate-900 hover:bg-slate-800"
          )}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {isSold 
            ? dict.product.actions.soldOut
            : isReserved
              ? (locale === "fi" ? "Varattu" : "Reserved")
              : dict.product.actions.addToCart}
        </button>

        {/* Reservation Request Button */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setIsReservationOpen(true)}
            className="flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {locale === "fi" ? "Varaus" : "Reserve"}
          </button>

          <button
            type="button"
            onClick={() => setIsTradeOpen(true)}
            className="flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            {locale === "fi" ? "Vaihto" : "Trade"}
          </button>
        </div>

        {/* WhatsApp Button */}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center rounded-full bg-[#25D366] px-8 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-[#20bd5a] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
        >
          <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
             <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          {locale === "fi" ? "Kysy WhatsAppissa" : "Ask on WhatsApp"}
        </a>

        {/* Klarna Logo */}
        <div className="mt-3 flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-2">
          <img src="/klarna.png" alt="Klarna" className="h-[3.5rem] w-auto object-contain" />
        </div>
      </div>

      <ReservationDialog 
        isOpen={isReservationOpen} 
        onClose={() => setIsReservationOpen(false)} 
        product={{ id: product.id, name: product.name }}
        locale={locale}
      />

      <TradeRequestDialog 
        isOpen={isTradeOpen} 
        onClose={() => setIsTradeOpen(false)} 
        product={{ id: product.id, name: product.name }}
        locale={locale}
      />

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
