/** Shared by server components and client counters, so keep it dependency-free. */

/**
 * Money columns are numeric(12,4). Confirmed figures read better at 2 places;
 * the live estimate uses 4 so the counter visibly moves.
 */
export function formatMoney(value: number, fractionDigits = 2): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}
