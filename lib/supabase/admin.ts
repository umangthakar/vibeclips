import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import WebSocketImpl from "ws";
import type { Database } from "@/lib/supabase/types";

/**
 * Service-role Supabase client.
 *
 * QuizStar does not use Supabase Auth — influencer login is a custom handle+PIN
 * flow — so every table has RLS enabled with no policies. That means the anon key
 * can read nothing, and ALL database access must happen here, on the server,
 * behind our own authorisation checks.
 *
 * Never import this file from a Client Component; `server-only` will fail the
 * build if you do.
 */

export type QuizStarClient = SupabaseClient<Database>;

let client: QuizStarClient | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and fill it in.`
    );
  }
  return value;
}

/**
 * `sb_secret_...` is the current Supabase secret key; `service_role` is the
 * legacy JWT it replaces. Accept either so an older project still works.
 */
function requireSecretKey(): string {
  const value =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) {
    throw new Error(
      "Missing SUPABASE_SECRET_KEY. Get it from the Supabase dashboard under " +
        "Settings -> API Keys -> secret key, and add it to .env.local."
    );
  }
  return value;
}

/** Lazily-created singleton so we don't open a client per request. */
export function supabaseAdmin(): QuizStarClient {
  if (!client) {
    client = createClient<Database>(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireSecretKey(),
      {
        auth: {
          // No user sessions: nothing to persist, refresh, or read back from a URL.
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
        realtime: {
          // supabase-js builds a Realtime client eagerly even though we never
          // use it, and that throws on Node < 22, which has no global
          // WebSocket. Hand it `ws` when the runtime lacks its own.
          ...(typeof globalThis.WebSocket === "undefined"
            ? { transport: WebSocketImpl as never }
            : {}),
        },
      }
    );
  }
  return client;
}
