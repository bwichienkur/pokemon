import { createClient } from '@supabase/supabase-js';
import { cardImages, cards, inquiries, seedLocal } from './seed-local.mjs';

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

function fail(message) {
  console.error(`\n${message}`);
  process.exitCode = 1;
}

async function assertNoError(operation, result) {
  if (result.error) {
    throw new Error(`${operation}: ${result.error.message}`);
  }
  return result.data;
}

async function findUserByEmail(supabase, email) {
  for (let page = 1; page <= 100; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`Looking up admin user: ${error.message}`);
    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase());
    if (user) return user;
    if (data.users.length < 1000) return null;
  }
  throw new Error('Could not locate admin user after scanning 100,000 users.');
}

async function seedAdmin(supabase) {
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email && !password) return;
  if (!email || !password) {
    throw new Error('Set both ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD, or set neither.');
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: 'Administrator' },
  });

  let user = data.user;
  if (error) {
    user = await findUserByEmail(supabase, email);
    if (!user) throw new Error(`Creating admin auth user: ${error.message}`);
    console.log(`Using existing admin auth user for ${email}.`);
  }

  await assertNoError(
    'Promoting admin profile',
    await supabase.rpc('seed_admin_profile', { user_id: user.id, user_email: email }),
  );
  console.log(`Seeded administrator profile for ${email}.`);
}

async function seedSupabase() {
  if (!supabaseUrl) {
    fail(
      'SUPABASE_SERVICE_ROLE_KEY is set, but SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) is required to seed Supabase.',
    );
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  await assertNoError(
    'Upserting demo cards',
    await supabase.from('cards').upsert(cards, { onConflict: 'id' }),
  );
  await assertNoError(
    'Upserting demo card images',
    await supabase.from('card_images').upsert(cardImages, { onConflict: 'id' }),
  );
  await assertNoError(
    'Upserting demo inquiries',
    await supabase.from('inquiries').upsert(inquiries, { onConflict: 'id' }),
  );
  await seedAdmin(supabase);

  console.log(`Seeded ${cards.length} demo cards, ${cardImages.length} images, and ${inquiries.length} inquiries into Supabase.`);
}

try {
  if (serviceRoleKey) {
    await seedSupabase();
  } else {
    const outputPath = await seedLocal();
    console.log(`No SUPABASE_SERVICE_ROLE_KEY found; wrote local fallback seed to ${outputPath}.`);
    console.log('To seed Supabase, first apply supabase/migrations, then set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    console.log('Optionally set ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD to provision an administrator without hard-coded credentials.');
  }
} catch (error) {
  fail(`Seeding failed: ${error instanceof Error ? error.message : String(error)}`);
}
