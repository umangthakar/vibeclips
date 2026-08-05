import { cn } from "@/lib/utils";
import { inputClass, inputErrorClass, labelClass } from "@/components/ui/input";

export function Field({
  label,
  name,
  error,
  hint,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  error?: string;
  hint?: string;
}) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;

  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [error ? errorId : null, hint ? hintId : null]
            .filter(Boolean)
            .join(" ") || undefined
        }
        className={cn(inputClass, "mt-2", error && inputErrorClass, className)}
        {...props}
      />
      {hint && !error && (
        <p id={hintId} className="mt-2 text-xs text-white/35">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-2 text-xs text-[#FF4D4D]">
          {error}
        </p>
      )}
    </div>
  );
}

/** Handle field with a fixed `@` prefix so the user never types it. */
export function HandleField({
  error,
  defaultValue,
}: {
  error?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor="handle" className={labelClass}>
        Instagram handle
      </label>
      <div
        className={cn(
          "mt-2 flex items-center border-2 border-dashed border-[rgba(123,47,255,0.4)] bg-[#0A0A0F] transition-colors focus-within:border-[#7B2FFF]",
          error && inputErrorClass
        )}
      >
        <span className="font-pixel select-none pl-4 pr-1 text-sm text-white/40">
          @
        </span>
        <input
          id="handle"
          name="handle"
          type="text"
          required
          maxLength={30}
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="yourhandle"
          defaultValue={defaultValue}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "handle-error" : undefined}
          className="w-full bg-transparent py-3 pr-4 text-white placeholder:text-white/25 outline-none"
        />
      </div>
      {error && (
        <p id="handle-error" className="mt-2 text-xs text-[#FF4D4D]">
          {error}
        </p>
      )}
    </div>
  );
}

/** Numeric PIN entry, styled like an arcade code box. */
export function PinField({
  label,
  name,
  error,
  hint,
  autoComplete,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  autoComplete: "current-password" | "new-password";
}) {
  return (
    <Field
      label={label}
      name={name}
      error={error}
      hint={hint}
      type="password"
      required
      inputMode="numeric"
      pattern="\d{4,6}"
      minLength={4}
      maxLength={6}
      autoComplete={autoComplete}
      placeholder="••••"
      className="font-pixel text-center text-base tracking-[0.4em]"
    />
  );
}
