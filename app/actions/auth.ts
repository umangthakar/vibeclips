"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { handleError, normalizeHandle } from "@/lib/auth/handle";
import { fakeVerifyPin, hashPin, pinError, verifyPin } from "@/lib/auth/pin";
import { createSession, destroySession } from "@/lib/auth/session";
import { clearRateLimit, rateLimit } from "@/lib/auth/rate-limit";
import { clientIpKey } from "@/lib/request-ip";

export type AuthField = "name" | "handle" | "pin" | "confirmPin";

export type AuthState = {
  formError?: string;
  fieldErrors?: Partial<Record<AuthField, string>>;
  /** Echoed back so a failed submit doesn't wipe what was typed. */
  values?: { name?: string; handle?: string };
};

const UNIQUE_VIOLATION = "23505";

/** Only allow redirecting back into the dashboard — never to an arbitrary URL. */
function safeNext(raw: FormDataEntryValue | null): string {
  const value = typeof raw === "string" ? raw : "";
  return value.startsWith("/dashboard") && !value.startsWith("//")
    ? value
    : "/dashboard";
}

// ---------------------------------------------------------------- signup

export async function signupAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const rawHandle = String(formData.get("handle") ?? "");
  const handle = normalizeHandle(rawHandle);
  const pin = String(formData.get("pin") ?? "");
  const confirmPin = String(formData.get("confirmPin") ?? "");
  const values = { name, handle };

  const fieldErrors: AuthState["fieldErrors"] = {};
  if (!name) fieldErrors.name = "Enter your name.";
  else if (name.length > 60) fieldErrors.name = "Keep it under 60 characters.";

  const handleProblem = handleError(handle);
  if (handleProblem) fieldErrors.handle = handleProblem;

  const pinProblem = pinError(pin);
  if (pinProblem) fieldErrors.pin = pinProblem;
  else if (pin !== confirmPin) fieldErrors.confirmPin = "PINs don't match.";

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, values };

  const pin_hash = await hashPin(pin);

  const { data, error } = await supabaseAdmin()
    .from("influencers")
    .insert({ name, instagram_handle: handle, pin_hash })
    .select("id, name, instagram_handle")
    .single();

  if (error) {
    // Racing signups for the same handle land here rather than on our
    // pre-check, which is why there is no pre-check: the unique index decides.
    if (error.code === UNIQUE_VIOLATION) {
      return {
        fieldErrors: { handle: "That handle is already registered." },
        values,
      };
    }
    return { formError: "Could not create your account. Try again.", values };
  }

  await createSession({
    sub: data.id,
    handle: data.instagram_handle,
    name: data.name,
  });

  // redirect() signals by throwing, so it must sit outside any try/catch.
  redirect("/dashboard");
}

// ----------------------------------------------------------------- login

export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const rawHandle = String(formData.get("handle") ?? "");
  const handle = normalizeHandle(rawHandle);
  const pin = String(formData.get("pin") ?? "");
  const next = safeNext(formData.get("next"));
  const values = { handle };

  if (!handle || !pin) {
    return { formError: "Enter your handle and PIN.", values };
  }

  const ip = clientIpKey();
  // Two budgets: one stops guessing a single account, the other stops sweeping
  // many accounts from one source.
  const perAccount = rateLimit(`login:${handle}:${ip}`, 5, 15 * 60 * 1000);
  const perIp = rateLimit(`login-ip:${ip}`, 30, 15 * 60 * 1000);
  if (!perAccount.allowed || !perIp.allowed) {
    const retryAfter = Math.max(perAccount.retryAfter, perIp.retryAfter);
    return {
      formError: `Too many attempts. Try again in ${Math.ceil(retryAfter / 60)} min.`,
      values,
    };
  }

  const { data: influencer } = await supabaseAdmin()
    .from("influencers")
    .select("id, name, instagram_handle, pin_hash")
    .eq("instagram_handle", handle)
    .maybeSingle();

  // Same message and (roughly) the same duration whether the handle exists or
  // the PIN is wrong — otherwise this doubles as a handle-enumeration oracle.
  const valid = influencer
    ? await verifyPin(pin, influencer.pin_hash)
    : await fakeVerifyPin(pin);

  if (!valid || !influencer) {
    return { formError: "Wrong handle or PIN.", values };
  }

  clearRateLimit(`login:${handle}:${ip}`);

  await createSession({
    sub: influencer.id,
    handle: influencer.instagram_handle,
    name: influencer.name,
  });

  redirect(next);
}

// ---------------------------------------------------------------- logout

export async function logoutAction(): Promise<void> {
  destroySession();
  redirect("/login");
}
