import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Arrow, Callout, SectionLabel, SiteFooter, SiteHeader } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Notre mission",
  description: "Découvrez la mission, la conviction et la façon d’agir de l’association VIE AVENIR en Martinique.",
};

const reasons = [
  { number: "01", title: "Des repères", text: "Voir des parcours vrais et comprendre qu’il n’existe pas une seule route pour avancer.", tone: "pink" },
  { number: "02", title: "Des clés concrètes", text: "Décoder la vie active : emploi, logement, budget, démarches et autonomie.", tone: "orange" },
  { number: "03", title: "Une voix", text: "Pouvoir poser ses questions, exprimer ses besoins et contribuer aux projets jeunesse.", tone: "green" },
] as const;

const principles = [
  { title: "Proche", text: "Des formats itinérants, pensés avec les réalités des jeunes et des territoires.", tone: "pink" },
  { title: "Concret", text: "Des échanges simples, des mises en situation et des outils que l’on peut réutiliser.", tone: "orange" },
  { title: "Collectif", text: "Des jeunes, des professionnels, des associations, des entreprises et des communes qui avancent ensemble.", tone: "green" },
] as const;

export default function MissionPage() {
  return (
    <main>
      <SiteHeader activePath="/notre-mission" />

      <section className="page-hero page-hero-mission">
        <div className="page-photo page-photo-left">
          <Image
            src="/hero-vie-avenir.webp"
            alt="Des jeunes Martiniquais échangent autour d’un projet"
            fill
            priority
            sizes="(max-width: 800px) 100vw, 48vw"
          />
          <p className="photo-caption"><strong>Martinique · 14—25 ans</strong><span>Des rencontres qui ouvrent des possibles.</span></p>
        </div>
        <div className="page-hero-copy">
          <SectionLabel>Qui sommes-nous ?</SectionLabel>
          <h1>Nous créons les rencontres qui permettent d’imaginer autrement.</h1>
          <p>VIE AVENIR est une association martiniquaise qui rapproche les jeunes de professionnels, d’expériences concrètes et de ressources utiles pour construire la suite avec confiance.</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/nos-actions">Découvrir nos actions <Arrow /></Link>
            <Link className="text-link text-link-pink" href="/contact">Va et deviens ! <span>→</span></Link>
          </div>
        </div>
      </section>

      <section className="page-section page-section-tinted">
        <div className="page-container">
          <SectionLabel>Pourquoi VIE AVENIR ?</SectionLabel>
          <h2>Parce qu’un déclic peut changer une trajectoire.</h2>
          <div className="reason-grid">
            {reasons.map((reason) => (
              <article className={`mini-card tone-${reason.tone}`} key={reason.number}>
                <div><strong>{reason.number}</strong><h3>{reason.title}</h3></div>
                <p>{reason.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="page-container">
          <SectionLabel>Notre façon d’agir</SectionLabel>
          <h2>Proche. Concret. Collectif.</h2>
          <p className="section-intro">Trois principes pour que chaque rencontre soit vraiment utile.</p>
          <div className="principle-grid">
            {principles.map((principle) => (
              <article className={`principle tone-${principle.tone}`} key={principle.title}>
                <span aria-hidden="true">✦</span>
                <h3>{principle.title}</h3>
                <p>{principle.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Callout
        eyebrow="L’histoire ne fait que commencer"
        title="Et si vous en faisiez partie ?"
        buttonLabel="Nous rejoindre"
        href="/contact"
      />
      <SiteFooter />
    </main>
  );
}
