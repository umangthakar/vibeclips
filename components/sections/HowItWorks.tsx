"use client";

import { Upload, Sparkles, Rocket, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Fragment } from "react";

const steps = [
  {
    icon: Upload,
    num: "01",
    title: "Connect your stream",
    description: "Share your Twitch, YouTube or Kick VOD link or channel.",
  },
  {
    icon: Sparkles,
    num: "02",
    title: "We clip the gold",
    description: "Our team pulls 50+ clips from every stream — same day.",
  },
  {
    icon: Rocket,
    num: "03",
    title: "150 pages post daily",
    description: "Your clips go live across your entire fan page network.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative px-5 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <span className="font-pixel text-[10px] uppercase tracking-wider text-[#FF6A00]">
            // The process
          </span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-4 max-w-2xl font-pixel text-xl leading-[1.5] text-white sm:text-3xl sm:leading-[1.5]">
            Raw footage in. Viral out.
          </h2>
        </Reveal>

        <div className="mt-14 flex flex-col items-stretch gap-6 md:flex-row md:items-center">
          {steps.map((step, i) => (
            <Fragment key={step.num}>
              <Reveal className="flex-1" delay={i * 0.12}>
                <div className="pixel-border h-full bg-[#13131C] p-7">
                  <div className="flex items-center justify-between">
                    <div className="grid h-12 w-12 place-items-center bg-grad text-white">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <span className="font-pixel text-2xl text-white/15">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="mt-6 font-pixel text-sm leading-relaxed text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm text-white/55">{step.description}</p>
                </div>
              </Reveal>

              {i < steps.length - 1 && (
                <Reveal delay={i * 0.12 + 0.06}>
                  <div className="flex justify-center md:px-1">
                    <ArrowRight className="h-6 w-6 rotate-90 text-[#7B2FFF] md:rotate-0" />
                  </div>
                </Reveal>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
