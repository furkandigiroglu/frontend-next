import type { FeatureCard } from "@/types/home";

type FeatureGridProps = {
  features: FeatureCard[];
  linkLabel?: string;
};

export function FeatureGrid({ features, linkLabel }: FeatureGridProps) {
  return (
    <section className="grid gap-6 md:grid-cols-3">
      {features.map((feature) => (
        <article
          key={feature.title}
          className="group flex h-full flex-col justify-between rounded-[32px] border border-[#e1d5c5] bg-gradient-to-br from-[#fffdf7] to-[#f5ecdf] p-6 shadow-[0_20px_45px_rgba(32,23,7,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#7c5a33]/40"
        >
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {feature.highlight}
            </p>
            <h3 className="text-2xl font-semibold text-slate-900">{feature.title}</h3>
            <p className="text-sm leading-relaxed text-slate-600">{feature.description}</p>
          </div>
          <div className="mt-8 flex items-center justify-between text-sm font-medium text-slate-800">
            {linkLabel ?? "Explore"}
            <span className="text-base transition group-hover:translate-x-1">↗</span>
          </div>
        </article>
      ))}
    </section>
  );
}
