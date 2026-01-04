import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProductBySlug } from "@/lib/products";
import { fetchCategories } from "@/lib/settings";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductDescription } from "@/components/product/ProductDescription";
import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import { siteConfig } from "@/lib/siteConfig";

interface ProductPageProps {
  params: Promise<{
    category: string;
    slug: string;
    locale: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { category, slug, locale } = await params;
  const product = await getProductBySlug(locale, category, slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const title = `${product.name} | ${siteConfig.name}`;
  const description = typeof product.description === 'string' 
    ? product.description.slice(0, 160) 
    : (product.description?.[locale] || product.description?.['fi'] || "").slice(0, 160);
  
  const images = product.files?.[0] 
    ? [`http://185.96.163.183:8000/api/v1/storage/${product.files[0].namespace}/${product.files[0].entity_id}/${product.files[0].filename}`]
    : [];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { category, slug, locale } = await params;
  const product = await getProductBySlug(locale, category, slug);
  const dict = await getDictionary(locale as Locale);

  if (!product) {
    notFound();
  }

  // Resolve category name
  let categoryName = category;
  const categoryId = product.category_id || product.category;
  if (categoryId) {
    try {
      const categories = await fetchCategories();
      const cat = categories.find(c => c.id === categoryId);
      if (cat) {
        categoryName = cat.name_translations[locale] || cat.name_translations['fi'] || cat.name_translations['en'];
      }
    } catch (e) {
      console.error("Failed to resolve category name", e);
    }
  }

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.files?.map(f => `http://185.96.163.183:8000/api/v1/storage/${f.namespace}/${f.entity_id}/${f.filename}`),
    description: typeof product.description === 'string' ? product.description : (product.description?.[locale] || ""),
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand || "Ehankki"
    },
    offers: {
      "@type": "Offer",
      url: `${siteConfig.url}/${locale}/products/${category}/${slug}`,
      priceCurrency: "EUR",
      price: product.sale_price || product.regular_price,
      availability: product.status === "sold" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      itemCondition: product.condition_type === "new" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition"
    }
  };

  return (
    <div className="bg-[#f2ecdf]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          {/* Image Gallery */}
          <ProductGallery files={product.files || []} productName={product.name} />

          {/* Product Info */}
          <ProductInfo 
            product={product} 
            locale={locale} 
            dict={dict} 
            categoryName={categoryName}
          />
        </div>

        {/* Product Description & Details */}
        <ProductDescription product={product} locale={locale} dict={dict} />
      </div>
    </div>
  );
}
