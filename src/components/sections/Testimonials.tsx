"use client";

import { useEffect, useRef, useState } from "react";
import type { Review } from "@/lib/reviews";

type TestimonialsProps = {
  items: Review[];
};

const STAR_COUNT = 5;

function StarIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`h-4 w-4 ${filled ? "text-amber-400" : "text-gray-600"}`}
    >
      <path d="M12 2.5l2.9 6.2 6.8.6-5.1 4.6 1.5 6.7L12 16.8 5.9 20.6l1.5-6.7L2.3 9.3l6.8-.6z" />
    </svg>
  );
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function ReviewCard({ item }: { item: Review }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongText = item.review_text.length > 150;

  return (
    <figure
      className="h-full min-w-[280px] w-[90vw] sm:w-[320px] max-w-[360px] snap-center flex-none flex flex-col justify-between rounded-2xl border border-white/5 bg-white/5 p-5 sm:p-6 backdrop-blur transition hover:border-white/10 hover:bg-white/10"
    >
      <div>
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: STAR_COUNT }).map((_, index) => (
            <StarIcon key={index} filled={index < item.rating} />
          ))}
        </div>
        
        <blockquote className={`min-h-[4rem] text-sm leading-relaxed text-white/90 ${isExpanded ? '' : 'line-clamp-4'}`}>
          &ldquo;{item.review_text}&rdquo;
        </blockquote>
        
        {isLongText && (
          <button 
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-xs font-medium text-amber-400 hover:text-amber-300"
          >
            {isExpanded ? "Näytä vähemmän" : "Lue lisää"}
          </button>
        )}
      </div>

      <figcaption className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-xs font-bold text-white uppercase shadow-md">
            {item.author_name.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-medium text-white max-w-[120px] sm:max-w-[140px] truncate" title={item.author_name}>{item.author_name}</div>
            <div className="text-[0.65rem] text-white/60">{item.relative_time}</div>
          </div>
        </div>
        <div className="opacity-80 grayscale transition hover:grayscale-0 hover:opacity-100">
           <GoogleLogo />
        </div>
      </figcaption>
    </figure>
  );
}

export function Testimonials({ items }: TestimonialsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Auto-scroll logic
  useEffect(() => {
    const container = containerRef.current;
    if (!container || items.length < 3) return; // Don't scroll if few items

    let intervalId: NodeJS.Timeout;

    const startScrolling = () => {
      intervalId = setInterval(() => {
        if (!container || isHovered) return;
        
        // Check if we're near the end to loop back or just scroll
        const maxScroll = container.scrollWidth - container.clientWidth;
        const firstCard = container.firstElementChild as HTMLElement;
        if (!firstCard) return;

        // Dynamic scroll amount based on card width and gap
        // gap-4 (16px) on mobile, gap-6 (24px) on sm+
        const gap = window.innerWidth < 640 ? 16 : 24;
        const scrollAmount = firstCard.offsetWidth + gap;
        
        if (container.scrollLeft >= maxScroll - 10) {
            // Smoothly scroll back to start
            container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }

      }, 4000); // Scroll every 4 seconds
    };

    startScrolling();

    return () => clearInterval(intervalId);
  }, [items.length, isHovered]);

  if (!items || items.length === 0) return null;

  return (
    <section className="rounded-[24px] sm:rounded-[40px] border border-[#d5c6b2]/20 bg-[#1f1b16] px-0 pt-6 pb-0 sm:pb-4 sm:px-10 sm:py-12 text-white overflow-hidden">
      <div className="mb-4 flex flex-col items-center gap-2 text-center px-4">
        <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1 sm:px-4 sm:py-1.5 shadow-sm">
          <div className="scale-75 sm:scale-100"><GoogleLogo /></div>
          <span className="text-xs sm:text-sm font-semibold text-gray-800">Rating</span>
          <span className="text-sm sm:text-base font-bold text-gray-900">5.0/5</span>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} filled />
            ))}
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-50">Asiakkaamme kertovat</h2>
      </div>

      <div 
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto pb-2 pt-2 px-6 snap-x scrollbar-hide"
      >
        {items.map((item) => (
          <ReviewCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

