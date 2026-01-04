import Link from "next/link";
import type { CategoryCard } from "@/types/home";

type CategoryGridProps = {
  categories: CategoryCard[];
  createHref: (path: string) => string;
};

export function CategoryGrid({ categories, createHref }: CategoryGridProps) {
  if (!categories.length) {
    return null;
  }

  return (
    <section className="rounded-[36px] border border-[#efe1cf] bg-white px-4 py-8 shadow-[0_18px_40px_rgba(32,23,7,0.08)] sm:px-6">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => {
          const hrefWithFilter = category.tag
            ? `${category.href}${category.href.includes("?") ? "&" : "?"}filter=${encodeURIComponent(category.tag)}`
            : category.href;

          return (
            <Link
              key={category.title}
              href={createHref(hrefWithFilter)}
              className="group relative flex min-h-[220px] flex-col justify-end overflow-hidden rounded-[28px] border border-black/5 bg-[#fefaf3] p-5"
            >
              <div
                className="absolute inset-0 opacity-80 transition duration-500 group-hover:scale-105"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(7,7,7,0.2), rgba(7,7,7,0.65)), url(${category.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="relative space-y-2 text-white">
                <span className="inline-flex rounded-full border border-white/40 px-3 py-1 text-[11px] uppercase tracking-[0.3em]">
                  {category.tag}
                </span>
                <h3 className="text-xl font-semibold leading-tight">{category.title}</h3>
                <p className="text-sm text-white/80">{category.description}</p>
              </div>
              <span className="relative mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900">
                {category.tag}
                <span>→</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
