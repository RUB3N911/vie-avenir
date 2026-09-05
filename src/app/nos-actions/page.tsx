import type { Metadata } from "next";
import Image from "next/image";
import { Callout, SectionLabel, SiteFooter, SiteHeader } from "@/layouts/site-shell";

export const metadata: Metadata = {
  title: "Nos actions",
  description: "Rencontres métiers, ateliers de vie active et Voix de l’Avenir : découvrez les actions concrètes de VIE AVENIR.",
  alternates: { canonical: "/nos-actions" },
};

const actions = [
  {
    number: "01",
    label: "Rencontrer",
    title: "Des professionnels inspirants",
    text: "Des parcours racontés autrement, des métiers à découvrir et des échanges où toutes les questions ont leur place.",
    items: ["Speed-rencontres", "Témoignages sans filtre", "Questions libres"],
    tone: "pink",
  },
  {
    number: "02",
    label: "Comprendre",
    title: "La vie active, sans mode d’emploi compliqué",
    text: "Des ateliers utiles pour devenir autonome et prendre de meilleures décisions au quotidien.",
    items: ["Fiche de paie & impôts", "Bail, logement & APL", "Budget, courses & démarches"],
    tone: "orange",
  },
  {
    number: "03",
    label: "Prendre la parole",
    title: "La Voix de l’Avenir",
    text: "Un espace pour partager ses idées, faire entendre ses besoins et contribuer aux projets qui concernent la jeunesse.",
    items: ["Expression & confiance", "Débat et co-construction", "Retours d’expérience"],
    tone: "green",
  },
] as const;

const traits = [
  ["Itinérant", "Au plus près des jeunes", "pink"],
  ["Interactif", "On participe vraiment", "orange"],
  ["Accessible", "Des mots simples", "yellow"],
  ["Sans tabou", "Toutes les questions comptent", "green"],
] as const;

export default function ActionsPage() {
  return (
    <main>
      <SiteHeader activePath="/nos-actions" />
      <section className="page-hero page-hero-actions">
        <div className="page-hero-copy">
          <SectionLabel>Nos actions</SectionLabel>
          <h1>Du concret pour passer de « je ne sais pas » à « pourquoi pas moi ? »</h1>
          <p>Des formats vivants, sans jargon et sans tabou, conçus pour rencontrer, comprendre et prendre la parole.</p>
        </div>
        <div className="page-photo page-photo-right">
          <Image
            src="/images/hero/hero-vie-avenir.webp"
            alt="Atelier VIE AVENIR avec des jeunes et un professionnel"
            fill
            priority
            sizes="(max-width: 800px) 100vw, 42vw"
          />
          <p className="photo-caption photo-caption-small"><strong>Faire · Tester · Oser</strong></p>
        </div>
      </section>

      <section className="page-section page-section-tinted action-list-section">
        <div className="page-container action-detail-list">
          {actions.map((action) => (
            <article className={`action-detail tone-${action.tone}`} key={action.number}>
              <div className="action-detail-copy">
                <strong className="action-detail-number">{action.number}</strong>
                <div>
                  <p>{action.label}</p>
                  <h2>{action.title}</h2>
                  <span>{action.text}</span>
                </div>
              </div>
              <ul>
                {action.items.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section workshop-section">
        <div className="page-container">
          <SectionLabel>Un atelier VIE AVENIR, c’est…</SectionLabel>
          <div className="trait-grid">
            {traits.map(([title, text, tone]) => (
              <article className={`trait tone-${tone}`} key={title}>
                <span aria-hidden="true" />
                <div><h3>{title}</h3><p>{text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Callout
        eyebrow="Prochain rendez-vous · 03 octobre 2026"
        title="L’aventure commence maintenant."
        buttonLabel="Voir l’événement"
        href="/evenements"
      />
      <SiteFooter />
    </main>
  );
}
