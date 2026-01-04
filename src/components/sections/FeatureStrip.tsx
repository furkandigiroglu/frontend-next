import type { JSX } from "react";
import type { FeatureStripItem } from "@/types/home";

const iconMap: Record<FeatureStripItem["icon"], JSX.Element> = {
  delivery: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6">
      <path
        d="M3 7h13v10H3zM16 10h3l2 3v4h-5z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="17" r="1.5" fill="currentColor" />
      <circle cx="17.5" cy="17" r="1.5" fill="currentColor" />
    </svg>
  ),
  payment: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6">
      <rect x="2.5" y="6" width="19" height="12" rx="2" strokeWidth="1.6" />
      <path d="M2.5 10h19" strokeWidth="1.6" />
      <path d="M7 15h4" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  quality: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6">
      <path
        d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.8l-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  ),
  support: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6">
      <path d="M12 4a7 7 0 0 1 7 7v2.5a3.5 3.5 0 0 1-3.5 3.5H14" strokeWidth="1.6" />
      <path d="M12 4a7 7 0 0 0-7 7v2.5A3.5 3.5 0 0 0 8.5 17H10" strokeWidth="1.6" />
      <path d="M9 21h6" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
};

type FeatureStripProps = {
  items: FeatureStripItem[];
};

export function FeatureStrip({ items }: FeatureStripProps) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="rounded-[32px] border border-[#e3d5c6] bg-white px-4 py-6 shadow-[0_15px_35px_rgba(32,23,7,0.1)] sm:px-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <article
            key={item.title}
            className="flex items-start gap-3 rounded-[24px] bg-[#fdf8f1] px-4 py-3"
          >
            <div className="rounded-full bg-[#1f1b16]/10 p-3 text-[#1f1b16]">
              {iconMap[item.icon]}
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
