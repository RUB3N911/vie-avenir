"use client";

import { useActionState } from "react";
import { saveLinkHubLink } from "@/app/admin/link-actions";
import { ActionMessage } from "@/components/admin/action-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { initialAdminActionState } from "@/lib/admin-action-state";
import type { LinkHubLink, LinkHubIconName } from "@/lib/cms-types";

const iconOptions: Array<{ value: LinkHubIconName; label: string }> = [
  { value: "link", label: "Lien" },
  { value: "spark", label: "Déclic / étoile" },
  { value: "calendar", label: "Calendrier" },
  { value: "users", label: "Public / rejoindre" },
  { value: "briefcase", label: "Professionnel" },
  { value: "heart", label: "Soutenir" },
  { value: "gallery", label: "Galerie" },
  { value: "globe", label: "Site web" },
];

export function LinkHubLinkForm({
  link,
  defaultOrder,
}: {
  link?: LinkHubLink;
  defaultOrder?: number;
}) {
  const saveAction = saveLinkHubLink.bind(null, link?.id ?? null);
  const [state, action] = useActionState(saveAction, initialAdminActionState);

  return (
    <form className="admin-form-card admin-link-hub-form" action={action}>
      <div className="admin-entry-heading">
        <div>
          <p className="admin-eyebrow">{link ? `Ordre ${link.display_order}` : "Nouveau bouton"}</p>
          <h3>{link?.label ?? "Ajouter un lien"}</h3>
        </div>
        {link ? (
          <span className={`admin-badge ${link.published ? "publication-published" : "publication-draft"}`}>
            {link.published ? "Visible" : "Masqué"}
          </span>
        ) : null}
      </div>

      <div className="admin-fields-grid">
        <label className="admin-field">
          <span>Titre du bouton <b>*</b></span>
          <input name="label" defaultValue={link?.label ?? ""} maxLength={80} required />
        </label>
        <label className="admin-field">
          <span>Icône</span>
          <select name="icon" defaultValue={link?.icon ?? "link"}>
            {iconOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="admin-field admin-field-wide">
          <span>Adresse du lien <b>*</b></span>
          <input name="url" defaultValue={link?.url ?? ""} placeholder="https://… ou /contact" required />
          <small className="admin-field-note">Pour une page du site, utilisez par exemple /evenements. Pour un autre site, saisissez l’adresse complète.</small>
        </label>
        <label className="admin-field">
          <span>Ordre d’affichage</span>
          <input name="display_order" type="number" min={0} max={999} defaultValue={link?.display_order ?? defaultOrder ?? 10} required />
          <small className="admin-field-note">Le nombre le plus petit apparaît en premier.</small>
        </label>
        <div className="admin-link-hub-options">
          <label className="admin-check-field">
            <input name="published" type="checkbox" defaultChecked={link?.published ?? true} />
            <span><strong>Afficher le lien</strong><small>Décochez pour le préparer sans le publier.</small></span>
          </label>
          <label className="admin-check-field">
            <input name="is_featured" type="checkbox" defaultChecked={link?.is_featured ?? false} />
            <span><strong>Mettre en avant</strong><small>Un seul bouton peut être mis en avant.</small></span>
          </label>
        </div>
      </div>

      <div className="admin-entry-actions">
        <ActionMessage state={state} />
        <SubmitButton>{link ? "Enregistrer le lien" : "Ajouter à la page"}</SubmitButton>
      </div>
    </form>
  );
}
