"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden px-5 pb-24 pt-36 sm:pt-44"
    >
      {/* soft brand glow, same treatment as the auth screens */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 animate-pulse-glow rounded-full bg-[#7B2FFF] opacity-20 blur-[130px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="relative mx-auto max-w-3xl text-center"
      >
        <span className="font-pixel inline-flex items-center gap-2 border-2 border-dashed border-[rgba(123,47,255,0.4)] px-3 py-2 text-[9px] uppercase tracking-wider text-white/70">
          <span className="bg-grad h-2 w-2" />
          // FOR INFLUENCERS
        </span>

        <h1 className="mt-8 font-pixel text-[1.7rem] leading-[1.35] text-white sm:text-4xl sm:leading-[1.35] lg:text-5xl lg:leading-[1.3]">
          <span className="glitch" data-text="You post.">
            You post.
          </span>
          <br />
          <span className="text-grad">They play.</span>
          <br />
          <span className="text-grad">You earn.</span>
        </h1>

        <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-white/60">
          Make a quiz about you, share one link to your Story, and earn a cut of
          the ad revenue every time a follower plays it. They never sign up. The
          payouts are real money.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
          <Button asChild size="lg">
            <Link href="/signup">
              Create your quiz <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <a
            href="#how-it-works"
            className="nav-link text-sm font-semibold uppercase tracking-wide text-white/70 hover:text-white"
          >
            See how it works
          </a>
        </div>

        <p className="font-pixel mt-8 text-[8px] uppercase tracking-wider text-white/35">
          Free to start · No follower minimum
        </p>
      </motion.div>
    </section>
  );
}
