"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { locales, type Locale } from "@/i18n/config";

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLocale = (newLocale: Locale) => {
    // Pathname usually looks like /fi/some/path or /fi
    // We need to replace the first segment
    const segments = pathname.split("/");
    if (segments.length > 1) {
        segments[1] = newLocale;
    } else {
        // Should not happen in app directory with [locale] root, but fallback
        return router.push(`/${newLocale}`);
    }
    
    const newPath = segments.join("/");
    router.push(newPath);
    setIsOpen(false);
  };

  const labels: Record<Locale, string> = {
    fi: "Suomi",
    en: "English",
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#d9cbb7] text-[#1f1b16] transition hover:bg-[#f3e7d6]"
      >
        <Globe className="h-5 w-5" />
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1f1b16] text-[0.55rem] font-bold text-white">
            {currentLocale.toUpperCase()}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-32 overflow-hidden rounded-xl border border-[#eadfcd] bg-white shadow-lg z-50">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => switchLocale(locale)}
              className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-[#f3e7d6] ${
                currentLocale === locale ? "font-semibold text-[#1f1b16]" : "text-[#6a5c4b]"
              }`}
            >
              {labels[locale]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
