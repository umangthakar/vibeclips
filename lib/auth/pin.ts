import "server-only";

import bcrypt from "bcryptjs";

/**
 * PIN hashing.
 *
 * A 4-6 digit PIN has at most 1,000,000 possible values. bcrypt's work factor is
 * the only thing standing between a leaked `pin_hash` column and a full recovery
 * of every PIN, so the cost is set deliberately high and login is rate limited
 * (see rate-limit.ts). Cost 12 is ~250ms per attempt on typical hardware, which
 * is fine for a login that happens once a month and painful for an attacker.
 */
const COST = 12;

export const PIN_PATTERN = /^\d{4,6}$/;

/**
 * A hash of a value nobody knows, compared against when the handle doesn't
 * exist. Without this, "no such handle" returns in ~0ms while a wrong PIN takes
 * ~250ms, and that gap tells an attacker which handles are registered.
 */
const DUMMY_HASH =
  "$2b$12$Jk3Znqou7GlTmHjFDOaWS.A.7dEr4sdDYWvmAhqRlmuutl35YVNX2";

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, COST);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

/** Burn the same time as a real check, then fail. */
export async function fakeVerifyPin(pin: string): Promise<false> {
  await bcrypt.compare(pin, DUMMY_HASH);
  return false;
}

export function pinError(pin: string): string | null {
  if (!pin) return "Enter a PIN.";
  if (!PIN_PATTERN.test(pin)) return "PIN must be 4-6 digits.";
  return null;
}
