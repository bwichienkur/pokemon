import "server-only";

import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { env } from "@/lib/env";

/**
 * Creates a request-scoped Supabase client that keeps auth cookies in sync
 * where the current Next.js execution context permits cookie writes.
 */
export async function createServerClient(): Promise<
  ReturnType<typeof createSupabaseServerClient>
> {
  if (
    !env.isSupabaseConfigured ||
    !env.NEXT_PUBLIC_SUPABASE_URL ||
    !env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error("Supabase is not configured. Use the local data store instead.");
  }

  const cookieStore = await cookies();

  return createSupabaseServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Components cannot mutate cookies. Middleware or a Route
            // Handler will persist refreshed auth tokens for those requests.
          }
        },
      },
    },
  );
}
