import type { Metadata } from "next";
import Link from "next/link";
import { QuizBuilder } from "@/components/dashboard/QuizBuilder";
import { requireSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "New quiz — QuizStar",
};

export default async function NewQuizPage() {
  const session = await requireSession();

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-14">
      <Link
        href="/dashboard"
        className="nav-link font-pixel text-[9px] uppercase tracking-wider text-white/40 hover:text-white"
      >
        ← Dashboard
      </Link>

      <span className="font-pixel mt-8 block text-[10px] uppercase tracking-wider text-[#FF6A00]">
        // New quiz
      </span>
      <h1 className="mt-4 font-pixel text-xl leading-[1.5] text-white sm:text-2xl">
        Build it.
      </h1>
      <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/55">
        Four options per question, one right answer. When you publish, you get a
        link to drop in your Story.
      </p>

      <div className="mt-10">
        <QuizBuilder handle={session.handle} />
      </div>
    </main>
  );
}
