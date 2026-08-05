"use client";

import { useFormState } from "react-dom";
import { loginAction, type AuthState } from "@/app/actions/auth";
import { HandleField, PinField } from "@/components/auth/Field";
import { FormError } from "@/components/auth/FormError";
import { SubmitButton } from "@/components/auth/SubmitButton";

const initialState: AuthState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormError message={state.formError} />
      {next && <input type="hidden" name="next" value={next} />}

      <HandleField defaultValue={state.values?.handle} />

      <PinField label="PIN" name="pin" autoComplete="current-password" />

      <div className="pt-2">
        <SubmitButton pendingLabel="Checking…">Log in</SubmitButton>
      </div>
    </form>
  );
}
