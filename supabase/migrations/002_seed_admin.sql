-- Do not hard-code administrator credentials in a migration.
-- Provision the auth user from ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD in the
-- seeding script, then call seed_admin_profile with that user's UUID and email.

create or replace function public.seed_admin_profile(user_id uuid, user_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set role = 'ADMIN',
      email = user_email
  where id = user_id;

  if not found then
    raise exception 'Cannot seed admin profile: no profile exists for user %', user_id;
  end if;
end;
$$;

revoke all on function public.seed_admin_profile(uuid, text) from public, anon, authenticated;
grant execute on function public.seed_admin_profile(uuid, text) to service_role;
