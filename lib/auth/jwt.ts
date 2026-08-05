/**
 * Session token signing/verification.
 *
 * Deliberately free of `server-only` and of any Node built-in: middleware runs
 * on the Edge runtime and imports this. Cookie handling lives in session.ts,
 * which is server-only.
 */
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "quizstar_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const ALG = "HS256";

export type SessionPayload = {
  /** influencers.id */
  sub: string;
  handle: string;
  name: string;
};

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error(
      "AUTH_SECRET is missing or too short (need >= 32 chars). Generate one with:\n" +
        "  node -e \"console.log(require('crypto').randomBytes(32).toString('base64url'))\""
    );
  }
  return new TextEncoder().encode(value);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ handle: payload.handle, name: payload.name })
    .setProtectedHeader({ alg: ALG })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());
}

/** Returns null for a missing, malformed, tampered, or expired token. */
export async function verifySessionToken(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: [ALG] });
    if (typeof payload.sub !== "string" || !payload.sub) return null;
    return {
      sub: payload.sub,
      handle: typeof payload.handle === "string" ? payload.handle : "",
      name: typeof payload.name === "string" ? payload.name : "",
    };
  } catch {
    return null;
  }
}
