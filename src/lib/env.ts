import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

function coerceOptionalUrl(value: unknown, label: string): string | undefined {
  const normalized = emptyToUndefined(value);
  if (typeof normalized !== "string") return undefined;
  const candidate = normalized.includes("://") ? normalized : `https://${normalized}`;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      console.warn(`[atelier-graded] Ignoring ${label}: unsupported protocol.`);
      return undefined;
    }
    return parsed.toString().replace(/\/$/, "");
  } catch {
    console.warn(`[atelier-graded] Ignoring invalid ${label}: ${normalized}`);
    return undefined;
  }
}

const optionalString = z.preprocess(emptyToUndefined, z.string().min(1).optional());
const optionalEmail = z.preprocess(emptyToUndefined, z.string().email().optional());

function resolveSiteUrl(): string {
  return (
    coerceOptionalUrl(process.env.NEXT_PUBLIC_SITE_URL, "NEXT_PUBLIC_SITE_URL") ??
    coerceOptionalUrl(process.env.VERCEL_URL, "VERCEL_URL") ??
    "http://localhost:3000"
  );
}

const environmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString,
  SUPABASE_SERVICE_ROLE_KEY: optionalString,
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  RESEND_API_KEY: optionalString,
  EMAIL_FROM: optionalString,
  ADMIN_EMAIL: optionalEmail,
  ADMIN_SEED_EMAIL: optionalEmail,
  ADMIN_SEED_PASSWORD: z.preprocess(
    emptyToUndefined,
    z.string().min(12, "Admin seed passwords must contain at least 12 characters.").optional(),
  ),
  DIRECT_CHECKOUT_ENABLED: z.preprocess(
    (value) => {
      if (typeof value === "boolean") return value;
      if (typeof value === "string") return value.trim().toLowerCase();
      return value;
    },
    z
      .union([z.boolean(), z.enum(["true", "false"])])
      .default(false)
      .transform((value) => value === true || value === "true"),
  ),
  STRIPE_SECRET_KEY: optionalString,
  BOT_PROTECTION_SECRET: optionalString,
});

const parsed = environmentSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: coerceOptionalUrl(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL",
  ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SITE_URL: resolveSiteUrl(),
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_SEED_EMAIL: process.env.ADMIN_SEED_EMAIL,
  ADMIN_SEED_PASSWORD: process.env.ADMIN_SEED_PASSWORD,
  DIRECT_CHECKOUT_ENABLED: process.env.DIRECT_CHECKOUT_ENABLED,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  BOT_PROTECTION_SECRET: process.env.BOT_PROTECTION_SECRET,
});

if (!parsed.success) {
  // Never crash the Vercel build for optional/badly pasted dashboard values.
  console.warn(
    `[atelier-graded] Environment validation issues (continuing with safe defaults): ${parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ")}`,
  );
}

const values = parsed.success
  ? parsed.data
  : environmentSchema.parse({
      NEXT_PUBLIC_SITE_URL: resolveSiteUrl(),
      DIRECT_CHECKOUT_ENABLED: false,
    });

const hasSupabaseUrl = Boolean(values.NEXT_PUBLIC_SUPABASE_URL);
const hasSupabaseAnonKey = Boolean(values.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const supabaseReady = hasSupabaseUrl && hasSupabaseAnonKey;
const adminSeedReady =
  Boolean(values.ADMIN_SEED_EMAIL) && Boolean(values.ADMIN_SEED_PASSWORD);

if (hasSupabaseUrl !== hasSupabaseAnonKey) {
  console.warn(
    "[atelier-graded] Ignoring incomplete Supabase configuration. Set both NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, or leave both empty.",
  );
}

if (Boolean(values.ADMIN_SEED_EMAIL) !== Boolean(values.ADMIN_SEED_PASSWORD)) {
  console.warn(
    "[atelier-graded] Ignoring incomplete admin seed configuration. Set both ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD, or leave both empty.",
  );
}

export const env = {
  ...values,
  NEXT_PUBLIC_SUPABASE_URL: supabaseReady ? values.NEXT_PUBLIC_SUPABASE_URL : undefined,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseReady ? values.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined,
  ADMIN_SEED_EMAIL: adminSeedReady ? values.ADMIN_SEED_EMAIL : undefined,
  ADMIN_SEED_PASSWORD: adminSeedReady ? values.ADMIN_SEED_PASSWORD : undefined,
  isSupabaseConfigured: supabaseReady,
} as const;

/** Values safe to import into browser code. */
export const publicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: env.NEXT_PUBLIC_SITE_URL,
  isSupabaseConfigured: env.isSupabaseConfigured,
} as const;

export type Environment = typeof env;
