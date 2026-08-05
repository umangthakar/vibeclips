-- QuizStar — recording a quiz view, and paying for it
--
-- One function, because "log the view and credit the influencer" must be all
-- or nothing. Doing it as two round trips from Next.js leaves a window where a
-- crash between them either pays for a view that was never logged or logs a
-- view that was never paid.
--
-- It also settles the credit-once-per-session rule without a read-then-write
-- race. Rather than SELECT-ing for an existing credited row and then deciding,
-- it simply *tries* to take the one credited slot: the partial unique index
-- analytics_logs_credit_once_per_session is what says yes or no, and two
-- concurrent requests for the same (quiz, session) cannot both win.

-- The influencer's cut. Lives here, next to the other money rules (the
-- monotonic-earnings trigger, the credit-once index), rather than in
-- application code that could disagree with them.
create or replace function public.influencer_share()
returns numeric
language sql
immutable
as $$
  select 0.70::numeric;
$$;

create or replace function public.record_quiz_view(
  p_quiz_id    uuid,
  p_session_id text,
  p_ip         inet,
  p_revenue    numeric
)
returns table (credited boolean, amount numeric)
language plpgsql
as $$
declare
  v_influencer uuid;
  v_credit     numeric(12,4);
begin
  select influencer_id into v_influencer
    from public.quizzes
   where id = p_quiz_id;

  if v_influencer is null then
    raise exception 'unknown quiz %', p_quiz_id
      using errcode = 'foreign_key_violation';
  end if;

  v_credit := round(p_revenue * public.influencer_share(), 4);

  begin
    -- The block is a subtransaction: if the insert loses the race for the
    -- credited slot, the UPDATE below never runs and nothing here persists.
    insert into public.analytics_logs (
      quiz_id, influencer_id, session_id, ip_address,
      simulated_revenue, was_credited, credited_amount
    )
    values (
      p_quiz_id, v_influencer, p_session_id, p_ip,
      p_revenue, true, v_credit
    );

    update public.influencers
       set total_earnings  = total_earnings  + v_credit,
           current_balance = current_balance + v_credit
     where id = v_influencer;

    return query select true, v_credit;

  exception when unique_violation then
    -- This session already got paid for this quiz. The view is still real and
    -- still worth logging — it just earns nothing.
    insert into public.analytics_logs (
      quiz_id, influencer_id, session_id, ip_address,
      simulated_revenue, was_credited, credited_amount
    )
    values (
      p_quiz_id, v_influencer, p_session_id, p_ip,
      p_revenue, false, 0
    );

    return query select false, 0::numeric;
  end;
end;
$$;

-- Same lockdown as the tables in 0001: functions are EXECUTE-able by PUBLIC by
-- default, and this one writes money. Only the server's secret key may call it.
revoke all on function public.record_quiz_view(uuid, text, inet, numeric)
  from public, anon, authenticated;
grant execute on function public.record_quiz_view(uuid, text, inet, numeric)
  to service_role;
