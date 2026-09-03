-- Integration regression test. Run as the database owner on a migrated database.
-- Every fixture is rolled back; this never calls Resend or sends real e-mails.
begin;
do $$
declare fid uuid := gen_random_uuid(); qid uuid := gen_random_uuid();
begin
  insert into public.custom_forms (id, title, slug, status, blocks, questions, notify_on_response)
  values (fid, 'Test des blocs', 'test-blocs-' || fid::text, 'published',
    '[{"id":"00000000-0000-4000-8000-000000000001","title":"Coordonnées"},{"id":"00000000-0000-4000-8000-000000000002","title":"Attentes"}]',
    jsonb_build_array(jsonb_build_object('id', qid::text, 'label', 'Votre prénom', 'help_text', '', 'type', 'short_text', 'required', true, 'options', '[]'::jsonb)), true);
  perform set_config('test.form_id', fid::text, true);
  perform set_config('test.question_id', qid::text, true);
  perform set_config('test.submission_id', gen_random_uuid()::text, true);
end;
$$;

set local role anon;
do $$
declare form_record record;
begin
  select id, revision, blocks, notify_on_response into strict form_record
    from public.custom_forms where id = current_setting('test.form_id')::uuid;
  if jsonb_array_length(form_record.blocks) <> 2 or not form_record.notify_on_response then
    raise exception 'public_metadata_inaccessible';
  end if;
  insert into public.custom_form_responses (form_id, submission_id, revision, answers, privacy_consent)
  values (form_record.id, current_setting('test.submission_id')::uuid, form_record.revision,
    jsonb_build_object(current_setting('test.question_id'), 'Réponse de test'), true);
  begin
    insert into public.custom_form_responses (form_id, submission_id, revision, answers, privacy_consent)
    values (form_record.id, current_setting('test.submission_id')::uuid, form_record.revision,
      jsonb_build_object(current_setting('test.question_id'), 'Réponse de test'), true);
    raise exception 'duplicate_submission_accepted';
  exception when unique_violation then null;
  end;
  if has_table_privilege('anon', 'public.custom_form_responses', 'SELECT')
     or has_column_privilege('anon', 'public.custom_forms', 'notify_on_response', 'UPDATE') then
    raise exception 'anonymous_access_too_broad';
  end if;
end;
$$;
reset role;

do $$
declare current_snapshot jsonb; saved_revision integer;
begin
  select questions_snapshot into strict current_snapshot from public.custom_form_responses
    where form_id = current_setting('test.form_id')::uuid;
  if current_snapshot->0->>'block_title' <> 'Coordonnées' then raise exception 'snapshot_not_stamped'; end if;
  update public.custom_forms set blocks = jsonb_set(blocks, '{0,title}', '"À propos de vous"')
    where id = current_setting('test.form_id')::uuid;
  if (select questions->0->>'block_title' from public.custom_forms where id = current_setting('test.form_id')::uuid) <> 'À propos de vous' then
    raise exception 'new_title_not_saved';
  end if;
  if (select questions_snapshot from public.custom_form_responses where form_id = current_setting('test.form_id')::uuid) <> current_snapshot then
    raise exception 'historical_snapshot_modified';
  end if;
  select revision into saved_revision from public.custom_forms where id = current_setting('test.form_id')::uuid;
  begin
    update public.custom_forms set blocks = '[]' where id = current_setting('test.form_id')::uuid;
    raise exception 'empty_blocks_accepted';
  exception when raise_exception then
    if sqlerrm <> 'invalid_form_blocks' then raise; end if;
  end;
  begin
    update public.custom_forms set blocks = jsonb_build_array(blocks->0, blocks->0) where id = current_setting('test.form_id')::uuid;
    raise exception 'duplicate_blocks_accepted';
  exception when raise_exception then
    if sqlerrm <> 'invalid_form_block' then raise; end if;
  end;
  begin
    update public.custom_forms set blocks = jsonb_set(blocks, '{0,title}', '" "') where id = current_setting('test.form_id')::uuid;
    raise exception 'blank_block_title_accepted';
  exception when raise_exception then
    if sqlerrm <> 'invalid_form_block' then raise; end if;
  end;
  begin
    update public.custom_forms set questions = jsonb_set(questions, '{0,block_id}', to_jsonb(gen_random_uuid()::text)) where id = current_setting('test.form_id')::uuid;
    raise exception 'orphan_question_accepted';
  exception when raise_exception then
    if sqlerrm <> 'unknown_question_block' then raise; end if;
  end;
  if (select revision from public.custom_forms where id = current_setting('test.form_id')::uuid) <> saved_revision then
    raise exception 'failed_update_changed_revision';
  end if;
end;
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', gen_random_uuid()::text, true);
do $$
begin
  if exists(select 1 from public.custom_form_responses where form_id = current_setting('test.form_id')::uuid) then
    raise exception 'non_admin_can_read_responses';
  end if;
  update public.custom_forms set notify_on_response = false where id = current_setting('test.form_id')::uuid;
  if found then raise exception 'non_admin_can_edit_notifications'; end if;
end;
$$;
reset role;
rollback;
select 'Custom form block, snapshot, deduplication and RLS checks passed; fixtures rolled back.' as result;
