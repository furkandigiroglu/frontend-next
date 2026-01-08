export const siteConfig = {
  name: "Ehankki Mobilya Pazar Yeri",
  description:
    "Ehankki.fi, ikinci el ve sıfır seçkileri aynı vitrinde buluşturan, sürdürülebilir ev mobilyası deneyimi sunan Nordik pazar yeridir.",
  url: "https://ehankki.fi",
  keywords: [
    "ehankki",
    "ikinciel mobilya",
    "sifir mobilya",
    "finlandiya",
    "dairesel ekonomi",
    "ev dekorasyonu"
  ],
  ogImage: "https://ehankki.fi/og-furniture.jpg",
  contactEmail: "info@ehankki.fi",
  phone: "+358 41 312 4969",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://185.96.163.183:8000",
};

type SiteConfig = typeof siteConfig;

export type SiteConfigKeys = keyof SiteConfig;
