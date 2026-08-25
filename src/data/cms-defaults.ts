import type { AssociationSettings, EventRecord, ProgramItem } from "@/lib/cms-types";

export const defaultProgram: ProgramItem[] = [
  {
    title: "Rencontres métiers",
    description: "Des parcours vrais et des rencontres accessibles.",
  },
  {
    title: "Défis",
    description: "Sans filtre et sans mauvaise question.",
  },
  {
    title: "Échanges sans tabou",
    description: "Des activités et des mises en situation concrètes.",
  },
];

export const defaultAssociationSettings: AssociationSettings = {
  legal_name: "VIE AVENIR",
  association_status: null,
  public_email: null,
  phone: null,
  whatsapp: null,
  address: null,
  postal_code: null,
  city: "Martinique",
  rna_number: null,
  instagram_url: null,
  tiktok_url: null,
  facebook_url: null,
  linkedin_url: null,
  website_url: "https://vie-avenir.vercel.app",
};

export const defaultEvent: EventRecord = {
  id: "event-initial-2026",
  slug: "aventure-commence-maintenant-2026",
  title: "L’aventure commence maintenant.",
  summary:
    "Un premier atelier vivant pour rencontrer des professionnels, poser ses questions, essayer et voir son avenir autrement.",
  description:
    "Une rencontre participative pensée pour les jeunes de Martinique, avec des échanges sans tabou et des activités concrètes.",
  starts_at: "2026-10-03T09:00:00-04:00",
  ends_at: null,
  venue_name: "Lieu à confirmer",
  venue_address: null,
  city: "Martinique",
  age_min: 14,
  age_max: 25,
  capacity: null,
  price_label: "Gratuit",
  access_details: "Les informations pratiques seront communiquées prochainement.",
  registration_url: null,
  registration_deadline: null,
  registration_status: "coming_soon",
  publication_status: "published",
  image_url: null,
  program: defaultProgram,
  created_at: "2026-08-11T00:00:00.000Z",
  updated_at: "2026-08-11T00:00:00.000Z",
};
