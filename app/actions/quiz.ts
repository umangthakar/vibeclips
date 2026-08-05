"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { slugify, uniqueSlug } from "@/lib/quiz/slug";
import {
  OPTION_COUNT,
  validateQuiz,
  type DraftQuestion,
  type QuizDraft,
  type QuizErrors,
} from "@/lib/quiz/validate";

const UNIQUE_VIOLATION = "23505";

export type CreateQuizState = {
  errors?: QuizErrors;
};

/**
 * Reads the flat, index-addressed field names the builder posts:
 *   title
 *   question-<i>-text
 *   question-<i>-option-<j>
 *   question-<i>-correct   (value = the chosen option index)
 *
 * Indices are discovered from the payload rather than assumed, so a form with
 * gaps or extra questions is *seen* — validateQuiz() then rejects an oversized
 * one instead of this silently truncating it.
 */
function parseDraft(formData: FormData): QuizDraft {
  const indices = new Set<number>();
  formData.forEach((_value, key) => {
    const match = /^question-(\d+)-text$/.exec(key);
    if (match) indices.add(Number(match[1]));
  });

  const questions: DraftQuestion[] = Array.from(indices)
    .sort((a, b) => a - b)
    .map((i) => ({
      text: String(formData.get(`question-${i}-text`) ?? ""),
      options: Array.from({ length: OPTION_COUNT }, (_, j) =>
        String(formData.get(`question-${i}-option-${j}`) ?? "")
      ),
      correctIndex: toOptionIndex(formData.get(`question-${i}-correct`)),
    }));

  return { title: String(formData.get("title") ?? ""), questions };
}

/** null for anything that isn't one of the four valid option positions. */
function toOptionIndex(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string" || raw === "") return null;
  const index = Number(raw);
  return Number.isInteger(index) && index >= 0 && index < OPTION_COUNT
    ? index
    : null;
}

export async function createQuizAction(
  _prev: CreateQuizState,
  formData: FormData
): Promise<CreateQuizState> {
  // Middleware guards /dashboard pages but never runs for Server Actions, so
  // the authorisation check has to happen right here.
  const session = await requireSession();

  const result = validateQuiz(parseDraft(formData));
  if (!result.ok) return { errors: result.errors };

  const { title, questions } = result;
  const base = slugify(title);

  // `base` is [a-z0-9-] only, so it carries no LIKE wildcards of its own.
  const { data: siblings, error: siblingError } = await supabaseAdmin()
    .from("quizzes")
    .select("slug")
    .eq("influencer_id", session.sub)
    .like("slug", `${base}%`);

  if (siblingError) {
    return { errors: { form: "Could not save your quiz. Try again." } };
  }

  const taken = new Set((siblings ?? []).map((row) => row.slug));
  let slug = uniqueSlug(base, taken);
  let saved: { slug: string } | null = null;

  // Two tabs saving the same title at once both read the same sibling list, so
  // one of them loses on quizzes_influencer_slug_key. Take the loser's slug as
  // newly-known-taken and pick the next one.
  for (let attempt = 0; attempt < 5 && !saved; attempt++) {
    const { data, error } = await supabaseAdmin()
      .from("quizzes")
      .insert({ influencer_id: session.sub, title, slug, questions })
      .select("slug")
      .single();

    if (!error) {
      saved = data;
      break;
    }
    if (error.code !== UNIQUE_VIOLATION) {
      return { errors: { form: "Could not save your quiz. Try again." } };
    }
    taken.add(slug);
    slug = uniqueSlug(base, taken);
  }

  if (!saved) {
    return {
      errors: { form: "Could not find a free link for that title. Rename it?" },
    };
  }

  revalidatePath("/dashboard");
  // redirect() signals by throwing, so it must sit outside any try/catch.
  // ?created= lets the dashboard surface the new share link straight away.
  redirect(`/dashboard?created=${encodeURIComponent(saved.slug)}`);
}
