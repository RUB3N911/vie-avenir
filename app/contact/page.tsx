import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Callout, SectionLabel, SiteFooter, SiteHeader } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Nous rejoindre",
  description: "Contactez VIE AVENIR pour participer à un atelier, partager un métier ou construire un partenariat en Martinique.",
};

const audiences = [
  ["Tu as 14—25 ans", "Participer, poser une question ou proposer une idée.", "pink"],
  ["Vous êtes professionnel", "Partager votre parcours ou votre métier.", "orange"],
  ["Vous représentez une structure", "Imaginer un partenariat ou accueillir une action.", "green"],
] as const;

export default function ContactPage() {
  return (
    <main>
      <SiteHeader activePath="/contact" />
      <section className="contact-page-hero">
        <div>
          <SectionLabel>Contact · Nous rejoindre</SectionLabel>
          <h1>Une question, une envie, une rencontre à provoquer ? Parlons-en.</h1>
          <p>Dis-nous simplement qui tu es et ce que tu aimerais faire avec VIE AVENIR. Nous reviendrons vers toi dès que possible.</p>
        </div>
        <strong aria-hidden="true">VA !</strong>
      </section>

      <section className="audience-band">
        <div className="audience-grid">
          {audiences.map(([title, text, tone]) => (
            <article className={`audience-card tone-${tone}`} key={title}>
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section contact-form-section">
        <div className="page-container">
          <SectionLabel>Écrivez-nous</SectionLabel>
          <h2>Quelques mots suffisent pour commencer.</h2>
          <div className="contact-layout">
            <ContactForm />
            <aside className="contact-aside">
              <section className="next-steps">
                <h3>Et après ?</h3>
                <ol>
                  <li><span>1</span>Nous lisons ton message</li>
                  <li><span>2</span>Nous identifions la bonne suite</li>
                  <li><span>3</span>Nous te recontactons</li>
                </ol>
              </section>
              <section className="contact-details">
                <h3>Coordonnées</h3>
                <strong>Les coordonnées officielles seront ajoutées avant l’ouverture des inscriptions.</strong>
                <p>En attendant, le formulaire constitue le point de contact principal du site.</p>
                <span>Instagram · TikTok · à renseigner</span>
              </section>
            </aside>
          </div>
        </div>
      </section>

      <section className="faq-band">
        <div className="page-container">
          <SectionLabel>Bon à savoir</SectionLabel>
          <div className="faq-grid">
            <article><h3>Puis-je venir à un atelier ?</h3><p>Oui, si tu as entre 14 et 25 ans. Les modalités seront indiquées avec chaque événement.</p></article>
            <article><h3>Puis-je proposer mon métier ?</h3><p>Oui. Présentez votre parcours et vos disponibilités dans le formulaire.</p></article>
          </div>
        </div>
      </section>

      <Callout
        eyebrow="Rencontrer. Inspirer. Devenir."
        title="La prochaine rencontre peut commencer ici."
        buttonLabel="Nous écrire"
        href="#formulaire"
      />
      <SiteFooter />
    </main>
  );
}
