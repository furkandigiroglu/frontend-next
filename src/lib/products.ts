import type { Product, ProductListResponse } from "@/types/product";
import { fetchCategories } from "@/lib/settings";

export type HomeProductBuckets = {
  latest: Product[];
  favorites: Product[];
  discounted: Product[];
};

const EMPTY_BUCKETS: HomeProductBuckets = {
  latest: [],
  favorites: [],
  discounted: [],
};

const apiBase = "http://185.96.163.183:8000/api/v1";

export async function fetchProducts(params?: Record<string, string>, token?: string): Promise<Product[]> {
  try {
    const query = new URLSearchParams(params);
    const headers: HeadersInit = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${apiBase}/products?${query.toString()}`, {
      headers,
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error("Failed to fetch products:", await response.text());
      return [];
    }

    const data: ProductListResponse = await response.json();
    return data.items;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function fetchAdminProducts(token?: string): Promise<Product[]> {
  // Fetch all products for admin (maybe with pagination later)
  return fetchProducts({ limit: "100" }, token);
}

export async function fetchHomeProducts(): Promise<HomeProductBuckets> {
  try {
    // Fetch active products and categories in parallel
    const [products, categories] = await Promise.all([
      fetchProducts({ status: "active", limit: "50" }),
      fetchCategories()
    ]);

    if (!products.length) {
      return EMPTY_BUCKETS;
    }

    // Enrich products with category slugs
    const enrichedProducts = products.map(p => {
      // Prefer category_id as it seems to be the source of truth for the new backend
      const categoryId = p.category_id || p.category;
      
      if (categoryId) {
        const cat = categories.find(c => c.id === categoryId);
        if (cat) {
          return { ...p, category_slugs: cat.slug_translations };
        }
      }
      return p;
    });

    // Sort by created_at for latest
    const latest = [...enrichedProducts]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4);

    // For favorites, we don't have a 'fav' count in new backend yet, so just pick random or same as latest
    const favorites = enrichedProducts.slice(0, 4);

    // For discounted, check if sale_price < regular_price
    const discounted = enrichedProducts
      .filter(p => p.sale_price && p.regular_price && p.sale_price < p.regular_price)
      .slice(0, 4);

    return {
      latest,
      favorites,
      discounted: discounted.length ? discounted : latest, // Fallback
    };
  } catch {
    return EMPTY_BUCKETS;
  }
}

export async function getProduct(id: string, token?: string): Promise<Product | null> {
  try {
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${apiBase}/products/${id}`, {
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      console.error("Failed to fetch product:", await response.text());
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function getProductBySlug(lang: string, categorySlug: string, productSlug: string): Promise<Product | null> {
  const url = `${apiBase}/products/by-slug/${lang}/${categorySlug}/${productSlug}`;
  try {
    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`Failed to fetch product by slug (${response.status}):`, await response.text());
      if (response.status === 404) return null;
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}
