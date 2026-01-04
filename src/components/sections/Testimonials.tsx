import type { Testimonial } from "@/types/home";

type TestimonialsProps = {
  items: Testimonial[];
};

const STAR_COUNT = 5;

function StarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M12 2.5l2.9 6.2 6.8.6-5.1 4.6 1.5 6.7L12 16.8 5.9 20.6l1.5-6.7L2.3 9.3l6.8-.6z" />
    </svg>
  );
}

export function Testimonials({ items }: TestimonialsProps) {
  return (
    <section className="rounded-[40px] border border-[#d5c6b2] bg-gradient-to-br from-[#1c231f] via-[#25342c] to-[#111511] px-4 py-10 text-white sm:px-8">
      <div className="flex gap-6 overflow-x-auto pb-4 pt-2 lg:grid lg:grid-cols-2 lg:gap-8 lg:overflow-visible">
        {items.map((item) => (
          <figure
            key={item.author}
            className="min-w-[260px] flex-1 rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur"
          >
            <div className="flex items-center gap-1 text-amber-300">
              {Array.from({ length: STAR_COUNT }).map((_, index) => (
                <StarIcon key={index} />
              ))}
              <span className="ml-2 text-xs uppercase tracking-[0.4em] text-white/60">Google</span>
            </div>
            <blockquote className="mt-4 text-base leading-relaxed text-white/85">“{item.quote}”</blockquote>
            <figcaption className="mt-5 text-sm text-white/70">
              <span className="font-semibold text-white">{item.author}</span> · {item.role}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
