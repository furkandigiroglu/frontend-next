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
      next: { revalidate: 0 },
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
      
      let categorySlugs = undefined;

      if (categoryId) {
        const cat = categories.find(c => c.id === categoryId);
        if (cat) {
          categorySlugs = cat.slug_translations;
        }
      }
      
      // Fallback: if no category object found but we have a category name string in p.category
      // try to find it by name in categories list
      if (!categorySlugs && typeof p.category === 'string') {
          const catByName = categories.find(c => c.name_translations['fi'] === p.category || c.name_translations['en'] === p.category);
          if (catByName) {
             categorySlugs = catByName.slug_translations;
          }
      }

      return { ...p, category_slugs: categorySlugs };
    });

    // Sort by created_at for latest
    const latest = [...enrichedProducts]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4);

    // For favorites, filter by metadata.featured and shuffle to show variety
    const featured = enrichedProducts.filter(p => (p.metadata as any)?.featured === true || (p.metadata as any)?.featured === "true");
    const favorites = featured.sort(() => 0.5 - Math.random()).slice(0, 4);

    // For discounted, check if sale_price < regular_price
    const discounted = enrichedProducts
      .filter(p => {
         // handle string or number
         const reg = Number(p.regular_price);
         const sale = Number(p.sale_price);
         return reg > 0 && sale > 0 && sale < reg;
      })
      .slice(0, 4);

    return {
      latest,
      favorites, // Return empty if none found, so section hides
      discounted, // Return empty if none found, so section hides
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
  // Extract UUID from the end of the slug
  const uuidRegex = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  const match = productSlug.match(uuidRegex);
  
  if (match) {
    const productId = match[0];
    // console.log(`[getProductBySlug] Extracted ID: ${productId} from slug: ${productSlug}`);
    return getProduct(productId);
  }

  // Fallback to legacy by-slug (Only if not UUID found)
  console.log(`[getProductBySlug] No UUID found in slug: ${productSlug}, trying legacy lookup`);
  const url = `${apiBase}/products/by-slug/${lang}/${categorySlug}/${productSlug}`;
  try {
    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      // console.error(`Failed to fetch product by slug (${response.status}):`, await response.text());
      if (response.status === 404) return null;
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}

export async function deleteProduct(id: string, token: string): Promise<void> {
  const response = await fetch(`${apiBase}/products/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete product");
  }
}
