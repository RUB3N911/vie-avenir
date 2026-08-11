update public.legal_pages
set sections = jsonb_set(
  jsonb_set(
    sections,
    '{1,body}',
    to_jsonb('Selon le parcours choisi, le formulaire peut recueillir vos prénom et nom, adresse e-mail, téléphone, profil, âge du jeune concerné, structure, fonction, objet et message. Ne transmettez aucune donnée sensible ou information qui n’est pas nécessaire à votre demande. Des données techniques minimales, comme l’adresse IP et les journaux de sécurité, peuvent être traitées par l’hébergeur pour assurer le fonctionnement et la protection du site.'::text)
  ),
  '{3,note}',
  to_jsonb('Les demandes envoyées depuis le site sont enregistrées dans un espace sécurisé et accessibles uniquement aux personnes autorisées chargées de leur suivi.'::text)
)
where slug = 'politique-confidentialite';
