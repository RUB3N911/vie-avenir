create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.association_settings (
  id boolean primary key default true check (id = true),
  legal_name text not null default 'VIE AVENIR',
  public_email text,
  phone text,
  whatsapp text,
  address text,
  postal_code text,
  city text not null default 'Martinique',
  rna_number text,
  instagram_url text,
  tiktok_url text,
  website_url text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue_name text,
  venue_address text,
  city text not null default 'Martinique',
  age_min integer not null default 14 check (age_min between 0 and 99),
  age_max integer not null default 25 check (age_max between age_min and 99),
  capacity integer check (capacity is null or capacity > 0),
  price_label text not null default 'Gratuit',
  access_details text,
  registration_url text,
  registration_deadline timestamptz,
  registration_status text not null default 'coming_soon'
    check (registration_status in ('coming_soon', 'open', 'full', 'cancelled', 'closed')),
  publication_status text not null default 'draft'
    check (publication_status in ('draft', 'published', 'archived')),
  image_url text,
  program jsonb not null default '[]'::jsonb check (jsonb_typeof(program) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create index if not exists events_publication_starts_idx
  on public.events (publication_status, starts_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists association_settings_updated_at on public.association_settings;
create trigger association_settings_updated_at
before update on public.association_settings
for each row execute function public.set_updated_at();

drop trigger if exists events_updated_at on public.events;
create trigger events_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.admin_users where id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.admin_users enable row level security;
alter table public.association_settings enable row level security;
alter table public.events enable row level security;

drop policy if exists "Admin users can read their role" on public.admin_users;
create policy "Admin users can read their role"
on public.admin_users for select to authenticated
using (id = (select auth.uid()));

drop policy if exists "Public can read association settings" on public.association_settings;
create policy "Public can read association settings"
on public.association_settings for select to anon, authenticated
using (true);

drop policy if exists "Admins manage association settings" on public.association_settings;
create policy "Admins manage association settings"
on public.association_settings for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Public can read published events" on public.events;
create policy "Public can read published events"
on public.events for select to anon, authenticated
using (publication_status = 'published');

drop policy if exists "Admins manage events" on public.events;
create policy "Admins manage events"
on public.events for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

grant select on public.association_settings to anon, authenticated;
grant select on public.events to anon, authenticated;
grant insert, update, delete on public.association_settings to authenticated;
grant insert, update, delete on public.events to authenticated;
grant select on public.admin_users to authenticated;

insert into public.association_settings (id, legal_name, city, website_url)
values (true, 'VIE AVENIR', 'Martinique', 'https://vie-avenir.vercel.app')
on conflict (id) do nothing;

insert into public.events (
  slug,
  title,
  summary,
  description,
  starts_at,
  venue_name,
  city,
  age_min,
  age_max,
  price_label,
  access_details,
  registration_status,
  publication_status,
  program
)
values (
  'aventure-commence-maintenant-2026',
  'L’aventure commence maintenant.',
  'Un premier atelier vivant pour rencontrer des professionnels, poser ses questions, essayer et voir son avenir autrement.',
  'Une rencontre participative pensée pour les jeunes de Martinique, avec des échanges sans tabou et des activités concrètes.',
  '2026-10-03 09:00:00-04',
  'Lieu à confirmer',
  'Martinique',
  14,
  25,
  'Gratuit',
  'Les informations pratiques seront communiquées prochainement.',
  'coming_soon',
  'published',
  '["Rencontres métiers", "Défis", "Échanges sans tabou"]'::jsonb
)
on conflict (slug) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-images',
  'event-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view event images" on storage.objects;
create policy "Public can view event images"
on storage.objects for select to public
using (bucket_id = 'event-images');

drop policy if exists "Admins upload event images" on storage.objects;
create policy "Admins upload event images"
on storage.objects for insert to authenticated
with check (bucket_id = 'event-images' and (select public.is_admin()));

drop policy if exists "Admins update event images" on storage.objects;
create policy "Admins update event images"
on storage.objects for update to authenticated
using (bucket_id = 'event-images' and (select public.is_admin()))
with check (bucket_id = 'event-images' and (select public.is_admin()));

drop policy if exists "Admins delete event images" on storage.objects;
create policy "Admins delete event images"
on storage.objects for delete to authenticated
using (bucket_id = 'event-images' and (select public.is_admin()));
