/** Shared by server components and client counters, so keep it dependency-free. */

/**
 * Money columns are numeric(12,4). Confirmed figures read better at 2 places;
 * the live estimate uses 4 so the counter visibly moves.
 *
 * en-IN also groups in lakhs (₹1,00,000 rather than ₹100,000), which is the
 * right shape for the audience.
 */
export function formatMoney(value: number, fractionDigits = 2): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}
