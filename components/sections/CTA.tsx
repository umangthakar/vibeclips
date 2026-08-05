"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section id="contact" className="relative px-5 py-24 sm:py-28">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="pixel-border-glow mx-auto flex max-w-6xl flex-col items-start justify-between gap-10 bg-[#101018] p-8 sm:p-12 lg:flex-row lg:items-center"
      >
        <div className="max-w-2xl">
          <span className="font-pixel text-[10px] uppercase tracking-wider text-[#FF6A00]">
            // Last call
          </span>
          <h2 className="mt-5 font-pixel text-2xl leading-[1.4] text-white sm:text-4xl sm:leading-[1.35]">
            Your followers already think they{" "}
            <span className="text-grad">know you.</span>
          </h2>
          <p className="mt-5 max-w-md text-white/60">
            Find out who&apos;s right — and get paid while they prove it.
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
          <Button asChild size="lg">
            <Link href="/signup">
              Create your quiz <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <span className="font-pixel text-[8px] uppercase tracking-wider text-white/40">
            No contracts. Just a link.
          </span>
        </div>
      </motion.div>
    </section>
  );
}
