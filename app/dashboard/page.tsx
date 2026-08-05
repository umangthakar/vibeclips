import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EstimatedEarnings } from "@/components/dashboard/EstimatedEarnings";
import { ShareLink } from "@/components/dashboard/ShareLink";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/session";
import { formatDate, formatMoney } from "@/lib/format";
import { quizUrl } from "@/lib/quiz/slug";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Dashboard — QuizStar",
};

/** Window the live estimate extrapolates from. */
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Cap on rows read for the rate calculation. supabase-js can't SUM server-side
 * without an RPC, so this is a bounded read: past the cap the rate is
 * understated. Acceptable precisely because the number is labelled an estimate.
 */
const RATE_SAMPLE_LIMIT = 2000;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { created?: string };
}) {
  const session = await requireSession();
  const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();

  const [influencerResult, quizzesResult, creditedResult] = await Promise.all([
    supabaseAdmin()
      .from("influencers")
      .select("name, instagram_handle, total_earnings, current_balance")
      .eq("id", session.sub)
      .maybeSingle(),
    supabaseAdmin()
      .from("quizzes")
      .select("id, title, slug, questions, created_at")
      .eq("influencer_id", session.sub)
      .order("created_at", { ascending: false }),
    supabaseAdmin()
      .from("analytics_logs")
      .select("credited_amount")
      .eq("influencer_id", session.sub)
      .eq("was_credited", true)
      .gte("timestamp", since)
      .limit(RATE_SAMPLE_LIMIT),
  ]);

  const influencer = influencerResult.data;
  // The layout already redirects a valid token whose account is gone; this
  // repeat check is what convinces TypeScript, and costs nothing.
  if (!influencer) redirect("/logout");

  const quizzes = quizzesResult.data ?? [];

  const creditedLast24h = (creditedResult.data ?? []).reduce(
    (total, row) => total + Number(row.credited_amount),
    0
  );
  const perSecond = creditedLast24h / (RATE_WINDOW_MS / 1000);

  const justCreated = searchParams.created
    ? quizzes.find((quiz) => quiz.slug === searchParams.created)
    : undefined;

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-14">
      <span className="font-pixel text-[10px] uppercase tracking-wider text-[#FF6A00]">
        // Dashboard
      </span>
      <h1 className="mt-4 font-pixel text-xl leading-[1.5] text-white sm:text-2xl">
        Hey {influencer.name.split(" ")[0]}.
      </h1>
      <p className="mt-4 max-w-md text-white/55">
        You&apos;re logged in as{" "}
        <span className="text-white">@{influencer.instagram_handle}</span>.
      </p>

      {justCreated && (
        <div className="pixel-border-glow mt-10 bg-[#13131C] p-6 sm:p-7">
          <span className="font-pixel text-[9px] uppercase tracking-wider text-[#FF6A00]">
            Published
          </span>
          <p className="mt-3 text-sm text-white">
            &ldquo;{justCreated.title}&rdquo; is live. Drop this link in your
            Story:
          </p>
          <ShareLink
            url={quizUrl(influencer.instagram_handle, justCreated.slug)}
            className="mt-4 max-w-xl"
          />
        </div>
      )}

      {/* ------------------------------------------------------------ money */}
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="pixel-border bg-[#13131C] p-7">
          <span className="font-pixel text-[9px] uppercase tracking-wider text-white/50">
            Unpaid balance
          </span>
          <p className="mt-4 font-pixel text-2xl text-white tabular-nums">
            {formatMoney(influencer.current_balance)}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-white/40">
            Confirmed and waiting to be paid out.
          </p>
        </div>

        <div className="pixel-border bg-[#13131C] p-7">
          <span className="font-pixel text-[9px] uppercase tracking-wider text-white/50">
            Lifetime earnings
          </span>
          <p className="mt-4 font-pixel text-2xl text-white tabular-nums">
            {formatMoney(influencer.total_earnings)}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-white/40">
            Everything you&apos;ve ever earned, paid or not.
          </p>
        </div>

        <EstimatedEarnings
          baseline={Number(influencer.current_balance)}
          perSecond={perSecond}
        />
      </div>

      {/* ---------------------------------------------------------- quizzes */}
      <div className="mt-16 flex flex-wrap items-end justify-between gap-5">
        <div>
          <span className="font-pixel text-[10px] uppercase tracking-wider text-[#FF6A00]">
            // Your quizzes
          </span>
          <p className="mt-3 text-sm text-white/45">
            {quizzes.length === 0
              ? "Nothing here yet."
              : `${quizzes.length} published.`}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/new">+ New quiz</Link>
        </Button>
      </div>

      {quizzes.length === 0 ? (
        <div className="mt-8 border-2 border-dashed border-[rgba(123,47,255,0.4)] p-10 text-center">
          <p className="text-sm leading-relaxed text-white/45">
            Make your first quiz, share the link in your Story, and start
            earning from every play.
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-5 lg:grid-cols-2">
          {quizzes.map((quiz) => (
            <li key={quiz.id} className="pixel-border bg-[#13131C] p-7">
              <h2 className="font-pixel text-sm leading-[1.6] text-white">
                {quiz.title}
              </h2>
              <p className="mt-3 text-xs text-white/40">
                {quiz.questions.length}{" "}
                {quiz.questions.length === 1 ? "question" : "questions"} ·
                Created {formatDate(quiz.created_at)}
              </p>
              <ShareLink
                url={quizUrl(influencer.instagram_handle, quiz.slug)}
                className="mt-5"
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
