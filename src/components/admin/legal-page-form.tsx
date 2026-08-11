"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveLegalPage } from "@/app/admin/actions";
import { ActionMessage } from "@/components/admin/action-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { legalPlaceholders } from "@/data/legal-page-defaults";
import type { LegalPageRecord } from "@/lib/cms-types";
import { initialAdminActionState } from "@/lib/admin-action-state";

export function LegalPageForm({ page }: { page: LegalPageRecord }) {
  const actionWithSlug = saveLegalPage.bind(null, page.slug);
  const [state, action] = useActionState(actionWithSlug, initialAdminActionState);
  const hasSummary = page.summary_items.length > 0;

  return (
    <form className="admin-form" action={action}>
      <section className="admin-form-card">
        <div className="admin-form-card-heading"><span>01</span><div><h2>En-tête de la page</h2><p>Ces textes apparaissent dans le grand bandeau bleu.</p></div></div>
        <div className="admin-fields-grid">
          <label className="admin-field"><span>Petit titre <b>*</b></span><input name="eyebrow" defaultValue={page.eyebrow} maxLength={100} required /></label>
          <label className="admin-field"><span>Grand titre <b>*</b></span><input name="title" defaultValue={page.title} maxLength={140} required /></label>
          <label className="admin-field admin-field-full"><span>Texte d’introduction <b>*</b></span><textarea name="description" rows={3} defaultValue={page.description} maxLength={500} required /></label>
        </div>
      </section>

      {hasSummary ? (
        <section className="admin-form-card">
          <div className="admin-form-card-heading"><span>02</span><div><h2>Résumé en mots simples</h2><p>Les quatre points mis en avant en haut de la politique de confidentialité.</p></div></div>
          <div className="admin-fields-grid">
            <label className="admin-field admin-field-full"><span>Titre du résumé</span><input name="summary_title" defaultValue={page.summary_title ?? ""} maxLength={140} /></label>
            {page.summary_items.map((item, index) => (
              <label className="admin-field admin-field-full" key={index}><span>Point {index + 1}</span><input name={`summary_item_${index}`} defaultValue={item} maxLength={300} /></label>
            ))}
          </div>
        </section>
      ) : <input type="hidden" name="summary_title" value="" />}

      <aside className="admin-placeholder-help">
        <strong>Informations automatiques</strong>
        <p>Conservez les éléments entre accolades : le site les remplace automatiquement par les informations à jour de l’association.</p>
        <code>{legalPlaceholders.join(" · ")}</code>
      </aside>

      {page.sections.map((section, index) => (
        <section className="admin-form-card" key={section.id}>
          <div className="admin-form-card-heading"><span>{String(index + (hasSummary ? 3 : 2)).padStart(2, "0")}</span><div><h2>Section {index + 1}</h2><p>Le titre alimente aussi le sommaire de la page.</p></div></div>
          <div className="admin-fields-grid">
            <label className="admin-field admin-field-full"><span>Titre de la section <b>*</b></span><input name={`section_${index}_title`} defaultValue={section.title} maxLength={140} required /></label>
            <label className="admin-field admin-field-full"><span>Contenu <b>*</b></span><textarea name={`section_${index}_body`} rows={6} defaultValue={section.body} maxLength={5000} required /></label>
            <label className="admin-field admin-field-full"><span>Encadré complémentaire <small>— facultatif</small></span><textarea name={`section_${index}_note`} rows={3} defaultValue={section.note} maxLength={2000} /></label>
          </div>
        </section>
      ))}

      <div className="admin-form-actions">
        <ActionMessage state={state} />
        <Link className="admin-preview-link" href={`/${page.slug}`} target="_blank">Prévisualiser ↗</Link>
        <SubmitButton>Enregistrer et publier</SubmitButton>
      </div>
    </form>
  );
}
