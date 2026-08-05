"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Why It Works", href: "#why-it-works" },
  { label: "The Numbers", href: "#stats" },
  { label: "Get Started", href: "#contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled
          ? "border-b-2 border-dashed border-[rgba(123,47,255,0.35)] bg-[#0A0A0F]/85 backdrop-blur-md"
          : "border-b-2 border-transparent"
      )}
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3.5">
        <a href="#top" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="QuizStar"
            width={1174}
            height={876}
            priority
            className="h-9 w-auto"
          />
          <span className="font-pixel hidden text-sm text-white sm:inline">
            QuizStar
          </span>
        </a>

        <div className="flex items-center gap-8">
          <ul className="hidden items-center gap-7 md:flex">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="nav-link font-pixel text-[10px] uppercase tracking-wide text-white/65 transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/signup">Create your quiz</Link>
          </Button>
        </div>
      </nav>
    </motion.header>
  );
}
