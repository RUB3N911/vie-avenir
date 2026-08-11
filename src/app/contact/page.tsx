import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { contactJourneys, contactProfiles } from "@/data/contact-journeys";
import { Callout, SectionLabel, SiteFooter, SiteHeader } from "@/layouts/site-shell";
import { getAssociationSettings } from "@/lib/cms-data";
import type { ContactProfile } from "@/lib/cms-types";

export const metadata: Metadata = {
  title: "Nous rejoindre",
  description: "Contactez VIE AVENIR pour participer à un atelier, partager un métier ou construire un partenariat en Martinique.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ profil?: string }> }) {
  const [settings, query] = await Promise.all([getAssociationSettings(), searchParams]);
  const initialProfile = contactProfiles.includes(query.profil as ContactProfile) ? query.profil as ContactProfile : "young";
  return (
    <main>
      <SiteHeader activePath="/contact" />
      <section className="contact-page-hero">
        <div>
          <SectionLabel>Contact · Nous rejoindre</SectionLabel>
          <h1>Une question, une envie, une rencontre à provoquer ? Parlons-en.</h1>
          <p>Choisissez le parcours qui vous correspond et partagez simplement votre demande. VIE AVENIR vous indiquera la suite la plus adaptée.</p>
        </div>
        <strong aria-hidden="true">VA !</strong>
      </section>

      <section className="audience-band" id="parcours">
        <div className="audience-grid">
          {contactProfiles.map((profile) => (
            <Link className={`audience-card tone-${contactJourneys[profile].tone}`} href={`/contact?profil=${profile}#formulaire`} key={profile}>
              <h2>{contactJourneys[profile].cardTitle}</h2>
              <p>{contactJourneys[profile].description}</p>
              <span>Choisir ce parcours →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-section contact-form-section">
        <div className="page-container">
          <SectionLabel>Écrivez-nous</SectionLabel>
          <h2>Quelques mots suffisent pour commencer.</h2>
          <div className="contact-layout">
            <ContactForm initialProfile={initialProfile} />
            <aside className="contact-aside">
              <section className="next-steps">
                <h3>Et après ?</h3>
                <ol>
                  <li><span>1</span>Votre message est lu</li>
                  <li><span>2</span>Nous identifions la bonne suite</li>
                  <li><span>3</span>Nous vous recontactons</li>
                </ol>
              </section>
              <section className="contact-details">
                <h3>Contacter l’association</h3>
                <strong>{settings.legal_name}<br />{settings.city}</strong>
                {settings.public_email ? <p><a href={`mailto:${settings.public_email}`}>{settings.public_email}</a>{settings.phone ? <><br /><a href={`tel:${settings.phone.replace(/\s/g, "")}`}>{settings.phone}</a></> : null}</p> : <p>Pour participer, proposer un métier ou construire un partenariat, utilisez le formulaire en ligne.</p>}
                <Link href="/politique-confidentialite">Comment vos données sont protégées <span aria-hidden="true">→</span></Link>
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
