import { cn } from "@/lib/utils";

/**
 * Reserved space for an ad unit.
 *
 * Deliberately a plain server component: it renders no script, holds no state
 * and ships zero JavaScript to the browser. That matters on the quiz player,
 * which has to stay fast on a phone opened from an Instagram Story.
 *
 * Right now it is only a placeholder — QuizStar serves no real ads and the
 * earnings shown to influencers are simulated. It is styled to look obviously
 * empty rather than like a live advert, because anything else would mislead
 * the follower looking at it.
 *
 * When Monetag approves the site and issues zone codes, the script goes where
 * the MONETAG_AD_ZONE comment is. Adding a script there will very likely make
 * this a client component — check whether the surrounding page still needs to
 * stay server-rendered at that point.
 */
export function AdSlot({
  size = "leaderboard",
  label,
  className,
}: {
  /** Roughly the IAB slot this stands in for. */
  size?: "leaderboard" | "rectangle";
  /** Small caption, e.g. the dimensions. */
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="presentation"
      data-ad-slot={size}
      className={cn(
        "flex flex-col items-center justify-center gap-1 border-2 border-dashed",
        "border-white/12 bg-white/[0.03] text-center",
        size === "leaderboard" ? "h-[70px]" : "h-[140px]",
        className
      )}
    >
      {/* MONETAG_AD_ZONE: replace with real ad script once approved */}
      <span className="font-pixel text-[8px] uppercase tracking-[0.2em] text-white/25">
        Ad placeholder
      </span>
      {label && <span className="text-[10px] text-white/20">{label}</span>}
    </div>
  );
}
