create table if not exists public.link_hub_links (
  id uuid primary key default gen_random_uuid(),
  label text not null check (char_length(label) between 2 and 80),
  url text not null check (
    char_length(url) between 1 and 2048
    and (
      url like 'https://%'
      or url like 'http://%'
      or (url like '/%' and url not like '//%')
    )
  ),
  icon text not null default 'link'
    check (icon in ('link', 'spark', 'calendar', 'users', 'briefcase', 'heart', 'gallery', 'globe')),
  is_featured boolean not null default false,
  published boolean not null default true,
  display_order integer not null default 0 check (display_order between 0 and 999),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create index if not exists link_hub_links_publication_order_idx
  on public.link_hub_links (published, display_order, created_at);

create unique index if not exists link_hub_links_one_featured_idx
  on public.link_hub_links (is_featured)
  where is_featured;

create index if not exists link_hub_links_updated_by_idx
  on public.link_hub_links (updated_by);

drop trigger if exists link_hub_links_updated_at on public.link_hub_links;
create trigger link_hub_links_updated_at
before update on public.link_hub_links
for each row execute function public.set_updated_at();

alter table public.link_hub_links enable row level security;

drop policy if exists "Anonymous users read published link hub links" on public.link_hub_links;
create policy "Anonymous users read published link hub links"
on public.link_hub_links for select to anon
using (published);

drop policy if exists "Authenticated users read allowed link hub links" on public.link_hub_links;
create policy "Authenticated users read allowed link hub links"
on public.link_hub_links for select to authenticated
using (published or (select private.is_admin()));

drop policy if exists "Admins insert link hub links" on public.link_hub_links;
create policy "Admins insert link hub links"
on public.link_hub_links for insert to authenticated
with check ((select private.is_admin()));

drop policy if exists "Admins update link hub links" on public.link_hub_links;
create policy "Admins update link hub links"
on public.link_hub_links for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "Admins delete link hub links" on public.link_hub_links;
create policy "Admins delete link hub links"
on public.link_hub_links for delete to authenticated
using ((select private.is_admin()));

grant select on public.link_hub_links to anon, authenticated;
grant insert, update, delete on public.link_hub_links to authenticated;

insert into public.link_hub_links (label, url, icon, is_featured, published, display_order)
select seed.label, seed.url, seed.icon, seed.is_featured, true, seed.display_order
from (
  values
    ('Participer ou nous rejoindre', '/contact', 'users', true, 10),
    ('Découvrir notre mission', '/notre-mission', 'spark', false, 20),
    ('Voir tous nos événements', '/evenements', 'calendar', false, 30),
    ('Découvrir la galerie', '/galerie', 'gallery', false, 40)
) as seed(label, url, icon, is_featured, display_order)
where not exists (select 1 from public.link_hub_links);

update public.association_settings
set linkedin_url = 'https://www.linkedin.com/in/mouvement-vie-avenir-51565a431/'
where id = true and linkedin_url is null;
