import type { ReactNode } from "react";
import Link from "next/link";
import type { AssociationSettings } from "@/lib/cms-types";
import { legalConfig } from "@/lib/site";

function renderTokens(text: string, settings: AssociationSettings) {
  const address = [settings.address, settings.postal_code, settings.city].filter(Boolean).join(", ");
  const tokens: Record<string, ReactNode> = {
    "{nom_site}": <strong>VIE AVENIR</strong>,
    "{association}": <strong>{settings.legal_name}</strong>,
    "{adresse_association}": address || legalConfig.location,
    "{ville}": settings.city || legalConfig.location,
    "{rna}": settings.rna_number
      ? <>Numéro RNA : <strong>{settings.rna_number}</strong>.</>
      : legalConfig.registrationNotice,
    "{contact}": settings.public_email
      ? <a href={`mailto:${settings.public_email}`}>{settings.public_email}</a>
      : <Link href="/contact">la page de contact</Link>,
    "{direction_publication}": legalConfig.publicationDirector,
    "{hebergeur}": <strong>{legalConfig.host.name}</strong>,
    "{adresse_hebergeur}": legalConfig.host.address,
    "{site_hebergeur}": <a href={legalConfig.host.website} target="_blank" rel="noreferrer">vercel.com</a>,
    "{duree_conservation}": legalConfig.privacyRetention,
    "{page_contact}": <Link href="/contact">page de contact</Link>,
    "{politique_confidentialite}": <Link href="/politique-confidentialite">politique de confidentialité</Link>,
    "{politique_vercel}": <a href="https://vercel.com/legal/privacy-notice" target="_blank" rel="noreferrer">politique de confidentialité de Vercel</a>,
  };

  return text.split(/(\{[a-z_]+\})/).map((part, index) => (
    <span key={`${part}-${index}`}>{tokens[part] ?? part}</span>
  ));
}

export function LegalPageText({ text, settings }: { text: string; settings: AssociationSettings }) {
  return text.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => (
    <p key={index}>{renderTokens(paragraph, settings)}</p>
  ));
}
