/**
 * Instagram handle normalisation. Shared by client and server, so no imports.
 *
 * The database enforces `^[a-z0-9._]{1,30}$` (see the influencers_handle_format
 * check constraint) — this mirrors it so users get a readable message instead of
 * a constraint violation.
 */

export const HANDLE_PATTERN = /^[a-z0-9._]{1,30}$/;

/** `  @Foo.Bar ` -> `foo.bar`. Idempotent. */
export function normalizeHandle(raw: string): string {
  return raw.trim().toLowerCase().replace(/^@+/, "");
}

/** Human-readable reason the handle is unusable, or null if it's fine. */
export function handleError(normalized: string): string | null {
  if (!normalized) return "Enter your Instagram handle.";
  if (normalized.length > 30) return "Handles are at most 30 characters.";
  if (!HANDLE_PATTERN.test(normalized)) {
    return "Only letters, numbers, dots and underscores.";
  }
  return null;
}
