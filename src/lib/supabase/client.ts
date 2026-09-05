"use client";

import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

import { publicEnv } from "@/lib/env";

let browserClient: ReturnType<typeof createSupabaseBrowserClient> | undefined;

/**
 * Returns the browser Supabase client when Supabase is configured.
 * Local-store mode intentionally has no browser Supabase client.
 */
export function createBrowserClient(): ReturnType<typeof createSupabaseBrowserClient> {
  const { NEXT_PUBLIC_SUPABASE_URL: url, NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey } = publicEnv;
  if (!publicEnv.isSupabaseConfigured || !url || !anonKey) {
    throw new Error("Supabase is not configured. Use the local data store instead.");
  }

  browserClient ??= createSupabaseBrowserClient(url, anonKey);
  return browserClient;
}
