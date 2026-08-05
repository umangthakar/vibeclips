import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { QuizPlayer } from "@/components/player/QuizPlayer";
import { ViewTracker } from "@/components/player/ViewTracker";
import { normalizeHandle } from "@/lib/auth/handle";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { QuizQuestion } from "@/lib/supabase/types";

/**
 * The public quiz. No auth, no signup — a follower taps through from a Story.
 *
 * Rendered per request rather than cached: the influencer can edit a quiz, and
 * a stale copy would show the wrong questions to everyone who followed the
 * link. The view itself is recorded by <ViewTracker/> after mount, not here —
 * see app/actions/view.ts for why.
 */
export const dynamic = "force-dynamic";

type Params = { params: { handle: string; slug: string } };

type LoadedQuiz = {
  id: string;
  title: string;
  questions: QuizQuestion[];
  name: string;
  handle: string;
};

/**
 * generateMetadata and the page both need the quiz. React's cache() collapses
 * that into one set of queries per request instead of two.
 */
const loadQuiz = cache(async function loadQuiz(
  rawHandle: string,
  slug: string
): Promise<LoadedQuiz | null> {
  const handle = normalizeHandle(decodeURIComponent(rawHandle));
  if (!handle) return null;

  const { data: influencer } = await supabaseAdmin()
    .from("influencers")
    .select("id, name, instagram_handle")
    .eq("instagram_handle", handle)
    .maybeSingle();

  if (!influencer) return null;

  // Slugs are unique per influencer, so this pair identifies one quiz.
  const { data: quiz } = await supabaseAdmin()
    .from("quizzes")
    .select("id, title, questions")
    .eq("influencer_id", influencer.id)
    .eq("slug", slug)
    .maybeSingle();

  if (!quiz) return null;

  return {
    id: quiz.id,
    title: quiz.title,
    questions: quiz.questions,
    name: influencer.name,
    handle: influencer.instagram_handle,
  };
});

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const quiz = await loadQuiz(params.handle, params.slug);
  if (!quiz) return { title: "Quiz not found — QuizStar" };

  const title = `${quiz.title} — a quiz by @${quiz.handle}`;
  const description = `${quiz.questions.length} questions. How well do you know ${quiz.name}?`;

  // This link gets pasted into an Instagram Story, so the unfurl matters.
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function QuizPage({ params }: Params) {
  const quiz = await loadQuiz(params.handle, params.slug);
  if (!quiz) notFound();

  // A quiz with no questions can't be played. The builder won't create one,
  // but the column defaults to '[]' so the shape is technically reachable.
  if (quiz.questions.length === 0) notFound();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-8">
      <ViewTracker quizId={quiz.id} />

      <Link href="/" className="flex items-center justify-center gap-2">
        <Image
          src="/logo.png"
          alt="QuizStar"
          width={24}
          height={24}
          className="h-6 w-6"
        />
        <span className="font-pixel text-[10px] text-white/70">QuizStar</span>
      </Link>

      <header className="mt-10 text-center">
        <h1 className="font-pixel text-lg leading-[1.6] text-white">
          {quiz.title}
        </h1>
        <p className="mt-3 text-xs text-white/45">
          by <span className="text-white/70">@{quiz.handle}</span>
        </p>
      </header>

      {/* Above the first question. The only slot shown while playing — more
          would slow the page down and get in the way of the quiz itself. */}
      <div className="mt-8">
        <AdSlot size="leaderboard" label="728 × 90" />
      </div>

      <div className="mt-10 flex-1">
        <QuizPlayer
          questions={quiz.questions}
          // Server-rendered here, displayed by the player only once the
          // scorecard is up — so nothing loads mid-quiz.
          scoreAd={<AdSlot size="rectangle" label="300 × 250" />}
        />
      </div>

      <footer className="mt-12 text-center text-[10px] leading-relaxed text-white/25">
        Made with QuizStar. Ad slots are placeholders — no real ads are served.
      </footer>
    </main>
  );
}
