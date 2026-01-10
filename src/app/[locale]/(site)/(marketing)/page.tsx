import { notFound } from "next/navigation";
import { CTASection } from "@/components/sections/CTASection";
import { CategoryGrid } from "@/components/sections/CategoryGrid";
import { FeatureGrid } from "@/components/sections/FeatureGrid";
import { FeatureStrip } from "@/components/sections/FeatureStrip";
import { Hero } from "@/components/sections/Hero";
import { ProductRail } from "@/components/sections/ProductRail";
import { ShowcaseGrid } from "@/components/sections/ShowcaseGrid";
import { Testimonials } from "@/components/sections/Testimonials";
import { VisitTracker } from "@/components/analytics/VisitTracker";
import { siteConfig } from "@/lib/siteConfig";
import { getDictionary } from "@/i18n/getDictionary";
import { locales, type Locale } from "@/i18n/config";
import { fetchHomeProducts } from "@/lib/products";

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
  const {
    hero,
    heroPanels,
    featureStrip,
    featuresIntro,
    features,
    categoryShowcase,
    productSections,
    showcaseIntro,
    showcaseCollections,
    reviewsIntro,
    testimonials,
    cta,
  } = dictionary.home;
  const products = await fetchHomeProducts();
  const productLookup: Record<string, typeof products.latest> = {
    latest: products.latest,
    favorites: products.favorites,
    discounted: products.discounted,
  };

  const createHref = (path: string) => (path.startsWith("/") ? `/${locale}${path}` : path);

  return (
    <main className="px-6 py-12 md:px-10 md:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16">
        <VisitTracker pageId={`${locale}-home`} />
        <Hero
          content={hero}
          panels={heroPanels}
          contactEmail={siteConfig.contactEmail}
          phone={siteConfig.phone}
          createHref={createHref}
        />

        <FeatureStrip items={featureStrip} />

        <CategoryGrid categories={categoryShowcase} createHref={createHref} />

        <div className="space-y-6">
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{featuresIntro.eyebrow}</p>
            <h2 className="text-3xl font-semibold text-slate-900">{featuresIntro.title}</h2>
            {featuresIntro.description && (
              <p className="max-w-2xl text-base text-slate-600">{featuresIntro.description}</p>
            )}
            {featuresIntro.ctaLabel && (
              <span className="text-xs uppercase tracking-[0.4em] text-slate-400">{featuresIntro.ctaLabel}</span>
            )}
          </div>
          <FeatureGrid features={features} linkLabel={featuresIntro.ctaLabel} />
        </div>

        {productSections.map((section) => {
          const items = (productLookup[section.key] ?? []).map((product) => ({
            ...product,
            badge: product.badge ?? section.fallbackTag,
          }));
          if (!items.length) {
            return null;
          }
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

        <div className="space-y-6">
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{showcaseIntro.eyebrow}</p>
            <h2 className="text-3xl font-semibold text-slate-900">{showcaseIntro.title}</h2>
            {showcaseIntro.description && (
              <p className="max-w-2xl text-base text-slate-600">{showcaseIntro.description}</p>
            )}
          </div>
          <ShowcaseGrid collections={showcaseCollections} label={showcaseIntro.cardLabel} />
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{reviewsIntro.eyebrow}</p>
            <h2 className="text-3xl font-semibold text-slate-900">{reviewsIntro.title}</h2>
            {reviewsIntro.description && (
              <p className="max-w-2xl text-base text-slate-600">{reviewsIntro.description}</p>
            )}
          </div>
          <Testimonials items={testimonials.map((t, i) => ({
            id: `testimonial-${i}`,
            author_name: `${t.author} - ${t.role}`,
            review_text: t.quote,
            rating: 5,
            relative_time: "recently",
            source: "customer"
          }))} />
        </div>
        <CTASection content={cta} createHref={createHref} />
      </div>
    </main>
  );
}
