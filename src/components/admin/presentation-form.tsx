"use client";

import { useActionState } from "react";
import { saveSitePresentation } from "@/app/admin/content-actions";
import { ActionMessage } from "@/components/admin/action-message";
import { SubmitButton } from "@/components/admin/submit-button";
import type { SitePresentation } from "@/lib/cms-types";
import { initialAdminActionState } from "@/lib/admin-action-state";

export function PresentationForm({ presentation }: { presentation: SitePresentation }) {
  const [state, action] = useActionState(saveSitePresentation, initialAdminActionState);
  return (
    <form className="admin-form admin-content-block" action={action}>
      <section className="admin-form-card">
        <div className="admin-form-card-heading"><span>01</span><div><h2>Histoire de VIE AVENIR</h2><p>Cette section reste invisible sur le site tant que le texte principal est vide.</p></div></div>
        <div className="admin-fields-grid">
          <label className="admin-field admin-field-full"><span>Titre</span><input name="story_title" defaultValue={presentation.story_title ?? ""} placeholder="Ex. Pourquoi VIE AVENIR est née" /></label>
          <label className="admin-field admin-field-full"><span>Notre histoire</span><textarea name="story_body" rows={8} defaultValue={presentation.story_body ?? ""} placeholder="Racontez le constat de départ, le déclic et la vision portée par les fondateurs…" /></label>
          <label className="admin-field admin-field-full"><span>Présentation courte de l’équipe ou du bureau</span><textarea name="team_intro" rows={4} defaultValue={presentation.team_intro ?? ""} placeholder="Une ou deux phrases pour présenter les personnes qui portent l’association." /></label>
        </div>
      </section>
      <section className="admin-form-card">
        <div className="admin-form-card-heading"><span>02</span><div><h2>Accueil et protection des mineurs</h2><p>Publiez la charte uniquement après validation par le bureau.</p></div></div>
        <div className="admin-fields-grid">
          <label className="admin-field admin-field-full"><span>Titre de la charte</span><input name="minor_charter_title" defaultValue={presentation.minor_charter_title ?? ""} /></label>
          <label className="admin-field admin-field-full"><span>Contenu de la charte</span><textarea name="minor_charter_body" rows={10} defaultValue={presentation.minor_charter_body ?? ""} placeholder="Engagements d’accueil, encadrement, droit à l’image, confidentialité, signalement…" /></label>
          <label className="admin-switch-field"><input name="minor_charter_published" type="checkbox" defaultChecked={presentation.minor_charter_published} /><span>Publier la charte sur la page Notre mission</span></label>
        </div>
      </section>
      <div className="admin-form-actions"><ActionMessage state={state} /><SubmitButton>Enregistrer la présentation</SubmitButton></div>
    </form>
  );
}
