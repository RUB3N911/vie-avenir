create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where id = (select auth.uid())
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

drop policy if exists "Public can read association settings" on public.association_settings;
drop policy if exists "Admins manage association settings" on public.association_settings;

create policy "Everyone can read association settings"
on public.association_settings for select to anon, authenticated
using (true);

create policy "Admins insert association settings"
on public.association_settings for insert to authenticated
with check ((select private.is_admin()));

create policy "Admins update association settings"
on public.association_settings for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins delete association settings"
on public.association_settings for delete to authenticated
using ((select private.is_admin()));

drop policy if exists "Public can read published events" on public.events;
drop policy if exists "Admins manage events" on public.events;

create policy "Anonymous users read published events"
on public.events for select to anon
using (publication_status = 'published');

create policy "Authenticated users read allowed events"
on public.events for select to authenticated
using (publication_status = 'published' or (select private.is_admin()));

create policy "Admins insert events"
on public.events for insert to authenticated
with check ((select private.is_admin()));

create policy "Admins update events"
on public.events for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins delete events"
on public.events for delete to authenticated
using ((select private.is_admin()));

drop policy if exists "Admins upload event images" on storage.objects;
drop policy if exists "Admins update event images" on storage.objects;
drop policy if exists "Admins delete event images" on storage.objects;

create policy "Admins upload event images"
on storage.objects for insert to authenticated
with check (bucket_id = 'event-images' and (select private.is_admin()));

create policy "Admins update event images"
on storage.objects for update to authenticated
using (bucket_id = 'event-images' and (select private.is_admin()))
with check (bucket_id = 'event-images' and (select private.is_admin()));

create policy "Admins delete event images"
on storage.objects for delete to authenticated
using (bucket_id = 'event-images' and (select private.is_admin()));

drop function if exists public.is_admin();

create index if not exists association_settings_updated_by_idx
  on public.association_settings (updated_by);

create index if not exists events_updated_by_idx
  on public.events (updated_by);
