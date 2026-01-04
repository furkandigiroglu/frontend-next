import Image from "next/image";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import type { MarketplaceProduct } from "@/types/product";
import { createProductSlug } from "@/lib/slug";

type ProductRailProps = {
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  products: MarketplaceProduct[];
  createHref: (path: string) => string;
  locale?: string;
};

function PriceDisplay({ product }: { product: MarketplaceProduct }) {
  const regularPrice = product.regular_price;
  const salePrice = product.sale_price;

  if (salePrice && regularPrice && salePrice < regularPrice) {
    const discount = Math.round(((regularPrice - salePrice) / regularPrice) * 100);
    return (
      <div className="flex flex-col items-start">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white">{salePrice.toLocaleString("fi-FI")} €</span>
          <span className="rounded-md bg-red-500 px-1.5 py-0.5 text-[0.65rem] font-bold text-white">
            -{discount}%
          </span>
        </div>
        <span className="text-xs text-white/60 line-through">{regularPrice.toLocaleString("fi-FI")} €</span>
      </div>
    );
  }

  if (regularPrice) {
    return <span className="text-lg font-bold text-white">{regularPrice.toLocaleString("fi-FI")} €</span>;
  }

  return <span className="text-lg font-bold text-white">–</span>;
}

export function ProductRail({ title, description, ctaLabel, href, products, createHref, locale = 'fi' }: ProductRailProps) {
  if (!products.length) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
        <Link
          href={createHref(href)}
          className="inline-flex items-center gap-2 rounded-full border border-[#1f1b16] px-5 py-2 text-sm font-semibold text-[#1f1b16] transition hover:bg-[#1f1b16] hover:text-white"
        >
          {ctaLabel}
          <span>→</span>
        </Link>
      </div>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        {products.map((product) => {
          const coverImage = product.files?.[0] 
            ? `http://185.96.163.183:8000/api/v1/storage/${product.files[0].namespace}/${product.files[0].entity_id}/${product.files[0].filename}`
            : "/window.svg";

          const categorySlug = product.category_slugs?.[locale] || product.category_slug || 'general';
          const productSlug = createProductSlug(product, locale);
          const productHref = createHref(`/products/${categorySlug}/${productSlug}`);

          return (
          <article
            key={product.id}
            className="group relative flex aspect-square w-full flex-col overflow-hidden rounded-[24px] bg-slate-900 shadow-md transition-all duration-300 hover:shadow-xl"
          >
            <Link href={productHref} className="absolute inset-0 z-0" aria-label={`View ${product.name}`}>
              <Image
                src={coverImage}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 33vw, 100vw"
                className="object-cover transition duration-700 group-hover:scale-110"
                priority={false}
              />
            </Link>
            
            {/* Gradient Overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 transition duration-300 group-hover:opacity-80 z-0" />
            
            {/* Top Actions */}
            <div className="absolute left-4 top-4 right-4 flex justify-between items-start z-10 pointer-events-none">
              {product.status === 'sold' ? (
                <span className="inline-flex rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-md bg-red-500/90 text-white">
                  Myyty
                </span>
              ) : <span />} 

              <button 
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white transition hover:bg-white hover:text-red-600 pointer-events-auto"
                aria-label="Add to favorites"
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10 translate-y-2 transition-transform duration-300 group-hover:translate-y-0 pointer-events-none">
               <h3 className="text-xl font-bold text-white leading-tight mb-3 line-clamp-2 drop-shadow-md">{product.name}</h3>
               
               <div className="flex items-end justify-between">
                  <PriceDisplay product={product} />
                  
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 opacity-0 shadow-lg transform translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </div>
               </div>
            </div>
          </article>
        )})}
      </div>
    </section>
  );
}
