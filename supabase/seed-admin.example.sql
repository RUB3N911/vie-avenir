-- 1. Créez d'abord l'utilisateur dans Supabase > Authentication > Users.
-- 2. Remplacez l'adresse ci-dessous, puis exécutez cette requête une seule fois.

insert into public.admin_users (id, email)
select id, email
from auth.users
where lower(email) = lower('votre-adresse@email.fr')
on conflict (id) do update set email = excluded.email;
