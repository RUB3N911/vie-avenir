import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell, LegalSection } from "@/components/legal-page-shell";
import { getAssociationSettings } from "@/lib/cms-data";
import { legalConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Comment VIE AVENIR utilise et protège les données personnelles transmises sur son site.",
};

export const dynamic = "force-dynamic";

const privacyNavigation = [
  { id: "responsable", label: "Responsable" },
  { id: "donnees", label: "Données concernées" },
  { id: "finalites", label: "Finalités et base" },
  { id: "conservation", label: "Conservation" },
  { id: "hebergement", label: "Hébergement" },
  { id: "droits", label: "Vos droits" },
  { id: "cookies", label: "Cookies" },
] as const;

export default async function PrivacyPage() {
  const settings = await getAssociationSettings();
  return (
    <LegalPageShell
      description="Une information claire et compréhensible, y compris pour les jeunes, sur les données utilisées par VIE AVENIR."
      eyebrow="Vos données · Vos droits"
      navigation={privacyNavigation}
      relatedHref="/mentions-legales"
      relatedLabel="Les mentions légales du site"
      title="Politique de confidentialité"
      updatedAt={legalConfig.updatedAt}
      variant="privacy"
    >
        <section className="privacy-summary" aria-labelledby="privacy-summary-title">
          <div>
            <p>À retenir</p>
            <h2 id="privacy-summary-title">L’essentiel, en mots simples</h2>
          </div>
          <ul>
            <li><span aria-hidden="true">✓</span> Tes informations servent uniquement à répondre à ta demande.</li>
            <li><span aria-hidden="true">✓</span> Nous ne vendons jamais tes données et ne faisons pas de publicité.</li>
            <li><span aria-hidden="true">✓</span> Tu peux demander à les voir, les corriger ou les supprimer.</li>
            <li><span aria-hidden="true">✓</span> Si tu as moins de 15 ans, demande l’aide d’un responsable légal.</li>
          </ul>
        </section>

        <LegalSection id="responsable" number="01" title="Responsable du traitement">
          <p>
            Le responsable du traitement est <strong>{settings.legal_name}</strong>, association établie à {settings.city || legalConfig.location}.
            Toute demande relative à vos données peut être envoyée {settings.public_email ? <>à <a href={`mailto:${settings.public_email}`}>{settings.public_email}</a></> : <>depuis la <Link href="/contact">page de contact</Link></>}
            en indiquant « Exercice de mes droits » dans l’objet.
          </p>
        </LegalSection>

        <LegalSection id="donnees" number="02" title="Données concernées">
          <p>
            Le formulaire peut recueillir vos prénom et nom, adresse e-mail, profil, objet et message. Ne transmettez
            aucune donnée sensible ou information qui n’est pas nécessaire à votre demande. Des données techniques
            minimales, comme l’adresse IP et les journaux de sécurité, peuvent être traitées par l’hébergeur pour assurer
            le fonctionnement et la protection du site.
          </p>
        </LegalSection>

        <LegalSection id="finalites" number="03" title="Pourquoi et sur quelle base ?">
          <p>
            Les informations servent à répondre aux demandes, préparer une participation, mettre en relation un
            professionnel ou étudier un partenariat. Le traitement repose sur l’intérêt légitime de VIE AVENIR à répondre
            aux sollicitations reçues et, lorsque la demande prépare une inscription ou une collaboration, sur les mesures
            prises à votre demande avant cette démarche.
          </p>
        </LegalSection>

        <LegalSection id="conservation" number="04" title="Destinataires et conservation">
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
        </LegalSection>

        <LegalSection id="hebergement" number="05" title="Hébergement et transferts">
          <p>
            Le site est hébergé par Vercel Inc., société établie aux États-Unis. Vercel peut traiter des données techniques
            de connexion dans le cadre de l’hébergement et de la sécurité du service, selon ses engagements contractuels
            et mécanismes de transfert applicables. Consultez la{" "}
            <a href="https://vercel.com/legal/privacy-notice" target="_blank" rel="noreferrer">
              politique de confidentialité de Vercel
            </a>.
          </p>
        </LegalSection>

        <LegalSection id="droits" number="06" title="Vos droits">
          <p>
            Selon votre situation, vous pouvez demander l’accès, la rectification, l’effacement ou la limitation de vos
            données, vous opposer à leur traitement et demander leur portabilité. Vous pouvez aussi saisir la CNIL si vous
            estimez que vos droits ne sont pas respectés. Pour exercer un droit, utilisez la{" "}
            <Link href="/contact">page de contact</Link>. Une preuve d’identité ne sera demandée qu’en cas de doute raisonnable.
          </p>
        </LegalSection>

        <LegalSection id="cookies" number="07" title="Cookies et mesure d’audience">
          <p>
            Le site n’utilise actuellement aucun cookie publicitaire ni outil de mesure d’audience nécessitant votre
            consentement. Si un tel outil est ajouté, cette page sera mise à jour et un dispositif de choix sera affiché
            avant tout dépôt non essentiel.
          </p>
        </LegalSection>
    </LegalPageShell>
  );
}
