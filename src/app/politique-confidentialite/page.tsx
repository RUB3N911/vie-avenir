import type { Metadata } from "next";
import { LegalPageShell, LegalSection } from "@/components/legal-page-shell";
import { LegalPageText } from "@/components/legal-page-text";
import { formatLegalUpdatedAt, getAssociationSettings, getLegalPage } from "@/lib/cms-data";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Comment VIE AVENIR utilise et protège les données personnelles transmises sur son site.",
};

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const [settings, page] = await Promise.all([
    getAssociationSettings(),
    getLegalPage("politique-confidentialite"),
  ]);
  const navigation = page.sections.map((section) => ({ id: section.id, label: section.title }));
  return (
    <LegalPageShell
      description={page.description}
      eyebrow={page.eyebrow}
      navigation={navigation}
      relatedHref="/mentions-legales"
      relatedLabel="Les mentions légales du site"
      title={page.title}
      updatedAt={formatLegalUpdatedAt(page.updated_at)}
      variant="privacy"
    >
      {page.summary_title && page.summary_items.length ? (
        <section className="privacy-summary" aria-labelledby="privacy-summary-title">
          <div>
            <p>À retenir</p>
            <h2 id="privacy-summary-title">{page.summary_title}</h2>
          </div>
          <ul>
            {page.summary_items.map((item) => <li key={item}><span aria-hidden="true">✓</span> {item}</li>)}
          </ul>
        </section>
      ) : null}

      {page.sections.map((section, index) => (
        <LegalSection id={section.id} number={String(index + 1).padStart(2, "0")} title={section.title} key={section.id}>
          <LegalPageText text={section.body} settings={settings} />
          {section.note ? <div className="legal-note"><LegalPageText text={section.note} settings={settings} /></div> : null}
        </LegalSection>
      ))}
    </LegalPageShell>
  );
}
