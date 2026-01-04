import type { Metadata } from "next";
import { Newsreader, Space_Grotesk } from "next/font/google";
import { siteConfig } from "@/lib/siteConfig";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-brand-sans",
});

const serif = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-brand-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    template: "%s | Ehankki",
    default: `${siteConfig.name} — Nordik e-ticaret stüdyosu`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [siteConfig.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${serif.variable} bg-[#f2ecdf] text-[#1f1b16] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
