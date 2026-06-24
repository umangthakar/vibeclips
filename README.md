# VibeClips

A pixel / retro-tech (but premium) landing page for **VibeClips** — a short-form
content clipping & distribution agency for creators.

> _We clip the gold._

## Aesthetic

- **Fonts** — `Press Start 2P` (display headings) + `Inter` (body) via `next/font`
- **Palette** — near-black `#0A0A0F`, brand gradient purple `#7B2FFF` → pink `#D0007A` → orange `#FF6A00`
- **Pixel details** — 2px dashed borders on cards, flat square buttons with hard
  offset shadows, monospace stat numbers
- **Glitch** headline on the hero (`We clip` — pure CSS, `.glitch` in `globals.css`)
- **Custom cursor** — glowing purple crosshair (`components/CustomCursor.tsx`)
- **Page-wide grain** — SVG noise overlay at 0.04 opacity
- **CSS waveform** animation around the hero logo

## Logo

The site loads the real logo from **`public/logo.png`** (used in the nav, hero and
footer — never a text fallback). To swap it, just overwrite that one file; no code
changes needed. The current file was generated from the supplied artwork with its
white background knocked out to transparent and auto-cropped.

## Stack

- **Next.js 14** (App Router) · **Tailwind CSS** · **Framer Motion**
- All content static — no backend.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Sections

Each lives in `components/sections/` (one component per section):

| #   | Section      | File             |
| --- | ------------ | ---------------- |
| 1   | Nav (sticky) | `Nav.tsx`        |
| 2   | Hero         | `Hero.tsx`       |
| 3   | Marquee      | `MarqueeBar.tsx` |
| 4   | Services     | `Services.tsx` (bento grid) |
| 5   | How It Works | `HowItWorks.tsx` |
| 6   | Stats        | `Stats.tsx`      |
| 7   | Pricing      | `Pricing.tsx`    |
| 8   | CTA          | `CTA.tsx`        |
| 9   | Footer       | `Footer.tsx`     |

Shared helpers: `Reveal` (scroll reveal), `Marquee`, `CountUp`, `CustomCursor`.

> Note: the redesign is driven entirely through `app/globals.css`, `app/layout.tsx`
> and component-level Tailwind — the build config files (`tailwind.config.ts`,
> `next.config.mjs`, `postcss`, `tsconfig`, `package.json`) were left untouched.
