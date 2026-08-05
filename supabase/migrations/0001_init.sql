-- QuizStar — initial schema
--
-- Design notes
--  * No Supabase Auth. Influencer login is custom (handle + PIN), so every table
--    has RLS enabled with ZERO policies: anon/authenticated keys can read nothing.
--    All access goes through Next.js server code using the service_role key.
--  * Money columns are numeric(12,4) — exact decimal, 4 places for sub-cent ad revenue.
--  * "Credited once per session per quiz" is enforced by a partial unique index,
--    not by application logic, so refresh-spam cannot inflate earnings even if a
--    race slips past the app.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- helpers
-- ---------------------------------------------------------------------------

-- total_earnings is a lifetime counter: it may go up, never down.
create or replace function public.enforce_total_earnings_monotonic()
returns trigger
language plpgsql
as $$
begin
  if new.total_earnings < old.total_earnings then
    raise exception
      'total_earnings cannot decrease (% -> %) for influencer %',
      old.total_earnings, new.total_earnings, old.id;
  end if;
  return new;
end;
$$;

-- Validates one question: { text: string, options: [string x4], correct_index: 0|1|2|3 }
--
-- Written as a CASE rather than a chain of ANDs on purpose. A missing key makes
-- `jsonb_typeof(e -> 'key')` return NULL, and `NOT NULL` is NULL — which a WHERE
-- clause treats as "no match", so an AND chain would silently ACCEPT a question
-- with no `text`. CASE also guarantees ordered evaluation, so the array-shape
-- guards run before `jsonb_array_length`, which errors on a scalar.
create or replace function public.is_valid_question(e jsonb)
returns boolean
language sql
immutable
as $$
  select case
    when jsonb_typeof(e) is distinct from 'object'             then false
    when jsonb_typeof(e -> 'text') is distinct from 'string'   then false
    when length(btrim(e ->> 'text')) = 0                       then false
    when jsonb_typeof(e -> 'options') is distinct from 'array'  then false
    when jsonb_array_length(e -> 'options') <> 4                then false
    when exists (
           select 1 from jsonb_array_elements(e -> 'options') as o
           where jsonb_typeof(o) <> 'string' or length(btrim(o #>> '{}')) = 0
         )                                                      then false
    when jsonb_typeof(e -> 'correct_index') is distinct from 'number' then false
    when (e ->> 'correct_index')::numeric not in (0, 1, 2, 3)  then false
    else true
  end;
$$;

-- Validates the whole quizzes.questions payload.
create or replace function public.is_valid_questions(q jsonb)
returns boolean
language sql
immutable
as $$
  select case
    when jsonb_typeof(q) is distinct from 'array' then false
    else not exists (
      select 1 from jsonb_array_elements(q) as e
      where not public.is_valid_question(e)
    )
  end;
$$;

-- ---------------------------------------------------------------------------
-- influencers
-- ---------------------------------------------------------------------------

create table if not exists public.influencers (
  id                uuid         primary key default gen_random_uuid(),
  name              text         not null,
  -- stored normalised: lowercase, no leading '@'
  instagram_handle  text         not null unique,
  pin_hash          text         not null,
  -- lifetime gross credited to this influencer; monotonic (see trigger below)
  total_earnings    numeric(12,4) not null default 0,
  -- unpaid portion; reset to 0 when a payout is recorded
  current_balance   numeric(12,4) not null default 0,
  created_at        timestamptz  not null default now(),

  constraint influencers_name_not_blank
    check (length(btrim(name)) > 0),
  constraint influencers_handle_format
    check (instagram_handle ~ '^[a-z0-9._]{1,30}$'),
  constraint influencers_total_earnings_nonneg
    check (total_earnings >= 0),
  constraint influencers_current_balance_nonneg
    check (current_balance >= 0)
);

drop trigger if exists influencers_total_earnings_monotonic on public.influencers;
create trigger influencers_total_earnings_monotonic
  before update on public.influencers
  for each row
  execute function public.enforce_total_earnings_monotonic();

-- ---------------------------------------------------------------------------
-- quizzes
-- ---------------------------------------------------------------------------

create table if not exists public.quizzes (
  id             uuid        primary key default gen_random_uuid(),
  influencer_id  uuid        not null references public.influencers(id) on delete cascade,
  title          text        not null,
  slug           text        not null,
  -- [{ text, options: [4], correct_index }]
  questions      jsonb       not null default '[]'::jsonb,
  created_at     timestamptz not null default now(),

  constraint quizzes_title_not_blank
    check (length(btrim(title)) > 0),
  constraint quizzes_slug_format
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 60),
  constraint quizzes_questions_shape
    check (public.is_valid_questions(questions))
);

-- slug is unique per influencer, so /q/<handle>/<slug> resolves to exactly one quiz
create unique index if not exists quizzes_influencer_slug_key
  on public.quizzes (influencer_id, slug);

create index if not exists quizzes_influencer_created_idx
  on public.quizzes (influencer_id, created_at desc);

-- ---------------------------------------------------------------------------
-- analytics_logs
-- ---------------------------------------------------------------------------

create table if not exists public.analytics_logs (
  id                uuid          primary key default gen_random_uuid(),
  quiz_id           uuid          not null references public.quizzes(id) on delete cascade,
  -- denormalised from quizzes so earnings queries don't need a join
  influencer_id     uuid          not null references public.influencers(id) on delete cascade,
  session_id        text          not null,
  ip_address        inet,
  "timestamp"       timestamptz   not null default now(),
  -- gross simulated ad revenue for this page load
  simulated_revenue numeric(12,4) not null default 0,
  -- true only for the first load of a given (quiz, session); the influencer's 70% cut
  was_credited      boolean       not null default false,
  credited_amount   numeric(12,4) not null default 0,

  constraint analytics_logs_session_not_blank
    check (length(btrim(session_id)) > 0),
  constraint analytics_logs_revenue_nonneg
    check (simulated_revenue >= 0),
  constraint analytics_logs_credited_amount_nonneg
    check (credited_amount >= 0),
  -- an uncredited load must carry no credited amount
  constraint analytics_logs_credit_consistent
    check (was_credited or credited_amount = 0)
);

-- THE anti-refresh-spam guarantee: at most one credited row per (quiz, session).
-- Repeat loads still insert a log row, just with was_credited = false.
create unique index if not exists analytics_logs_credit_once_per_session
  on public.analytics_logs (quiz_id, session_id)
  where was_credited;

create index if not exists analytics_logs_influencer_ts_idx
  on public.analytics_logs (influencer_id, "timestamp" desc);

create index if not exists analytics_logs_quiz_ts_idx
  on public.analytics_logs (quiz_id, "timestamp" desc);

-- ---------------------------------------------------------------------------
-- payouts
-- ---------------------------------------------------------------------------

create table if not exists public.payouts (
  id             uuid          primary key default gen_random_uuid(),
  influencer_id  uuid          not null references public.influencers(id) on delete cascade,
  amount         numeric(12,4) not null,
  "timestamp"    timestamptz   not null default now(),

  constraint payouts_amount_positive check (amount > 0)
);

create index if not exists payouts_influencer_ts_idx
  on public.payouts (influencer_id, "timestamp" desc);

-- ---------------------------------------------------------------------------
-- lockdown: RLS on, no policies, no grants to the public API roles
-- ---------------------------------------------------------------------------

alter table public.influencers    enable row level security;
alter table public.quizzes        enable row level security;
alter table public.analytics_logs enable row level security;
alter table public.payouts        enable row level security;

-- Belt and braces: even if a policy is added by accident later, anon/authenticated
-- hold no table privileges. service_role bypasses RLS and keeps its grants.
revoke all on public.influencers, public.quizzes, public.analytics_logs, public.payouts
  from anon, authenticated;
