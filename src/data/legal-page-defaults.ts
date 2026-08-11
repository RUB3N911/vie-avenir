import type { LegalPageRecord } from "@/lib/cms-types";

export const legalPageDefaults: Record<LegalPageRecord["slug"], LegalPageRecord> = {
  "mentions-legales": {
    slug: "mentions-legales",
    eyebrow: "Informations du site",
    title: "Mentions légales",
    description:
      "Retrouvez les informations essentielles sur l’éditeur, l’hébergement et les règles d’utilisation du site VIE AVENIR.",
    summary_title: null,
    summary_items: [],
    sections: [
      {
        id: "editeur",
        title: "Éditeur du site",
        body: "Le site {nom_site} est édité par l’association {association}, établie à {adresse_association}.\n\nDirection de la publication : {direction_publication}.\n\n{rna}\n\nPour contacter l’association : {contact}.",
        note: "",
      },
      {
        id: "hebergement",
        title: "Hébergement",
        body: "Le site est hébergé par {hebergeur}, {adresse_hebergeur}.\n\nSite de l’hébergeur : {site_hebergeur}.",
        note: "",
      },
      {
        id: "propriete",
        title: "Propriété intellectuelle",
        body: "Sauf mention contraire, les textes, l’identité visuelle, le logo, la structure et les contenus de ce site sont protégés. Toute reproduction, adaptation ou diffusion substantielle nécessite l’autorisation préalable de VIE AVENIR. Les photographies et visuels sont utilisés avec les droits nécessaires à leur publication.",
        note: "",
      },
      {
        id: "responsabilite",
        title: "Responsabilité",
        body: "VIE AVENIR veille à publier des informations exactes et à jour. Les dates, lieux et modalités des événements peuvent toutefois évoluer : les informations figurant sur la page de l’événement au moment de l’inscription font référence. Les liens vers des sites tiers sont proposés à titre informatif ; VIE AVENIR ne contrôle pas leur contenu.",
        note: "",
      },
      {
        id: "donnees",
        title: "Données personnelles",
        body: "Les règles applicables aux informations transmises via le site sont détaillées dans la {politique_confidentialite}.",
        note: "",
      },
    ],
    updated_at: "2026-08-11T00:00:00.000Z",
  },
  "politique-confidentialite": {
    slug: "politique-confidentialite",
    eyebrow: "Vos données · Vos droits",
    title: "Politique de confidentialité",
    description:
      "Une information claire et compréhensible, y compris pour les jeunes, sur les données utilisées par VIE AVENIR.",
    summary_title: "L’essentiel, en mots simples",
    summary_items: [
      "Tes informations servent uniquement à répondre à ta demande.",
      "Nous ne vendons jamais tes données et ne faisons pas de publicité.",
      "Tu peux demander à les voir, les corriger ou les supprimer.",
      "Si tu as moins de 15 ans, demande l’aide d’un responsable légal.",
    ],
    sections: [
      {
        id: "responsable",
        title: "Responsable du traitement",
        body: "Le responsable du traitement est {association}, association établie à {ville}. Toute demande relative à vos données peut être envoyée par {contact} en indiquant « Exercice de mes droits » dans l’objet.",
        note: "",
      },
      {
        id: "donnees",
        title: "Données concernées",
        body: "Selon le parcours choisi, le formulaire peut recueillir vos prénom et nom, adresse e-mail, téléphone, profil, âge du jeune concerné, structure, fonction, objet et message. Ne transmettez aucune donnée sensible ou information qui n’est pas nécessaire à votre demande. Des données techniques minimales, comme l’adresse IP et les journaux de sécurité, peuvent être traitées par l’hébergeur pour assurer le fonctionnement et la protection du site.",
        note: "",
      },
      {
        id: "finalites",
        title: "Pourquoi et sur quelle base ?",
        body: "Les informations servent à répondre aux demandes, préparer une participation, mettre en relation un professionnel ou étudier un partenariat. Le traitement repose sur l’intérêt légitime de VIE AVENIR à répondre aux sollicitations reçues et, lorsque la demande prépare une inscription ou une collaboration, sur les mesures prises à votre demande avant cette démarche.",
        note: "",
      },
      {
        id: "conservation",
        title: "Destinataires et conservation",
        body: "Les informations sont accessibles uniquement aux membres autorisés de VIE AVENIR et, si nécessaire, aux prestataires techniques indispensables au fonctionnement du site. Elles ne sont ni vendues ni transmises à des partenaires à des fins commerciales. Les messages sont conservés au maximum {duree_conservation}, sauf obligation légale ou nécessité liée à une relation associative en cours.",
        note: "Les demandes envoyées depuis le site sont enregistrées dans un espace sécurisé et accessibles uniquement aux personnes autorisées chargées de leur suivi.",
      },
      {
        id: "hebergement",
        title: "Hébergement et transferts",
        body: "Le site est hébergé par {hebergeur}, société établie aux États-Unis. L’hébergeur peut traiter des données techniques de connexion dans le cadre de l’hébergement et de la sécurité du service, selon ses engagements contractuels et mécanismes de transfert applicables. Consultez la {politique_vercel}.",
        note: "",
      },
      {
        id: "droits",
        title: "Vos droits",
        body: "Selon votre situation, vous pouvez demander l’accès, la rectification, l’effacement ou la limitation de vos données, vous opposer à leur traitement et demander leur portabilité. Vous pouvez aussi saisir la CNIL si vous estimez que vos droits ne sont pas respectés. Pour exercer un droit, utilisez la {page_contact}. Une preuve d’identité ne sera demandée qu’en cas de doute raisonnable.",
        note: "",
      },
      {
        id: "cookies",
        title: "Cookies et mesure d’audience",
        body: "Le site n’utilise actuellement aucun cookie publicitaire ni outil de mesure d’audience nécessitant votre consentement. Si un tel outil est ajouté, cette page sera mise à jour et un dispositif de choix sera affiché avant tout dépôt non essentiel.",
        note: "",
      },
    ],
    updated_at: "2026-08-11T00:00:00.000Z",
  },
};

export const legalPlaceholders = [
  "{nom_site}",
  "{association}",
  "{adresse_association}",
  "{ville}",
  "{rna}",
  "{contact}",
  "{direction_publication}",
  "{hebergeur}",
  "{adresse_hebergeur}",
  "{site_hebergeur}",
  "{duree_conservation}",
  "{page_contact}",
  "{politique_confidentialite}",
  "{politique_vercel}",
] as const;
