import { MarketplaceProduct } from "@/types/product";

export function createProductSlug(product: MarketplaceProduct, locale: string = 'fi'): string {
  if (product.slug_translations && product.slug_translations[locale]) {
    return product.slug_translations[locale];
  }

  const slug = product.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  
  return slug;
}
