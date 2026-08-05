"use client";

import { useEffect } from "react";
import { recordQuizViewAction } from "@/app/actions/view";

/**
 * Reports the page view exactly once per browser page load.
 *
 * The guard is module-level rather than a ref because React's StrictMode
 * remounts every component in development, which would otherwise log two views
 * for one visit. (The credited one would still be a single row — the database
 * index sees to that — but the second, uncredited row would be noise in the
 * analytics.)
 */
const reported = new Set<string>();

export function ViewTracker({ quizId }: { quizId: string }) {
  useEffect(() => {
    if (reported.has(quizId)) return;
    reported.add(quizId);

    // Nothing on screen depends on the outcome; a failure here must never
    // break the quiz for the player.
    void recordQuizViewAction(quizId).catch(() => {});
  }, [quizId]);

  return null;
}
