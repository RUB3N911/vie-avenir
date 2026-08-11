import type { ContactProfile } from "@/lib/cms-types";

export const contactJourneys: Record<ContactProfile, {
  title: string;
  cardTitle: string;
  description: string;
  formTitle: string;
  messageLabel: string;
  messagePlaceholder: string;
  tone: "pink" | "orange" | "yellow" | "green";
  requestOptions: string[];
}> = {
  young: {
    title: "Je suis un jeune",
    cardTitle: "Tu as 14—25 ans",
    description: "Participer, poser une question ou proposer une idée.",
    formTitle: "Dis-nous ce qui pourrait t’aider à avancer.",
    messageLabel: "Ton message",
    messagePlaceholder: "Parle-nous de ta question, de ton idée ou de ce que tu aimerais découvrir…",
    tone: "pink",
    requestOptions: ["Participer à un atelier", "Découvrir un métier", "Poser une question", "Proposer une idée", "Être tenu·e informé·e"],
  },
  parent: {
    title: "Je suis un parent",
    cardTitle: "Vous êtes parent",
    description: "Poser une question, accompagner votre jeune ou découvrir les actions.",
    formTitle: "Parlons de votre jeune et de vos attentes.",
    messageLabel: "Votre message",
    messagePlaceholder: "Précisez votre question, le besoin de votre jeune ou l’action qui vous intéresse…",
    tone: "yellow",
    requestOptions: ["Inscrire ou accompagner mon jeune", "Comprendre une action", "Poser une question", "Être tenu·e informé·e"],
  },
  professional: {
    title: "Je suis un professionnel",
    cardTitle: "Vous êtes professionnel",
    description: "Partager votre parcours, votre métier ou une compétence concrète.",
    formTitle: "Votre expérience peut provoquer un déclic.",
    messageLabel: "Votre proposition",
    messagePlaceholder: "Présentez le métier, l’expérience ou le format que vous aimeriez partager…",
    tone: "orange",
    requestOptions: ["Présenter mon métier", "Partager mon parcours", "Animer un atelier", "Accueillir une découverte", "Devenir mentor ou ressource"],
  },
  partner: {
    title: "Je représente un partenaire",
    cardTitle: "Vous représentez une structure",
    description: "Imaginer un partenariat, accueillir ou soutenir une action.",
    formTitle: "Construisons une action utile ensemble.",
    messageLabel: "Votre projet ou proposition",
    messagePlaceholder: "Présentez votre structure, votre idée, vos moyens ou le territoire concerné…",
    tone: "green",
    requestOptions: ["Construire un partenariat", "Accueillir une action", "Soutenir matériellement", "Financer une action", "Mettre un réseau en relation"],
  },
};

export const contactProfiles = Object.keys(contactJourneys) as ContactProfile[];
