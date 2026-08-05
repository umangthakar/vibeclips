/**
 * Slug generation for shareable quiz links.
 *
 * Runs on both sides — the builder previews the link as you type, the create
 * action produces the real one — so nothing here may import server-only code.
 *
 * The database enforces `^[a-z0-9]+(-[a-z0-9]+)*$` with length <= 60 (the
 * quizzes_slug_format constraint). Everything below exists to *guarantee* that
 * shape rather than discover it at insert time.
 */

export const SLUG_MAX_LENGTH = 60;

/** Used when a title has no usable characters at all (e.g. all emoji). */
const FALLBACK_SLUG = "quiz";

/** Cut to `max`, then drop any hyphen left dangling at the end. */
function truncate(slug: string, max: number): string {
  if (slug.length <= max) return slug;
  return slug.slice(0, max).replace(/-+$/, "") || FALLBACK_SLUG;
}

/** `"  Café Trivia!! "` -> `"cafe-trivia"`. Always returns a valid slug. */
export function slugify(raw: string): string {
  const slug = raw
    // NFKD splits "é" into "e" + a combining accent, which the next line strips.
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug ? truncate(slug, SLUG_MAX_LENGTH) : FALLBACK_SLUG;
}

/**
 * First free slug in the series `base`, `base-2`, `base-3`, …
 *
 * `taken` holds the slugs already used by THIS influencer — slugs are unique
 * per influencer (quizzes_influencer_slug_key), so two people can each own
 * /q/<handle>/movie-trivia.
 */
export function uniqueSlug(base: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  if (!used.has(base)) return base;

  for (let n = 2; n < 1000; n++) {
    const suffix = `-${n}`;
    // Trim the base rather than the suffix, so the result still fits in 60.
    const candidate = truncate(base, SLUG_MAX_LENGTH - suffix.length) + suffix;
    if (!used.has(candidate)) return candidate;
  }

  // 999 quizzes with the same title. Effectively unreachable, but returning
  // something valid beats looping forever or throwing at the user.
  const random = Math.random().toString(36).slice(2, 8);
  return `${truncate(base, SLUG_MAX_LENGTH - random.length - 1)}-${random}`;
}

/** Path a player visits. The page itself lands in the next phase. */
export function quizPath(handle: string, slug: string): string {
  return `/q/${handle}/${slug}`;
}

/**
 * Absolute share URL when NEXT_PUBLIC_SITE_URL is configured, otherwise the
 * bare path — callers in the browser resolve that against window.location.
 * Kept out of render-time browser lookups so server and client HTML agree.
 */
export function quizUrl(handle: string, slug: string): string {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");
  return `${origin}${quizPath(handle, slug)}`;
}
