import "server-only";

import { headers } from "next/headers";

/**
 * The caller's IP, or null if it can't be determined or doesn't parse.
 *
 * Returning null rather than a raw header value matters: `analytics_logs.ip_address`
 * is Postgres `inet`, which rejects anything malformed with SQLSTATE 22P02. A
 * spoofed or proxy-mangled `x-forwarded-for` must not be able to fail an insert
 * and cost an influencer a revenue credit.
 */

const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

function isIpv4(value: string): boolean {
  const match = IPV4.exec(value);
  return (
    match !== null &&
    match.slice(1).every((octet) => {
      const n = Number(octet);
      return n <= 255 && String(n) === String(Number(octet));
    })
  );
}

/** Loose but safe: only hex groups and colons, and at least two colons. */
function isIpv6(value: string): boolean {
  return /^[0-9a-f:]+$/i.test(value) && value.includes("::")
    ? true
    : /^([0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}$/i.test(value);
}

function normalize(raw: string): string | null {
  let value = raw.trim();
  if (!value) return null;

  // "[::1]:443" -> "::1"
  const bracketed = /^\[(.+)\](?::\d+)?$/.exec(value);
  if (bracketed) value = bracketed[1];
  // "1.2.3.4:5678" -> "1.2.3.4"  (only when there's exactly one colon, so we
  // never truncate a bare IPv6 address)
  else if (value.split(":").length === 2) value = value.split(":")[0];

  if (isIpv4(value) || isIpv6(value)) return value;
  return null;
}

export function clientIp(): string | null {
  const h = headers();
  // x-forwarded-for is "client, proxy1, proxy2" — the client is first.
  const forwarded = h.get("x-forwarded-for")?.split(",")[0];
  return normalize(forwarded ?? "") ?? normalize(h.get("x-real-ip") ?? "");
}

/** Stable key for rate limiting when the IP is unknown. */
export function clientIpKey(): string {
  return clientIp() ?? "unknown";
}
