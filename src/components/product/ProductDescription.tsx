"use client";

import { Product } from "@/types/product";
import { Dictionary } from "@/types/dictionary";
import { cn } from "@/lib/utils";

interface ProductDescriptionProps {
  product: Product;
  locale: string;
  dict: Dictionary;
}

export function ProductDescription({ product, locale, dict }: ProductDescriptionProps) {
  const getDescription = () => {
    if (!product.description) return null;
    if (typeof product.description === 'string') return product.description;
    
    const desc = product.description as Record<string, string>;
    return desc[locale] || desc['fi'] || desc['en'] || null;
  };

  const descriptionText = getDescription();

  return (
    <div className="mx-auto mt-16 w-full max-w-2xl lg:col-span-4 lg:mt-0 lg:max-w-none">
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            className={cn(
              "border-slate-900 text-slate-900",
              "whitespace-nowrap border-b-2 py-6 text-sm font-medium"
            )}
          >
            {dict.product.tabs.description}
          </button>
          {/* Future: Add more tabs like "Shipping", "Reviews" */}
        </nav>
      </div>

      <div className="py-10">
        <div className="prose prose-slate max-w-none">
          <p className="whitespace-pre-line text-slate-600">
            {descriptionText || dict.product.messages.noDescription}
          </p>
        </div>
      </div>
    </div>
  );
}
