import { fetchProducts, fetchHomeProducts } from "@/lib/products"; // Using fetchHomeProducts logic to get enrichment
import { ProductCard } from "@/components/product/ProductCard";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/config";
import { fetchCategories } from "@/lib/settings";
import { CategoryPills } from "@/components/product/CategoryPills";

interface ProductsPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = "force-dynamic";

export default async function ProductsPage({ params, searchParams }: ProductsPageProps) {
  const { locale } = await params;
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const categories = await fetchCategories();
  
  // Convert searchParams to Record<string, string> for fetchProducts
  const queryParams: Record<string, string> = {};
  
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (typeof value === "string") {
      queryParams[key] = value;
    } else if (Array.isArray(value)) {
      queryParams[key] = value[0];
    }
  });

  // Default to active products
  if (!queryParams.status) {
    queryParams.status = "active";
  }

  // API returns 20 items by default. Increase this to show more products per page.
  if (!queryParams.limit) {
    queryParams.limit = "1000";
  }

  const activeFilter = queryParams.filter || "";
  let finalProducts: any[] = [];
  let filterTitle = activeFilter || (locale === 'fi' ? 'Kaikki tuotteet' : 'All products');

  // Fetch Logic
  let rawProducts = [];
  
  if (activeFilter === 'sale' || activeFilter === 'Alennetut tuotteet') {
     const saleParams = { ...queryParams, limit: "100" };
     delete saleParams.filter;
     rawProducts = await fetchProducts(saleParams);
     rawProducts = rawProducts.filter(p => {
        if (!p.regular_price || !p.sale_price) return false;
        return Number(p.sale_price) < Number(p.regular_price);
     });
     filterTitle = locale === 'fi' ? 'Alennetut tuotteet' : 'Discounted Products';

  } else if (activeFilter === 'favorites' || activeFilter === 'Suosikki valinnat') {
     const favParams = { ...queryParams, limit: "100" };
     delete favParams.filter;
     rawProducts = await fetchProducts(favParams);
     rawProducts = rawProducts.filter(p => {
        return (p.metadata as any)?.featured === true;
     });
     filterTitle = locale === 'fi' ? 'Suosikki valinnat' : 'Favorite Picks';

  } else if (activeFilter === 'Uudet Huonekalut' || activeFilter === 'New Furniture') {
     const newParams = { ...queryParams, condition: 'new' };
     delete newParams.filter;
     rawProducts = await fetchProducts(newParams);
     filterTitle = locale === 'fi' ? 'Uudet Huonekalut' : 'New Furniture';

  } else if (activeFilter) {
     // Try to find category by name (case-insensitive) in translations
     const foundCategory = categories.find(c => {
         const fiName = c.name_translations?.fi?.toLowerCase() || "";
         const enName = c.name_translations?.en?.toLowerCase() || "";
         const filterLower = activeFilter.toLowerCase();
         
         // Direct match
         if (fiName === filterLower || enName === filterLower) return true;

         // Singular/Plural simple check (e.g. Sohvat -> Sohva)
         if (filterLower.endsWith('s') && enName === filterLower.slice(0, -1)) return true; // Sofas -> Sofa
         if (filterLower.endsWith('t') && fiName === filterLower.slice(0, -1)) return true; // Sohvat -> Sohva (Finnish basic rule)

         return false;
     });

     const catParams = { ...queryParams };
     delete catParams.filter;

     if (foundCategory) {
         console.log(`[ProductsPage] ${activeFilter} matched to Category ID: ${foundCategory.id}`);
         catParams.category_id = foundCategory.id;
         // Clean up potential conflicts
         delete catParams.category;
     } else {
         console.log(`[ProductsPage] ${activeFilter} NOT matched to any category. Using string fallback.`);
         // Use category param for strict filtering to avoid including products that just mention the word in title (e.g. sofa + coffee table set)
         catParams.category = activeFilter;
         delete catParams.category_id;
         delete catParams.search; 
     }
     
     rawProducts = await fetchProducts(catParams);
  } else {
     rawProducts = await fetchProducts(queryParams);
  }

  // Enrich with category slugs manually since fetchProducts doesn't do it by default
  // Ideally this should be in fetchProducts or a helper, but duplicating logic here for quick fix on listing page
  finalProducts = rawProducts.map(p => {
      const categoryId = p.category_id || p.category;
      let categorySlugs = undefined;
      if (categoryId) {
        const cat = categories.find(c => c.id === categoryId);
        if (cat) {
          categorySlugs = cat.slug_translations;
        }
      }
      if (!categorySlugs && typeof p.category === 'string') {
          const catByName = categories.find(c => c.name_translations['fi'] === p.category || c.name_translations['en'] === p.category);
          if (catByName) {
             categorySlugs = catByName.slug_translations;
          }
      }
      return { ...p, category_slugs: categorySlugs };
  });

  const products = finalProducts;

  return (
    <div className="mx-auto w-full max-w-[84rem] px-4 py-8 md:px-8">
      <div className="mb-8 flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-[#1f1b16]">{filterTitle}</h1>
        <CategoryPills categories={categories} activeFilter={activeFilter} locale={locale} />
      </div>

      {products.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[#dccfbd] bg-[#fffaf2]">
          <p className="text-lg text-[#6a5c4b]">
            {locale === 'fi' ? 'Ei tuotteita löytynyt.' : 'No products found.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
