import type { ContactProfile } from "./cms-types";

export type ContactReplyTemplate = {
  key: string;
  profile: ContactProfile;
  label: string;
  subject: string;
  heading: string;
  body: string;
  cta?: {
    label: string;
    url: string;
  };
};

const interventionFormUrl = "https://www.vieavenir.fr/formulaires/devenez-une-voix-de-l-avenir-avec-l-association-vie-avenir";

export const contactReplyTemplates: Record<ContactProfile, ContactReplyTemplate[]> = {
  young: [
    {
      key: "young-answer",
      profile: "young",
      label: "Réponse à une demande",
      subject: "VIE AVENIR — Réponse à ta demande",
      heading: "Merci pour ton message",
      body: "Nous avons bien pris connaissance de ta demande. Notre équipe va pouvoir t’accompagner et te préciser les prochaines étapes.\n\nSi tu le souhaites, réponds directement à cet e-mail pour nous donner davantage d’informations.",
    },
    {
      key: "young-actions",
      profile: "young",
      label: "Découvrir nos actions",
      subject: "VIE AVENIR — Découvre nos prochaines actions",
      heading: "Trouvons l’action qui te correspond",
      body: "Merci pour ton intérêt pour VIE AVENIR. Nous serons heureux de te présenter les ateliers, rencontres et événements qui peuvent répondre à ta demande.\n\nRéponds à ce message en nous indiquant tes disponibilités ou ce que tu aimerais découvrir en priorité.",
    },
  ],
  parent: [
    {
      key: "parent-answer",
      profile: "parent",
      label: "Réponse à une demande",
      subject: "VIE AVENIR — Réponse à votre demande",
      heading: "Merci pour votre message",
      body: "Nous avons bien pris connaissance de votre demande. Notre équipe reviendra vers vous afin de vous apporter les informations utiles et de vous orienter vers l’action la plus adaptée.\n\nVous pouvez répondre directement à cet e-mail si vous souhaitez nous apporter une précision.",
    },
    {
      key: "parent-exchange",
      profile: "parent",
      label: "Proposer un échange",
      subject: "VIE AVENIR — Échangeons au sujet de votre jeune",
      heading: "Échangeons sur ses besoins",
      body: "Merci de nous avoir contactés. Afin de mieux comprendre la situation et les attentes de votre jeune, nous vous proposons un premier échange avec l’équipe VIE AVENIR.\n\nRépondez à ce message en nous indiquant vos disponibilités ainsi que le moyen de contact que vous préférez.",
    },
  ],
  professional: [
    {
      key: "professional-intervention",
      profile: "professional",
      label: "Préparer une intervention",
      subject: "VIE AVENIR — Préparons vos futures interventions",
      heading: "Préparons vos futures interventions",
      body: "Merci pour votre envie de transmettre et de partager votre expérience avec les jeunes. Afin de mieux vous connaître et de préparer vos futures interventions avec VIE AVENIR, nous vous invitons à compléter ce formulaire.",
      cta: {
        label: "Compléter le formulaire",
        url: interventionFormUrl,
      },
    },
    {
      key: "professional-exchange",
      profile: "professional",
      label: "Proposer un échange",
      subject: "VIE AVENIR — Échangeons autour de votre proposition",
      heading: "Construisons votre contribution",
      body: "Merci pour votre proposition et votre volonté de contribuer aux actions de VIE AVENIR. Nous aimerions échanger avec vous pour préciser le public, le format et les disponibilités possibles.\n\nRépondez à ce message en nous indiquant vos créneaux afin que nous puissions organiser un premier échange.",
    },
  ],
  partner: [
    {
      key: "partner-project",
      profile: "partner",
      label: "Étudier un partenariat",
      subject: "VIE AVENIR — Construisons notre partenariat",
      heading: "Imaginons une action utile ensemble",
      body: "Merci pour l’intérêt que vous portez à VIE AVENIR. Votre proposition a retenu notre attention et nous souhaitons étudier avec vous les formes que pourrait prendre ce partenariat.\n\nRépondez à ce message en nous indiquant vos disponibilités pour un premier échange.",
    },
    {
      key: "partner-answer",
      profile: "partner",
      label: "Réponse à une demande",
      subject: "VIE AVENIR — Réponse à votre demande de partenariat",
      heading: "Merci pour votre proposition",
      body: "Nous avons bien reçu votre demande et pris connaissance des premières informations transmises. Notre équipe va l’étudier et reviendra vers vous pour préciser les suites possibles.\n\nVous pouvez répondre directement à cet e-mail pour joindre tout complément utile.",
    },
  ],
};

export function getContactReplyTemplates(profile: ContactProfile) {
  return contactReplyTemplates[profile];
}

export function getContactReplyTemplate(profile: ContactProfile, key: string) {
  return contactReplyTemplates[profile].find((template) => template.key === key) ?? null;
}
