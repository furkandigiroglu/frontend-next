import Link from "next/link";
import { Truck, CreditCard, ShieldCheck, Headset } from "lucide-react";
import type { HeroContent, HeroPanels, FeatureStripItem } from "@/types/home";

type HeroProps = {
  content: HeroContent;
  panels?: HeroPanels;
  features?: FeatureStripItem[];
  contactEmail: string;
  phone: string;
  createHref: (path: string) => string;
};

const apiBase =
  process.env.NEXT_PUBLIC_EHANKKI_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.EHANKKI_API_URL ??
  "";

const mediaBase = apiBase ? apiBase.replace(/\/+$/, "") : "";

const resolveMediaUrl = (value?: string) => {
  if (!value) {
    return undefined;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (!mediaBase) {
    return value.startsWith("/") ? value : `/${value}`;
  }

  const normalized = value.replace(/^\/+/, "");
  return `${mediaBase}/${normalized}`;
};

const getIcon = (icon: string) => {
  const props = { className: "h-6 w-6" };
  switch (icon) {
    case "delivery":
      return <Truck {...props} />;
    case "payment":
      return <CreditCard {...props} />;
    case "quality":
      return <ShieldCheck {...props} />;
    case "support":
      return <Headset {...props} />;
    default:
      return null;
  }
};

const getFeatureStyles = (icon: string) => {
  switch (icon) {
    case "delivery":
      return {
        container: "bg-gradient-to-br from-[#f1f5ec] via-[#dfe9d8] to-white border-white/60",
        icon: "text-[#5c7a5c]",
      };
    case "payment":
      return {
        container: "bg-gradient-to-br from-[#f6efe3] via-[#eddcc2] to-white border-white/60",
        icon: "text-[#8c7355]",
      };
    case "quality":
      return {
        container: "bg-gradient-to-br from-[#f7e8da] via-[#f2d4bf] to-white border-white/60",
        icon: "text-[#a66e4e]",
      };
    case "support":
      return {
        container: "bg-gradient-to-br from-[#eef2ff] via-[#e0e7ff] to-white border-white/60",
        icon: "text-[#6366f1]",
      };
    default:
      return {
        container: "bg-[#fffaf2] border-[#eadfcd]",
        icon: "text-[#6a5c4b]",
      };
  }
};

export function Hero({ content, panels, features, contactEmail, phone, createHref }: HeroProps) {
  const defaultCTA = content.ctas[0] ?? { label: "Explore", href: "/" };
  const primaryPanel = panels?.primary ?? {
    tag: content.eyebrow,
    title: content.title,
    description: content.description,
    image: "/window.svg",
    href: defaultCTA.href,
    ctaLabel: defaultCTA.label,
  };
  const secondaryPanels = panels?.secondary?.length
    ? panels.secondary
    : [
        {
          tag: content.eyebrow,
          title: content.title,
          description: content.description,
          image: "/window.svg",
          href: defaultCTA.href,
          ctaLabel: defaultCTA.label,
        },
      ];
  const sanitizedPhone = phone.replace(/[\s()-]/g, "");
  const showHeroIntro = Boolean(content.eyebrow || content.title || content.description);
  const primaryImage = resolveMediaUrl(primaryPanel.image) ?? "/window.svg";

  return (
    <section className="w-full">
      <div className="mx-auto flex w-full max-w-[84rem] flex-col gap-10">
        {showHeroIntro && (
          <div className="flex flex-col gap-3 text-center lg:text-left">
            {content.eyebrow && (
              <span className="text-xs uppercase tracking-[0.4em] text-[#6a5c4b]">{content.eyebrow}</span>
            )}
            {content.title && (
              <h1 className="text-4xl font-semibold leading-tight text-[#1f1b16] md:text-5xl">
                {content.title}
              </h1>
            )}
            {content.description && (
              <p className="text-base text-[#4a3d31] md:text-lg">{content.description}</p>
            )}
          </div>
        )}

        <div className="hidden lg:grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-4">
          <article className="group relative min-h-[480px] overflow-hidden rounded-[36px] border border-[#eadfcd] bg-[#120d07] shadow-[0_35px_80px_rgba(15,10,5,0.45)]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${primaryImage})`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/0 to-[#14100c]/30" />
            <div className="relative flex h-full flex-col justify-between p-10 text-white">
              <div className="space-y-4">
                <div className="inline-flex flex-wrap items-center gap-3 text-[0.65rem] uppercase tracking-[0.35em] text-white/70">
                  {primaryPanel.tag && (
                    <span className="inline-flex items-center rounded-full border border-white/30 px-4 py-1">
                      {primaryPanel.tag}
                    </span>
                  )}
                  {primaryPanel.spotlight && (
                    <span className="rounded-full border border-white/20 px-3 py-1 text-[0.55rem]">
                      {primaryPanel.spotlight}
                    </span>
                  )}
                </div>
                <h2 className="text-4xl font-semibold leading-tight">{primaryPanel.title}</h2>
                <p className="text-base text-white/80">
                  {primaryPanel.description ?? content.description}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {content.ctas.map((cta, index) => (
                  <Link
                    key={cta.label}
                    href={createHref(cta.href)}
                    className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5 ${
                      index === 0
                        ? "bg-white text-[#1f1b16]"
                        : "bg-black text-white border border-white/20"
                    }`}
                  >
                    {cta.label}
                    <span>{index === 0 ? "↗" : "→"}</span>
                  </Link>
                ))}
              </div>
            </div>
          </article>

          <div className="flex flex-col gap-4">
            {secondaryPanels.map((panel, index) => {
              const panelImage = resolveMediaUrl(panel.image) ?? primaryImage;
              return (
                <article
                  key={`${panel.title}-${index}`}
                  className="relative flex-1 min-h-[240px] overflow-hidden rounded-[28px] border border-[#eadfcd] bg-[#120d07] shadow-[0_20px_60px_rgba(15,10,5,0.35)]"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${panelImage})`,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/0 to-transparent" />
                  <div className="relative flex h-full flex-col justify-between p-6 text-white">
                    <div>
                      <div className="flex items-center justify-between text-[0.55rem] uppercase tracking-[0.35em] text-white/70">
                        {panel.tag && <span>{panel.tag}</span>}
                        {panel.accent && (
                          <span className="rounded-full border border-white/30 px-3 py-0.5 text-[0.55rem]">
                            {panel.accent}
                          </span>
                        )}
                      </div>
                      {panel.title && (
                        <h3 className="mt-3 text-2xl font-semibold leading-snug">{panel.title}</h3>
                      )}
                      {panel.description && (
                        <p className="mt-2 text-sm text-white/80">{panel.description}</p>
                      )}
                    </div>
                    <Link
                      href={createHref(panel.href)}
                      className="inline-flex w-fit items-center gap-2 rounded-full border border-white/40 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1f1b16]"
                    >
                      {panel.ctaLabel}
                      <span>→</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Mobile Layout - Wide Aspect Ratio Slider */}
        <div className="lg:hidden -mx-6 sm:mx-0">
          <div className="flex snap-x snap-mandatory gap-0 overflow-x-auto scrollbar-hide">
            {[primaryPanel, ...secondaryPanels].map((panel, index) => {
              const panelImage = resolveMediaUrl(panel.image) ?? primaryImage;
              return (
                <article
                  key={`mob-slide-${index}`}
                  className="relative h-[280px] w-full flex-none snap-center overflow-hidden"
                >
                  <img
                    src={panelImage}
                    alt={panel.title}
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                  {/* Subtle gradient at bottom for text visibility */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/90 via-white/50 to-transparent" />
                  
                  <div className="relative flex h-full flex-col justify-end p-6 text-[#1f1b16] text-center items-center">
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold leading-tight">
                        {panel.title}
                      </h2>
                      
                      {panel.description && (
                         <p className="text-sm text-[#4a3d31] line-clamp-2 font-medium">
                          {panel.description}
                        </p>
                      )}

                      <div className="flex flex-wrap justify-center gap-2 pt-1">
                        {index === 0 ? (
                          content.ctas.map((cta, idx) => (
                            <Link
                              key={cta.label}
                              href={createHref(cta.href)}
                              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[0.6rem] font-bold uppercase tracking-widest transition shadow-md ${
                                idx === 0
                                  ? "bg-[#1f1b16] text-white hover:bg-black"
                                  : "bg-white text-[#1f1b16] border border-[#1f1b16]/10 hover:bg-gray-50"
                              }`}
                            >
                              {cta.label}
                            </Link>
                          ))
                        ) : (
                          <Link
                            href={createHref(panel.href ?? "/")}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#1f1b16] px-5 py-1.5 text-[0.6rem] font-bold uppercase tracking-widest text-white transition hover:bg-black shadow-md"
                          >
                            {panel.ctaLabel ?? "Tutustu"}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          
           {/* Simple Paginator */}
           <div className="flex justify-center gap-1.5 -mt-4 relative z-10 pb-2">
             {[primaryPanel, ...secondaryPanels].map((_, idx) => (
                <div key={idx} className="h-1 w-1 rounded-full bg-[#1f1b16]/20" />
             ))}
           </div>
        </div>

        {/* Stats Section - Hidden on mobile for faster access to products */}
        <div className="hidden sm:grid gap-3 grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
          {content.stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[28px] border border-[#eadfcd] bg-white px-6 py-5 text-left shadow-[0_15px_40px_rgba(32,23,7,0.07)]"
            >
              <p className="text-3xl font-semibold text-[#1f1b16]">{stat.value}</p>
              <p className="text-sm text-[#6a5c4b]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Features Section - Horizontal Scroll on Mobile */}
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x [scrollbar-width:none] sm:grid sm:gap-6 sm:pb-0 sm:mx-0 sm:px-0 sm:grid-cols-2 lg:grid-cols-4">
          {features?.map((feature) => {
            const styles = getFeatureStyles(feature.icon);
            return (
              <div
                key={feature.title}
                className={`flex-none w-[280px] sm:w-auto snap-center flex flex-col gap-3 rounded-2xl border p-5 sm:p-6 ${styles.container}`}
              >
                <div className={styles.icon}>{getIcon(feature.icon)}</div>
                <div>
                  <h3 className="font-semibold text-[#1f1b16]">{feature.title}</h3>
                  <p className="mt-1 text-sm text-[#4a3d31]">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
