import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

const importantLinks = [
  { name: "Etusivu", link: "/" },
  { name: "Meistä", link: "/about" }, // Assuming /about or /meista
  { name: "Lahjoita ja Myy", link: "/sell-donate" }, // Updated text slightly
  { name: "Tuotteet", link: "/products" },
  { name: "Ostoehdot", link: "/terms" },
  { name: "Palvelut", link: "/blog" },
];

const infos = [
  {
    icon: Phone,
    description: "041 312 4969",
    href: "tel:0413124969",
  },
  {
    icon: Mail,
    description: siteConfig.contactEmail, // info
    href: `mailto:${siteConfig.contactEmail}`,
  },
  {
    icon: MapPin,
    description: "Niittyläntie 3, 00620 Helsinki",
    href: "https://www.google.com/maps/place/Niittyläntie+3,+00620+Helsinki",
  },
];

type FooterProps = {
  locale?: string;
};

export function Footer({ locale = 'fi' }: FooterProps) {
  const withLocale = (path: string) => `/${locale}${path}`;

  const importantLinks = [
    { name: "Etusivu", link: withLocale("/") },
    { name: "Meistä", link: withLocale("/about") },
    { name: "Lahjoita ja Myy", link: withLocale("/sell-donate") },
    { name: "Tuotteet", link: withLocale("/products") },
    { name: "Ostoehdot", link: withLocale("/terms") },
    { name: "Palvelut", link: withLocale("/services") },
  ];

  return (
    <footer className="mt-auto border-t border-white/10 bg-[#1f1b16] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-10 px-6 py-12 md:flex-row md:items-start md:px-10">
        
        {/* LOGO & COMPANY */}
        <div className="flex w-full flex-col items-center md:w-1/3 md:items-start">
          <div className="flex items-center gap-5">
            <div className="relative h-32 w-32 overflow-hidden rounded-full bg-white/5 p-2">
               <Image 
                src="/logo_5.png" 
                alt="Ehankki Logo" 
                width={128} 
                height={128}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-wide">EHANKKI</span>
              <span className="text-base text-white/60">Luotettava ja Kestävä</span>
            </div>
          </div>
        </div>

        {/* LINKS (Middle) */}
        <div className="flex w-full flex-col items-center md:w-1/3">
            {/* Opening Hours - Mobile Only */}
            <div className="mb-8 flex flex-col items-center gap-1 text-center md:hidden">
              <h3 className="text-lg font-semibold text-amber-500">Aukioloajat</h3>
              <p className="text-white/80">ma - la : 11:00 - 18:00</p>
              <p className="text-white/80">su : 12:00 - 17:00</p>
            </div>

            {/* Links List */}
            <div className="flex flex-row flex-wrap justify-center gap-x-6 gap-y-3 text-center">
              {importantLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.link} 
                  className="text-white/80 transition-colors hover:text-amber-500 hover:underline"
                >
                  {link.name}
                </Link>
              ))}
            </div>
        </div>

        {/* CONTACT INFO (Right) */}
        <div className="flex w-full flex-col items-center gap-4 md:w-1/3 md:items-end md:text-right">
          {infos.map((info, index) => (
            <a
              key={index}
              href={info.href}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3 transition-colors hover:text-amber-500"
            >
              <span className="text-sm sm:text-base">{info.description}</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-amber-500 transition-colors group-hover:bg-amber-500 group-hover:text-white">
                <info.icon size={20} />
              </div>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
