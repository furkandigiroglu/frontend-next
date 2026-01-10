import type { ReactNode } from "react";
import { NavigationBar } from "@/components/navigation/NavigationBar";
import { Footer } from "@/components/navigation/Footer";
import { siteConfig } from "@/lib/siteConfig";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { WhatsAppFloat } from "@/components/shared/WhatsAppFloat";

export default async function SiteLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params as { locale: Locale };
  const dictionary = await getDictionary(locale);
  const phoneHref = siteConfig.phone.replace(/\s+/g, "");

  return (
    <div className="relative min-h-screen">
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
        <Footer locale={locale} />
      </div>
    </div>
  );
}
