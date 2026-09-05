-- Atelier Graded marketplace schema.
-- Inventory uses a soft-delete lifecycle: set archived_at and ARCHIVED instead
-- of deleting cards so inquiry, order, and audit history remain intact.

create extension if not exists pgcrypto with schema extensions;

create type public.user_role as enum ('USER', 'ADMIN');
create type public.availability_status as enum ('AVAILABLE', 'RESERVED', 'SOLD', 'ARCHIVED');
create type public.publication_status as enum ('DRAFT', 'PUBLISHED');
create type public.grader_company as enum ('PSA', 'BGS', 'CGC', 'TAG');
create type public.inquiry_status as enum (
  'NEW', 'REVIEWING', 'BUYER_CONTACTED', 'NEGOTIATING',
  'ACCEPTED', 'DECLINED', 'CLOSED', 'CONVERTED_TO_ORDER'
);
create type public.image_type as enum ('FRONT', 'BACK', 'LABEL', 'DETAIL');
create type public.preferred_contact_method as enum ('EMAIL', 'PHONE', 'EITHER');
create type public.order_status as enum ('PENDING', 'RESERVED', 'PAID', 'FULFILLED', 'CANCELLED', 'EXPIRED');
create type public.payment_event_status as enum ('RECEIVED', 'PROCESSED', 'FAILED', 'IGNORED');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text not null,
  phone text,
  role public.user_role not null default 'USER',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  pokemon_name text not null,
  description text,
  year integer,
  set_name text,
  set_code text,
  card_number text,
  set_total text,
  rarity text,
  variant text,
  edition text,
  finish text,
  language text default 'English',
  category text default 'Pokemon',
  grader public.grader_company not null,
  grade numeric(4,1) not null,
  grade_label text,
  certification_number text not null,
  verification_url text,
  grader_metadata jsonb not null default '{}'::jsonb,
  price_minor integer not null check (price_minor >= 0),
  currency text not null default 'USD',
  price_negotiable boolean not null default false,
  availability_status public.availability_status not null default 'AVAILABLE',
  publication_status public.publication_status not null default 'DRAFT',
  featured boolean not null default false,
  population_count integer,
  provenance_notes text,
  slab_notes text,
  shipping_regions text,
  acquired_at timestamptz,
  listed_at timestamptz,
  sold_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (grader, certification_number),
  check (grade >= 0 and grade <= 100),
  check (population_count is null or population_count >= 0),
  check (
    (availability_status = 'SOLD' and sold_at is not null)
    or (availability_status <> 'SOLD' and sold_at is null)
  ),
  check (
    (availability_status = 'ARCHIVED' and archived_at is not null)
    or (availability_status <> 'ARCHIVED')
  )
);

-- This mirrors the one-sale-per-card lifecycle rule. The primary key makes the
-- index structurally redundant today, but preserves the invariant if inventory
-- is ever partitioned or represented by a sale-specific relation.
create unique index cards_one_sold_record_idx
  on public.cards (id) where availability_status = 'SOLD';

create table public.card_images (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  image_url text not null,
  storage_path text,
  image_type public.image_type not null,
  alt_text text,
  sort_order integer not null default 0,
  width integer,
  height integer,
  created_at timestamptz not null default now(),
  check (sort_order >= 0),
  check (width is null or width > 0),
  check (height is null or height > 0)
);

create table public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  card_id uuid not null references public.cards(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, card_id)
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  reference_number text unique not null,
  card_id uuid not null references public.cards(id) on delete restrict,
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  offer_amount_minor integer check (offer_amount_minor is null or offer_amount_minor >= 0),
  currency text not null default 'USD',
  preferred_contact_method public.preferred_contact_method not null default 'EMAIL',
  country text,
  postal_code text,
  message text not null,
  status public.inquiry_status not null default 'NEW',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inquiry_notes (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  note text not null,
  is_internal boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  status public.order_status not null default 'PENDING',
  currency text not null default 'USD',
  subtotal_minor integer not null default 0 check (subtotal_minor >= 0),
  tax_minor integer not null default 0 check (tax_minor >= 0),
  shipping_minor integer not null default 0 check (shipping_minor >= 0),
  total_minor integer not null default 0 check (total_minor >= 0),
  reservation_expires_at timestamptz,
  payment_provider text,
  payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (total_minor = subtotal_minor + tax_minor + shipping_minor)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  card_id uuid not null references public.cards(id) on delete restrict,
  title_snapshot text not null,
  certification_snapshot text not null,
  grade_snapshot numeric(4,1) not null,
  price_minor integer not null check (price_minor >= 0),
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  check (grade_snapshot >= 0 and grade_snapshot <= 100)
);

create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  idempotency_key text unique not null,
  status public.payment_event_status not null default 'RECEIVED',
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default now()
);

create table public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

create index cards_slug_idx on public.cards (slug);
create index cards_availability_status_idx on public.cards (availability_status);
create index cards_featured_idx on public.cards (featured);
create index cards_grader_idx on public.cards (grader);
create index cards_publication_status_idx on public.cards (publication_status);
create index cards_listed_at_desc_idx on public.cards (listed_at desc);
create index inquiries_status_idx on public.inquiries (status);
create index inquiries_email_idx on public.inquiries (email);
create index inquiries_card_id_idx on public.inquiries (card_id);
create index card_images_card_id_sort_order_idx on public.card_images (card_id, sort_order);
create index audit_logs_entity_type_entity_id_idx on public.audit_logs (entity_type, entity_id);
create index audit_logs_created_at_desc_idx on public.audit_logs (created_at desc);
create index favorites_user_id_idx on public.favorites (user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'ADMIN'
  );
$$;

create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() = old.id
     and not public.is_admin() then
    raise exception 'Users cannot change their own role';
  end if;
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger cards_set_updated_at
before update on public.cards
for each row execute function public.set_updated_at();

create trigger inquiries_set_updated_at
before update on public.inquiries
for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create trigger app_settings_set_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();

create trigger profiles_prevent_role_escalation
before update on public.profiles
for each row execute function public.prevent_role_escalation();

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.cards enable row level security;
alter table public.card_images enable row level security;
alter table public.favorites enable row level security;
alter table public.inquiries enable row level security;
alter table public.inquiry_notes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_events enable row level security;
alter table public.audit_logs enable row level security;
alter table public.app_settings enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "Public can read published cards"
  on public.cards for select to anon, authenticated
  using (publication_status = 'PUBLISHED' and archived_at is null);
create policy "Admins can manage cards"
  on public.cards for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Public can read images of published cards"
  on public.card_images for select to anon, authenticated
  using (
    exists (
      select 1 from public.cards
      where cards.id = card_images.card_id
        and cards.publication_status = 'PUBLISHED'
        and cards.archived_at is null
    )
  );
create policy "Admins can manage card images"
  on public.card_images for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Users can manage their own favorites"
  on public.favorites for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Anyone can submit inquiries"
  on public.inquiries for insert to anon, authenticated
  with check (true);
create policy "Users can read own inquiries and admins can read all"
  on public.inquiries for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "Admins can manage inquiries"
  on public.inquiries for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());
create policy "Admins can delete inquiries"
  on public.inquiries for delete to authenticated
  using (public.is_admin());

create policy "Users can read public notes for own inquiries"
  on public.inquiry_notes for select to authenticated
  using (
    not is_internal
    and exists (
      select 1 from public.inquiries
      where inquiries.id = inquiry_notes.inquiry_id
        and inquiries.user_id = auth.uid()
    )
  );
create policy "Admins can manage inquiry notes"
  on public.inquiry_notes for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Users can read own orders and admins can read all"
  on public.orders for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "Admins can manage orders"
  on public.orders for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
create policy "Users can read own order items and admins can read all"
  on public.order_items for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );
create policy "Admins can manage order items"
  on public.order_items for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can manage payment events"
  on public.payment_events for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can read audit logs"
  on public.audit_logs for select to authenticated
  using (public.is_admin());
-- audit_logs have no INSERT policy: backend service-role writes bypass RLS.

create policy "Admins can manage app settings"
  on public.app_settings for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant usage on schema public to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.cards, public.card_images to anon, authenticated;
grant select, insert, update, delete on public.favorites to authenticated;
grant insert on public.inquiries to anon;
grant select, insert, update, delete on public.inquiries to authenticated;
grant select, insert, update, delete on public.inquiry_notes to authenticated;
grant select, insert, update, delete on public.orders, public.order_items to authenticated;
grant select, insert, update, delete on public.payment_events to authenticated;
grant select on public.audit_logs to authenticated;
grant select, insert, update, delete on public.app_settings to authenticated;
grant execute on function public.is_admin() to authenticated;

-- Supabase Storage bucket: create a public-read `card-images` bucket in the
-- dashboard or storage migration. Grant authenticated writes only through an
-- admin-checked storage.objects policy; do not permit anonymous uploads.
