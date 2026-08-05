/**
 * Verifies the QuizStar Supabase setup:
 *   1. the secret key works, all four tables exist, and every expected column
 *      is present
 *   2. the public (publishable/anon) key can read NOTHING — the RLS lockdown holds
 *
 *   npm run db:check
 */
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !secretKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY.\n" +
      "Copy .env.example to .env.local and fill it in."
  );
  process.exit(1);
}

// Selecting these by name makes PostgREST 400 if any column is missing, so this
// validates the shape of the migration and not merely that a table exists.
const TABLES = {
  influencers:
    "id,name,instagram_handle,pin_hash,total_earnings,current_balance,created_at",
  quizzes: "id,influencer_id,title,slug,questions,created_at",
  analytics_logs:
    "id,quiz_id,influencer_id,session_id,ip_address,timestamp," +
    "simulated_revenue,was_credited,credited_amount",
  payouts: "id,influencer_id,amount,timestamp",
};

const options = {
  auth: { persistSession: false },
  // Node < 22 has no global WebSocket; supabase-js builds a Realtime client
  // regardless of whether we use it. Mirrors lib/supabase/admin.ts.
  realtime:
    typeof globalThis.WebSocket === "undefined" ? { transport: WebSocket } : {},
};

/** PostgREST: table absent from the schema cache. */
const MISSING_TABLE = "PGRST205";
/** Postgres: insufficient_privilege — what a correct lockdown produces. */
const NO_PRIVILEGE = "42501";

const pad = (s) => s.padEnd(15);
let failed = false;

// --- 1. schema ------------------------------------------------------------
// NOTE: no `head: true` here. A HEAD request has no response body, so
// supabase-js cannot surface PostgREST's error and a missing table comes back
// as {error: null, count: null} — a silent pass. Always fetch a body.
const admin = createClient(url, secretKey, options);

console.log("Schema (secret key):");
for (const [table, columns] of Object.entries(TABLES)) {
  const { error } = await admin.from(table).select(columns).limit(1);

  if (error) {
    const why =
      error.code === MISSING_TABLE ? "table missing" : "bad shape";
    console.error(`  FAIL  ${pad(table)} ${why} — ${error.message}`);
    failed = true;
  } else {
    console.log(`  ok    ${pad(table)} all columns present`);
  }
}

if (failed) {
  console.error(
    "\nRun supabase/migrations/0001_init.sql in the Supabase SQL editor,\n" +
      "then re-run this check."
  );
  process.exit(1);
}

// --- 2. RLS lockdown ------------------------------------------------------
// QuizStar uses no Supabase Auth: RLS is on with zero policies and the public
// roles have no grants. A public-key read must therefore fail with a privilege
// error. If one ever succeeds, a policy or grant has leaked in and quiz and
// earnings data is exposed to anyone who views source.
if (!publishableKey) {
  console.log(
    "\nRLS lockdown: SKIPPED (set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to test)."
  );
} else {
  const anon = createClient(url, publishableKey, options);
  console.log("\nRLS lockdown (public key must read nothing):");

  for (const table of Object.keys(TABLES)) {
    const { data, error } = await anon.from(table).select("*").limit(1);

    if (!error) {
      console.error(
        `  FAIL  ${pad(table)} readable by the public key ` +
          `(${data.length} row(s) returned)`
      );
      failed = true;
    } else if (error.code === NO_PRIVILEGE || error.code === MISSING_TABLE) {
      // MISSING_TABLE would mean the schema check above already passed while
      // this one sees no table — i.e. the two keys disagree. Never a pass.
      const verdict =
        error.code === NO_PRIVILEGE
          ? null
          : "inconclusive — public key cannot even see the table";
      if (verdict) {
        console.error(`  FAIL  ${pad(table)} ${verdict}`);
        failed = true;
      } else {
        console.log(`  ok    ${pad(table)} blocked (insufficient_privilege)`);
      }
    } else {
      console.error(
        `  FAIL  ${pad(table)} unexpected error ${error.code} — ${error.message}`
      );
      failed = true;
    }
  }
}

if (failed) {
  console.error("\nRLS lockdown is broken — do not ship.");
  process.exit(1);
}

console.log("\nSchema and lockdown both verified.");
