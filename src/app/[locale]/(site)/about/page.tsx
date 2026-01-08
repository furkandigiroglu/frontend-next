import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import { CheckCircle, Leaf, Truck, Users } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meistä - Ehankki",
  description: "Ehankki Kaluste – Kestävä ja Edullinen Huonekalukauppa",
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const { about } = dictionary;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-[#1f1b16] sm:text-5xl mb-4">
          {about.title}
        </h1>
        <h2 className="text-xl font-medium text-[#6a5c4b]">
          {about.subtitle}
        </h2>
      </div>

      {/* Main Description */}
      <div className="prose prose-lg prose-stone mx-auto text-center mb-12 text-[#4a3d31]">
        <p className="leading-relaxed text-lg">
          {about.description}
        </p>
      </div>

      <div className="w-full h-px bg-[#eadfcd] mb-12" />

      {/* Features Grid - Converted to Card Style matching FeatureGrid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quality */}
        <div className="group flex flex-col justify-between rounded-[32px] border border-[#e1d5c5] bg-gradient-to-br from-[#fffdf7] to-[#f5ecdf] p-8 shadow-[0_20px_45px_rgba(32,23,7,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#7c5a33]/40">
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-green-600 shadow-sm">
               <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-[#1f1b16]">{about.features.quality.title}</h3>
            <p className="text-[#6a5c4b] leading-relaxed">{about.features.quality.description}</p>
          </div>
        </div>

        {/* Ecological */}
        <div className="group flex flex-col justify-between rounded-[32px] border border-[#e1d5c5] bg-gradient-to-br from-[#fffdf7] to-[#f5ecdf] p-8 shadow-[0_20px_45px_rgba(32,23,7,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#7c5a33]/40">
           <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-green-600 shadow-sm">
              <Leaf className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-[#1f1b16]">{about.features.ecological.title}</h3>
            <p className="text-[#6a5c4b] leading-relaxed">{about.features.ecological.description}</p>
          </div>
        </div>

        {/* Delivery */}
        <div className="group flex flex-col justify-between rounded-[32px] border border-[#e1d5c5] bg-gradient-to-br from-[#fffdf7] to-[#f5ecdf] p-8 shadow-[0_20px_45px_rgba(32,23,7,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#7c5a33]/40">
           <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-green-600 shadow-sm">
              <Truck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-[#1f1b16]">{about.features.delivery.title}</h3>
            <p className="text-[#6a5c4b] leading-relaxed">{about.features.delivery.description}</p>
          </div>
        </div>

        {/* Customer Service */}
        <div className="group flex flex-col justify-between rounded-[32px] border border-[#e1d5c5] bg-gradient-to-br from-[#fffdf7] to-[#f5ecdf] p-8 shadow-[0_20px_45px_rgba(32,23,7,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#7c5a33]/40">
           <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-green-600 shadow-sm">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-[#1f1b16]">{about.features.customer.title}</h3>
            <p className="text-[#6a5c4b] leading-relaxed">{about.features.customer.description}</p>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-[#eadfcd] my-12" />

      {/* Footer Content */}
      <div className="space-y-6 text-center text-[#4a3d31]">
        <p className="text-lg leading-relaxed">
         {about.extra}
        </p>
        <p className="text-lg font-medium text-[#1f1b16]">
          {about.recycling}
        </p>
      </div>
    </div>
  );
}
