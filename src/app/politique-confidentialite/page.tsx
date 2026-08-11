import type { Metadata } from "next";
import Link from "next/link";
import { SectionLabel, SiteFooter, SiteHeader } from "@/layouts/site-shell";
import { legalConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Comment VIE AVENIR utilise et protège les données personnelles transmises sur son site.",
};

export default function PrivacyPage() {
  return (
    <main>
      <SiteHeader />
      <header className="legal-hero legal-hero-privacy">
        <div className="page-container">
          <SectionLabel>Vos données · Vos droits</SectionLabel>
          <h1>Politique de confidentialité</h1>
          <p>Une information claire, y compris pour les jeunes, sur les données utilisées par VIE AVENIR.</p>
        </div>
      </header>

      <article className="legal-content page-container">
        <p className="legal-updated">Dernière mise à jour : {legalConfig.updatedAt}</p>

        <section className="privacy-summary" aria-labelledby="privacy-summary-title">
          <h2 id="privacy-summary-title">L’essentiel, en mots simples</h2>
          <ul>
            <li>Nous utilisons tes informations uniquement pour répondre à ton message et organiser la suite demandée.</li>
            <li>Nous ne vendons jamais tes données et ne les utilisons pas pour de la publicité.</li>
            <li>Tu peux demander à voir, corriger ou supprimer tes informations.</li>
            <li>Si tu as moins de 15 ans, demande à un parent ou responsable légal de t’aider à nous écrire.</li>
          </ul>
        </section>

        <section>
          <h2>1. Responsable du traitement</h2>
          <p>
            Le responsable du traitement est <strong>VIE AVENIR</strong>, projet associatif établi en {legalConfig.location}.
            Toute demande relative à vos données peut être envoyée depuis la <Link href="/contact">page de contact</Link>
            en indiquant « Exercice de mes droits » dans l’objet.
          </p>
        </section>

        <section>
          <h2>2. Données concernées</h2>
          <p>
            Le formulaire peut recueillir vos prénom et nom, adresse e-mail, profil, objet et message. Ne transmettez
            aucune donnée sensible ou information qui n’est pas nécessaire à votre demande. Des données techniques
            minimales, comme l’adresse IP et les journaux de sécurité, peuvent être traitées par l’hébergeur pour assurer
            le fonctionnement et la protection du site.
          </p>
        </section>

        <section>
          <h2>3. Pourquoi et sur quelle base ?</h2>
          <p>
            Les informations servent à répondre aux demandes, préparer une participation, mettre en relation un
            professionnel ou étudier un partenariat. Le traitement repose sur l’intérêt légitime de VIE AVENIR à répondre
            aux sollicitations reçues et, lorsque la demande prépare une inscription ou une collaboration, sur les mesures
            prises à votre demande avant cette démarche.
          </p>
        </section>

        <section>
          <h2>4. Destinataires et conservation</h2>
          <p>
            Les informations sont accessibles uniquement aux membres autorisés de VIE AVENIR et, si nécessaire, aux
            prestataires techniques indispensables au fonctionnement du site. Elles ne sont ni vendues ni transmises à
            des partenaires à des fins commerciales. Les messages sont conservés au maximum {legalConfig.privacyRetention},
            sauf obligation légale ou nécessité liée à une relation associative en cours.
          </p>
          <p className="legal-note">
            Tant que l’envoi du formulaire n’est pas activé, les informations saisies restent dans votre navigateur et ne
            sont pas transmises à VIE AVENIR.
          </p>
        </section>

        <section>
          <h2>5. Hébergement et transferts</h2>
          <p>
            Le site est hébergé par Vercel Inc., société établie aux États-Unis. Vercel peut traiter des données techniques
            de connexion dans le cadre de l’hébergement et de la sécurité du service, selon ses engagements contractuels
            et mécanismes de transfert applicables. Consultez la{" "}
            <a href="https://vercel.com/legal/privacy-notice" target="_blank" rel="noreferrer">
              politique de confidentialité de Vercel
            </a>.
          </p>
        </section>

        <section>
          <h2>6. Vos droits</h2>
          <p>
            Selon votre situation, vous pouvez demander l’accès, la rectification, l’effacement ou la limitation de vos
            données, vous opposer à leur traitement et demander leur portabilité. Vous pouvez aussi saisir la CNIL si vous
            estimez que vos droits ne sont pas respectés. Pour exercer un droit, utilisez la{" "}
            <Link href="/contact">page de contact</Link>. Une preuve d’identité ne sera demandée qu’en cas de doute raisonnable.
          </p>
        </section>

        <section>
          <h2>7. Cookies et mesure d’audience</h2>
          <p>
            Le site n’utilise actuellement aucun cookie publicitaire ni outil de mesure d’audience nécessitant votre
            consentement. Si un tel outil est ajouté, cette page sera mise à jour et un dispositif de choix sera affiché
            avant tout dépôt non essentiel.
          </p>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
