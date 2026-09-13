create table public.contact_reply_templates (
  id uuid primary key default gen_random_uuid(),
  profile text not null check (profile in ('young', 'parent', 'professional', 'partner')),
  label text not null check (char_length(label) between 2 and 80),
  subject text not null check (char_length(subject) between 3 and 160 and subject !~ E'[\\r\\n]'),
  heading text not null check (char_length(heading) between 3 and 180),
  body text not null check (char_length(body) between 10 and 5000),
  cta_label text check (cta_label is null or char_length(cta_label) between 2 and 80),
  cta_url text check (cta_url is null or char_length(cta_url) between 8 and 2048),
  display_order integer not null default 10 check (display_order between 0 and 999),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  constraint contact_reply_templates_cta_pair check (
    (cta_label is null and cta_url is null)
    or (cta_label is not null and cta_url is not null)
  )
);

create trigger contact_reply_templates_updated_at
before update on public.contact_reply_templates
for each row execute function public.set_updated_at();

alter table public.contact_reply_templates enable row level security;

create policy "Admins read contact reply templates"
on public.contact_reply_templates for select to authenticated
using ((select private.is_admin()));

create policy "Admins insert contact reply templates"
on public.contact_reply_templates for insert to authenticated
with check ((select private.is_admin()));

create policy "Admins update contact reply templates"
on public.contact_reply_templates for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins delete contact reply templates"
on public.contact_reply_templates for delete to authenticated
using ((select private.is_admin()));

revoke all privileges on public.contact_reply_templates from public, anon, authenticated;
grant select, insert, update, delete on public.contact_reply_templates to authenticated;

create index contact_reply_templates_profile_order_idx
on public.contact_reply_templates (profile, display_order, created_at);

create index contact_reply_templates_created_by_idx
on public.contact_reply_templates (created_by);

create index contact_reply_templates_updated_by_idx
on public.contact_reply_templates (updated_by);

insert into public.contact_reply_templates
  (profile, label, subject, heading, body, cta_label, cta_url, display_order)
values
  (
    'young',
    'Réponse à une demande',
    'VIE AVENIR — Réponse à ta demande',
    'Merci pour ton message',
    E'Nous avons bien pris connaissance de ta demande. Notre équipe va pouvoir t’accompagner et te préciser les prochaines étapes.\n\nSi tu le souhaites, réponds directement à cet e-mail pour nous donner davantage d’informations.',
    null,
    null,
    10
  ),
  (
    'young',
    'Découvrir nos actions',
    'VIE AVENIR — Découvre nos prochaines actions',
    'Trouvons l’action qui te correspond',
    E'Merci pour ton intérêt pour VIE AVENIR. Nous serons heureux de te présenter les ateliers, rencontres et événements qui peuvent répondre à ta demande.\n\nRéponds à ce message en nous indiquant tes disponibilités ou ce que tu aimerais découvrir en priorité.',
    null,
    null,
    20
  ),
  (
    'parent',
    'Réponse à une demande',
    'VIE AVENIR — Réponse à votre demande',
    'Merci pour votre message',
    E'Nous avons bien pris connaissance de votre demande. Notre équipe reviendra vers vous afin de vous apporter les informations utiles et de vous orienter vers l’action la plus adaptée.\n\nVous pouvez répondre directement à cet e-mail si vous souhaitez nous apporter une précision.',
    null,
    null,
    10
  ),
  (
    'parent',
    'Proposer un échange',
    'VIE AVENIR — Échangeons au sujet de votre jeune',
    'Échangeons sur ses besoins',
    E'Merci de nous avoir contactés. Afin de mieux comprendre la situation et les attentes de votre jeune, nous vous proposons un premier échange avec l’équipe VIE AVENIR.\n\nRépondez à ce message en nous indiquant vos disponibilités ainsi que le moyen de contact que vous préférez.',
    null,
    null,
    20
  ),
  (
    'professional',
    'Préparer une intervention',
    'VIE AVENIR — Préparons vos futures interventions',
    'Préparons vos futures interventions',
    'Merci pour votre envie de transmettre et de partager votre expérience avec les jeunes. Afin de mieux vous connaître et de préparer vos futures interventions avec VIE AVENIR, nous vous invitons à compléter ce formulaire.',
    'Compléter le formulaire',
    'https://www.vieavenir.fr/formulaires/devenez-une-voix-de-l-avenir-avec-l-association-vie-avenir',
    10
  ),
  (
    'professional',
    'Proposer un échange',
    'VIE AVENIR — Échangeons autour de votre proposition',
    'Construisons votre contribution',
    E'Merci pour votre proposition et votre volonté de contribuer aux actions de VIE AVENIR. Nous aimerions échanger avec vous pour préciser le public, le format et les disponibilités possibles.\n\nRépondez à ce message en nous indiquant vos créneaux afin que nous puissions organiser un premier échange.',
    null,
    null,
    20
  ),
  (
    'partner',
    'Étudier un partenariat',
    'VIE AVENIR — Construisons notre partenariat',
    'Imaginons une action utile ensemble',
    E'Merci pour l’intérêt que vous portez à VIE AVENIR. Votre proposition a retenu notre attention et nous souhaitons étudier avec vous les formes que pourrait prendre ce partenariat.\n\nRépondez à ce message en nous indiquant vos disponibilités pour un premier échange.',
    null,
    null,
    10
  ),
  (
    'partner',
    'Réponse à une demande',
    'VIE AVENIR — Réponse à votre demande de partenariat',
    'Merci pour votre proposition',
    E'Nous avons bien reçu votre demande et pris connaissance des premières informations transmises. Notre équipe va l’étudier et reviendra vers vous pour préciser les suites possibles.\n\nVous pouvez répondre directement à cet e-mail pour joindre tout complément utile.',
    null,
    null,
    20
  );
