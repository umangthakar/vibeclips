import "server-only";

/**
 * Fixed-window rate limiter for login attempts.
 *
 * A 4-digit PIN is 10,000 guesses; without this, bcrypt's cost is the only thing
 * slowing an online attack, and 250ms per try is not slow enough.
 *
 * CAVEAT: state lives in this process's memory. It resets on deploy and is not
 * shared between serverless instances, so a distributed attacker gets N x the
 * budget on an N-instance deployment. It raises the cost of the naive attack,
 * which is what it is for. Moving to Postgres or Upstash is the upgrade path if
 * this ever matters.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Drop expired entries so the map can't grow without bound. */
function sweep(now: number): void {
  if (buckets.size < 500) return;
  // forEach rather than for..of: the project's tsconfig sets no `target`, so it
  // defaults to ES5 and direct Map iteration would need --downlevelIteration.
  const expired: string[] = [];
  buckets.forEach((bucket, key) => {
    if (bucket.resetAt <= now) expired.push(key);
  });
  expired.forEach((key) => buckets.delete(key));
}

export type RateLimitResult = {
  allowed: boolean;
  /** Seconds until the window resets. Only meaningful when blocked. */
  retryAfter: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return {
      allowed: false,
      retryAfter: Math.ceil((existing.resetAt - now) / 1000),
    };
  }
  return { allowed: true, retryAfter: 0 };
}

/** Called after a successful login so a legitimate user isn't left throttled. */
export function clearRateLimit(key: string): void {
  buckets.delete(key);
}
