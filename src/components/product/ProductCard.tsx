"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import type { MarketplaceProduct } from "@/types/product";
import { useWishlist } from "@/context/WishlistContext";
import { createProductSlug } from "@/lib/slug";

function PriceDisplay({ product }: { product: MarketplaceProduct }) {
  const parsePrice = (price: string | number | null | undefined) => {
    if (!price) return 0;
    return typeof price === 'string' ? parseFloat(price) : price;
  };

  const regularPrice = parsePrice(product.regular_price);
  const salePrice = parsePrice(product.sale_price);

  if (salePrice > 0 && regularPrice > 0 && salePrice < regularPrice) {
    const discount = Math.round(((regularPrice - salePrice) / regularPrice) * 100);
    return (
      <div className="flex flex-col items-start leading-none gap-0.5">
         <span className="text-xs text-gray-500 line-through">{regularPrice.toLocaleString("fi-FI", {minimumFractionDigits: 0, maximumFractionDigits: 0})} €</span>
         <span className="text-base sm:text-lg font-bold text-[#d32f2f]">{salePrice.toLocaleString("fi-FI", {minimumFractionDigits: 0, maximumFractionDigits: 0})} €</span>
      </div>
    );
  }

  if (salePrice > 0) {
    return <span className="text-base sm:text-lg font-bold text-[#1f1b16]">{salePrice.toLocaleString("fi-FI", {minimumFractionDigits: 0, maximumFractionDigits: 0})} €</span>;
  }

  if (regularPrice > 0) {
    return <span className="text-base sm:text-lg font-bold text-[#1f1b16]">{regularPrice.toLocaleString("fi-FI", {minimumFractionDigits: 0, maximumFractionDigits: 0})} €</span>;
  }

  return <span className="text-base sm:text-lg font-bold text-[#1f1b16]">–</span>;
}

interface ProductCardProps {
  product: MarketplaceProduct;
  locale: string;
}

export function ProductCard({ product, locale }: ProductCardProps) {
  const { toggleItem, isInWishlist } = useWishlist();
  const isFavorite = isInWishlist(product.id);

  const coverImage = product.files?.[0] 
    ? `http://185.96.163.183:8000/api/v1/storage/${product.files[0].namespace}/${product.files[0].entity_id}/${product.files[0].filename}`
    : "/window.svg";

  const categorySlug = product.category_slugs?.[locale] || product.category_slug || 'general';
  const productSlug = createProductSlug(product, locale);
  // Ensure locale is part of the path
  const productHref = `/${locale}/products/${categorySlug}/${productSlug}`;

  return (
    <article
      className="group relative flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-xl border border-[#eadfcd]"
    >
      {/* Image Container - Returned to wider 4:3 aspect ratio */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f0f0f0]">
        <Link href={productHref} className="absolute inset-0 z-0" aria-label={`View ${product.name}`}>
        <Image
            src={coverImage}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-105"
            priority={false}
        />
        </Link>
        
            {/* Badges (Top Left) */}
            <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5 pointer-events-none">
            {product.is_reserved ? (
                <span className="inline-flex w-fit rounded bg-amber-400/90 px-2 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-black backdrop-blur-sm">
                {locale === "fi" ? "Varattu" : "Reserved"}
                </span>
            ) : product.status === 'sold' ? (
                <span className="inline-flex w-fit rounded bg-red-500/90 px-2 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                {locale === "fi" ? "Myyty" : "Sold"}
                </span>
            ) : null}
            {/* Sale Badge */}
                {product.sale_price && product.regular_price && (typeof product.sale_price === 'number' ? product.sale_price : parseFloat(product.sale_price)) < (typeof product.regular_price === 'number' ? product.regular_price : parseFloat(product.regular_price)) && (
                    <span className="inline-flex w-fit rounded bg-black/80 px-2 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                        ALE
                    </span>
                )}
            </div>

            {/* Favorite Button (Top Right) */}
            <button 
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleItem(product);
                }}
                className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition active:scale-95 ${
                    isFavorite 
                        ? "bg-white text-red-600 hover:bg-slate-50" 
                        : "bg-white/80 text-[#1f1b16] hover:bg-white hover:text-red-600"
                }`}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
            </button>
      </div>

      {/* Content Container */}
      <div className="flex flex-col gap-2 p-3 sm:p-4">
            <Link href={productHref}>
                <h3 className="text-sm sm:text-base font-medium text-[#1f1b16] line-clamp-2 min-h-[2.5em] leading-tight group-hover:text-[#6a5c4b] transition-colors">{product.name}</h3>
            </Link>
            
            <div className="flex items-end justify-between mt-1">
                <div className="text-[#1f1b16]">
                    <PriceDisplay product={product} />
                </div>
                
                {/* Action Button */}
                <Link 
                href={productHref}
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#f3e7d6] text-[#1f1b16] transition-colors hover:bg-[#1f1b16] hover:text-white"
                >
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
            </div>
      </div>
    </article>
  );
}
