import { termsFi, termsEn } from "@/lib/terms-content";
import { Locale } from "@/i18n/config";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ostoehdot - Ehankki",
  description: "Ehankki Kaluste – Ostoehdot ja toimitus",
};

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const content = locale === "fi" ? termsFi : termsEn;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-[#1f1b16] sm:text-5xl mb-4">
          {content.title}
        </h1>
        <div className="h-1 w-24 bg-[#eadfcd] mx-auto rounded-full" />
      </div>

      {/* Content Sections */}
      <div className="space-y-12">
        {content.sections.map((section, index) => (
          <section 
            key={index} 
            className="rounded-[32px] border border-[#e1d5c5] bg-[#fffdf7] p-8 shadow-[0_10px_30px_rgba(32,23,7,0.05)] transition-all hover:border-[#dccfbd] hover:shadow-[0_15px_35px_rgba(32,23,7,0.08)]"
          >
            <h2 className="text-2xl font-semibold text-[#1f1b16] mb-6 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1f1b16] text-sm text-white font-bold">
                {index + 1}
              </span>
              {section.title}
            </h2>
            <div className="prose prose-stone max-w-none text-[#4a3d31]">
              {section.content.map((paragraph, pIndex) => (
                <p key={pIndex} className="mb-4 leading-relaxed last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
