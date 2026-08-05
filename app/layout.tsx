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
  title: "QuizStar — You post. They play. You earn.",
  description:
    "Make a quiz about you, share one link to your Instagram Story, and earn a cut of the ad revenue every time a follower plays. No signup for them, no follower minimum for you.",
  icons: { icon: "/logo.png" },
  openGraph: {
    title: "QuizStar — You post. They play. You earn.",
    description:
      "Turn one link in your Story into ad revenue. Built for influencers, whatever size their following.",
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
