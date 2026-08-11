import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell, LegalSection } from "@/components/legal-page-shell";
import { legalConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Informations légales relatives au site de l’association VIE AVENIR.",
};

const legalNavigation = [
  { id: "editeur", label: "Éditeur du site" },
  { id: "hebergement", label: "Hébergement" },
  { id: "propriete", label: "Propriété intellectuelle" },
  { id: "responsabilite", label: "Responsabilité" },
  { id: "donnees", label: "Données personnelles" },
] as const;

export default function LegalNoticePage() {
  return (
    <LegalPageShell
      description="Retrouvez les informations essentielles sur l’éditeur, l’hébergement et les règles d’utilisation du site VIE AVENIR."
      eyebrow="Informations du site"
      navigation={legalNavigation}
      relatedHref="/politique-confidentialite"
      relatedLabel="Notre politique de confidentialité"
      title="Mentions légales"
      updatedAt={legalConfig.updatedAt}
    >
        <LegalSection id="editeur" number="01" title="Éditeur du site">
          <p>
            Le site <strong>VIE AVENIR</strong> est édité par le projet associatif VIE AVENIR,
            établi en {legalConfig.location}.
          </p>
          <p>Direction de la publication : {legalConfig.publicationDirector}.</p>
          <p className="legal-note">{legalConfig.registrationNotice}</p>
          <p>
            Pour contacter l’association, utilisez la <Link href="/contact">page Nous rejoindre</Link>.
          </p>
        </LegalSection>

        <LegalSection id="hebergement" number="02" title="Hébergement">
          <p>
            Le site est hébergé par <strong>{legalConfig.host.name}</strong>, {legalConfig.host.address}.
          </p>
          <p>
            Site de l’hébergeur :{" "}
            <a href={legalConfig.host.website} target="_blank" rel="noreferrer">vercel.com</a>.
          </p>
        </LegalSection>

        <LegalSection id="propriete" number="03" title="Propriété intellectuelle">
          <p>
            Sauf mention contraire, les textes, l’identité visuelle, le logo, la structure et les contenus de ce site
            sont protégés. Toute reproduction, adaptation ou diffusion substantielle nécessite l’autorisation préalable
            de VIE AVENIR. Les photographies et visuels sont utilisés avec les droits nécessaires à leur publication.
          </p>
        </LegalSection>

        <LegalSection id="responsabilite" number="04" title="Responsabilité">
          <p>
            VIE AVENIR veille à publier des informations exactes et à jour. Les dates, lieux et modalités des événements
            peuvent toutefois évoluer : les informations figurant sur la page de l’événement au moment de l’inscription
            font référence. Les liens vers des sites tiers sont proposés à titre informatif ; VIE AVENIR ne contrôle pas
            leur contenu.
          </p>
        </LegalSection>

        <LegalSection id="donnees" number="05" title="Données personnelles">
          <p>
            Les règles applicables aux informations transmises via le site sont détaillées dans la{" "}
            <Link href="/politique-confidentialite">politique de confidentialité</Link>.
          </p>
        </LegalSection>
    </LegalPageShell>
  );
}
