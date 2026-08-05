import { AdSlot } from "@/components/AdSlot";
import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { WhyItWorks } from "@/components/sections/WhyItWorks";
import { Stats } from "@/components/sections/Stats";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <WhyItWorks />
        <Stats />
        <CTA />

        {/* Last thing before the footer, so it never sits between the pitch
            and the signup call to action. */}
        <div className="mx-auto w-full max-w-6xl px-5 pb-20">
          <AdSlot size="leaderboard" label="728 × 90" />
        </div>
      </main>
      <Footer />
    </>
  );
}
