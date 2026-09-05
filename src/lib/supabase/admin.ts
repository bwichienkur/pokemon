import "server-only";

import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

let adminClient: ReturnType<typeof createClient> | undefined;

/**
 * Returns the privileged service-role client. This must only be used in
 * trusted server code and never exposed to a browser bundle.
 */
export function createAdminClient(): ReturnType<typeof createClient> {
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
