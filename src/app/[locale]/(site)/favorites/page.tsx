"use client";

import { useWishlist } from "@/context/WishlistContext";
import { ProductCard } from "@/components/product/ProductCard";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

export default function FavoritesPage({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }) {
    const { locale } = use(params);
    const { items, wishlistCount } = useWishlist();

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
             <div className="mb-8 flex items-center gap-4">
                <Link 
                href={`/${locale}`} 
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-3xl font-bold text-[#1f1b16]">
                    {locale === 'fi' ? 'Suosikit' : 'Favorites'}
                    <span className="ml-2 text-lg font-normal text-slate-500">({wishlistCount})</span>
                </h1>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100">
                    <h2 className="text-xl font-medium text-slate-900 mb-2">
                        {locale === 'fi' ? 'Ei suosikkeja vielä' : 'No favorites yet'}
                    </h2>
                    <p className="text-slate-500 mb-6">
                        {locale === 'fi' 
                            ? 'Lisää tuotteita suosikkeihin sydän-ikonista.' 
                            : 'Add products to your favorites by clicking the heart icon.'}
                    </p>
                    <Link
                        href={`/${locale}/products`}
                        className="inline-flex items-center justify-center rounded-full bg-[#1f1b16] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#3d362b]"
                    >
                        {locale === 'fi' ? 'Selaa tuotteita' : 'Browse Products'}
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
                    {items.map((product) => (
                        <ProductCard key={product.id} product={product} locale={locale} />
                    ))}
                </div>
            )}
        </div>
    );
}
