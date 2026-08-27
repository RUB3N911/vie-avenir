create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  participant_first_name text not null check (char_length(participant_first_name) between 2 and 80),
  participant_last_name text not null check (char_length(participant_last_name) between 2 and 80),
  birth_date date not null,
  contact_email text not null check (char_length(contact_email) between 5 and 254),
  contact_phone text not null check (char_length(contact_phone) between 6 and 30),
  city text check (city is null or char_length(city) <= 120),
  guardian_name text check (guardian_name is null or char_length(guardian_name) <= 160),
  guardian_email text check (guardian_email is null or char_length(guardian_email) <= 254),
  guardian_phone text check (guardian_phone is null or char_length(guardian_phone) <= 30),
  accessibility_needs text check (accessibility_needs is null or char_length(accessibility_needs) <= 1000),
  photo_consent boolean not null default false,
  privacy_consent_at timestamptz not null,
  guardian_consent_at timestamptz,
  status text not null check (status in ('confirmed', 'waitlisted', 'cancelled', 'attended', 'no_show')),
  admin_notes text check (admin_notes is null or char_length(admin_notes) <= 2000),
  status_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create unique index event_registrations_active_identity_idx
  on public.event_registrations (
    event_id,
    lower(contact_email),
    lower(participant_first_name),
    lower(participant_last_name)
  )
  where status <> 'cancelled';

create index event_registrations_event_status_created_idx
  on public.event_registrations (event_id, status, created_at);

create index event_registrations_updated_by_idx
  on public.event_registrations (updated_by);

create table public.event_registration_messages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  audience text not null check (audience in ('confirmed', 'waitlisted', 'all')),
  subject text not null check (char_length(subject) between 3 and 160),
  body text not null check (char_length(body) between 3 and 5000),
  recipient_count integer not null default 0 check (recipient_count >= 0),
  delivered_count integer not null default 0 check (delivered_count >= 0),
  failed_count integer not null default 0 check (failed_count >= 0),
  delivery_status text not null default 'sending'
    check (delivery_status in ('sending', 'sent', 'partial', 'failed')),
  sent_at timestamptz not null default now(),
  sent_by uuid not null references auth.users(id)
);

create index event_registration_messages_event_sent_idx
  on public.event_registration_messages (event_id, sent_at desc);

create trigger event_registrations_updated_at
before update on public.event_registrations
for each row execute function public.set_updated_at();

alter table public.event_registrations enable row level security;
alter table public.event_registration_messages enable row level security;

create policy "Admins read event registrations"
on public.event_registrations for select to authenticated
using ((select private.is_admin()));

create policy "Admins insert event registrations"
on public.event_registrations for insert to authenticated
with check ((select private.is_admin()));

create policy "Admins update event registrations"
on public.event_registrations for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins delete event registrations"
on public.event_registrations for delete to authenticated
using ((select private.is_admin()));

create policy "Admins read event registration messages"
on public.event_registration_messages for select to authenticated
using ((select private.is_admin()));

create policy "Admins insert event registration messages"
on public.event_registration_messages for insert to authenticated
with check ((select private.is_admin()) and sent_by = (select auth.uid()));

create policy "Admins update event registration messages"
on public.event_registration_messages for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()) and sent_by = (select auth.uid()));

revoke all on table public.event_registrations from public, anon, authenticated;
revoke all on table public.event_registration_messages from public, anon, authenticated;
grant select, insert, update, delete on table public.event_registrations to authenticated;
grant select, insert, update on table public.event_registration_messages to authenticated;

create or replace function public.register_for_event(
  p_event_id uuid,
  p_first_name text,
  p_last_name text,
  p_birth_date date,
  p_contact_email text,
  p_contact_phone text,
  p_city text,
  p_guardian_name text,
  p_guardian_email text,
  p_guardian_phone text,
  p_accessibility_needs text,
  p_photo_consent boolean,
  p_privacy_consent boolean,
  p_guardian_consent boolean
)
returns table (registration_id uuid, registration_status text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.events%rowtype;
  v_age integer;
  v_confirmed_count integer;
  v_registration_id uuid := gen_random_uuid();
  v_status text;
  v_email text := lower(trim(p_contact_email));
begin
  if not p_privacy_consent then
    raise exception using message = 'privacy_consent_required', errcode = '22023';
  end if;

  if char_length(trim(p_first_name)) not between 2 and 80
     or char_length(trim(p_last_name)) not between 2 and 80
     or char_length(v_email) not between 5 and 254
     or v_email !~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'
     or char_length(trim(p_contact_phone)) not between 6 and 30
     or p_birth_date is null
     or p_birth_date > current_date then
    raise exception using message = 'invalid_registration_data', errcode = '22023';
  end if;

  if char_length(coalesce(trim(p_city), '')) > 120
     or char_length(coalesce(trim(p_guardian_name), '')) > 160
     or char_length(coalesce(trim(p_guardian_email), '')) > 254
     or char_length(coalesce(trim(p_guardian_phone), '')) > 30
     or char_length(coalesce(trim(p_accessibility_needs), '')) > 1000 then
    raise exception using message = 'invalid_registration_data', errcode = '22023';
  end if;

  select * into v_event
  from public.events
  where id = p_event_id
  for update;

  if not found or v_event.publication_status <> 'published' then
    raise exception using message = 'event_not_found', errcode = 'P0002';
  end if;

  if v_event.registration_status not in ('open', 'full') then
    raise exception using message = 'registrations_not_open', errcode = '55000';
  end if;

  if v_event.registration_deadline is not null and v_event.registration_deadline < now() then
    raise exception using message = 'registration_deadline_passed', errcode = '55000';
  end if;

  if v_event.starts_at <= now() then
    raise exception using message = 'event_started', errcode = '55000';
  end if;

  v_age := extract(year from age(v_event.starts_at::date, p_birth_date))::integer;
  if v_age < v_event.age_min or v_age > v_event.age_max then
    raise exception using message = 'participant_age_not_eligible', errcode = '22023';
  end if;

  if v_age < 18 and (
    not p_guardian_consent
    or char_length(coalesce(trim(p_guardian_name), '')) < 2
    or coalesce(trim(p_guardian_email), '') !~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'
    or char_length(coalesce(trim(p_guardian_phone), '')) < 6
  ) then
    raise exception using message = 'guardian_details_required', errcode = '22023';
  end if;

  if (
    select count(*)
    from public.event_registrations
    where event_id = p_event_id
      and lower(contact_email) = v_email
      and status <> 'cancelled'
  ) >= 5 then
    raise exception using message = 'registration_email_limit_reached', errcode = '54000';
  end if;

  select count(*) into v_confirmed_count
  from public.event_registrations
  where event_id = p_event_id and status in ('confirmed', 'attended');

  v_status := case
    when v_event.capacity is null or v_confirmed_count < v_event.capacity then 'confirmed'
    else 'waitlisted'
  end;

  insert into public.event_registrations (
    id,
    event_id,
    participant_first_name,
    participant_last_name,
    birth_date,
    contact_email,
    contact_phone,
    city,
    guardian_name,
    guardian_email,
    guardian_phone,
    accessibility_needs,
    photo_consent,
    privacy_consent_at,
    guardian_consent_at,
    status
  ) values (
    v_registration_id,
    p_event_id,
    trim(p_first_name),
    trim(p_last_name),
    p_birth_date,
    v_email,
    trim(p_contact_phone),
    nullif(trim(p_city), ''),
    nullif(trim(p_guardian_name), ''),
    nullif(lower(trim(p_guardian_email)), ''),
    nullif(trim(p_guardian_phone), ''),
    nullif(trim(p_accessibility_needs), ''),
    coalesce(p_photo_consent, false),
    now(),
    case when v_age < 18 then now() else null end,
    v_status
  );

  if v_event.capacity is not null
     and v_status = 'confirmed'
     and v_confirmed_count + 1 >= v_event.capacity
     and v_event.registration_status = 'open' then
    update public.events set registration_status = 'full' where id = p_event_id;
  end if;

  return query select v_registration_id, v_status;
end;
$$;

comment on function public.register_for_event is
  'Narrow anonymous registration endpoint. It validates inputs, locks the event for capacity allocation and returns no participant data.';

revoke all on function public.register_for_event(uuid, text, text, date, text, text, text, text, text, text, text, boolean, boolean, boolean)
  from public, anon, authenticated;
grant execute on function public.register_for_event(uuid, text, text, date, text, text, text, text, text, text, text, boolean, boolean, boolean)
  to anon, authenticated;

create or replace function public.admin_cancel_event_registration(p_registration_id uuid)
returns table (
  promoted_registration_id uuid,
  promoted_email text,
  promoted_first_name text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_registration public.event_registrations%rowtype;
  v_promoted public.event_registrations%rowtype;
  v_event public.events%rowtype;
  v_confirmed_count integer;
begin
  if not (select private.is_admin()) then
    raise insufficient_privilege using message = 'admin_required';
  end if;

  select * into v_registration
  from public.event_registrations
  where id = p_registration_id
  for update;

  if not found then
    raise exception using message = 'registration_not_found', errcode = 'P0002';
  end if;

  if v_registration.status = 'cancelled' then
    return query select null::uuid, null::text, null::text;
    return;
  end if;

  select * into v_event from public.events where id = v_registration.event_id for update;

  update public.event_registrations
  set status = 'cancelled', status_updated_at = now(), updated_by = (select auth.uid())
  where id = p_registration_id;

  if v_registration.status in ('confirmed', 'attended') then
    select * into v_promoted
    from public.event_registrations
    where event_id = v_registration.event_id and status = 'waitlisted'
    order by created_at
    for update skip locked
    limit 1;

    if found then
      update public.event_registrations
      set status = 'confirmed', status_updated_at = now(), updated_by = (select auth.uid())
      where id = v_promoted.id;
    end if;
  end if;

  select count(*) into v_confirmed_count
  from public.event_registrations
  where event_id = v_registration.event_id and status in ('confirmed', 'attended');

  if v_event.registration_status in ('open', 'full') then
    update public.events
    set registration_status = case
      when v_event.capacity is not null and v_confirmed_count >= v_event.capacity then 'full'
      else 'open'
    end
    where id = v_event.id;
  end if;

  return query select v_promoted.id, v_promoted.contact_email, v_promoted.participant_first_name;
end;
$$;

revoke all on function public.admin_cancel_event_registration(uuid) from public, anon, authenticated;
grant execute on function public.admin_cancel_event_registration(uuid) to authenticated;

create or replace function public.admin_promote_event_registration(p_registration_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_registration public.event_registrations%rowtype;
  v_event public.events%rowtype;
  v_confirmed_count integer;
begin
  if not (select private.is_admin()) then
    raise insufficient_privilege using message = 'admin_required';
  end if;

  select * into v_registration
  from public.event_registrations
  where id = p_registration_id and status = 'waitlisted'
  for update;

  if not found then
    raise exception using message = 'waitlisted_registration_not_found', errcode = 'P0002';
  end if;

  select * into v_event from public.events where id = v_registration.event_id for update;
  select count(*) into v_confirmed_count
  from public.event_registrations
  where event_id = v_registration.event_id and status in ('confirmed', 'attended');

  if v_event.capacity is not null and v_confirmed_count >= v_event.capacity then
    raise exception using message = 'event_capacity_reached', errcode = '55000';
  end if;

  update public.event_registrations
  set status = 'confirmed', status_updated_at = now(), updated_by = (select auth.uid())
  where id = p_registration_id;

  if v_event.capacity is not null
     and v_confirmed_count + 1 >= v_event.capacity
     and v_event.registration_status = 'open' then
    update public.events set registration_status = 'full' where id = v_event.id;
  end if;
end;
$$;

revoke all on function public.admin_promote_event_registration(uuid) from public, anon, authenticated;
grant execute on function public.admin_promote_event_registration(uuid) to authenticated;
