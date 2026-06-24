"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, animate } from "framer-motion";

interface CountUpProps {
  to: number;
  duration?: number;
  /** Text rendered before the number, e.g. nothing. */
  prefix?: string;
  /** Text rendered after the number, e.g. "M+". */
  suffix?: string;
}

/**
 * Counts up from 0 to `to` once the element scrolls into view.
 */
export function CountUp({
  to,
  duration = 2,
  prefix = "",
  suffix = "",
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const motionValue = useMotionValue(0);

  useEffect(() => {
    if (!inView || !Number.isFinite(to)) return;
    const controls = animate(motionValue, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [inView, to, duration, motionValue]);

  useEffect(() => {
    return motionValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${Math.round(latest).toLocaleString()}${suffix}`;
      }
    });
  }, [motionValue, prefix, suffix]);

  const initial = Number.isFinite(to) ? "0" : to.toLocaleString();
  return <span ref={ref}>{`${prefix}${initial}${suffix}`}</span>;
}
