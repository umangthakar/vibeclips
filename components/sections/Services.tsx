"use client";

import { Scissors, Share2, CalendarClock, BarChart3 } from "lucide-react";
import { Reveal } from "@/components/Reveal";

export function Services() {
  return (
    <section id="services" className="relative px-5 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl">
        {/* Left-aligned heading */}
        <Reveal>
          <span className="font-pixel text-[10px] uppercase tracking-wider text-[#FF6A00]">
            // What we do for streamers
          </span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-4 max-w-2xl font-pixel text-xl leading-[1.5] text-white sm:text-3xl sm:leading-[1.5]">
            What We Do For Streamers.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 max-w-md text-white/55">
            You go live. We turn the VOD into reach — every single day.
          </p>
        </Reveal>

        {/* Bento grid */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
          {/* Clipping — big feature tile */}
          <Reveal className="lg:col-span-2 lg:row-span-2" delay={0}>
            <article className="pixel-border group flex h-full flex-col justify-between bg-[#13131C] p-7 transition-colors duration-300">
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center border-2 border-dashed border-[rgba(123,47,255,0.4)] text-[#7B2FFF] transition-colors group-hover:text-white">
                  <Scissors className="h-6 w-6" />
                </div>
                <span className="font-pixel text-[9px] uppercase tracking-wider text-white/30">
                  01
                </span>
              </div>
              <div className="mt-10">
                <h3 className="font-pixel text-base text-white sm:text-lg">
                  Stream Clipping
                </h3>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">
                  We watch your VODs and pull the best 30-90 second moments
                  daily — the kills, the reactions, the chaos — cut into punchy,
                  captioned verticals built to retain.
                </p>
              </div>
            </article>
          </Reveal>

          {/* Distribution — wide tile */}
          <Reveal className="lg:col-span-2" delay={0.08}>
            <article className="pixel-border group flex h-full items-start gap-4 bg-[#13131C] p-6 transition-colors duration-300">
              <div className="grid h-11 w-11 shrink-0 place-items-center border-2 border-dashed border-[rgba(123,47,255,0.4)] text-[#D0007A] transition-colors group-hover:text-white">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-pixel text-sm text-white">
                  Mass Distribution
                </h3>
                <p className="mt-2 text-sm text-white/55">
                  150+ fan pages across TikTok, Reels &amp; Shorts post your
                  clips every single day.
                </p>
              </div>
            </article>
          </Reveal>

          {/* Scheduling */}
          <Reveal delay={0.16}>
            <article className="pixel-border group flex h-full flex-col bg-[#13131C] p-6 transition-colors duration-300">
              <div className="mb-5 grid h-11 w-11 place-items-center border-2 border-dashed border-[rgba(123,47,255,0.4)] text-[#FF6A00] transition-colors group-hover:text-white">
                <CalendarClock className="h-5 w-5" />
              </div>
              <h3 className="font-pixel text-sm text-white">
                Fan Page Network
              </h3>
              <p className="mt-2 text-sm text-white/55">
                You own a 50-page network per platform. Built and managed by us.
              </p>
            </article>
          </Reveal>

          {/* Analytics */}
          <Reveal delay={0.24}>
            <article className="pixel-border group flex h-full flex-col bg-[#13131C] p-6 transition-colors duration-300">
              <div className="mb-5 grid h-11 w-11 place-items-center border-2 border-dashed border-[rgba(123,47,255,0.4)] text-[#7B2FFF] transition-colors group-hover:text-white">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="font-pixel text-sm text-white">
                Growth Analytics
              </h3>
              <p className="mt-2 text-sm text-white/55">
                Weekly reports: views, follows gained &amp; top performing clips.
              </p>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
