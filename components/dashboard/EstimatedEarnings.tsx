"use client";

import { useEffect, useRef, useState } from "react";
import { formatMoney } from "@/lib/format";

/**
 * A live, deliberately-approximate earnings ticker.
 *
 * It starts at the influencer's real unpaid balance and grows at the rate they
 * actually earned over the last 24 hours. Nothing here touches the database —
 * it is a projection drawn on top of a confirmed number, and it resets to the
 * truth on every refresh. Hence the wording below: this is never presented as
 * a settled figure.
 */
export function EstimatedEarnings({
  baseline,
  perSecond,
}: {
  /** Confirmed unpaid balance at page render. */
  baseline: number;
  /** Recent earnings rate, in dollars per second. Zero when there's no history. */
  perSecond: number;
}) {
  const [value, setValue] = useState(baseline);
  // Elapsed time is measured from mount, not from a server timestamp, so a
  // skewed client clock can't make the counter open above the real balance.
  const mountedAt = useRef<number | null>(null);

  useEffect(() => {
    setValue(baseline);
    if (perSecond <= 0) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    mountedAt.current = Date.now();
    const id = setInterval(() => {
      const elapsed = (Date.now() - (mountedAt.current ?? Date.now())) / 1000;
      setValue(baseline + perSecond * elapsed);
    }, reduceMotion ? 5000 : 250);

    return () => clearInterval(id);
  }, [baseline, perSecond]);

  const live = perSecond > 0;

  return (
    <div className="pixel-border bg-[#13131C] p-7">
      <div className="flex items-center gap-2">
        <span className="font-pixel text-[9px] uppercase tracking-wider text-white/50">
          Estimated
        </span>
        {live && (
          <span
            aria-hidden
            className="h-[6px] w-[6px] animate-pulse bg-[#FF6A00]"
          />
        )}
      </div>

      <p
        className="text-grad mt-4 font-pixel text-2xl tabular-nums"
        // Screen readers should not announce a number that changes 4x a second.
        aria-live="off"
      >
        {formatMoney(value, 4)}
      </p>

      <p className="mt-3 text-xs leading-relaxed text-white/40">
        {live
          ? "An estimate projected from your last 24 hours — not your final balance. Refresh for the confirmed figure."
          : "An estimate, not your final balance. It starts ticking once your quizzes are getting views."}
      </p>
    </div>
  );
}
