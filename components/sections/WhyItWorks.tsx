"use client";

import { UserX, MessageSquareOff, Repeat2, ShieldCheck, Zap } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const reasons = [
  {
    icon: UserX,
    title: "No follower minimum",
    description:
      "Nobody checks your numbers before letting you in. 200 followers or 200,000 — the link works exactly the same.",
  },
  {
    icon: MessageSquareOff,
    title: "Nothing to negotiate",
    description:
      "No pitching brands, no rate cards, no waiting on a reply that never comes. You publish, and you're live.",
  },
  {
    icon: Repeat2,
    title: "Fits what you already post",
    description:
      "You're putting links in your Story anyway. This is the one that pays you back for it.",
  },
  {
    icon: ShieldCheck,
    title: "Paid on plays, not promises",
    description:
      "Revenue is credited once per person per quiz — so it counts real attention, not someone refreshing the page.",
  },
  {
    icon: Zap,
    title: "It's yours",
    description:
      "Your quiz, your link, your audience, your earnings. Nothing to sign away and nobody taking a cut of the relationship.",
  },
];

export function WhyItWorks() {
  return (
    <section id="why-it-works" className="relative px-5 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <span className="font-pixel text-[10px] uppercase tracking-wider text-[#FF6A00]">
            // Why this works
          </span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-4 max-w-2xl font-pixel text-xl leading-[1.5] text-white sm:text-3xl sm:leading-[1.5]">
            Built for the accounts brands ignore.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 max-w-lg text-white/55">
            Sponsorships reward the accounts that are already big. A quiz link
            doesn&apos;t care how many followers you have — it just needs people
            who actually pay attention to you.
          </p>
        </Reveal>

        <div className="mt-14 grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason, i) => (
            <Reveal key={reason.title} delay={i * 0.1}>
              <div className="pixel-border group flex h-full flex-col bg-[#13131C] p-7 transition-transform duration-300 hover:-translate-y-1">
                <div className="mb-6 grid h-12 w-12 place-items-center border-2 border-dashed border-[rgba(123,47,255,0.4)] text-[#7B2FFF] transition-colors group-hover:text-white">
                  <reason.icon className="h-6 w-6" />
                </div>
                <h3 className="font-pixel text-base text-white">
                  {reason.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-white/55">
                  {reason.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
