"use client";

import { CountUp } from "@/components/CountUp";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

/**
 * Facts about how QuizStar works — deliberately not traction numbers. Every
 * figure here is something the product actually guarantees, so none of it goes
 * stale or overstates what's been built.
 */
const stats = [
  { to: 70, suffix: "%", label: "Your cut of every play", indent: "md:ml-0" },
  { to: 0, suffix: "", label: "Followers needed to start", indent: "md:ml-16" },
  { to: 1, suffix: "", label: "Link to share anywhere", indent: "md:ml-32" },
  { to: 2, suffix: "MIN", label: "To publish your first quiz", indent: "md:ml-48" },
];

export function Stats() {
  return (
    <section
      id="stats"
      className="relative overflow-hidden border-y-2 border-dashed border-[rgba(123,47,255,0.3)] bg-[#101018] px-5 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <span className="font-pixel text-[10px] uppercase tracking-wider text-[#FF6A00]">
            // The short version
          </span>
        </Reveal>

        <div className="mt-10 flex flex-col gap-10 md:gap-6">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.12} className={stat.indent}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-6">
                <div
                  className={cn(
                    "text-grad font-mono text-6xl font-extrabold tracking-tighter sm:text-7xl lg:text-8xl"
                  )}
                >
                  <CountUp to={stat.to} suffix={stat.suffix} />
                </div>
                <div className="font-pixel mb-3 text-[11px] uppercase tracking-wider text-white/60">
                  {stat.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
