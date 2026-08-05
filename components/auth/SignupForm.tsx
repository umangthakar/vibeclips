"use client";

import { useFormState } from "react-dom";
import { signupAction, type AuthState } from "@/app/actions/auth";
import { Field, HandleField, PinField } from "@/components/auth/Field";
import { FormError } from "@/components/auth/FormError";
import { SubmitButton } from "@/components/auth/SubmitButton";

const initialState: AuthState = {};

export function SignupForm() {
  const [state, formAction] = useFormState(signupAction, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormError message={state.formError} />

      <Field
        label="Your name"
        name="name"
        type="text"
        required
        maxLength={60}
        autoComplete="name"
        placeholder="Alex Rivera"
        defaultValue={state.values?.name}
        error={state.fieldErrors?.name}
      />

      <HandleField
        error={state.fieldErrors?.handle}
        defaultValue={state.values?.handle}
      />

      <PinField
        label="Choose a PIN"
        name="pin"
        autoComplete="new-password"
        hint="4-6 digits. This is how you log back in."
        error={state.fieldErrors?.pin}
      />

      <PinField
        label="Confirm PIN"
        name="confirmPin"
        autoComplete="new-password"
        error={state.fieldErrors?.confirmPin}
      />

      <div className="pt-2">
        <SubmitButton pendingLabel="Creating…">Create account</SubmitButton>
      </div>

      <p className="text-center text-xs leading-relaxed text-white/35">
        There is no PIN reset yet — write it down somewhere safe.
      </p>
    </form>
  );
}
