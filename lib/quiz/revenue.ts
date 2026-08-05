/**
 * Simulated ad revenue for one quiz view.
 *
 * QuizStar has no ad network — the banners are placeholders — so a view is
 * "worth" a random amount in this range. The number is always produced on the
 * server: if the client sent it, anyone could claim a ₹9,999 page load.
 *
 * The influencer's 70% cut is NOT applied here. That split lives in the
 * database (public.influencer_share, used by record_quiz_view) so it can't
 * drift from the ledger it's written into.
 */

/** Gross revenue per view, in rupees. */
export const REVENUE_MIN = 0.1;
export const REVENUE_MAX = 0.5;

/** Matches the numeric(12,4) money columns. */
const DECIMALS = 4;

export function randomRevenue(): number {
  const value = REVENUE_MIN + Math.random() * (REVENUE_MAX - REVENUE_MIN);
  return Number(value.toFixed(DECIMALS));
}
