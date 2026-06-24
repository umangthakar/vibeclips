import { Marquee } from "@/components/Marquee";

const niches = [
  "Twitch",
  "YouTube Live",
  "Kick",
  "TikTok",
  "Reels",
  "Shorts",
  "Clips",
  "Highlights",
  "Moments",
];

export function MarqueeBar() {
  return (
    <section className="relative border-y-2 border-dashed border-[rgba(123,47,255,0.3)] bg-[#101018] py-4">
      <Marquee items={niches} />
    </section>
  );
}
