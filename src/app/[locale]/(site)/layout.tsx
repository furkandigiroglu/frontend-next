import type { ReactNode } from "react";
import { NavigationBar } from "@/components/navigation/NavigationBar";
import { siteConfig } from "@/lib/siteConfig";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { WhatsAppFloat } from "@/components/shared/WhatsAppFloat";

export default async function SiteLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const phoneHref = siteConfig.phone.replace(/\s+/g, "");

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,_rgba(197,138,72,0.18),_transparent_45%),_radial-gradient(circle_at_80%_0,_rgba(58,90,64,0.2),_transparent_40%)]" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <NavigationBar
          locale={locale}
          content={dictionary.navigation}
          contactEmail={siteConfig.contactEmail}
          phone={siteConfig.phone}
        />
        <div className="flex-1">{children}</div>
        <WhatsAppFloat />
        <footer className="mt-12 border-t border-white/30 bg-[#1f1b16] px-6 py-10 text-sm text-white md:px-10">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-semibold">{siteConfig.name}</p>
              <p className="text-white/70">{siteConfig.description}</p>
            </div>
            <div className="flex flex-col gap-1 text-white/80">
              <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
              <a href={`tel:${phoneHref}`}>{siteConfig.phone}</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
