import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signSession,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/auth/jwt";

export type { SessionPayload };

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true, // not readable from JS — blocks XSS session theft
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // survives the click-through from an Instagram Story
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  return verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
}

export function destroySession(): void {
  cookies().delete(SESSION_COOKIE);
}

/**
 * For pages and actions that must have a logged-in influencer.
 *
 * Middleware already guards /dashboard, but middleware can be bypassed by
 * subrequest quirks and does not run for Server Actions, so anything that reads
 * or writes influencer data calls this too.
 */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
