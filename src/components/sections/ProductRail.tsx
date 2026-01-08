import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import type { MarketplaceProduct } from "@/types/product";

type ProductRailProps = {
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  products: MarketplaceProduct[];
  createHref: (path: string) => string;
  locale?: string;
};

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
      <div className="grid gap-3 grid-cols-2 sm:gap-6 sm:grid-cols-2 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} locale={locale} />
        ))}
      </div>
    </section>
  );
}

