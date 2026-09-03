-- Additive upgrade: existing forms and historical response snapshots are untouched.
alter table public.custom_forms
  add column blocks jsonb not null default '[{"id":"00000000-0000-4000-8000-000000000001","title":"Questions"}]'::jsonb,
  add column notify_on_response boolean not null default false;

create function private.validate_custom_form_blocks()
returns trigger language plpgsql security invoker set search_path = ''
as $$
declare
  block jsonb;
  question jsonb;
  block_ids text[] := array[]::text[];
  block_titles jsonb := '{}'::jsonb;
  block_id text;
  canonical_questions jsonb := '[]'::jsonb;
begin
  if jsonb_typeof(new.blocks) is distinct from 'array'
     or jsonb_array_length(new.blocks) not between 1 and 20
     or octet_length(new.blocks::text) > 20000 then
    raise exception 'invalid_form_blocks';
  end if;
  for block in select value from jsonb_array_elements(new.blocks) loop
    if jsonb_typeof(block) is distinct from 'object'
       or jsonb_typeof(block->'id') is distinct from 'string'
       or jsonb_typeof(block->'title') is distinct from 'string' then
      raise exception 'invalid_form_block';
    end if;
    block_id := block->>'id';
    if block_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
       or block_id = any(block_ids)
       or char_length(btrim(block->>'title')) not between 1 and 120 then
      raise exception 'invalid_form_block';
    end if;
    block_ids := array_append(block_ids, block_id);
    block_titles := block_titles || jsonb_build_object(block_id, btrim(block->>'title'));
  end loop;
  for question in select value from jsonb_array_elements(new.questions) loop
    -- An old editor may omit block metadata; assign those questions to the first block.
    block_id := case when question ? 'block_id' then question->>'block_id' else block_ids[1] end;
    if block_id is null or not (block_id = any(block_ids)) then
      raise exception 'unknown_question_block';
    end if;
    -- Stamp the authoritative title so future renames cannot change past responses.
    canonical_questions := canonical_questions || jsonb_build_array(question || jsonb_build_object(
      'block_id', block_id, 'block_title', block_titles->>block_id
    ));
  end loop;
  new.questions := canonical_questions;
  return new;
end;
$$;
revoke all on function private.validate_custom_form_blocks() from public, anon, authenticated;
create trigger validate_custom_form_blocks before insert or update on public.custom_forms
for each row execute function private.validate_custom_form_blocks();

-- These contain only display metadata / a boolean, never credentials or responses.
-- Existing row-level policies still restrict access to published/closed forms.
grant select (blocks, notify_on_response) on public.custom_forms to anon;
