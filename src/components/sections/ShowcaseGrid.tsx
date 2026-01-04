import type { ShowcaseCard } from "@/types/home";

const gradients = [
  "from-[#f6efe3] via-[#eddcc2] to-white",
  "from-[#f1f5ec] via-[#dfe9d8] to-white",
  "from-[#f7e8da] via-[#f2d4bf] to-white",
];

type ShowcaseGridProps = {
  collections: ShowcaseCard[];
  label?: string;
};

export function ShowcaseGrid({ collections, label }: ShowcaseGridProps) {
  return (
    <section className="grid gap-6 md:grid-cols-3">
      {collections.map((collection, index) => (
        <article
          key={collection.title}
          className={`rounded-[36px] border border-white/60 bg-gradient-to-br ${gradients[index]} p-6 shadow-[0_25px_50px_rgba(15,20,50,0.08)]`}
        >
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{label ?? "Collection"}</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900">{collection.title}</h3>
          <p className="mt-2 text-sm text-slate-700">{collection.description}</p>
          <div className="mt-10 inline-flex items-center rounded-full border border-slate-900/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700">
            {collection.metric}
          </div>
        </article>
      ))}
    </section>
  );
}
