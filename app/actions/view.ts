"use server";

import { cookies } from "next/headers";
import { clientIp } from "@/lib/request-ip";
import { PLAYER_SESSION_COOKIE } from "@/lib/quiz/player-session";
import { randomRevenue } from "@/lib/quiz/revenue";
import { supabaseAdmin } from "@/lib/supabase/admin";

/** Postgres would reject a malformed uuid with 22P02; cheaper to catch here. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ViewResult = {
  /** Whether a row reached analytics_logs at all. */
  logged: boolean;
  /** Whether this view earned the influencer anything. */
  credited: boolean;
};

const NOT_LOGGED: ViewResult = { logged: false, credited: false };

/**
 * Records one quiz view and pays for it if it's the session's first.
 *
 * Fired from the browser after the page mounts rather than during the server
 * render, deliberately: a render-time side effect would also fire for link
 * prefetches, RSC re-renders and crawlers, none of which are a human looking
 * at an ad. Requiring a real browser to execute this is the closest thing to
 * "someone actually loaded the page".
 *
 * The revenue figure is generated here, on the server. It is never accepted
 * from the caller — otherwise anyone could post themselves a fortune.
 *
 * `quizId` *is* caller-supplied, but that grants nothing a normal visit
 * doesn't: the credit-once-per-session index means a scripted caller still
 * earns exactly one credit per session cookie, same as a real viewer.
 */
export async function recordQuizViewAction(
  quizId: string
): Promise<ViewResult> {
  if (!UUID.test(quizId)) return NOT_LOGGED;

  const sessionId = cookies().get(PLAYER_SESSION_COOKIE)?.value;
  // Middleware issues this on the way in. Missing means cookies are blocked —
  // and without a session id there is no way to honour "credit once per
  // session", so the safe answer is to record nothing rather than pay out.
  if (!sessionId) return NOT_LOGGED;

  const { data, error } = await supabaseAdmin().rpc("record_quiz_view", {
    p_quiz_id: quizId,
    p_session_id: sessionId,
    p_ip: clientIp(),
    p_revenue: randomRevenue(),
  });

  if (error) {
    // Nothing on screen depends on this, so the player sees no difference —
    // which is exactly why a failure has to be loud on the server. A silent
    // return here means views stop earning and nobody finds out.
    console.error("record_quiz_view failed", {
      quizId,
      code: error.code,
      message: error.message,
    });
    return NOT_LOGGED;
  }

  return { logged: true, credited: data?.[0]?.credited ?? false };
}
