alter table public.association_settings
  add column if not exists facebook_url text,
  add column if not exists linkedin_url text;
