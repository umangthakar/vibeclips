import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/jwt";

/**
 * Clears the session cookie and bounces to /login.
 *
 * Exists for one case the logout Server Action can't cover: a signed, unexpired
 * token whose influencer row is gone. A layout can't delete cookies during
 * render, and redirecting it straight to /login would ping-pong forever —
 * middleware sees a valid token on /login and sends it back to /dashboard.
 * Route handlers *can* set cookies, so the loop is broken here.
 */
export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
