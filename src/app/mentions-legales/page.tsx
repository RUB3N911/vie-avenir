import type { Metadata } from "next";
import { LegalPageShell, LegalSection } from "@/components/legal-page-shell";
import { LegalPageText } from "@/components/legal-page-text";
import { formatLegalUpdatedAt, getAssociationSettings, getLegalPage } from "@/lib/cms-data";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Informations légales relatives au site de l’association VIE AVENIR.",
  alternates: { canonical: "/mentions-legales" },
};

export const dynamic = "force-dynamic";

export default async function LegalNoticePage() {
  const [settings, page] = await Promise.all([
    getAssociationSettings(),
    getLegalPage("mentions-legales"),
  ]);
  const navigation = page.sections.map((section) => ({ id: section.id, label: section.title }));
  return (
    <LegalPageShell
      description={page.description}
      eyebrow={page.eyebrow}
      navigation={navigation}
      relatedHref="/politique-confidentialite"
      relatedLabel="Notre politique de confidentialité"
      title={page.title}
      updatedAt={formatLegalUpdatedAt(page.updated_at)}
    >
      {page.sections.map((section, index) => (
        <LegalSection id={section.id} number={String(index + 1).padStart(2, "0")} title={section.title} key={section.id}>
          <LegalPageText text={section.body} settings={settings} />
          {section.note ? <div className="legal-note"><LegalPageText text={section.note} settings={settings} /></div> : null}
        </LegalSection>
      ))}
    </LegalPageShell>
  );
}
