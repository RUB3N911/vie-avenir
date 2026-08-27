alter function public.register_for_event(
  uuid, text, text, date, text, text, text, text, text, text, text, boolean, boolean, boolean
) set schema private;

revoke all on function private.register_for_event(
  uuid, text, text, date, text, text, text, text, text, text, text, boolean, boolean, boolean
) from public, anon, authenticated;

grant usage on schema private to anon;
grant execute on function private.register_for_event(
  uuid, text, text, date, text, text, text, text, text, text, text, boolean, boolean, boolean
) to anon, authenticated;

create function public.register_for_event(
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
language sql
security invoker
set search_path = ''
as $$
  select *
  from private.register_for_event(
    p_event_id,
    p_first_name,
    p_last_name,
    p_birth_date,
    p_contact_email,
    p_contact_phone,
    p_city,
    p_guardian_name,
    p_guardian_email,
    p_guardian_phone,
    p_accessibility_needs,
    p_photo_consent,
    p_privacy_consent,
    p_guardian_consent
  );
$$;

comment on function public.register_for_event is
  'Public security-invoker wrapper around a narrow private registration function. Returns only the generated id and allocated status.';

revoke all on function public.register_for_event(
  uuid, text, text, date, text, text, text, text, text, text, text, boolean, boolean, boolean
) from public, anon, authenticated;
grant execute on function public.register_for_event(
  uuid, text, text, date, text, text, text, text, text, text, text, boolean, boolean, boolean
) to anon, authenticated;

alter function public.admin_cancel_event_registration(uuid) security invoker;
alter function public.admin_promote_event_registration(uuid) security invoker;

create index event_registration_messages_sent_by_idx
  on public.event_registration_messages (sent_by);
