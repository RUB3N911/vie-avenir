import type { Metadata } from "next";
import Link from "next/link";
import { SectionLabel, SiteFooter, SiteHeader } from "@/layouts/site-shell";
import { legalConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Informations légales relatives au site de l’association VIE AVENIR.",
};

export default function LegalNoticePage() {
  return (
    <main>
      <SiteHeader />
      <header className="legal-hero">
        <div className="page-container">
          <SectionLabel>Informations du site</SectionLabel>
          <h1>Mentions légales</h1>
          <p>Les informations essentielles sur l’éditeur, l’hébergement et l’utilisation du site VIE AVENIR.</p>
        </div>
      </header>

      <article className="legal-content page-container">
        <p className="legal-updated">Dernière mise à jour : {legalConfig.updatedAt}</p>

        <section>
          <h2>1. Éditeur du site</h2>
          <p>
            Le site <strong>VIE AVENIR</strong> est édité par le projet associatif VIE AVENIR,
            établi en {legalConfig.location}.
          </p>
          <p>Direction de la publication : {legalConfig.publicationDirector}.</p>
          <p className="legal-note">{legalConfig.registrationNotice}</p>
          <p>
            Pour contacter l’association, utilisez la <Link href="/contact">page Nous rejoindre</Link>.
          </p>
        </section>

        <section>
          <h2>2. Hébergement</h2>
          <p>
            Le site est hébergé par <strong>{legalConfig.host.name}</strong>, {legalConfig.host.address}.
          </p>
          <p>
            Site de l’hébergeur :{" "}
            <a href={legalConfig.host.website} target="_blank" rel="noreferrer">vercel.com</a>.
          </p>
        </section>

        <section>
          <h2>3. Propriété intellectuelle</h2>
          <p>
            Sauf mention contraire, les textes, l’identité visuelle, le logo, la structure et les contenus de ce site
            sont protégés. Toute reproduction, adaptation ou diffusion substantielle nécessite l’autorisation préalable
            de VIE AVENIR. Les photographies et visuels sont utilisés avec les droits nécessaires à leur publication.
          </p>
        </section>

        <section>
          <h2>4. Responsabilité</h2>
          <p>
            VIE AVENIR veille à publier des informations exactes et à jour. Les dates, lieux et modalités des événements
            peuvent toutefois évoluer : les informations figurant sur la page de l’événement au moment de l’inscription
            font référence. Les liens vers des sites tiers sont proposés à titre informatif ; VIE AVENIR ne contrôle pas
            leur contenu.
          </p>
        </section>

        <section>
          <h2>5. Données personnelles</h2>
          <p>
            Les règles applicables aux informations transmises via le site sont détaillées dans la{" "}
            <Link href="/politique-confidentialite">politique de confidentialité</Link>.
          </p>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
