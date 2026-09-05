# Atelier Graded

Atelier Graded is a private, research-first showroom for exceptional graded collectibles.

## Stack

- Next.js App Router, React, and TypeScript
- Tailwind CSS and Radix UI primitives
- Zod validation and server actions
- Supabase Auth, Postgres, and Storage in hosted mode
- A file-backed local store for development without Supabase
- Vitest for unit tests and Playwright for browser smoke tests

## Local development without Supabase

Local mode is the default: do not configure Supabase variables. It stores development data in
`.data/store.json`, serves uploaded images from `public/uploads`, and uses safe-to-share demo
accounts.

```bash
npm install
cp .env.example .env.local
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use either demo account:

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `admin@ateliergraded.demo` | `ChangeMeAdmin!23` |
| Collector | `collector@ateliergraded.demo` | `ChangeMeUser!23` |

The local authentication adapter is intentionally disabled in production. Never use demo
credentials for a deployed application.

## Supabase setup

1. Create a Supabase project and copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
   `SUPABASE_SERVICE_ROLE_KEY`.
3. Apply the SQL in `supabase/migrations` with the Supabase CLI:

   ```bash
   supabase link --project-ref <project-ref>
   supabase db push
   ```

4. In Storage, create a **public** bucket named `card-images`. Uploaded card image URLs are
   rendered directly by the application. Configure Storage policies so only authenticated
   administrators can upload or modify images.
5. Review the RLS policies in `supabase/migrations/001_initial_schema.sql` before production.
   They protect public catalogue reads and restrict administrative writes; apply them through
   migrations rather than manually weakening RLS.
6. Seed catalogue data:

   ```bash
   npm run db:seed
   ```

To provision an administrator while seeding, set both `ADMIN_SEED_EMAIL` and
`ADMIN_SEED_PASSWORD` (at least 12 characters) before running the seed command. The script is
idempotent for the seeded catalog data and reuses an existing admin account when possible.

## Environment variables

See [`.env.example`](.env.example) for commented values. The important groups are:

- `NEXT_PUBLIC_SITE_URL` for canonical URLs and redirects.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
  `SUPABASE_SERVICE_ROLE_KEY` for Supabase mode.
- `RESEND_API_KEY`, `EMAIL_FROM`, and `ADMIN_EMAIL` for transactional email notifications.
- `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` for administrator provisioning.
- `DIRECT_CHECKOUT_ENABLED=false` keeps payments off; cards are sold through private inquiries.
- `BOT_PROTECTION_SECRET` configures the optional bot-protection adapter.

## Scripts

```bash
npm run dev          # Start the development server
npm run build        # Create a production build
npm run start        # Run the production server
npm run lint         # Run ESLint
npm run typecheck    # Check TypeScript without emitting files
npm run test         # Run Vitest unit tests
npm run test:watch   # Run Vitest in watch mode
npm run test:e2e     # Run Playwright smoke tests
npm run validate     # Typecheck, lint, and unit tests
npm run db:migrate   # Apply project migration helper
npm run db:seed      # Seed Supabase or the local fallback store
```

## Architecture

The repository layer supports two modes. With complete Supabase configuration it uses Supabase
for profiles, catalogue data, inquiries, and storage. Without it, the same repository API uses
the seeded local JSON store, which makes the full showroom usable for local development.

Payments are disabled by design. `DIRECT_CHECKOUT_ENABLED` defaults to `false`; inquiries create
an auditable sales conversation but never reserve or sell inventory automatically. Email delivery
uses an adapter: Resend is used when configured and local development otherwise remains usable
without external delivery credentials.

## Security notes

- Store currency in integer minor units; validations reject fractional storage values.
- Inventory transitions are explicit; archived inventory cannot return to an active state.
- Server actions validate inputs and re-check authenticated roles rather than trusting routing
  cookies.
- Uploads accept only JPEG, PNG, and WebP files up to 15 MB; SVG uploads are rejected.
- Security headers are applied in middleware, including clickjacking and MIME-sniffing defenses.
- Configure Supabase RLS and Storage policies before exposing a hosted instance.

## Testing

Unit tests cover money handling, schemas, inventory rules, authorization, inquiry workflow,
payment-event idempotency, grader links, slugs, and basic accessibility labels:

```bash
npm run test
npm run validate
```

Browser smoke coverage is defined in `tests/e2e/smoke.spec.ts`. It starts `npm run dev` when
needed, exercises catalogue filtering, collector login/favorite/inquiry flow, and administrator
dashboard access:

```bash
npm run test:e2e
```

## Disclaimer

Atelier Graded is not affiliated with, endorsed by, or sponsored by The Pokémon Company,
Nintendo, Game Freak, Creatures, PSA, Beckett, CGC, TAG, or any other rights holder or grading
company. Names and marks are used only to describe collectible inventory and verification
resources.
