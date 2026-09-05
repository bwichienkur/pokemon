import "server-only";

import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

let adminClient: ReturnType<typeof createClient> | undefined;

/**
 * Returns the privileged service-role client. This must only be used in
 * trusted server code and never exposed to a browser bundle.
 */
// The project intentionally has no generated Supabase Database type yet.
// Keep the privileged repository adapter flexible until generation is added.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase schema types are not generated.
export function createAdminClient(): any {
  if (
    !env.isSupabaseConfigured ||
    !env.NEXT_PUBLIC_SUPABASE_URL ||
    !env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error(
      "Supabase admin access requires NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  adminClient ??= createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  );

  return adminClient;
}
