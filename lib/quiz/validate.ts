/**
 * Quiz validation, shared verbatim by the builder and the create action.
 *
 * The client copy exists for fast feedback; the server copy is the one that
 * counts. A Server Action is a public HTTP endpoint — nothing stops a caller
 * posting straight to it — so the server always re-runs this, and the database
 * re-checks the shape a third time via is_valid_questions().
 *
 * No server-only imports here: this file is bundled into the browser.
 */

import type { QuizQuestion } from "@/lib/supabase/types";

export const OPTION_COUNT = 4;
export const MIN_QUESTIONS = 1;
export const MAX_QUESTIONS = 10;
export const TITLE_MAX = 80;
export const QUESTION_TEXT_MAX = 200;
export const OPTION_TEXT_MAX = 100;

/** What the form holds: raw strings, and no correct answer picked yet. */
export type DraftQuestion = {
  text: string;
  options: string[];
  correctIndex: number | null;
};

export type QuizDraft = {
  title: string;
  questions: DraftQuestion[];
};

export type QuestionErrors = {
  text?: string;
  /** Sparse, indexed to match `options`. */
  options?: (string | undefined)[];
  correctIndex?: string;
};

export type QuizErrors = {
  /** Whole-form problem: too many questions, database refused the insert, … */
  form?: string;
  title?: string;
  /** Indexed to match `questions`; an entry is `{}` when that question is fine. */
  questions?: QuestionErrors[];
};

export type QuizValidation =
  | { ok: true; title: string; questions: QuizQuestion[] }
  | { ok: false; errors: QuizErrors };

export function emptyQuestion(): DraftQuestion {
  return {
    text: "",
    options: Array.from({ length: OPTION_COUNT }, () => ""),
    correctIndex: null,
  };
}

/** True when any field in the tree is set. */
export function hasErrors(errors: QuizErrors): boolean {
  if (errors.form || errors.title) return true;
  return (errors.questions ?? []).some(
    (q) => q.text || q.correctIndex || (q.options ?? []).some(Boolean)
  );
}

function validateQuestion(question: DraftQuestion): QuestionErrors {
  const errors: QuestionErrors = {};

  const text = question.text.trim();
  if (!text) errors.text = "Write the question.";
  else if (text.length > QUESTION_TEXT_MAX) {
    errors.text = `Keep it under ${QUESTION_TEXT_MAX} characters.`;
  }

  const optionErrors: (string | undefined)[] = [];
  for (let i = 0; i < OPTION_COUNT; i++) {
    const option = (question.options[i] ?? "").trim();
    if (!option) optionErrors[i] = "Fill this in.";
    else if (option.length > OPTION_TEXT_MAX) {
      optionErrors[i] = `Max ${OPTION_TEXT_MAX} characters.`;
    }
  }
  if (optionErrors.some(Boolean)) errors.options = optionErrors;

  const { correctIndex } = question;
  if (correctIndex === null) {
    errors.correctIndex = "Mark the correct answer.";
  } else if (
    !Number.isInteger(correctIndex) ||
    correctIndex < 0 ||
    correctIndex >= OPTION_COUNT
  ) {
    errors.correctIndex = "Mark the correct answer.";
  }

  return errors;
}

/**
 * Validates and normalises a draft. On success the questions come back trimmed
 * and in the exact shape the `questions` column stores.
 */
export function validateQuiz(draft: QuizDraft): QuizValidation {
  const errors: QuizErrors = {};

  const title = draft.title.trim();
  if (!title) errors.title = "Give your quiz a title.";
  else if (title.length > TITLE_MAX) {
    errors.title = `Keep it under ${TITLE_MAX} characters.`;
  }

  if (draft.questions.length < MIN_QUESTIONS) {
    errors.form = "Add at least one question.";
  } else if (draft.questions.length > MAX_QUESTIONS) {
    errors.form = `That's more than ${MAX_QUESTIONS} questions — trim it down.`;
  }

  const questionErrors = draft.questions.map(validateQuestion);
  if (questionErrors.some((q) => Object.keys(q).length > 0)) {
    errors.questions = questionErrors;
  }

  if (hasErrors(errors)) return { ok: false, errors };

  const questions: QuizQuestion[] = draft.questions.map((question) => ({
    text: question.text.trim(),
    // Widths and the index range were both just checked above; the casts only
    // tell TypeScript what the checks already guarantee.
    options: question.options
      .slice(0, OPTION_COUNT)
      .map((option) => option.trim()) as QuizQuestion["options"],
    correct_index: question.correctIndex as QuizQuestion["correct_index"],
  }));

  return { ok: true, title, questions };
}
