# Supabase setup

## 1. Credentials

Copy `.env.example` to `.env.local` in the repo root and fill in:

| Variable                               | Where to find it                                          |
| -------------------------------------- | --------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Dashboard → Settings → Data API → Project URL             |
| `SUPABASE_SECRET_KEY`                  | Dashboard → Settings → API Keys → secret key (`sb_secret_…`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Dashboard → Settings → API Keys → publishable key         |

`.env.local` is already gitignored.

The secret key bypasses RLS and is the only key app code uses. On older projects
that still show `anon` / `service_role` JWTs, hit **Create new API keys** on that
page; `SUPABASE_SERVICE_ROLE_KEY` is also accepted as a fallback.

The publishable key is **not used by any app code** — QuizStar has no browser-side
Supabase client. It's in `.env.local` purely so `npm run db:check` can prove the
public key can't read a thing. See "Why no Supabase Auth" below.

## 2. Apply the schema

Open the Supabase dashboard → **SQL Editor** → New query, and run each file in
`migrations/` in order:

| File | What it adds |
| ---- | ------------ |
| `0001_init.sql` | The four tables, constraints, indexes and the RLS lockdown |
| `0002_record_quiz_view.sql` | `record_quiz_view()` — logs a view and credits the influencer, atomically |

Both are idempotent, so re-running either is safe.

<details>
<summary>Or with the Supabase CLI</summary>

```bash
npx supabase link --project-ref <your-ref>
npx supabase db push
```

</details>

## 3. Verify

```bash
npm run db:check
```

Checks every column of the four tables, asserts the publishable key is blocked
from reading all of them, and probes `record_quiz_view()` with a quiz id that
cannot exist — proving the function is installed and that the public key cannot
call it, without writing a row.

## Why no Supabase Auth (and no public-key access)

Influencer login is a custom handle + PIN flow, and quiz players never sign up at
all. There are no Supabase user sessions, so there is nothing for RLS policies to
key off.

Instead: **RLS is enabled on every table with zero policies**, and `anon` /
`authenticated` have their table grants revoked. The publishable key maps to the
`anon` role, so it can read and write nothing. Every query runs server-side
through `lib/supabase/admin.ts` using the secret key, behind our own
authorisation checks. `npm run db:check` verifies this holds.

## Schema notes

**`influencers`** — `instagram_handle` is stored normalised (lowercase, no leading
`@`) and is unique. `total_earnings` is a lifetime counter guarded by the
`influencers_total_earnings_monotonic` trigger, which raises if an update tries to
lower it. `current_balance` is the unpaid portion and drops to 0 on payout.

**`quizzes`** — `(influencer_id, slug)` is unique, so a slug only has to be unique
within one influencer's quizzes. `questions` is validated in the database by
`is_valid_questions()`: an array of `{ text, options[4], correct_index: 0..3 }`.
Malformed question JSON is rejected at insert time.

**`analytics_logs`** — every page load inserts a row. The partial unique index
`analytics_logs_credit_once_per_session` on `(quiz_id, session_id) WHERE
was_credited` is what makes revenue credit-once-per-session: a second credited
insert for the same session and quiz fails with a unique violation, so
refresh-spam can only ever add `was_credited = false` rows. This is enforced by
the database, not by application logic, so it holds under concurrent requests too.

**`record_quiz_view()`** — the only thing that writes earnings. It logs the view
and moves the money in one transaction, and instead of checking for an existing
credited row it just *tries* to insert one: the partial unique index above is
what grants or denies the credit, so two simultaneous requests for the same
session can't both be paid. Losing that race is caught and downgraded to an
uncredited log row. The influencer's 70% cut is `influencer_share()`, kept in
the database next to the other money rules rather than in application code.

**`payouts`** — append-only ledger of manual payouts. Recording one is what resets
`current_balance`; `total_earnings` is untouched.

Money columns are `numeric(12,4)` — exact decimal with four places, so fractions
of a cent of simulated ad revenue accumulate without float drift.
