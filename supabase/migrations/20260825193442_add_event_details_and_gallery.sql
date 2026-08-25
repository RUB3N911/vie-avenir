create table if not exists public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  event_id uuid references public.events(id) on delete set null,
  published boolean not null default false,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.gallery_media (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.gallery_albums(id) on delete cascade,
  media_type text not null check (media_type in ('photo', 'video')),
  file_url text not null,
  storage_path text not null unique,
  title text,
  caption text,
  alt_text text,
  mime_type text not null,
  file_size bigint not null check (file_size > 0),
  display_order integer not null default 0 check (display_order >= 0),
  is_cover boolean not null default false,
  published boolean not null default false,
  consent_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  constraint gallery_media_published_requires_consent
    check (not published or consent_confirmed)
);

create index if not exists gallery_albums_publication_order_idx
  on public.gallery_albums (published, display_order, created_at desc);
create index if not exists gallery_albums_event_id_idx
  on public.gallery_albums (event_id);
create index if not exists gallery_albums_updated_by_idx
  on public.gallery_albums (updated_by);
create index if not exists gallery_media_album_order_idx
  on public.gallery_media (album_id, published, display_order, created_at);
create index if not exists gallery_media_updated_by_idx
  on public.gallery_media (updated_by);
create unique index if not exists gallery_media_one_cover_per_album_idx
  on public.gallery_media (album_id)
  where is_cover;

drop trigger if exists gallery_albums_updated_at on public.gallery_albums;
create trigger gallery_albums_updated_at
before update on public.gallery_albums
for each row execute function public.set_updated_at();

drop trigger if exists gallery_media_updated_at on public.gallery_media;
create trigger gallery_media_updated_at
before update on public.gallery_media
for each row execute function public.set_updated_at();

alter table public.gallery_albums enable row level security;
alter table public.gallery_media enable row level security;

drop policy if exists "Anonymous users read published gallery albums" on public.gallery_albums;
create policy "Anonymous users read published gallery albums"
on public.gallery_albums for select to anon
using (published);

drop policy if exists "Authenticated users read allowed gallery albums" on public.gallery_albums;
create policy "Authenticated users read allowed gallery albums"
on public.gallery_albums for select to authenticated
using (published or (select private.is_admin()));

drop policy if exists "Admins insert gallery albums" on public.gallery_albums;
create policy "Admins insert gallery albums"
on public.gallery_albums for insert to authenticated
with check ((select private.is_admin()));

drop policy if exists "Admins update gallery albums" on public.gallery_albums;
create policy "Admins update gallery albums"
on public.gallery_albums for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "Admins delete gallery albums" on public.gallery_albums;
create policy "Admins delete gallery albums"
on public.gallery_albums for delete to authenticated
using ((select private.is_admin()));

drop policy if exists "Anonymous users read published gallery media" on public.gallery_media;
create policy "Anonymous users read published gallery media"
on public.gallery_media for select to anon
using (
  published
  and consent_confirmed
  and exists (
    select 1 from public.gallery_albums
    where gallery_albums.id = gallery_media.album_id
      and gallery_albums.published
  )
);

drop policy if exists "Authenticated users read allowed gallery media" on public.gallery_media;
create policy "Authenticated users read allowed gallery media"
on public.gallery_media for select to authenticated
using (
  (
    published
    and consent_confirmed
    and exists (
      select 1 from public.gallery_albums
      where gallery_albums.id = gallery_media.album_id
        and gallery_albums.published
    )
  )
  or (select private.is_admin())
);

drop policy if exists "Admins insert gallery media" on public.gallery_media;
create policy "Admins insert gallery media"
on public.gallery_media for insert to authenticated
with check ((select private.is_admin()));

drop policy if exists "Admins update gallery media" on public.gallery_media;
create policy "Admins update gallery media"
on public.gallery_media for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "Admins delete gallery media" on public.gallery_media;
create policy "Admins delete gallery media"
on public.gallery_media for delete to authenticated
using ((select private.is_admin()));

grant select on public.gallery_albums to anon, authenticated;
grant select on public.gallery_media to anon, authenticated;
grant insert, update, delete on public.gallery_albums to authenticated;
grant insert, update, delete on public.gallery_media to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery-media',
  'gallery-media',
  true,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view gallery media files" on storage.objects;
create policy "Public can view gallery media files"
on storage.objects for select to public
using (bucket_id = 'gallery-media');

drop policy if exists "Admins upload gallery media files" on storage.objects;
create policy "Admins upload gallery media files"
on storage.objects for insert to authenticated
with check (bucket_id = 'gallery-media' and (select private.is_admin()));

drop policy if exists "Admins update gallery media files" on storage.objects;
create policy "Admins update gallery media files"
on storage.objects for update to authenticated
using (bucket_id = 'gallery-media' and (select private.is_admin()))
with check (bucket_id = 'gallery-media' and (select private.is_admin()));

drop policy if exists "Admins delete gallery media files" on storage.objects;
create policy "Admins delete gallery media files"
on storage.objects for delete to authenticated
using (bucket_id = 'gallery-media' and (select private.is_admin()));
