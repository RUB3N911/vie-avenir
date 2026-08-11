import type { Metadata } from "next";
import Link from "next/link";
import { Arrow, Callout, SectionLabel, SiteFooter, SiteHeader } from "@/layouts/site-shell";

export const metadata: Metadata = {
  title: "Événements",
  description: "Retrouvez les prochains ateliers et rendez-vous VIE AVENIR pour les jeunes de 14 à 25 ans en Martinique.",
};

const steps = [
  ["1", "Rencontrer", "Des professionnels et des parcours vrais", "pink"],
  ["2", "Questionner", "Sans filtre et sans mauvaise question", "orange"],
  ["3", "Essayer", "Des activités et mises en situation", "yellow"],
  ["4", "Repartir", "Avec des idées et une prochaine étape", "green"],
] as const;

const formats = [
  ["Rencontres métiers", "Découvrir des métiers grâce à celles et ceux qui les vivent vraiment.", "pink"],
  ["La vie active", "Comprendre la paie, le logement, le budget et les démarches essentielles.", "orange"],
  ["La Voix de l’Avenir", "Partager ses idées et contribuer aux projets qui concernent la jeunesse.", "green"],
] as const;

export default function EventsPage() {
  return (
    <main>
      <SiteHeader activePath="/evenements" />
      <section className="event-page-hero">
        <div className="event-page-date">
          <p>Prochain rendez-vous</p>
          <div><strong>03</strong><span>Octobre<br />2026</span></div>
        </div>
        <div className="event-page-copy">
          <h1>L’aventure commence maintenant.</h1>
          <p>Un premier atelier vivant pour rencontrer des professionnels, poser ses questions, essayer et voir son avenir autrement.</p>
          <div className="event-page-actions">
            <span>Martinique · lieu à venir</span>
            <Link className="button button-pink" href="/contact">Être informé·e <Arrow /></Link>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="page-container">
          <SectionLabel>Au programme</SectionLabel>
          <h2>Un atelier qui bouge avec toi.</h2>
          <ol className="event-steps">
            {steps.map(([number, title, text, tone]) => (
              <li className={`tone-${tone}`} key={number}>
                <strong>{number}</strong>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="page-section page-section-tinted">
        <div className="page-container">
          <SectionLabel>Les prochains formats</SectionLabel>
          <h2>La suite se prépare déjà.</h2>
          <div className="format-grid">
            {formats.map(([title, text, tone]) => (
              <article className={`format-card tone-${tone}`} key={title}>
                <p>Bientôt</p>
                <h3>{title}</h3>
                <span>{text}</span>
                <Link href="/contact">Être informé·e <b aria-hidden="true">→</b></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section practical-section">
        <div className="page-container">
          <SectionLabel>En pratique</SectionLabel>
          <div className="practical-grid">
            <article><h3>Pour qui ?</h3><p>Jeunes de 14 à 25 ans</p></article>
            <article><h3>Où ?</h3><p>En Martinique · lieu à confirmer</p></article>
            <article><h3>Comment ?</h3><p>Inscription bientôt disponible</p></article>
            <article><h3>À prévoir</h3><p>Ta curiosité, tout simplement</p></article>
          </div>
        </div>
      </section>

      <Callout
        eyebrow="Ne manque pas le prochain rendez-vous"
        title="Ton avenir vient de t’appeler."
        buttonLabel="Je reste informé·e"
        href="/contact"
      />
      <SiteFooter />
    </main>
  );
}
