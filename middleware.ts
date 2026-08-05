import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/jwt";
import {
  PLAYER_SESSION_COOKIE,
  newPlayerSessionId,
} from "@/lib/quiz/player-session";

/**
 * Auth guard, plus session-id issuing for anonymous quiz players.
 *
 * Runs on the Edge runtime, so it imports lib/auth/jwt.ts (jose only) and never
 * touches bcrypt, Supabase, or `next/headers`. It verifies the token's
 * signature but does NOT confirm the influencer still exists — that costs a
 * database round trip on every request. Pages and actions call
 * `requireSession()` and read from the database anyway, so a deleted account
 * fails there.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public quiz pages: no auth to check, just make sure the visitor is
  // carrying a session id before the page can try to record a view.
  if (pathname.startsWith("/q/")) {
    const response = NextResponse.next();
    if (!request.cookies.get(PLAYER_SESSION_COOKIE)) {
      response.cookies.set(PLAYER_SESSION_COOKIE, newPlayerSessionId(), {
        httpOnly: true, // nothing in the browser needs to read it
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax", // survives the click-through from an Instagram Story
        path: "/",
        // No maxAge on purpose — see lib/quiz/player-session.ts.
      });
    }
    return response;
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (pathname.startsWith("/dashboard")) {
    if (session) return NextResponse.next();

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    // Send them back where they were headed once they're in.
    url.searchParams.set("next", pathname);

    const response = NextResponse.redirect(url);
    // Expired or tampered cookie: clear it so it stops being re-sent.
    if (token) response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  // Already signed in? No reason to see the login or signup form.
  if (session && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup", "/q/:path*"],
};
