"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroMockup } from "@/components/sections/HeroMockup";

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden px-5 pb-20 pt-36 sm:pt-44"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        {/* LEFT — text */}
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="text-left"
        >
          <span className="font-pixel inline-flex items-center gap-2 border-2 border-dashed border-[rgba(123,47,255,0.4)] px-3 py-2 text-[9px] uppercase tracking-wider text-white/70">
            <span className="h-2 w-2 bg-grad" />
            // FOR LIVE STREAMERS
          </span>

          <h1 className="mt-7 font-pixel text-[1.7rem] leading-[1.35] text-white sm:text-4xl sm:leading-[1.35] lg:text-5xl lg:leading-[1.3]">
            <span className="glitch" data-text="You streamed.">
              You streamed.
            </span>
            <br />
            <span className="text-grad">Millions missed it.</span>
            <br />
            <span className="text-grad">We fix that.</span>
          </h1>

          <p className="mt-7 max-w-md text-base leading-relaxed text-white/60">
            One stream. Thousands of clips. Every platform. Every day.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-6">
            <Button asChild size="lg">
              <a href="mailto:clips@vibechan.com?subject=I%20Want%20To%20Grow%20My%20Stream&body=Hey%20VibeClips!%0A%0AI%27m%20interested%20in%20growing%20my%20stream.%0A%0AMy%20channel%20link%3A%20%0AMy%20platform%20(Twitch%2FYouTube%2FKick)%3A%20%0AWhat%20I%27m%20looking%20for%3A%20">
                Get started <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <a
              href="#how-it-works"
              className="nav-link text-sm font-semibold uppercase tracking-wide text-white/70 hover:text-white"
            >
              See how it works
            </a>
          </div>
        </motion.div>

        {/* RIGHT — animated stream → clips mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="relative flex items-center justify-center"
        >
          <HeroMockup />
        </motion.div>
      </div>
    </section>
  );
}
