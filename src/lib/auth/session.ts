import "server-only";

import { cookies } from "next/headers";

import { AuthError, ValidationError } from "@/lib/auth/errors";
import { createServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { DEMO_PASSWORDS } from "@/lib/data/seed-data";
import { getProfile, getProfileByEmail } from "@/lib/data/repository";
import { updateStore } from "@/lib/data/local-store";
import type { Profile } from "@/types/database";

const SESSION_COOKIE = "ag_session";
const ROLE_COOKIE = "ag_role";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function localDevelopmentOnly(): void {
  if (process.env.NODE_ENV === "production") {
    throw new AuthError("Local authentication is disabled in production.");
  }
}

function sessionCookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: SESSION_MAX_AGE_SECONDS };
}

async function setLocalSession(profile: Profile): Promise<void> {
  const session = { id: crypto.randomUUID(), userId: profile.id, email: profile.email, createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString() };
  await updateStore((store) => { store.sessions = store.sessions.filter((item) => item.userId !== profile.id && new Date(item.expiresAt).getTime() > Date.now()); store.sessions.push(session); });
  const store = await cookies();
  store.set(SESSION_COOKIE, session.id, sessionCookieOptions());
  // This is only an early middleware hint; protected server operations verify the session.
  store.set(ROLE_COOKIE, profile.role, { ...sessionCookieOptions(), httpOnly: false });
}

export async function getCurrentUser(): Promise<Profile | null> {
  if (env.isSupabaseConfigured) {
    const { data: { user } } = await (await createServerClient()).auth.getUser();
    return user ? getProfile(user.id) : null;
  }
  const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;
  const { readStore } = await import("@/lib/data/local-store");
  const store = await readStore();
  const session = store.sessions.find((item) => item.id === sessionId);
  if (!session || new Date(session.expiresAt).getTime() <= Date.now()) return null;
  return store.profiles.find((profile) => profile.id === session.userId) ?? null;
}

export async function requireUser(): Promise<Profile> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError();
  return user;
}

export async function requireAdmin(): Promise<Profile> {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new AuthError("Administrator access is required.");
  return user;
}

export async function signInLocal(email: string, password: string): Promise<Profile> {
  localDevelopmentOnly();
  const normalizedEmail = email.trim().toLowerCase();
  const profile = await getProfileByEmail(normalizedEmail);
  if (!profile) throw new AuthError("Invalid email or password.");
  const expectedPassword = DEMO_PASSWORDS[normalizedEmail as keyof typeof DEMO_PASSWORDS]
    ?? (await (async () => {
      const { readStore } = await import("@/lib/data/local-store");
      return (await readStore()).appSettings.find((setting) => setting.key === `dev:plain-password:${profile.id}`)?.value;
    })());
  if (typeof expectedPassword !== "string" || password !== expectedPassword) throw new AuthError("Invalid email or password.");
  await setLocalSession(profile);
  return profile;
}

export async function signUpLocal(fullName: string, email: string, password: string): Promise<Profile> {
  localDevelopmentOnly();
  const normalizedEmail = email.trim().toLowerCase();
  if (await getProfileByEmail(normalizedEmail)) throw new ValidationError("An account with this email already exists.");
  const profile: Profile = { id: crypto.randomUUID(), email: normalizedEmail, displayName: fullName.trim(), phone: null, role: "USER", avatarUrl: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  await updateStore((store) => {
    store.profiles.push(profile);
    // Local fallback is development-only. This explicitly stores a demo credential
    // so sign-up can be exercised without pretending to provide production auth.
    store.appSettings.push({ key: `dev:plain-password:${profile.id}`, value: password, updatedAt: profile.updatedAt, updatedBy: profile.id });
  });
  await setLocalSession(profile);
  return profile;
}

export async function signOut(): Promise<void> {
  if (env.isSupabaseConfigured) await (await createServerClient()).auth.signOut();
  else {
    const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
    if (sessionId) await updateStore((store) => { store.sessions = store.sessions.filter((session) => session.id !== sessionId); });
  }
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(ROLE_COOKIE);
}
