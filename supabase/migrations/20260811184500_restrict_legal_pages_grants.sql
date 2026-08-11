revoke all privileges on table public.legal_pages from public, anon, authenticated;

grant select on table public.legal_pages to anon;
grant select, insert, update, delete on table public.legal_pages to authenticated;
