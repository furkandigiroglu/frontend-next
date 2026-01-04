import Link from "next/link";
import type { CTAContent } from "@/types/home";

type CTASectionProps = {
  content: CTAContent;
  createHref: (path: string) => string;
};

export function CTASection({ content, createHref }: CTASectionProps) {
  return (
    <section className="relative isolate overflow-hidden rounded-[42px] border border-[#e4d2bc] bg-gradient-to-br from-[#fdf8f1] via-[#f2e4ce] to-[#f0d3b8] px-10 py-14 text-[#1f1b16]">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute -left-6 top-10 h-36 w-36 rounded-full bg-[#c58a48]/40 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-[#3a5a40]/35 blur-[140px]" />
      </div>
      <div className="relative flex flex-col gap-6">
        <p className="text-sm uppercase tracking-[0.5em] text-[#6a5c4b]">{content.label}</p>
        <h3 className="text-3xl font-semibold leading-tight">{content.title}</h3>
        <p className="text-base text-[#4a3d31]">{content.description}</p>
        <div className="flex flex-wrap gap-4">
          <Link
            href={createHref(content.primary.href)}
            className="inline-flex items-center gap-2 rounded-full bg-[#1f1b16] px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
          >
            {content.primary.label}
          </Link>
          <Link
            href={createHref(content.secondary.href)}
            className="inline-flex items-center gap-2 rounded-full border border-[#1f1b16]/40 px-6 py-3 text-sm text-[#1f1b16] transition hover:border-[#1f1b16]"
          >
            {content.secondary.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
