-- ============================================================
-- WeddingInvite database schema
-- Run this once in your Supabase project's SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste this whole file -> Run)
-- ============================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------
-- PROFILES: extends Supabase auth.users with a role and, for couple
-- admins, a link to the one wedding they manage.
-- ----------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('super_admin', 'couple_admin')),
  full_name text,
  wedding_id uuid, -- set for couple_admin, null for super_admin
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- WEDDINGS: one row per couple's wedding / tenant.
-- ----------------------------------------------------------------
create table if not exists weddings (
  id uuid primary key default gen_random_uuid(),
  couple_names text not null,          -- e.g. "Ama & Kwame"
  slug text unique not null,           -- used in public RSVP URLs
  is_active boolean not null default true,
  theme_preset text not null default 'classic_gold' check (theme_preset in ('classic_gold','modern_teal','rustic_earthy','custom')),
  primary_color text default '#B8925A',
  secondary_color text default '#1C1917',
  accent_color text default '#C9A0A0',
  cover_photo_url text,
  logo_url text,
  welcome_message text default 'We would love for you to celebrate with us.',
  dress_code text,
  event_date date,
  rsvp_deadline date,
  venue_name text,
  venue_address text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

alter table profiles
  add constraint profiles_wedding_fk foreign key (wedding_id) references weddings(id) on delete set null;

-- ----------------------------------------------------------------
-- GUESTS: every invitee. Approved plus-ones become their own row.
-- ----------------------------------------------------------------
create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  name text not null,
  category text not null default 'individual' check (category in ('individual','couple','plus_one')),
  phone text,
  notes text,
  allow_plus_one boolean not null default false,
  invite_token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  invite_status text not null default 'pending' check (invite_status in ('pending','sent','opened','responded')),
  rsvp_status text not null default 'pending' check (rsvp_status in ('pending','yes','yes_joy','no','from_afar')),
  dietary_restrictions text,
  guest_message text,
  is_plus_one_of uuid references guests(id) on delete cascade,
  checked_in_at timestamptz,
  opened_at timestamptz,
  responded_at timestamptz,
  deleted_at timestamptz, -- soft delete
  created_at timestamptz not null default now()
);

create index if not exists idx_guests_wedding on guests(wedding_id) where deleted_at is null;
create index if not exists idx_guests_token on guests(invite_token);

-- ----------------------------------------------------------------
-- PLUS-ONE REQUESTS: guest asks for a plus one; couple approves.
-- ----------------------------------------------------------------
create table if not exists plus_one_requests (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references guests(id) on delete cascade,
  wedding_id uuid not null references weddings(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','approved','declined')),
  plus_one_guest_id uuid references guests(id) on delete set null,
  requested_at timestamptz not null default now(),
  decided_at timestamptz
);

-- ----------------------------------------------------------------
-- TABLES + SEATING
-- ----------------------------------------------------------------
create table if not exists reception_tables (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  name text not null,
  max_seats int not null default 8,
  created_at timestamptz not null default now()
);

create table if not exists seating_assignments (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references reception_tables(id) on delete cascade,
  guest_id uuid not null references guests(id) on delete cascade unique,
  wedding_id uuid not null references weddings(id) on delete cascade,
  seats int not null default 1,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- ACTIVITY LOG (super admin actions across the platform)
-- ----------------------------------------------------------------
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  wedding_id uuid references weddings(id),
  action text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table weddings enable row level security;
alter table guests enable row level security;
alter table plus_one_requests enable row level security;
alter table reception_tables enable row level security;
alter table seating_assignments enable row level security;
alter table activity_log enable row level security;

-- Helper: is the current logged-in user a super admin?
create or replace function is_super_admin()
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'super_admin'
  );
$$;

-- Helper: which wedding does the current logged-in user manage (if any)?
create or replace function my_wedding_id()
returns uuid
language sql security definer stable
as $$
  select wedding_id from profiles where id = auth.uid();
$$;

-- PROFILES policies
create policy "read own profile" on profiles for select
  using (id = auth.uid() or is_super_admin());
create policy "super admin manages profiles" on profiles for all
  using (is_super_admin());

-- WEDDINGS policies
create policy "super admin full access weddings" on weddings for all
  using (is_super_admin());
create policy "couple reads own wedding" on weddings for select
  using (id = my_wedding_id());
create policy "couple updates own wedding" on weddings for update
  using (id = my_wedding_id());

-- GUESTS policies
create policy "super admin full access guests" on guests for all
  using (is_super_admin());
create policy "couple manages own guests" on guests for all
  using (wedding_id = my_wedding_id());

-- PLUS ONE REQUESTS
create policy "super admin full access plus_one" on plus_one_requests for all
  using (is_super_admin());
create policy "couple manages own plus_one_requests" on plus_one_requests for all
  using (wedding_id = my_wedding_id());

-- TABLES
create policy "super admin full access tables" on reception_tables for all
  using (is_super_admin());
create policy "couple manages own tables" on reception_tables for all
  using (wedding_id = my_wedding_id());

-- SEATING
create policy "super admin full access seating" on seating_assignments for all
  using (is_super_admin());
create policy "couple manages own seating" on seating_assignments for all
  using (wedding_id = my_wedding_id());

-- ACTIVITY LOG
create policy "super admin full access log" on activity_log for all
  using (is_super_admin());
create policy "couple reads own wedding log" on activity_log for select
  using (wedding_id = my_wedding_id());

-- ============================================================
-- PUBLIC GUEST-FACING FUNCTIONS (security definer, callable by
-- anonymous visitors who only ever hold an invite token, never a
-- login). These are the ONLY way an anonymous visitor can touch
-- guest data, which keeps the tables above locked down.
-- ============================================================

-- Fetch everything the RSVP page needs to render, by token.
create or replace function get_invite_by_token(p_token text)
returns json
language plpgsql security definer
as $$
declare
  g guests%rowtype;
  w weddings%rowtype;
  result json;
begin
  select * into g from guests where invite_token = p_token and deleted_at is null;
  if not found then
    return json_build_object('error', 'not_found');
  end if;

  select * into w from weddings where id = g.wedding_id;
  if not w.is_active then
    return json_build_object('error', 'inactive');
  end if;

  -- mark opened, first time only
  if g.opened_at is null then
    update guests set opened_at = now(), invite_status = 'opened'
      where id = g.id;
  end if;

  result := json_build_object(
    'guest', json_build_object(
      'id', g.id,
      'name', g.name,
      'category', g.category,
      'allow_plus_one', g.allow_plus_one,
      'rsvp_status', g.rsvp_status,
      'dietary_restrictions', g.dietary_restrictions,
      'guest_message', g.guest_message
    ),
    'wedding', json_build_object(
      'couple_names', w.couple_names,
      'theme_preset', w.theme_preset,
      'primary_color', w.primary_color,
      'secondary_color', w.secondary_color,
      'accent_color', w.accent_color,
      'cover_photo_url', w.cover_photo_url,
      'logo_url', w.logo_url,
      'welcome_message', w.welcome_message,
      'dress_code', w.dress_code,
      'event_date', w.event_date,
      'rsvp_deadline', w.rsvp_deadline,
      'venue_name', w.venue_name,
      'venue_address', w.venue_address
    )
  );
  return result;
end;
$$;

-- Submit (or update) an RSVP response by token.
create or replace function submit_rsvp(
  p_token text,
  p_rsvp_status text,
  p_dietary text,
  p_message text,
  p_wants_plus_one boolean
)
returns json
language plpgsql security definer
as $$
declare
  g guests%rowtype;
begin
  select * into g from guests where invite_token = p_token and deleted_at is null;
  if not found then
    return json_build_object('error', 'not_found');
  end if;

  if p_rsvp_status not in ('yes','yes_joy','no','from_afar') then
    return json_build_object('error', 'invalid_status');
  end if;

  update guests set
    rsvp_status = p_rsvp_status,
    dietary_restrictions = p_dietary,
    guest_message = p_message,
    invite_status = 'responded',
    responded_at = now()
  where id = g.id;

  if p_wants_plus_one and g.allow_plus_one then
    insert into plus_one_requests (guest_id, wedding_id, status)
    values (g.id, g.wedding_id, 'pending')
    on conflict do nothing;
  end if;

  return json_build_object('ok', true);
end;
$$;

grant execute on function get_invite_by_token(text) to anon, authenticated;
grant execute on function submit_rsvp(text, text, text, text, boolean) to anon, authenticated;
grant execute on function is_super_admin() to authenticated;
grant execute on function my_wedding_id() to authenticated;

-- ============================================================
-- Auto-create a profile row whenever a new auth user is created.
-- Default new signups to couple_admin; promote the first Super
-- Admin manually afterwards (see README).
-- ============================================================
create or replace function handle_new_user()
returns trigger
language plpgsql security definer
as $$
begin
  insert into profiles (id, role, full_name)
  values (new.id, 'couple_admin', new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
