"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Fake data                                                          */
/* ------------------------------------------------------------------ */

const CHAT_NAMES = ["xGamer99", "StreamKing", "vibecheck_", "clipsonly", "no_scope", "ggwp_tv"];
const CHAT_MSGS = ["CLIP THAT", "W moment", "LOL", "bro what", "PogChamp", "insane", "actual W", "clip it!!"];

// Real clip thumbnails (cycled in order as new cards appear)
const CLIP_IMAGES = ["/clips/clip1.jpg", "/clips/clip2.jpg", "/clips/clip3.jpg"];

const VIEW_COUNTS = ["124K views", "2.4M views", "88K views", "560K views", "1.2M views", "342K views"];

const FLOAT_BADGES = ["+2.4K views", "New clip posted", "50 fan pages live", "+18K views", "Clip distributed"];

/* ------------------------------------------------------------------ */
/*  Small platform glyphs (pure CSS/SVG, no external icons)            */
/* ------------------------------------------------------------------ */

function TikTokGlyph() {
  return (
    <span className="grid h-4 w-4 place-items-center rounded-sm bg-black text-[8px] font-bold text-white">
      ♪
    </span>
  );
}

function ReelsGlyph() {
  return (
    <span className="grid h-4 w-4 place-items-center rounded-sm bg-grad text-[8px] text-white">
      ▶
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Phone shell                                                        */
/* ------------------------------------------------------------------ */

function PhoneShell({
  children,
  className = "",
  rotate = 0,
  scale = 1,
}: {
  children: React.ReactNode;
  className?: string;
  rotate?: number;
  scale?: number;
}) {
  return (
    <div
      className={`relative h-[360px] w-[180px] shrink-0 overflow-hidden rounded-[26px] border-2 border-dashed border-[rgba(123,47,255,0.5)] bg-[#1a1a2e] shadow-[0_18px_60px_-18px_rgba(123,47,255,0.6)] ${className}`}
      style={{ transform: `rotate(${rotate}deg) scale(${scale})` }}
    >
      {/* notch */}
      <div className="absolute left-1/2 top-2 z-20 h-1.5 w-12 -translate-x-1/2 rounded-full bg-white/15" />
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Left phone — LIVE stream with scrolling chat                       */
/* ------------------------------------------------------------------ */

type ChatLine = { id: number; name: string; msg: string };

function StreamPhone() {
  const [lines, setLines] = useState<ChatLine[]>(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      name: CHAT_NAMES[i % CHAT_NAMES.length],
      msg: CHAT_MSGS[i % CHAT_MSGS.length],
    })),
  );

  useEffect(() => {
    let n = 5;
    const t = setInterval(() => {
      setLines((prev) => {
        const next: ChatLine = {
          id: n++,
          name: CHAT_NAMES[Math.floor(Math.random() * CHAT_NAMES.length)],
          msg: CHAT_MSGS[Math.floor(Math.random() * CHAT_MSGS.length)],
        };
        return [...prev.slice(-5), next];
      });
    }, 1500);
    return () => clearInterval(t);
  }, []);

  return (
    <PhoneShell rotate={-6} className="hidden md:block">
      <div className="flex h-full flex-col">
        {/* stream video area */}
        <div className="relative h-[46%] bg-gradient-to-br from-[#241a3a] to-[#0d0d18]">
          {/* LIVE badge */}
          <div className="absolute left-2 top-4 z-10 flex items-center gap-1 bg-[#FF4D4D] px-1.5 py-1">
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-white"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <span className="font-pixel text-[6px] tracking-wider text-white">LIVE</span>
          </div>
          {/* fake streamer cam */}
          <div className="absolute inset-0 grid place-items-center">
            <motion.div
              className="h-12 w-12 rounded-full bg-grad opacity-80"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <div className="absolute bottom-2 left-2 text-[7px] font-semibold text-white/70">
            🔴 12,408 watching
          </div>
        </div>

        {/* chat */}
        <div className="relative flex-1 overflow-hidden bg-[#15151f] px-2 py-2">
          <div className="flex h-full flex-col justify-end gap-1.5">
            <AnimatePresence initial={false}>
              {lines.map((l) => (
                <motion.div
                  key={l.id}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="text-[8px] leading-tight"
                >
                  <span className="font-semibold text-violet-glow">{l.name}</span>
                  <span className="text-white/70">: {l.msg}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Feed phone — clip cards sliding up (TikTok / Reels)                */
/* ------------------------------------------------------------------ */

type ClipCard = { id: number; img: string; views: string };

function FeedPhone({
  label,
  platform,
  rotate = 0,
  scale = 1,
  delay = 0,
  className = "",
}: {
  label: string;
  platform: "tiktok" | "reels";
  rotate?: number;
  scale?: number;
  delay?: number; // ms head-start offset so the two feeds stagger
  className?: string;
}) {
  const [cards, setCards] = useState<ClipCard[]>([]);
  const [ping, setPing] = useState(false);

  useEffect(() => {
    let n = 0;
    let interval: ReturnType<typeof setInterval>;

    const push = () => {
      setCards((prev) => {
        const idx = n++;
        const next: ClipCard = {
          id: idx,
          img: CLIP_IMAGES[idx % CLIP_IMAGES.length],
          views: VIEW_COUNTS[Math.floor(Math.random() * VIEW_COUNTS.length)],
        };
        return [next, ...prev].slice(0, 4);
      });
      setPing(true);
      setTimeout(() => setPing(false), 700);
    };

    const start = setTimeout(() => {
      push();
      interval = setInterval(push, 2000);
    }, delay);

    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
  }, [delay]);

  return (
    <PhoneShell rotate={rotate} scale={scale} className={className}>
      <div className="flex h-full flex-col bg-[#121019]">
        {/* header */}
        <div className="flex items-center justify-between border-b border-white/5 px-3 pb-2 pt-4">
          <span className="font-pixel text-[6px] text-white/80">{label}</span>
          <div className="relative">
            {platform === "tiktok" ? <TikTokGlyph /> : <ReelsGlyph />}
            {/* notification ping */}
            <AnimatePresence>
              {ping && (
                <motion.span
                  initial={{ scale: 0, opacity: 0.9 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full border border-violet-glow"
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* feed */}
        <div className="flex flex-1 flex-col gap-2 overflow-hidden p-2">
          <AnimatePresence initial={false}>
            {cards.map((c) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 40, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="relative aspect-[9/16] shrink-0 overflow-hidden rounded-lg"
                style={{
                  backgroundImage: `url('${c.img}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* bottom scrim so overlaid text stays readable */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 to-transparent" />

                {/* top-right — more / options */}
                <span className="absolute right-1.5 top-1.5 text-[10px] leading-none text-white/90 drop-shadow">
                  •••
                </span>

                {/* bottom-left — play icon + view count pill (Inter) */}
                <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full bg-black/35 px-1.5 py-0.5 backdrop-blur-sm">
                  <span className="text-[9px] leading-none text-white">▶</span>
                  <span className="text-[10px] font-medium leading-none text-white">
                    {c.views.replace(/\s*views$/i, "")}
                  </span>
                </div>

                {/* bottom-right — Reels glyph (circle + play arrow) */}
                <svg
                  viewBox="0 0 24 24"
                  className="absolute bottom-1.5 right-1.5 h-3.5 w-3.5 text-white drop-shadow"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none" />
                </svg>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </PhoneShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Floating notification badges                                       */
/* ------------------------------------------------------------------ */

type Float = { id: number; text: string; left: string; top: string };

function FloatingBadges() {
  const [items, setItems] = useState<Float[]>([]);

  useEffect(() => {
    let n = 0;
    const positions = [
      { left: "2%", top: "18%" },
      { left: "78%", top: "12%" },
      { left: "70%", top: "70%" },
      { left: "6%", top: "62%" },
    ];
    const t = setInterval(() => {
      const pos = positions[n % positions.length];
      const badge: Float = {
        id: n,
        text: FLOAT_BADGES[n % FLOAT_BADGES.length],
        ...pos,
      };
      n++;
      setItems((prev) => [...prev, badge]);
      setTimeout(() => {
        setItems((prev) => prev.filter((b) => b.id !== badge.id));
      }, 2600);
    }, 1400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      <AnimatePresence>
        {items.map((b) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 10, scale: 0.85 }}
            animate={{ opacity: 1, y: -28, scale: 1 }}
            exit={{ opacity: 0, y: -48 }}
            transition={{ duration: 2.4, ease: "easeOut" }}
            style={{ left: b.left, top: b.top }}
            className="absolute"
          >
            <span className="font-pixel inline-flex items-center gap-1 whitespace-nowrap border-2 border-dashed border-[rgba(123,47,255,0.55)] bg-[#13131C]/90 px-2 py-1.5 text-[6px] text-white shadow-[0_8px_30px_-10px_rgba(123,47,255,0.7)]">
              <span className="h-1.5 w-1.5 bg-grad" />
              {b.text}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main exported mockup                                               */
/* ------------------------------------------------------------------ */

export function HeroMockup() {
  return (
    <div className="relative flex items-center justify-center">
      {/* purple glow behind everything */}
      <div className="pointer-events-none absolute h-72 w-72 bg-[#7B2FFF]/25 blur-[110px] sm:h-96 sm:w-96" />

      <FloatingBadges />

      {/* phones */}
      <div className="relative z-10 flex items-center justify-center">
        {/* left — stream (hidden on mobile) */}
        <div className="-mr-6">
          <StreamPhone />
        </div>

        {/* center — TikTok feed (hero element, always visible) */}
        <div className="relative z-20">
          <FeedPhone
            label="FOR YOU"
            platform="tiktok"
            scale={1.08}
            delay={0}
          />
        </div>

        {/* right — Reels feed (hidden on mobile, staggered +1s) */}
        <div className="-ml-6 hidden md:block">
          <FeedPhone
            label="REELS"
            platform="reels"
            rotate={6}
            delay={1000}
          />
        </div>
      </div>
    </div>
  );
}
