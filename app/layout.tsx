import type { Metadata } from "next";
import { Inter, Press_Start_2P } from "next/font/google";
import "./globals.css";
import { CustomCursor } from "@/components/CustomCursor";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const pixel = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VibeClips — Your stream ends. Your clips don't.",
  description:
    "VibeClips turns every live stream into 50+ daily clips, distributed across 150+ fan pages on TikTok, Reels & Shorts. Built for streamers on Twitch, YouTube Live & Kick.",
  icons: { icon: "/logo.png" },
  openGraph: {
    title: "VibeClips — Your stream ends. Your clips don't.",
    description:
      "Stream clipping & mass distribution for live streamers on Twitch, YouTube Live & Kick.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${pixel.variable}`}>
      <body>
        {children}
        {/* Page-wide film-grain/noise texture */}
        <div className="grain-overlay" aria-hidden />
        {/* Glowing crosshair cursor (desktop / fine pointer only) */}
        <CustomCursor />
      </body>
    </html>
  );
}
