"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { NavigationContent } from "@/types/navigation";
import type { Locale } from "@/i18n/config";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { LogOut } from "lucide-react";

type NavigationBarProps = {
  locale: Locale;
  content: NavigationContent;
  contactEmail: string;
  phone: string;
};

type LegacyMenuItem = {
  label: string;
  href: string;
  filterKey?: string;
  submenu?: Array<{ label: string; href: string; filterKey?: string }>;
};

const IconButton = ({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#d9cbb7] text-[#1f1b16] transition hover:bg-[#f3e7d6]"
  >
    {children}
  </button>
);

const Badge = ({ count }: { count: number }) => (
  <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#d32f2f] px-1 text-[0.65rem] font-semibold text-white">
    {count}
  </span>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
    <path d="M12 20s-6.5-4.35-8.5-8.5A4.5 4.5 0 0 1 8 5c1.6 0 3 .9 4 2.2C13 5.9 14.4 5 16 5a4.5 4.5 0 0 1 4.5 6.5C18.5 15.65 12 20 12 20Z" />
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
    <path d="M4 5h2l1.5 10h11L20 7H7" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="10" cy="19" r="1.2" />
    <circle cx="17" cy="19" r="1.2" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
    <circle cx="12" cy="8" r="3" />
    <path d="M5 19c1.5-3 4-4 7-4s5.5 1 7 4" strokeLinecap="round" />
  </svg>
);

const MenuIcon = ({ open }: { open: boolean }) => (
  <div className="flex flex-col gap-1.5">
    <span className={`h-0.5 w-6 bg-current transition ${open ? "translate-y-2 rotate-45" : ""}`} />
    <span className={`h-0.5 w-6 bg-current transition ${open ? "opacity-0" : ""}`} />
    <span className={`h-0.5 w-6 bg-current transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
  </div>
);

export function NavigationBar({ locale, content, contactEmail, phone }: NavigationBarProps) {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSubmenus, setMobileSubmenus] = useState<Record<string, boolean>>({});
  const [favoriteCount, setFavoriteCount] = useState(0);

  const withLocale = (href: string) => (href.startsWith("/") ? `/${locale}${href}` : href);

  const localeStrings = useMemo(() => (locale === "fi"
    ? {
        address: "Niittyläntie 3, 00620 Helsinki",
        hours: "Avoinna ma-la 11:00-18:00 · su 12:00-17:00",
        support: "Asiakastuki",
        home: "Etusivu",
        sofas: "Sohvat",
        beds: "Sängyt",
        rugs: "Matot",
        newFurniture: "Uudet Huonekalut",
        others: "Muut",
        services: "Palvelut",
        favorites: "Suosikit",
        cart: "Ostoskori",
        account: "Tili",
        menu: "Valikko",
      }
    : {
        address: "Niittyläntie 3, 00620 Helsinki",
        hours: "Open Mon-Sat 11:00-18:00 · Sun 12:00-17:00",
        support: "Support",
        home: "Home",
        sofas: "Sofas",
        beds: "Beds",
        rugs: "Rugs",
        newFurniture: "New Furniture",
        others: "Others",
        services: "Services",
        favorites: "Favorites",
        cart: "Cart",
        account: "Account",
        menu: "Menu",
      }), [locale]);

  const menuItems: LegacyMenuItem[] = useMemo(() => {
    const sofaOptions = [
      { label: locale === "fi" ? "Kulmasohvat" : "Corner sofas", filterKey: "Kulmasohvat" },
      { label: locale === "fi" ? "Vuodesohvat" : "Sofa beds", filterKey: "Vuodesohvat" },
      { label: locale === "fi" ? "Divaanisohvat" : "Chaise sofas", filterKey: "Divaanisohvat" },
      { label: locale === "fi" ? "2-3 istuttavat" : "2-3 seaters", filterKey: "2-3 istuttavat sohvat" },
      { label: locale === "fi" ? "Nojatuolit" : "Armchairs", filterKey: "Nojatuoli" },
      { label: locale === "fi" ? "Kaikki Sohvat" : "All sofas", filterKey: "Kaikki Sohvat" },
    ];

    const basePath = "/products";

    const withFilter = (filterKey?: string) =>
      filterKey ? `${basePath}?filter=${encodeURIComponent(filterKey)}` : basePath;

    return [
      { label: localeStrings.home, href: "/" },
      {
        label: localeStrings.sofas,
        href: withFilter("Sohvat"),
        filterKey: "Sohvat",
        submenu: sofaOptions.map((option) => ({
          label: option.label,
          href: withFilter(option.filterKey),
          filterKey: option.filterKey,
        })),
      },
      { label: localeStrings.beds, href: withFilter("Sängyt"), filterKey: "Sängyt" },
      { label: localeStrings.rugs, href: withFilter("Matot"), filterKey: "Matot" },
      { label: localeStrings.newFurniture, href: withFilter("Uudet Huonekalut"), filterKey: "Uudet Huonekalut" },
      { label: localeStrings.others, href: withFilter("Muut"), filterKey: "Muut" },
      { label: localeStrings.services, href: "/blogi" },
    ];
  }, [locale, localeStrings]);

  useEffect(() => {
    const syncCounts = () => {
      if (typeof window === "undefined") {
        return;
      }
      // Cart count is now handled by useCart hook

      const favRaw = window.localStorage.getItem("fav");
      if (favRaw) {
        try {
          const parsed = JSON.parse(favRaw);
          if (Array.isArray(parsed)) {
            setFavoriteCount(parsed.length);
          } else if (typeof parsed === "object") {
            setFavoriteCount(Object.keys(parsed).length);
          } else {
            setFavoriteCount(String(favRaw).split(",").filter(Boolean).length);
          }
        } catch {
          setFavoriteCount(String(favRaw).split(",").filter(Boolean).length);
        }
      } else {
        setFavoriteCount(0);
      }
    };

    syncCounts();
    window.addEventListener("storage", syncCounts);
    return () => window.removeEventListener("storage", syncCounts);
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.removeProperty("overflow");
      return undefined;
    }
    document.body.style.setProperty("overflow", "hidden");
    return () => document.body.style.removeProperty("overflow");
  }, [mobileOpen]);

  const handleNavigate = (href: string, filterKey?: string) => {
    if (typeof window !== "undefined" && filterKey) {
      window.localStorage.setItem("filter", filterKey);
    }
    setActiveMenu(null);
    setMobileOpen(false);
    router.push(withLocale(href));
  };

  const toggleSubmenu = (label: string) => {
    setMobileSubmenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const sanitizedPhone = phone.replace(/[\s()-]/g, "");

  return (
    <header className="w-full bg-white">
      <div className="hidden border-b border-[#eadfcd] bg-[#fffaf2] md:block">
        <div className="mx-auto w-full max-w-[84rem] px-4 py-2 md:px-8">
          <div className="flex items-center justify-between text-xs text-[#4a3d31]">
            <span>{localeStrings.address}</span>
            <span>{localeStrings.hours}</span>
            <a href={`tel:${sanitizedPhone}`} className="font-semibold text-[#1f1b16]">
              {phone}
            </a>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-50 border-b border-[#eadfcd] bg-white/95 backdrop-blur">
        <div className="mx-auto w-full max-w-[84rem] px-4 py-3 md:px-8">
          <div className="flex items-center justify-between rounded-[28px] border border-[#dccfbd] bg-[#fffdf7] px-4 py-3 shadow-[0_10px_30px_rgba(32,23,7,0.08)]">
            <div className="flex flex-1 items-center gap-3">
              <button
                type="button"
                onClick={() => handleNavigate("/")}
                className="flex items-center gap-3"
              >
                <Image src="/logo_5.png" alt="Ehankki logo" width={52} height={52} className="rounded-full border border-[#eadfcd] bg-white p-1" />
                <div className="text-left">
                  <span className="text-lg font-semibold text-[#1f1b16]">Ehankki</span>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#6a5c4b]">{content.brandTagline}</p>
                </div>
              </button>
              <nav className="hidden gap-4 lg:flex">
                {menuItems.map((item) => (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => item.submenu && setActiveMenu(item.label)}
                    onMouseLeave={() => setActiveMenu((prev) => (prev === item.label ? null : prev))}
                  >
                    <button
                      type="button"
                      className="rounded-full px-3 py-1.5 text-sm font-medium text-[#3b3126] transition hover:bg-[#f2e4ce]"
                      onClick={() => (item.submenu ? setActiveMenu(item.label === activeMenu ? null : item.label) : handleNavigate(item.href, item.filterKey))}
                    >
                      {item.label}
                    </button>
                    {item.submenu && activeMenu === item.label && (
                      <div className="absolute left-0 top-full z-20 mt-3 w-64 rounded-2xl border border-[#eadfcd] bg-white p-4 shadow-[0_20px_50px_rgba(24,20,12,0.15)]">
                        <div className="flex flex-col gap-2">
                          {item.submenu.map((sub) => (
                            <button
                              type="button"
                              key={sub.label}
                              className="rounded-xl px-3 py-2 text-left text-sm text-[#4a3d31] transition hover:bg-[#fff7ec]"
                              onClick={() => handleNavigate(sub.href, sub.filterKey)}
                            >
                              {sub.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <LanguageSwitcher currentLocale={locale} />
              <IconButton label={localeStrings.favorites} onClick={() => handleNavigate("/fav") }>
                <HeartIcon />
                {favoriteCount > 0 && <Badge count={favoriteCount} />}
              </IconButton>
              <IconButton label={localeStrings.cart} onClick={() => handleNavigate("/cart") }>
                <CartIcon />
                {cartCount > 0 && <Badge count={cartCount} />}
              </IconButton>
              {isAuthenticated ? (
                <IconButton label="Kirjaudu ulos" onClick={logout}>
                  <LogOut className="h-5 w-5" />
                </IconButton>
              ) : (
                <IconButton label={localeStrings.account} onClick={() => handleNavigate("/login") }>
                  <UserIcon />
                </IconButton>
              )}
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <LanguageSwitcher currentLocale={locale} />
              <IconButton label={localeStrings.cart} onClick={() => handleNavigate("/cart") }>
                <CartIcon />
                {cartCount > 0 && <Badge count={cartCount} />}
              </IconButton>
              <button
                type="button"
                aria-label={localeStrings.menu}
                onClick={() => setMobileOpen((prev) => !prev)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d7c3ab] text-[#1f1b16]"
              >
                <MenuIcon open={mobileOpen} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative ml-auto flex h-full w-80 flex-col bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#1f1b16]">{localeStrings.menu}</p>
                <p className="text-xs text-[#6a5c4b]">{localeStrings.support}</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-semibold text-[#3b3126]"
              >
                ×
              </button>
            </div>
            <div className="mt-6 flex-1 space-y-3 overflow-y-auto">
              {menuItems.map((item) => (
                <div key={item.label} className="rounded-2xl border border-[#f0e4d4]">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-[#3b3126]"
                    onClick={() =>
                      item.submenu
                        ? toggleSubmenu(item.label)
                        : handleNavigate(item.href, item.filterKey)
                    }
                  >
                    {item.label}
                    {item.submenu && (
                      <span className={`text-lg transition ${mobileSubmenus[item.label] ? "rotate-45" : ""}`}>
                        +
                      </span>
                    )}
                  </button>
                  {item.submenu && mobileSubmenus[item.label] && (
                    <div className="border-t border-[#f0e4d4] bg-[#fff9f1]">
                      {item.submenu.map((sub) => (
                        <button
                          key={sub.label}
                          type="button"
                          className="block w-full px-4 py-2 text-left text-sm text-[#4a3d31]"
                          onClick={() => handleNavigate(sub.href, sub.filterKey)}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm text-[#4a3d31]">
              <p className="font-semibold text-[#1f1b16]">{localeStrings.support}</p>
              <a href={`mailto:${contactEmail}`} className="block break-all">
                {contactEmail}
              </a>
              <a href={`tel:${sanitizedPhone}`} className="block font-semibold text-[#1f1b16]">
                {phone}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
