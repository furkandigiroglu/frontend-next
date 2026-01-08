import { MarketplaceProduct } from "@/types/product";

export function createProductSlug(product: MarketplaceProduct, locale: string = 'fi'): string {
  let baseSlug = "";
  
  if (product.slug_translations && product.slug_translations[locale]) {
    baseSlug = product.slug_translations[locale];
  } else {
    baseSlug = product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  // Append ID to make it robust and queryable by ID
  return `${baseSlug}-${product.id}`;
}
