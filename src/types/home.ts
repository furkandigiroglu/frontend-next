export type HeroStat = {
  value: string;
  label: string;
};

export type HeroCTA = {
  label: string;
  href: string;
};

export type HeroContent = {
  eyebrow: string;
  title: string;
  description: string;
  stats: HeroStat[];
  ctas: HeroCTA[];
};

export type HeroPanel = {
  tag: string;
  title: string;
  description?: string;
  image: string;
  href: string;
  ctaLabel: string;
  accent?: string;
};

export type HeroPanels = {
  primary: HeroPanel & { spotlight?: string };
  secondary: HeroPanel[];
};

export type FeatureCard = {
  title: string;
  description: string;
  highlight: string;
};

export type FeatureStripItem = {
  icon: "delivery" | "payment" | "quality" | "support";
  title: string;
  description: string;
};

export type CategoryCard = {
  title: string;
  description: string;
  tag: string;
  href: string;
  image: string;
};

export type ProductSectionContent = {
  key: "latest" | "favorites" | "discounted" | (string & {});
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  fallbackTag?: string;
};

export type ShowcaseCard = {
  title: string;
  description: string;
  metric: string;
};

export type Testimonial = {
  quote: string;
  author: string;
  role: string;
};

export type CTAContent = {
  label: string;
  title: string;
  description: string;
  primary: HeroCTA;
  secondary: HeroCTA;
};

export type SectionIntro = {
  eyebrow: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  cardLabel?: string;
};

export type HomeContent = {
  hero: HeroContent;
  heroPanels: HeroPanels;
  featureStrip: FeatureStripItem[];
  featuresIntro: SectionIntro;
  features: FeatureCard[];
  categoryShowcase: CategoryCard[];
  productSections: ProductSectionContent[];
  showcaseIntro: SectionIntro;
  showcaseCollections: ShowcaseCard[];
  reviewsIntro: SectionIntro;
  testimonials: Testimonial[];
  cta: CTAContent;
};
