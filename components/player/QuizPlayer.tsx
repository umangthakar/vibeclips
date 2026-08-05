"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { QuizQuestion } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const LABELS = ["A", "B", "C", "D"];

const CORRECT = "#3DFF88";
const WRONG = "#FF4D4D";

/**
 * Plays a quiz one question at a time, grading on tap.
 *
 * Grading is client-side by design, which means `correct_index` ships to the
 * browser and a determined player could read it out of the page source. That's
 * the accepted trade for instant feedback with no round trip — these are
 * Instagram Story quizzes, not exams, and nothing about the score touches
 * money or the database.
 */
export function QuizPlayer({ questions }: { questions: QuizQuestion[] }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const revealed = picked !== null;

  function choose(option: number) {
    if (revealed) return;
    setPicked(option);
    if (option === question.correct_index) setScore((current) => current + 1);
  }

  function advance() {
    if (isLast) {
      setFinished(true);
      return;
    }
    setIndex((current) => current + 1);
    setPicked(null);
  }

  function restart() {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    return <Scorecard score={score} total={questions.length} onReplay={restart} />;
  }

  return (
    <div>
      {/* --------------------------------------------------------- progress */}
      <div className="flex items-center justify-between gap-4">
        <span className="font-pixel text-[9px] uppercase tracking-wider text-white/45">
          Question {index + 1} of {questions.length}
        </span>
        <span className="font-pixel text-[9px] uppercase tracking-wider text-white/45">
          {score} correct
        </span>
      </div>
      <div className="mt-3 h-[6px] w-full bg-white/10">
        <div
          className="bg-grad h-full transition-[width] duration-300"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* --------------------------------------------------------- question */}
      <h2 className="mt-8 font-pixel text-base leading-[1.7] text-white sm:text-lg">
        {question.text}
      </h2>

      <div className="mt-7 space-y-3">
        {question.options.map((option, optionIndex) => {
          const isAnswer = optionIndex === question.correct_index;
          const isPick = optionIndex === picked;

          return (
            <button
              key={optionIndex}
              type="button"
              onClick={() => choose(optionIndex)}
              disabled={revealed}
              aria-label={`Option ${LABELS[optionIndex]}: ${option}`}
              className={cn(
                "flex w-full items-center gap-4 border-2 px-4 py-4 text-left transition-colors",
                "min-h-[60px] disabled:cursor-default",
                !revealed &&
                  "border-dashed border-[rgba(123,47,255,0.45)] hover:border-[#7B2FFF] hover:bg-white/5 active:bg-white/10",
                revealed && isAnswer && "border-solid bg-[#3DFF88]/10",
                revealed && isPick && !isAnswer && "border-solid bg-[#FF4D4D]/10",
                revealed &&
                  !isAnswer &&
                  !isPick &&
                  "border-dashed border-white/10 opacity-40"
              )}
              style={
                revealed && isAnswer
                  ? { borderColor: CORRECT }
                  : revealed && isPick
                    ? { borderColor: WRONG }
                    : undefined
              }
            >
              <span
                className="font-pixel flex h-8 w-8 shrink-0 items-center justify-center border-2 border-dashed border-current text-[10px]"
                style={{
                  color: revealed
                    ? isAnswer
                      ? CORRECT
                      : isPick
                        ? WRONG
                        : undefined
                    : undefined,
                }}
              >
                {LABELS[optionIndex]}
              </span>
              <span className="text-sm leading-relaxed text-white sm:text-base">
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {/* ----------------------------------------------------------- verdict */}
      <div aria-live="polite" className="mt-7 min-h-[92px]">
        {revealed && (
          <>
            <p
              className="font-pixel text-xs"
              style={{
                color: picked === question.correct_index ? CORRECT : WRONG,
              }}
            >
              {picked === question.correct_index ? "Correct!" : "Not quite."}
            </p>
            <div className="mt-4">
              <Button type="button" onClick={advance} className="w-full sm:w-auto">
                {isLast ? "See your score" : "Next question"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function verdict(score: number, total: number): string {
  const share = score / total;
  if (share === 1) return "Flawless. Certified superfan.";
  if (share >= 0.7) return "Pretty solid. You've been paying attention.";
  if (share >= 0.4) return "Not bad. Room to improve.";
  return "Ouch. Time to catch up on the Stories.";
}

function Scorecard({
  score,
  total,
  onReplay,
}: {
  score: number;
  total: number;
  onReplay: () => void;
}) {
  return (
    <div className="text-center">
      <span className="font-pixel text-[10px] uppercase tracking-wider text-[#FF6A00]">
        // Your score
      </span>

      <p className="text-grad mt-6 font-pixel text-4xl leading-none">
        {score}/{total}
      </p>

      <p className="mt-6 text-sm leading-relaxed text-white/60">
        {verdict(score, total)}
      </p>

      <div className="mt-10 flex flex-col items-center gap-4">
        <Button asChild className="w-full sm:w-auto">
          <Link href="/signup">Make your own quiz</Link>
        </Button>
        <button
          type="button"
          onClick={onReplay}
          className="nav-link font-pixel text-[9px] uppercase tracking-wider text-white/45 hover:text-white"
        >
          Play again
        </button>
      </div>
    </div>
  );
}
