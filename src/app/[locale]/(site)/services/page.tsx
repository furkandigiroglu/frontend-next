import { washingServicesFi, washingServicesEn } from "@/lib/services-content";
import { blogPosts } from "@/lib/blog-content";
import { Locale } from "@/i18n/config";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Palvelut - Ehankki",
  description: "Pesupalvelut ja huonekalujen puhdistus - Ehankki",
};

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const services = locale === "fi" ? washingServicesFi : washingServicesEn;
  const blogs = locale === "fi" ? blogPosts.fi : blogPosts.en;
  
  const title = locale === "fi" ? "Pesupalvelut" : "Cleaning Services";
  const subtitle = locale === "fi" 
    ? "Ammattitaitoinen huonekalujen pesu ja puhdistus paikan päällä."
    : "Professional furniture cleaning and washing on location.";
  
  const blogTitle = locale === "fi" ? "Hyödyllistä tietoa" : "Useful Information";
  const blogSubtitle = locale === "fi" 
    ? "Lue vinkkejämme huonekalujen hoidosta ja kestävästä kehityksestä."
    : "Read our tips on furniture care and sustainability.";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="relative mb-16 overflow-hidden rounded-[3rem] bg-[#1f1b16] px-6 py-16 text-center shadow-2xl sm:px-12 md:py-24">
         {/* Background Decoration */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-full opacity-20">
            <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-amber-600 blur-[100px]" />
            <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-amber-800 blur-[100px]" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
            <Sparkles className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {title}
          </h1>
          <p className="max-w-2xl text-lg text-white/70">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="mb-24 grid gap-8 md:grid-cols-2 lg:gap-12">
        {services.map((category, idx) => (
          <div 
            key={idx}
            className="group relative overflow-hidden rounded-3xl border border-[#e1d5c5] bg-[#fffdf7] p-8 shadow-[0_10px_30px_rgba(32,23,7,0.04)] transition-all hover:border-[#dccfbd] hover:shadow-[0_20px_40px_rgba(32,23,7,0.08)]"
          >
             <div className="mb-6 border-b border-[#eadfcd] pb-4">
                <h3 className="text-2xl font-bold text-[#1f1b16]">{category.title}</h3>
             </div>
             <table className="w-full text-left text-sm sm:text-base">
                <tbody className="divide-y divide-[#eadfcd]/50">
                  {category.items.map((item, i) => (
                    <tr key={i} className="group/row transition-colors hover:bg-[#1f1b16]/[0.02]">
                      <td className="py-3 pr-4 font-medium text-[#4a3d31]">{item.service}</td>
                      <td className="whitespace-nowrap py-3 text-right font-bold text-[#1f1b16]">{item.price}</td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        ))}
      </div>

      {/* Blog Section */}
      <div className="mb-24">
         <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[#1f1b16] sm:text-4xl">{blogTitle}</h2>
            <p className="text-lg text-[#4a3d31]">{blogSubtitle}</p>
         </div>
         
         <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((post, idx) => (
              <Link 
                key={idx} 
                href={`/${locale}/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl"
              >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-200">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="mb-3 text-xl font-bold text-[#1f1b16] group-hover:text-amber-700">
                      {post.title}
                    </h3>
                    <p className="mb-4 line-clamp-3 flex-1 text-sm text-[#4a3d31]">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto flex items-center font-medium text-amber-700">
                       {locale === 'fi' ? 'Lue lisää' : 'Read more'} 
                       <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
              </Link>
            ))}
         </div>
      </div>

       {/* Contact CTA */}
       <div className="mt-16 rounded-3xl bg-[#f5ecdf] p-8 text-center md:p-12">
        <h3 className="mb-4 text-2xl font-semibold text-[#1f1b16]">
          {locale === 'fi' ? 'Varaa pesu tai kysy lisää!' : 'Book a cleaning or ask more!'}
        </h3>
        <p className="mb-8 text-[#4a3d31]">
          {locale === 'fi' 
            ? 'Ota yhteyttä asiakaspalveluumme puhelimitse tai sähköpostilla.' 
            : 'Contact our customer service via phone or email.'}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a 
            href="tel:0413124969"
            className="inline-flex items-center rounded-full bg-[#1f1b16] px-6 py-3 font-semibold text-white transition hover:bg-[#3b3126]"
          >
            041 312 4969
          </a>
          <a 
            href="mailto:info@ehankki.fi"
            className="inline-flex items-center rounded-full border border-[#1f1b16] px-6 py-3 font-semibold text-[#1f1b16] transition hover:bg-[#1f1b16] hover:text-white"
          >
            info@ehankki.fi
          </a>
        </div>
      </div>
    </div>
  );
}
