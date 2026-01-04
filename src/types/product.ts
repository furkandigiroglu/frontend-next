export type ProductStatus = "draft" | "active" | "sold" | "archived";
export type ProductCondition = "new" | "used";
export type ShippingTier = "standard" | "premium" | "oversized";

export interface StoredFile {
  namespace: string;
  entity_id: string;
  filename: string;
  content_type: string;
  size: number;
  sha256: string;
  absolute_path: string;
  relative_path: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  category?: string; // This is likely the ID
  category_id?: string;
  category_slug?: string;
  category_slugs?: Record<string, string>;
  slug_translations?: Record<string, string>;
  brand?: string;
  status: ProductStatus;
  condition_type: ProductCondition;
  shipping_tier: ShippingTier;
  regular_price?: number;
  sale_price?: number;
  purchase_price?: number;
  dimensions?: string;
  description?: Record<string, unknown>;
  files: StoredFile[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  limit: number;
  offset: number;
}

// Alias for backward compatibility if needed, or we can refactor the app to use Product
export type MarketplaceProduct = Product;

