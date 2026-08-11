create table if not exists public.legal_pages (
  slug text primary key check (slug in ('mentions-legales', 'politique-confidentialite')),
  eyebrow text not null,
  title text not null,
  description text not null,
  summary_title text,
  summary_items jsonb not null default '[]'::jsonb check (jsonb_typeof(summary_items) = 'array'),
  sections jsonb not null default '[]'::jsonb check (jsonb_typeof(sections) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

drop trigger if exists legal_pages_updated_at on public.legal_pages;
create trigger legal_pages_updated_at
before update on public.legal_pages
for each row execute function public.set_updated_at();

alter table public.legal_pages enable row level security;

drop policy if exists "Everyone can read legal pages" on public.legal_pages;
create policy "Everyone can read legal pages"
on public.legal_pages for select to anon, authenticated
using (true);

drop policy if exists "Admins insert legal pages" on public.legal_pages;
create policy "Admins insert legal pages"
on public.legal_pages for insert to authenticated
with check ((select private.is_admin()));

drop policy if exists "Admins update legal pages" on public.legal_pages;
create policy "Admins update legal pages"
on public.legal_pages for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "Admins delete legal pages" on public.legal_pages;
create policy "Admins delete legal pages"
on public.legal_pages for delete to authenticated
using ((select private.is_admin()));

grant select on public.legal_pages to anon, authenticated;
grant insert, update, delete on public.legal_pages to authenticated;

create index if not exists legal_pages_updated_by_idx on public.legal_pages (updated_by);

insert into public.legal_pages (
  slug, eyebrow, title, description, summary_title, summary_items, sections
)
values (
  'mentions-legales',
  'Informations du site',
  'Mentions légales',
  'Retrouvez les informations essentielles sur l’éditeur, l’hébergement et les règles d’utilisation du site VIE AVENIR.',
  null,
  '[]'::jsonb,
  $json$[
    {"id":"editeur","title":"Éditeur du site","body":"Le site {nom_site} est édité par l’association {association}, établie à {adresse_association}.\n\nDirection de la publication : {direction_publication}.\n\n{rna}\n\nPour contacter l’association : {contact}.","note":""},
    {"id":"hebergement","title":"Hébergement","body":"Le site est hébergé par {hebergeur}, {adresse_hebergeur}.\n\nSite de l’hébergeur : {site_hebergeur}.","note":""},
    {"id":"propriete","title":"Propriété intellectuelle","body":"Sauf mention contraire, les textes, l’identité visuelle, le logo, la structure et les contenus de ce site sont protégés. Toute reproduction, adaptation ou diffusion substantielle nécessite l’autorisation préalable de VIE AVENIR. Les photographies et visuels sont utilisés avec les droits nécessaires à leur publication.","note":""},
    {"id":"responsabilite","title":"Responsabilité","body":"VIE AVENIR veille à publier des informations exactes et à jour. Les dates, lieux et modalités des événements peuvent toutefois évoluer : les informations figurant sur la page de l’événement au moment de l’inscription font référence. Les liens vers des sites tiers sont proposés à titre informatif ; VIE AVENIR ne contrôle pas leur contenu.","note":""},
    {"id":"donnees","title":"Données personnelles","body":"Les règles applicables aux informations transmises via le site sont détaillées dans la {politique_confidentialite}.","note":""}
  ]$json$::jsonb
)
on conflict (slug) do nothing;

insert into public.legal_pages (
  slug, eyebrow, title, description, summary_title, summary_items, sections
)
values (
  'politique-confidentialite',
  'Vos données · Vos droits',
  'Politique de confidentialité',
  'Une information claire et compréhensible, y compris pour les jeunes, sur les données utilisées par VIE AVENIR.',
  'L’essentiel, en mots simples',
  $json$[
    "Tes informations servent uniquement à répondre à ta demande.",
    "Nous ne vendons jamais tes données et ne faisons pas de publicité.",
    "Tu peux demander à les voir, les corriger ou les supprimer.",
    "Si tu as moins de 15 ans, demande l’aide d’un responsable légal."
  ]$json$::jsonb,
  $json$[
    {"id":"responsable","title":"Responsable du traitement","body":"Le responsable du traitement est {association}, association établie à {ville}. Toute demande relative à vos données peut être envoyée par {contact} en indiquant « Exercice de mes droits » dans l’objet.","note":""},
    {"id":"donnees","title":"Données concernées","body":"Le formulaire peut recueillir vos prénom et nom, adresse e-mail, profil, objet et message. Ne transmettez aucune donnée sensible ou information qui n’est pas nécessaire à votre demande. Des données techniques minimales, comme l’adresse IP et les journaux de sécurité, peuvent être traitées par l’hébergeur pour assurer le fonctionnement et la protection du site.","note":""},
    {"id":"finalites","title":"Pourquoi et sur quelle base ?","body":"Les informations servent à répondre aux demandes, préparer une participation, mettre en relation un professionnel ou étudier un partenariat. Le traitement repose sur l’intérêt légitime de VIE AVENIR à répondre aux sollicitations reçues et, lorsque la demande prépare une inscription ou une collaboration, sur les mesures prises à votre demande avant cette démarche.","note":""},
    {"id":"conservation","title":"Destinataires et conservation","body":"Les informations sont accessibles uniquement aux membres autorisés de VIE AVENIR et, si nécessaire, aux prestataires techniques indispensables au fonctionnement du site. Elles ne sont ni vendues ni transmises à des partenaires à des fins commerciales. Les messages sont conservés au maximum {duree_conservation}, sauf obligation légale ou nécessité liée à une relation associative en cours.","note":"Tant que l’envoi du formulaire n’est pas activé, les informations saisies restent dans votre navigateur et ne sont pas transmises à VIE AVENIR."},
    {"id":"hebergement","title":"Hébergement et transferts","body":"Le site est hébergé par {hebergeur}, société établie aux États-Unis. L’hébergeur peut traiter des données techniques de connexion dans le cadre de l’hébergement et de la sécurité du service, selon ses engagements contractuels et mécanismes de transfert applicables. Consultez la {politique_vercel}.","note":""},
    {"id":"droits","title":"Vos droits","body":"Selon votre situation, vous pouvez demander l’accès, la rectification, l’effacement ou la limitation de vos données, vous opposer à leur traitement et demander leur portabilité. Vous pouvez aussi saisir la CNIL si vous estimez que vos droits ne sont pas respectés. Pour exercer un droit, utilisez la {page_contact}. Une preuve d’identité ne sera demandée qu’en cas de doute raisonnable.","note":""},
    {"id":"cookies","title":"Cookies et mesure d’audience","body":"Le site n’utilise actuellement aucun cookie publicitaire ni outil de mesure d’audience nécessitant votre consentement. Si un tel outil est ajouté, cette page sera mise à jour et un dispositif de choix sera affiché avant tout dépôt non essentiel.","note":""}
  ]$json$::jsonb
)
on conflict (slug) do nothing;
