import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Arrow, Callout, SectionLabel, SiteFooter, SiteHeader } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Partenaires",
  description: "Professionnels, entreprises, collectivités et associations : construisez une action utile avec VIE AVENIR.",
};

const partnerTypes = [
  ["Professionnels", "Partager un parcours, un métier, une expérience ou un conseil concret.", "pink"],
  ["Entreprises", "Mobiliser des collaborateurs, accueillir une rencontre ou soutenir un atelier.", "orange"],
  ["Collectivités", "Créer le lien avec les jeunes, les lieux et les dynamiques du territoire.", "yellow"],
  ["Associations", "Mutualiser les idées, les publics, les compétences et les ressources.", "green"],
] as const;

const contributions = [
  ["01", "Une rencontre", "Faire découvrir un métier ou un parcours sans discours formaté."],
  ["02", "Un atelier", "Donner des clés pratiques pour l’autonomie et la vie active."],
  ["03", "Un lieu", "Accueillir une action au plus près des jeunes du territoire."],
  ["04", "Un soutien", "Aider l’association à déployer du matériel, des formats et de nouveaux rendez-vous."],
] as const;

export default function PartnersPage() {
  return (
    <main>
      <SiteHeader activePath="/partenaires" />
      <section className="page-hero page-hero-partners">
        <div className="page-hero-copy">
          <SectionLabel>Devenir partenaire</SectionLabel>
          <h1>Ensemble, ouvrons le champ des possibles.</h1>
          <p>Entreprises, collectivités, professionnels et associations : votre expérience, vos lieux, vos réseaux ou votre soutien peuvent provoquer un vrai déclic.</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/contact">Construisons une action <Arrow /></Link>
          </div>
        </div>
        <div className="page-photo page-photo-right">
          <Image
            src="/hero-vie-avenir.webp"
            alt="Un professionnel accompagne des jeunes lors d’un atelier"
            fill
            priority
            sizes="(max-width: 800px) 100vw, 44vw"
          />
          <p className="photo-caption photo-caption-small"><strong>Une expérience partagée = un déclic</strong></p>
        </div>
      </section>

      <section className="page-section page-section-tinted">
        <div className="page-container">
          <SectionLabel>Chacun peut agir</SectionLabel>
          <h2>Quatre façons de rejoindre l’élan.</h2>
          <div className="partner-type-grid">
            {partnerTypes.map(([title, text, tone]) => (
              <article className={`partner-type tone-${tone}`} key={title}>
                <span aria-hidden="true">↗</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section contribution-section">
        <div className="page-container">
          <SectionLabel>Votre engagement rend possible</SectionLabel>
          <h2>Des actions utiles, visibles et ancrées ici.</h2>
          <div className="contribution-grid">
            {contributions.map(([number, title, text]) => (
              <article key={number}>
                <strong>{number}</strong>
                <div><h3>{title}</h3><p>{text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="partner-values" aria-label="Les engagements VIE AVENIR">
        <div><strong>Local</strong><span>Pensé en Martinique</span></div>
        <div><strong>Simple</strong><span>Un interlocuteur clair</span></div>
        <div><strong>Utile</strong><span>Des formats concrets</span></div>
        <div><strong>Collectif</strong><span>Des liens qui durent</span></div>
      </section>

      <Callout
        eyebrow="Une idée ? Un lieu ? Une compétence à partager ?"
        title="Construisons l’action qui vous ressemble."
        buttonLabel="Devenir partenaire"
        href="/contact"
      />
      <SiteFooter />
    </main>
  );
}
