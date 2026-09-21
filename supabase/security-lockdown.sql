-- ============================================================
-- SECURITY LOCKDOWN
--
-- Run this in the Supabase SQL Editor AFTER the matching app code is
-- deployed (the public RSVP / seat / join pages now read and write through
-- server routes; the old pages depended on the open policies removed here).
-- Safe to re-run.
--
-- Fixes, found by auditing the live policies (pg_policies):
--   1. Anyone holding the public anon key could read every guest (names,
--      phones), insert guests, and edit any guest's RSVP.
--   2. Those same "Public can ..." policies applied to every role, so any
--      logged-in user of any wedding could read every other wedding's guests.
--   3. Co-admin invite tokens were readable by everyone.
--   4. Any user could UPDATE their own profile with no column limits, i.e.
--      set role = 'super_admin' or attach themselves to any wedding.
--   5. Anyone could write rows into activity_log.
--   6. Any user could list every active wedding.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Remove the over-broad policies
-- ------------------------------------------------------------
drop policy if exists "Public can read guests by token"        on guests;
drop policy if exists "Public can update own rsvp via token"   on guests;
drop policy if exists "Public can insert guest via open rsvp"  on guests;

drop policy if exists "Public can read invite by token"        on co_admin_invites;

drop policy if exists "Anyone can insert activity logs"        on activity_log;
drop policy if exists "Public can insert activity logs"        on activity_log;
drop policy if exists "Authenticated users can insert activity logs" on activity_log;

drop policy if exists "Public can read active weddings"        on weddings;

-- Onboarding inserts a wedding and reads it straight back, before the
-- profile is linked to it. That relied on "read active weddings"; let the
-- creator read their own wedding instead.
drop policy if exists "creator reads own wedding" on weddings;
create policy "creator reads own wedding" on weddings
  for select to authenticated
  using (created_by = auth.uid());

-- ------------------------------------------------------------
-- 2. Stop users editing their own role / joining arbitrary weddings
--    (the "Users can update own profile" policy stays, so name changes
--    and onboarding keep working — this limits WHAT can change.)
-- ------------------------------------------------------------
create or replace function protect_profile_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Server-side calls (service role, SQL editor) carry no user; super admins
  -- may manage anyone's profile.
  if auth.uid() is null or is_super_admin() then
    return new;
  end if;

  if new.id is distinct from old.id then
    raise exception 'Cannot change profile id';
  end if;

  if new.role is distinct from old.role then
    raise exception 'You cannot change your own role';
  end if;

  -- A user may only link their profile to a wedding they created (that is
  -- what onboarding does). Joining someone else's wedding as co-admin goes
  -- through the server, which checks the invite token.
  if new.wedding_id is distinct from old.wedding_id
     and new.wedding_id is not null
     and not exists (
       select 1 from weddings w
       where w.id = new.wedding_id and w.created_by = auth.uid()
     ) then
    raise exception 'You can only link your profile to a wedding you created';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_columns on profiles;
create trigger protect_profile_columns
  before update on profiles
  for each row execute function protect_profile_columns();

-- ------------------------------------------------------------
-- 3. The public anon key gets no direct table access at all.
--    Every public page now goes through server routes (service role) or
--    the narrow functions granted below.
-- ------------------------------------------------------------
revoke all on all tables    in schema public from anon;
revoke all on all sequences in schema public from anon;

alter default privileges for role postgres in schema public
  revoke all on tables from anon;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon;
alter default privileges for role postgres in schema public
  revoke execute on functions from anon;

-- ------------------------------------------------------------
-- 4. Function permissions: only what each role actually needs
-- ------------------------------------------------------------
-- Not callable from the browser at all (the server calls these):
revoke execute on function save_plus_one(text, text, text)  from public, anon, authenticated;
revoke execute on function sync_partner_rsvp(text, text)    from public, anon, authenticated;
grant  execute on function save_plus_one(text, text, text)  to service_role;
grant  execute on function sync_partner_rsvp(text, text)    to service_role;

-- Older token RPCs no longer used by the app:
revoke execute on function get_invite_by_token(text)                        from public, anon, authenticated;
revoke execute on function submit_rsvp(text, text, text, text, boolean)     from public, anon, authenticated;
grant  execute on function get_invite_by_token(text)                        to service_role;
grant  execute on function submit_rsvp(text, text, text, text, boolean)     to service_role;

-- Row-level-security helpers: evaluated for logged-in users only.
revoke execute on function is_super_admin()          from public, anon;
revoke execute on function my_wedding_id()           from public, anon;
revoke execute on function manages_wedding(uuid)     from public, anon;
grant  execute on function is_super_admin()          to authenticated, service_role;
grant  execute on function my_wedding_id()           to authenticated, service_role;
grant  execute on function manages_wedding(uuid)     to authenticated, service_role;

-- The venue "find your table" QR flow stays public, by design:
revoke execute on function get_seat_by_token(text)            from public;
revoke execute on function search_guests_by_name(uuid, text)  from public;
revoke execute on function get_seat_by_guest_id(uuid, uuid)   from public;
revoke execute on function normalize_gh_phone(text)           from public;
grant  execute on function get_seat_by_token(text)            to anon, authenticated, service_role;
grant  execute on function search_guests_by_name(uuid, text)  to anon, authenticated, service_role;
grant  execute on function get_seat_by_guest_id(uuid, uuid)   to anon, authenticated, service_role;
grant  execute on function normalize_gh_phone(text)           to anon, authenticated, service_role;

-- ------------------------------------------------------------
-- 5. Check: the remaining policies should all be scoped to a wedding, to
--    the super admin, or to the user themselves. Nothing with "true".
-- ------------------------------------------------------------
select tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('guests', 'co_admin_invites', 'activity_log', 'weddings', 'profiles')
order by tablename, cmd, policyname;
