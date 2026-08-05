/**
 * Placeholder where a real ad unit would go.
 *
 * QuizStar has no ad network — earnings are simulated per view — so this is
 * deliberately, visibly fake. Anything that looked like a live advert would be
 * misleading to the follower looking at it.
 */
export function AdSlot({
  size,
  label,
}: {
  /** Roughly the IAB slot it stands in for. */
  size: "leaderboard" | "rectangle";
  label: string;
}) {
  return (
    <div
      role="presentation"
      className={[
        "flex flex-col items-center justify-center gap-1 border-2 border-dashed",
        "border-white/12 bg-white/[0.03] text-center",
        size === "leaderboard" ? "h-[70px]" : "h-[140px]",
      ].join(" ")}
    >
      <span className="font-pixel text-[8px] uppercase tracking-[0.2em] text-white/25">
        Ad placeholder
      </span>
      <span className="text-[10px] text-white/20">{label}</span>
    </div>
  );
}
