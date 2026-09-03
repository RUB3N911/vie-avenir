create table public.custom_forms (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 2 and 120),
  slug text not null unique check (char_length(slug) between 3 and 100 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null default '' check (char_length(description) <= 2000),
  confirmation_message text not null default 'Merci ! Votre réponse a bien été enregistrée.'
    check (char_length(btrim(confirmation_message)) between 2 and 1000),
  status text not null default 'draft' check (status in ('draft', 'published', 'closed')),
  questions jsonb not null default '[]'::jsonb
    check (jsonb_typeof(questions) = 'array' and jsonb_array_length(questions) <= 40),
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table public.custom_form_responses (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.custom_forms(id) on delete restrict,
  submission_id uuid not null,
  revision integer not null check (revision > 0),
  questions_snapshot jsonb not null default '[]'::jsonb,
  answers jsonb not null check (jsonb_typeof(answers) = 'object' and octet_length(answers::text) <= 250000),
  privacy_consent boolean not null check (privacy_consent),
  created_at timestamptz not null default now(),
  constraint custom_form_responses_submission_key unique (form_id, submission_id)
);
create index custom_forms_updated_by_idx on public.custom_forms(updated_by);
create index custom_forms_updated_at_idx on public.custom_forms(updated_at desc);
create index custom_form_responses_form_date_idx on public.custom_form_responses(form_id, created_at desc, id);

create function private.validate_custom_form()
returns trigger language plpgsql security invoker set search_path = ''
as $$
declare q jsonb; opt jsonb; ids text[] := array[]::text[]; choices text[]; qid text;
begin
  if jsonb_typeof(new.questions) is distinct from 'array'
     or jsonb_array_length(new.questions) > 40
     or octet_length(new.questions::text) > 150000 then
    raise exception 'invalid_form_questions';
  end if;
  if new.status = 'published' and jsonb_array_length(new.questions) = 0 then
    raise exception 'published_form_requires_questions';
  end if;
  for q in select value from jsonb_array_elements(new.questions) loop
    if jsonb_typeof(q) is distinct from 'object'
       or jsonb_typeof(q->'id') is distinct from 'string'
       or jsonb_typeof(q->'label') is distinct from 'string'
       or jsonb_typeof(q->'help_text') is distinct from 'string'
       or jsonb_typeof(q->'required') is distinct from 'boolean'
       or jsonb_typeof(q->'type') is distinct from 'string'
       or jsonb_typeof(q->'options') is distinct from 'array' then
      raise exception 'invalid_form_question';
    end if;
    qid := q->>'id';
    if qid !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
       or qid = any(ids) or char_length(btrim(q->>'label')) not between 1 and 200
       or char_length(q->>'help_text') > 500
       or q->>'type' not in ('short_text','long_text','email','phone','number','date','single_choice','multiple_choice') then
      raise exception 'invalid_form_question';
    end if;
    ids := array_append(ids, qid);
    if jsonb_array_length(q->'options') > 20
       or (q->>'type' in ('single_choice','multiple_choice') and jsonb_array_length(q->'options') < 2) then
      raise exception 'invalid_form_options';
    end if;
    choices := array[]::text[];
    for opt in select value from jsonb_array_elements(q->'options') loop
      if jsonb_typeof(opt) is distinct from 'string'
         or char_length(btrim(opt #>> '{}')) not between 1 and 120
         or (opt #>> '{}') = any(choices) then
        raise exception 'invalid_form_options';
      end if;
      choices := array_append(choices, opt #>> '{}');
    end loop;
  end loop;
  if tg_op = 'UPDATE' then
    new.revision := old.revision + 1;
    new.created_at := old.created_at;
  else
    new.revision := 1;
    new.created_at := now();
  end if;
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;
revoke all on function private.validate_custom_form() from public, anon, authenticated;
create trigger validate_custom_form before insert or update on public.custom_forms
for each row execute function private.validate_custom_form();

create function private.validate_custom_form_response()
returns trigger language plpgsql security invoker set search_path = ''
as $$
declare
  current_form record; q jsonb; answer jsonb; option_value jsonb;
  key text; value_text text; clean_answers jsonb := '{}'::jsonb; selected text[];
begin
  select questions, revision, status into current_form from public.custom_forms where id = new.form_id;
  if not found or current_form.status <> 'published' then raise exception 'form_not_open'; end if;
  if new.revision is distinct from current_form.revision then raise exception 'form_revision_changed'; end if;
  if new.privacy_consent is distinct from true then raise exception 'privacy_consent_required'; end if;
  if jsonb_typeof(new.answers) is distinct from 'object' or octet_length(new.answers::text) > 250000 then
    raise exception 'invalid_form_answers';
  end if;
  for key in select jsonb_object_keys(new.answers) loop
    if not exists (select 1 from jsonb_array_elements(current_form.questions) as question where question->>'id' = key) then
      raise exception 'unknown_form_question';
    end if;
  end loop;
  for q in select value from jsonb_array_elements(current_form.questions) loop
    key := q->>'id';
    answer := new.answers->key;
    if q->>'type' = 'multiple_choice' then
      answer := coalesce(answer, '[]'::jsonb);
      if jsonb_typeof(answer) is distinct from 'array' then raise exception 'invalid_form_answer'; end if;
      if jsonb_array_length(answer) > 20 or ((q->>'required')::boolean and jsonb_array_length(answer) = 0) then
        raise exception 'invalid_form_answer';
      end if;
      selected := array[]::text[];
      for option_value in select value from jsonb_array_elements(answer) loop
        if jsonb_typeof(option_value) is distinct from 'string'
           or not (q->'options' @> jsonb_build_array(option_value))
           or (option_value #>> '{}') = any(selected) then raise exception 'invalid_form_choice'; end if;
        selected := array_append(selected, option_value #>> '{}');
      end loop;
      clean_answers := clean_answers || jsonb_build_object(key, answer);
    else
      answer := coalesce(answer, '""'::jsonb);
      if jsonb_typeof(answer) is distinct from 'string' then raise exception 'invalid_form_answer'; end if;
      value_text := btrim(answer #>> '{}');
      if (q->>'required')::boolean and value_text = '' then raise exception 'required_form_answer'; end if;
      if char_length(value_text) > (case when q->>'type' = 'long_text' then 5000 else 500 end) then
        raise exception 'form_answer_too_long';
      end if;
      if value_text <> '' then
        case q->>'type'
          when 'single_choice' then
            if not (q->'options' @> jsonb_build_array(value_text)) then raise exception 'invalid_form_choice'; end if;
          when 'email' then
            if value_text !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'invalid_form_email'; end if;
          when 'phone' then
            if value_text !~ '^\+?[0-9[:space:]().-]{6,30}$' then raise exception 'invalid_form_phone'; end if;
          when 'number' then
            if value_text !~ '^-?[0-9]+(\.[0-9]+)?$' then raise exception 'invalid_form_number'; end if;
            perform value_text::double precision;
          when 'date' then
            if value_text !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then raise exception 'invalid_form_date'; end if;
            perform value_text::date;
          else null;
        end case;
      end if;
      clean_answers := clean_answers || jsonb_build_object(key, value_text);
    end if;
  end loop;
  new.answers := clean_answers;
  new.questions_snapshot := current_form.questions;
  new.created_at := now();
  return new;
end;
$$;
revoke all on function private.validate_custom_form_response() from public, anon, authenticated;
create trigger validate_custom_form_response before insert on public.custom_form_responses
for each row execute function private.validate_custom_form_response();

alter table public.custom_forms enable row level security;
alter table public.custom_form_responses enable row level security;

create policy "Anonymous readers see published or closed forms"
on public.custom_forms for select to anon using (status in ('published', 'closed'));
create policy "Authenticated readers see public forms or administer forms"
on public.custom_forms for select to authenticated using (status in ('published', 'closed') or (select private.is_admin()));
create policy "Admins create custom forms"
on public.custom_forms for insert to authenticated with check ((select private.is_admin()));
create policy "Admins update custom forms"
on public.custom_forms for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Visitors submit to open forms"
on public.custom_form_responses for insert to anon, authenticated
with check (privacy_consent and exists (select 1 from public.custom_forms where id = form_id and status = 'published' and revision = custom_form_responses.revision));
create policy "Only admins read custom form responses"
on public.custom_form_responses for select to authenticated using ((select private.is_admin()));

revoke all on public.custom_forms from public, anon, authenticated;
revoke all on public.custom_form_responses from public, anon, authenticated;
grant select (id,title,slug,description,confirmation_message,status,questions,revision,created_at,updated_at)
on public.custom_forms to anon;
grant select, insert, update on public.custom_forms to authenticated;
grant insert (form_id,submission_id,revision,answers,privacy_consent)
on public.custom_form_responses to anon, authenticated;
grant select on public.custom_form_responses to authenticated;
