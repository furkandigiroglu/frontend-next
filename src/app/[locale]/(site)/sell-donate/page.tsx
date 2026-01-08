import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import { SellDonateForm } from "@/components/site/SellDonateForm";

export const metadata = {
  title: "Myy tai Lahjoita | e-Hankki",
  description: "Myy tai lahjoita käytetyt tavarasi helposti e-Hankin kautta.",
};

interface SellDonatePageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export default async function SellDonatePage({ params }: SellDonatePageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="mx-auto w-full max-w-[84rem] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-[#1f1b16] sm:text-4xl">
          {locale === "fi" ? "Myy tai Lahjoita" : "Sell or Donate"}
        </h1>
        <p className="mt-4 text-lg text-[#6a5c4b]">
          {locale === "fi" 
            ? "Onko sinulla tarpeettomia tavaroita? Tarjoa niitä meille myyntiin tai lahjoituksena." 
            : "Do you have unused items? Offer them to us for sale or as a donation."}
        </p>
      </div>

      <SellDonateForm locale={locale} dict={dict} />
    </div>
  );
}
