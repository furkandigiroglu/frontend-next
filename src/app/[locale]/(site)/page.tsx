import { notFound } from "next/navigation";
import { FeatureGrid } from "@/components/sections/FeatureGrid";
import { Hero } from "@/components/sections/Hero";
import { ProductRail } from "@/components/sections/ProductRail";
import { ShowcaseGrid } from "@/components/sections/ShowcaseGrid";
import { Testimonials } from "@/components/sections/Testimonials";
import { siteConfig } from "@/lib/siteConfig";
import { fetchHomeProducts } from "@/lib/products";
import { fetchReviews } from "@/lib/reviews";
import { getDictionary } from "@/i18n/getDictionary";
import { locales, type Locale } from "@/i18n/config";

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale)) {
    notFound();
  }
  const dictionary = await getDictionary(locale);
  const products = await fetchHomeProducts();
  const reviews = await fetchReviews();
  
  const {
    hero,
    heroPanels,
    featureStrip,
    featuresIntro,
    features,
    productSections,
    showcaseIntro,
    showcaseCollections,
    testimonials,
  } = dictionary.home;

  const createHref = (path: string) => {
    if (!path) return "#";
    return path.startsWith("/") ? `/${locale}${path}` : path;
  };

  return (
    <main className="px-6 py-12 md:px-10 md:py-16">
      <div className="mx-auto flex w-full max-w-[84rem] flex-col gap-16">
        <Hero
          content={hero}
          panels={heroPanels}
          features={featureStrip}
          contactEmail={siteConfig.contactEmail}
          phone={siteConfig.phone}
          createHref={createHref}
        />

        {productSections.map((section) => {
          const bucketKey = section.key as keyof typeof products;
          const items = products[bucketKey] ?? [];
          if (!items.length) return null;

          return (
            <ProductRail
              key={section.key}
              title={section.title}
              description={section.description}
              ctaLabel={section.ctaLabel}
              href={section.href}
              products={items}
              createHref={createHref}
              locale={locale}
            />
          );
        })}

        <Testimonials items={reviews} />
      </div>
    </main>
  );
}
