"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  items: string[];
  className?: string;
}

/**
 * Infinite horizontal ticker. Items render twice side by side and the
 * track is scrolled left via requestAnimationFrame, wrapping at the
 * halfway point so the loop is perfectly seamless (no gaps). Driven in
 * JS so it always moves, regardless of `prefers-reduced-motion`.
 * Pauses on hover.
 */
export function Marquee({ items, className }: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const speed = 60; // px per second, right -> left
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      if (!pausedRef.current) {
        const half = track.scrollWidth / 2; // width of one item set
        offsetRef.current -= speed * dt;
        if (half > 0 && offsetRef.current <= -half) {
          offsetRef.current += half;
        }
        track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [items]);

  return (
    <div
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      className={cn(
        "relative flex w-full overflow-hidden",
        "[mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]",
        className
      )}
    >
      <div
        ref={trackRef}
        className="flex w-max items-center will-change-transform"
      >
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            aria-hidden={i >= items.length}
            className="font-pixel mx-5 flex items-center gap-5 text-[11px] uppercase tracking-wider text-white/75 sm:text-sm"
          >
            {item}
            <span className="text-grad text-base">&#9632;</span>
          </span>
        ))}
      </div>
    </div>
  );
}
