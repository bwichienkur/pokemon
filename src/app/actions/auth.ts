"use server";

import { revalidatePath } from "next/cache";

import { env } from "@/lib/env";
import { createServerClient } from "@/lib/supabase/server";
import { signInLocal, signOut, signUpLocal, requireUser } from "@/lib/auth/session";
import { ValidationError } from "@/lib/auth/errors";
import { updateProfile } from "@/lib/data/repository";
import { forgotPasswordSchema, loginSchema, profileUpdateSchema, signupSchema } from "@/lib/validations/auth";

function parse<T>(schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false; error: { issues: Array<{ message: string }> } } }, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new ValidationError(result.error.issues[0]?.message);
  return result.data;
}

export async function login(input: unknown) {
  const values = parse(loginSchema, input);
  if (!env.isSupabaseConfigured) return { ok: true, user: await signInLocal(values.email, values.password) };
  const { data, error } = await (await createServerClient()).auth.signInWithPassword({ email: values.email, password: values.password });
  if (error || !data.user) throw new ValidationError(error?.message ?? "Unable to sign in.");
  revalidatePath("/", "layout");
  return { ok: true, user: await requireUser() };
}

export async function signup(input: unknown) {
  const values = parse(signupSchema, input);
  if (!env.isSupabaseConfigured) return { ok: true, user: await signUpLocal(values.fullName, values.email, values.password) };
  const { data, error } = await (await createServerClient()).auth.signUp({ email: values.email, password: values.password, options: { data: { display_name: values.fullName } } });
  if (error) throw new ValidationError(error.message);
  revalidatePath("/", "layout");
  return { ok: true, userId: data.user?.id ?? null, needsEmailConfirmation: !data.session };
}

export async function logout() {
  await signOut();
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function forgotPassword(input: unknown) {
  const { email } = parse(forgotPasswordSchema, input);
  if (!env.isSupabaseConfigured) {
    if (process.env.NODE_ENV !== "production") console.info(`[Atelier Graded dev email] Password reset requested for ${email}`);
    return { ok: true };
  }
  const { error } = await (await createServerClient()).auth.resetPasswordForEmail(email, { redirectTo: new URL("/account/reset-password", env.NEXT_PUBLIC_SITE_URL).toString() });
  if (error) throw new ValidationError(error.message);
  return { ok: true };
}

export async function updateMyProfile(input: unknown) {
  const values = parse(profileUpdateSchema, input);
  const user = await requireUser();
  const profile = await updateProfile(user.id, {
    displayName: values.displayName ?? values.fullName ?? user.displayName,
    phone: values.phone ?? user.phone,
    avatarUrl: values.avatarUrl ?? user.avatarUrl,
  });
  revalidatePath("/account");
  return { ok: true, profile };
}
