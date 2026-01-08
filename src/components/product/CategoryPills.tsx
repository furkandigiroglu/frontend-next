"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import type { Category } from "@/types/settings";
import { useMemo } from "react";

interface CategoryPillsProps {
  categories: Category[];
  activeFilter: string;
  locale: string;
}

export function CategoryPills({ categories, activeFilter, locale }: CategoryPillsProps) {
  const { pills, backLink } = useMemo(() => {
    // 1. Identify current active category from the list
    const flatCats: Category[] = [];
    const traverse = (cats: Category[]) => {
      cats.forEach(c => {
        flatCats.push(c);
        if (c.children) traverse(c.children);
      });
    };
    traverse(categories);

    const activeCat = flatCats.find(c => 
      c.name_translations?.[locale]?.toLowerCase() === activeFilter.toLowerCase() || 
      c.name_translations?.['en']?.toLowerCase() === activeFilter.toLowerCase()
    );

    let itemsToShow: Category[] = [];
    let back: { href: string; label: string } | null = null;
    
    // Root categories (parent_id is null)
    const rootCategories = categories.filter(c => !c.parent_id);

    if (!activeFilter || !activeCat) {
       // CASE: No filter (All Products) -> Show Root Categories
       itemsToShow = rootCategories;
    } else {
       // Find children dynamically from the full list (works for both nested and flat structures)
       const children = flatCats.filter(c => c.parent_id === activeCat.id);
       
       if (activeCat.parent_id) {
           // CASE: Child Category Active (e.g. Vuodesohva)
           // Show: Siblings (Children of Parent)
           const siblings = flatCats.filter(c => c.parent_id === activeCat.parent_id);
           
           if (siblings.length > 0) {
               itemsToShow = siblings;
               
               // Back Button -> Parent
               const parent = flatCats.find(p => p.id === activeCat.parent_id);
               if (parent) {
                   back = {
                       href: `/${locale}/products?filter=${encodeURIComponent(parent.name_translations[locale] || parent.name_translations['en'])}`,
                       label: parent.name_translations[locale] || parent.name_translations['en']
                   };
               } else {
                    // Parent not found in list? Fallback to All
                    back = {
                        href: `/${locale}/products`,
                        label: locale === 'fi' ? 'Kaikki' : 'All'
                    };
               }
           } else {
               itemsToShow = rootCategories;
           }
       } else {
           // CASE: Root Category Active (e.g. Sohvat)
           // Show: Children (if any)
           if (children.length > 0) {
               itemsToShow = children;
               // Back Button -> All
               back = {
                   href: `/${locale}/products`,
                   label: locale === 'fi' ? 'Kaikki kategoriat' : 'All Categories'
               };
           } else {
               // Root with no children. Show all roots (siblings)
               itemsToShow = rootCategories;
               back = {
                   href: `/${locale}/products`,
                   label: locale === 'fi' ? 'Kaikki' : 'All'
               };
           }
       }
    }

    const outputPills = itemsToShow.map(cat => ({
      label: cat.name_translations?.[locale] || cat.name_translations?.['fi'],
      value: cat.name_translations?.[locale] || cat.name_translations?.['fi'], 
      isActive: cat.id === activeCat?.id
    }));

    return { pills: outputPills, backLink: back };

  }, [categories, activeFilter, locale]);

  if (pills.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
        
            {/* Back Button (if applicable) */}
            {backLink ? (
                 <Link
                    href={backLink.href}
                    className="flex items-center gap-1 rounded-full border border-[#eaddc5] bg-white pl-2 pr-4 py-2 text-sm font-medium text-[#6a5c4b] transition-colors hover:border-[#1f1b16] hover:text-[#1f1b16]"
                >
                    <ChevronLeft size={16} />
                    {backLink.label}
                </Link>
            ) : (
                /* "All" button when at root level */
                 <Link
                    href={`/${locale}/products`}
                    className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium transition-colors border",
                        !activeFilter 
                        ? "bg-[#1f1b16] text-white border-[#1f1b16]" 
                        : "bg-white text-[#6a5c4b] border-[#eaddc5] hover:border-[#1f1b16] hover:text-[#1f1b16]"
                    )}
                >
                    {locale === 'fi' ? 'Kaikki' : 'All'}
                </Link>
            )}

            {pills.map((pill) => (
                <Link
                key={pill.value}
                href={`/${locale}/products?filter=${encodeURIComponent(pill.value)}`}
                className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors border",
                    pill.isActive
                    ? "bg-[#1f1b16] text-white border-[#1f1b16]"
                    : "bg-white text-[#6a5c4b] border-[#eaddc5] hover:border-[#1f1b16] hover:text-[#1f1b16]"
                )}
                >
                {pill.label}
                </Link>
            ))}
    </div>
  );
}
