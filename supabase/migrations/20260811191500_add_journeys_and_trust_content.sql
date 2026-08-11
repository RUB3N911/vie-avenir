alter table public.association_settings
add column if not exists association_status text;

create table if not exists public.site_presentation (
  id boolean primary key default true check (id = true),
  story_title text,
  story_body text,
  team_intro text,
  minor_charter_title text,
  minor_charter_body text,
  minor_charter_published boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  bio text,
  image_url text,
  display_order integer not null default 0 check (display_order between 0 and 999),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.confirmed_partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text,
  website_url text,
  logo_url text,
  display_order integer not null default 0 check (display_order between 0 and 999),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_role text not null check (author_role in ('young', 'parent', 'professional', 'partner')),
  quote text not null,
  image_url text,
  display_order integer not null default 0 check (display_order between 0 and 999),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  profile text not null check (profile in ('young', 'parent', 'professional', 'partner')),
  name text not null,
  email text not null,
  phone text,
  age integer check (age is null or age between 0 and 99),
  organization text,
  subject text not null,
  message text not null,
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  status text not null default 'new' check (status in ('new', 'in_progress', 'replied', 'closed')),
  admin_notes text,
  consent_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

drop trigger if exists site_presentation_updated_at on public.site_presentation;
create trigger site_presentation_updated_at before update on public.site_presentation for each row execute function public.set_updated_at();
drop trigger if exists team_members_updated_at on public.team_members;
create trigger team_members_updated_at before update on public.team_members for each row execute function public.set_updated_at();
drop trigger if exists confirmed_partners_updated_at on public.confirmed_partners;
create trigger confirmed_partners_updated_at before update on public.confirmed_partners for each row execute function public.set_updated_at();
drop trigger if exists testimonials_updated_at on public.testimonials;
create trigger testimonials_updated_at before update on public.testimonials for each row execute function public.set_updated_at();
drop trigger if exists contact_requests_updated_at on public.contact_requests;
create trigger contact_requests_updated_at before update on public.contact_requests for each row execute function public.set_updated_at();

alter table public.site_presentation enable row level security;
alter table public.team_members enable row level security;
alter table public.confirmed_partners enable row level security;
alter table public.testimonials enable row level security;
alter table public.contact_requests enable row level security;

create policy "Everyone reads site presentation" on public.site_presentation for select to anon, authenticated using (true);
create policy "Admins insert site presentation" on public.site_presentation for insert to authenticated with check ((select private.is_admin()));
create policy "Admins update site presentation" on public.site_presentation for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete site presentation" on public.site_presentation for delete to authenticated using ((select private.is_admin()));

create policy "Anonymous users read published team" on public.team_members for select to anon using (published);
create policy "Authenticated users read allowed team" on public.team_members for select to authenticated using (published or (select private.is_admin()));
create policy "Admins insert team" on public.team_members for insert to authenticated with check ((select private.is_admin()));
create policy "Admins update team" on public.team_members for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete team" on public.team_members for delete to authenticated using ((select private.is_admin()));

create policy "Anonymous users read published partners" on public.confirmed_partners for select to anon using (published);
create policy "Authenticated users read allowed partners" on public.confirmed_partners for select to authenticated using (published or (select private.is_admin()));
create policy "Admins insert partners" on public.confirmed_partners for insert to authenticated with check ((select private.is_admin()));
create policy "Admins update partners" on public.confirmed_partners for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete partners" on public.confirmed_partners for delete to authenticated using ((select private.is_admin()));

create policy "Anonymous users read published testimonials" on public.testimonials for select to anon using (published);
create policy "Authenticated users read allowed testimonials" on public.testimonials for select to authenticated using (published or (select private.is_admin()));
create policy "Admins insert testimonials" on public.testimonials for insert to authenticated with check ((select private.is_admin()));
create policy "Admins update testimonials" on public.testimonials for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete testimonials" on public.testimonials for delete to authenticated using ((select private.is_admin()));

create policy "Visitors create contact requests" on public.contact_requests for insert to anon, authenticated
with check (status = 'new' and admin_notes is null and updated_by is null);
create policy "Admins read contact requests" on public.contact_requests for select to authenticated using ((select private.is_admin()));
create policy "Admins update contact requests" on public.contact_requests for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete contact requests" on public.contact_requests for delete to authenticated using ((select private.is_admin()));

revoke all privileges on public.site_presentation, public.team_members, public.confirmed_partners, public.testimonials, public.contact_requests from public, anon, authenticated;
grant select on public.site_presentation, public.team_members, public.confirmed_partners, public.testimonials to anon, authenticated;
grant insert, update, delete on public.site_presentation, public.team_members, public.confirmed_partners, public.testimonials to authenticated;
grant insert on public.contact_requests to anon, authenticated;
grant select, update, delete on public.contact_requests to authenticated;

create index if not exists team_members_public_order_idx on public.team_members (published, display_order);
create index if not exists confirmed_partners_public_order_idx on public.confirmed_partners (published, display_order);
create index if not exists testimonials_public_order_idx on public.testimonials (published, display_order);
create index if not exists contact_requests_status_created_idx on public.contact_requests (status, created_at desc);
create index if not exists site_presentation_updated_by_idx on public.site_presentation (updated_by);
create index if not exists team_members_updated_by_idx on public.team_members (updated_by);
create index if not exists confirmed_partners_updated_by_idx on public.confirmed_partners (updated_by);
create index if not exists testimonials_updated_by_idx on public.testimonials (updated_by);
create index if not exists contact_requests_updated_by_idx on public.contact_requests (updated_by);

insert into public.site_presentation (id, minor_charter_title)
values (true, 'Notre engagement pour l’accueil et la protection des mineurs')
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "Public views site media" on storage.objects for select to public using (bucket_id = 'site-media');
create policy "Admins upload site media" on storage.objects for insert to authenticated with check (bucket_id = 'site-media' and (select private.is_admin()));
create policy "Admins update site media" on storage.objects for update to authenticated using (bucket_id = 'site-media' and (select private.is_admin())) with check (bucket_id = 'site-media' and (select private.is_admin()));
create policy "Admins delete site media" on storage.objects for delete to authenticated using (bucket_id = 'site-media' and (select private.is_admin()));
