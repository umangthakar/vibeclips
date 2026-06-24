"use client";

import { Scissors, Share2, Zap, CalendarClock, TrendingUp } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const benefits = [
  {
    icon: Scissors,
    title: "Thousands of Clips",
    description:
      "Every stream gets torn apart for every viral moment worth posting.",
  },
  {
    icon: Share2,
    title: "Massive Distribution",
    description:
      "Your clips blast across TikTok, Reels & Shorts simultaneously.",
  },
  {
    icon: Zap,
    title: "Zero Effort",
    description: "Just stream. We handle clipping, editing, posting. Everything.",
  },
  {
    icon: CalendarClock,
    title: "Same Day Turnaround",
    description: "Clips go live within 24hrs of your stream ending.",
  },
  {
    icon: TrendingUp,
    title: "Clips That Keep Working",
    description:
      "Your content grows your audience long after you go offline.",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative px-5 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <span className="font-pixel text-[10px] uppercase tracking-wider text-[#FF6A00]">
            // What you get
          </span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-4 max-w-2xl font-pixel text-xl leading-[1.5] text-white sm:text-3xl sm:leading-[1.5]">
            What You Get.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 max-w-md text-white/55">
            You go live. We turn it into reach, growth and clips that never stop
            working.
          </p>
        </Reveal>

        <div className="mt-14 grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, i) => (
            <Reveal key={benefit.title} delay={i * 0.1}>
              <div className="pixel-border group flex h-full flex-col bg-[#13131C] p-7 transition-transform duration-300 hover:-translate-y-1">
                <div className="mb-6 grid h-12 w-12 place-items-center border-2 border-dashed border-[rgba(123,47,255,0.4)] text-[#7B2FFF] transition-colors group-hover:text-white">
                  <benefit.icon className="h-6 w-6" />
                </div>
                <h3 className="font-pixel text-base text-white">
                  {benefit.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-white/55">
                  {benefit.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
