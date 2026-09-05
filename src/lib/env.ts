import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalUrl = z.preprocess(emptyToUndefined, z.string().url().optional());
const optionalString = z.preprocess(emptyToUndefined, z.string().min(1).optional());
const optionalEmail = z.preprocess(emptyToUndefined, z.string().email().optional());

function resolveSiteUrl(): string | undefined {
  const configured = emptyToUndefined(process.env.NEXT_PUBLIC_SITE_URL);
  if (typeof configured === "string") return configured;
  const vercelUrl = emptyToUndefined(process.env.VERCEL_URL);
  if (typeof vercelUrl === "string") {
    return vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
  }
  return undefined;
}

const environmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString,
  SUPABASE_SERVICE_ROLE_KEY: optionalString,
  NEXT_PUBLIC_SITE_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().default("http://localhost:3000"),
  ),
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
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
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
  throw new Error(
    `Invalid environment configuration: ${parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ")}`,
  );
}

const values = parsed.data;
const hasSupabaseUrl = Boolean(values.NEXT_PUBLIC_SUPABASE_URL);
const hasSupabaseAnonKey = Boolean(values.NEXT_PUBLIC_SUPABASE_ANON_KEY);

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

const supabaseReady = hasSupabaseUrl && hasSupabaseAnonKey;

export const env = {
  ...values,
  NEXT_PUBLIC_SUPABASE_URL: supabaseReady ? values.NEXT_PUBLIC_SUPABASE_URL : undefined,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseReady ? values.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined,
  ADMIN_SEED_EMAIL:
    Boolean(values.ADMIN_SEED_EMAIL) && Boolean(values.ADMIN_SEED_PASSWORD)
      ? values.ADMIN_SEED_EMAIL
      : undefined,
  ADMIN_SEED_PASSWORD:
    Boolean(values.ADMIN_SEED_EMAIL) && Boolean(values.ADMIN_SEED_PASSWORD)
      ? values.ADMIN_SEED_PASSWORD
      : undefined,
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
