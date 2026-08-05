/**
 * The anonymous player's session id.
 *
 * Players never sign up, so this cookie is the only thing that distinguishes
 * "the same person refreshing" from "a new visitor" — it is what
 * analytics_logs.session_id records, and therefore what the credit-once rule
 * is enforced against.
 *
 * Deliberately a **session cookie**: no Max-Age, so it dies with the browser.
 * That is the behaviour the product wants. Refreshing the quiz twenty times
 * earns the influencer nothing, but a follower who comes back tomorrow is a
 * genuinely new view and pays again. A persistent cookie would silently turn
 * "once per session" into "once, ever".
 *
 * No `server-only` here: middleware imports it and runs on the Edge runtime.
 */

export const PLAYER_SESSION_COOKIE = "quizstar_play";

/** Available on the Edge runtime, in Node 19+, and in every target browser. */
export function newPlayerSessionId(): string {
  return crypto.randomUUID();
}
