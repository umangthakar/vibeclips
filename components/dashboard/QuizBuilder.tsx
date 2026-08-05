"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import Link from "next/link";
import { createQuizAction, type CreateQuizState } from "@/app/actions/quiz";
import { FormError } from "@/components/auth/FormError";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { Button } from "@/components/ui/button";
import { inputClass, inputErrorClass, labelClass } from "@/components/ui/input";
import { slugify } from "@/lib/quiz/slug";
import {
  MAX_QUESTIONS,
  OPTION_COUNT,
  OPTION_TEXT_MAX,
  QUESTION_TEXT_MAX,
  TITLE_MAX,
  emptyQuestion,
  validateQuiz,
  type DraftQuestion,
  type QuestionErrors,
  type QuizErrors,
} from "@/lib/quiz/validate";
import { cn } from "@/lib/utils";

const initialState: CreateQuizState = {};

const OPTION_LABELS = ["A", "B", "C", "D"];

/** Rows carry an id so React keeps a row's DOM node when its neighbours move. */
type Row = DraftQuestion & { id: number };

export function QuizBuilder({ handle }: { handle: string }) {
  const [state, formAction] = useFormState(createQuizAction, initialState);
  const [title, setTitle] = useState("");
  const [rows, setRows] = useState<Row[]>([{ id: 1, ...emptyQuestion() }]);
  const [nextId, setNextId] = useState(2);
  /** Set when the last submit was blocked here; cleared once it reaches the server. */
  const [clientErrors, setClientErrors] = useState<QuizErrors | null>(null);

  const errors: QuizErrors = clientErrors ?? state.errors ?? {};

  function updateRow(id: number, patch: Partial<DraftQuestion>) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  }

  function addRow() {
    setRows((current) => [...current, { id: nextId, ...emptyQuestion() }]);
    setNextId((id) => id + 1);
  }

  function removeRow(id: number) {
    setRows((current) => current.filter((row) => row.id !== id));
    // Errors are indexed by position, so they no longer line up. Drop them
    // rather than show the wrong message against the wrong question.
    setClientErrors(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const result = validateQuiz({ title, questions: rows });
    if (!result.ok) {
      // React skips the action when the submit event is defaulted-prevented.
      event.preventDefault();
      setClientErrors(result.errors);
      return;
    }
    setClientErrors(null);
  }

  const slug = slugify(title);

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate>
      {errors.form && (
        <div className="mb-6">
          <FormError message={errors.form} />
        </div>
      )}

      {/* ------------------------------------------------------------ title */}
      <div className="pixel-border bg-[#13131C] p-6 sm:p-8">
        <label htmlFor="title" className={labelClass}>
          Quiz title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={TITLE_MAX}
          autoComplete="off"
          placeholder="How well do you know me?"
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? "title-error" : "title-link"}
          className={cn(inputClass, "mt-2", errors.title && inputErrorClass)}
        />
        {errors.title ? (
          <p id="title-error" className="mt-2 text-xs text-[#FF4D4D]">
            {errors.title}
          </p>
        ) : (
          <p id="title-link" className="mt-3 text-xs text-white/35">
            Share link:{" "}
            <span className="text-white/60">
              /q/{handle}/{title.trim() ? slug : "…"}
            </span>
            {title.trim() && (
              <span className="block pt-1">
                If you already have a quiz on that link, we&apos;ll add a
                number to the end.
              </span>
            )}
          </p>
        )}
      </div>

      {/* -------------------------------------------------------- questions */}
      <div className="mt-6 space-y-6">
        {rows.map((row, index) => (
          <QuestionCard
            key={row.id}
            index={index}
            row={row}
            errors={errors.questions?.[index]}
            canRemove={rows.length > 1}
            onChange={(patch) => updateRow(row.id, patch)}
            onRemove={() => removeRow(row.id)}
          />
        ))}
      </div>

      {/* ----------------------------------------------------------- actions */}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={addRow}
          disabled={rows.length >= MAX_QUESTIONS}
        >
          + Add question
        </Button>
        <span className="text-xs text-white/35">
          {rows.length} of {MAX_QUESTIONS}
        </span>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-5">
        <div className="w-full sm:w-auto sm:min-w-[220px]">
          <SubmitButton pendingLabel="Publishing…">Publish quiz</SubmitButton>
        </div>
        <Link
          href="/dashboard"
          className="nav-link font-pixel text-[9px] uppercase tracking-wider text-white/50 hover:text-white"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------

function QuestionCard({
  index,
  row,
  errors,
  canRemove,
  onChange,
  onRemove,
}: {
  index: number;
  row: Row;
  errors?: QuestionErrors;
  canRemove: boolean;
  onChange: (patch: Partial<DraftQuestion>) => void;
  onRemove: () => void;
}) {
  const prefix = `question-${index}`;
  const textId = `${prefix}-text`;

  function setOption(optionIndex: number, value: string) {
    const options = [...row.options];
    options[optionIndex] = value;
    onChange({ options });
  }

  return (
    <fieldset className="pixel-border bg-[#13131C] p-6 sm:p-8">
      <legend className="sr-only">Question {index + 1}</legend>

      <div className="flex items-center justify-between gap-4">
        <span className="font-pixel text-[10px] uppercase tracking-wider text-[#FF6A00]">
          // Question {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="font-pixel text-[9px] uppercase tracking-wider text-white/40 transition-colors hover:text-[#FF4D4D]"
          >
            Remove
          </button>
        )}
      </div>

      <div className="mt-5">
        <label htmlFor={textId} className={labelClass}>
          Question
        </label>
        <textarea
          id={textId}
          name={textId}
          rows={2}
          value={row.text}
          onChange={(event) => onChange({ text: event.target.value })}
          maxLength={QUESTION_TEXT_MAX}
          placeholder="What's my go-to coffee order?"
          aria-invalid={errors?.text ? true : undefined}
          aria-describedby={errors?.text ? `${textId}-error` : undefined}
          className={cn(
            inputClass,
            "mt-2 resize-y",
            errors?.text && inputErrorClass
          )}
        />
        {errors?.text && (
          <p id={`${textId}-error`} className="mt-2 text-xs text-[#FF4D4D]">
            {errors.text}
          </p>
        )}
      </div>

      <div className="mt-6">
        <span className={labelClass}>Options</span>
        <p className="mt-2 text-xs text-white/35">
          Pick the circle next to the right answer.
        </p>

        <div className="mt-3 space-y-3">
          {row.options.map((option, optionIndex) => {
            const optionId = `${prefix}-option-${optionIndex}`;
            const radioId = `${prefix}-correct-${optionIndex}`;
            const optionError = errors?.options?.[optionIndex];
            const isCorrect = row.correctIndex === optionIndex;

            return (
              <div key={optionIndex}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id={radioId}
                    name={`${prefix}-correct`}
                    value={optionIndex}
                    checked={isCorrect}
                    onChange={() => onChange({ correctIndex: optionIndex })}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor={radioId}
                    title={`Mark option ${OPTION_LABELS[optionIndex]} as correct`}
                    className="font-pixel flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center border-2 border-dashed border-[rgba(123,47,255,0.4)] text-[10px] text-white/40 transition-colors hover:border-[#7B2FFF] peer-checked:border-solid peer-checked:border-[#FF6A00] peer-checked:bg-[#FF6A00]/15 peer-checked:text-[#FF6A00] peer-focus-visible:ring-2 peer-focus-visible:ring-[#7B2FFF]"
                  >
                    {OPTION_LABELS[optionIndex]}
                  </label>
                  <input
                    type="text"
                    id={optionId}
                    name={optionId}
                    value={option}
                    onChange={(event) =>
                      setOption(optionIndex, event.target.value)
                    }
                    maxLength={OPTION_TEXT_MAX}
                    autoComplete="off"
                    aria-label={`Option ${OPTION_LABELS[optionIndex]}`}
                    aria-invalid={optionError ? true : undefined}
                    className={cn(
                      inputClass,
                      "py-2",
                      optionError && inputErrorClass
                    )}
                  />
                </div>
                {optionError && (
                  <p className="mt-1 pl-12 text-xs text-[#FF4D4D]">
                    {optionError}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {errors?.correctIndex && (
          <p className="mt-3 text-xs text-[#FF4D4D]">{errors.correctIndex}</p>
        )}
      </div>
    </fieldset>
  );
}
