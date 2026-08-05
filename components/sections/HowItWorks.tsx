"use client";

import { PencilLine, Link2, Instagram, Wallet } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const steps = [
  {
    icon: PencilLine,
    num: "01",
    title: "Build a quiz in minutes",
    description:
      "A few questions, four answers each. No design skills, no editing, nothing to learn.",
  },
  {
    icon: Link2,
    num: "02",
    title: "Get your link",
    description:
      "Publishing gives you a link of your own — /q/yourhandle/your-quiz — ready to share.",
  },
  {
    icon: Instagram,
    num: "03",
    title: "Post it to your Story",
    description:
      "Followers tap through and play right there. No signup, no app, nothing to install.",
  },
  {
    icon: Wallet,
    num: "04",
    title: "Earn on every play",
    description:
      "You keep 70% of the ad revenue your quiz brings in, credited as people play and paid out to you.",
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
            Four steps. One link.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 max-w-md text-white/55">
            From nothing to earning in the time it takes to post a Story.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal key={step.num} delay={i * 0.1}>
              <div className="pixel-border h-full bg-[#13131C] p-7">
                <div className="flex items-center justify-between">
                  <div className="bg-grad grid h-12 w-12 place-items-center text-white">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="font-pixel text-2xl text-white/15">
                    {step.num}
                  </span>
                </div>
                <h3 className="mt-6 font-pixel text-sm leading-relaxed text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
