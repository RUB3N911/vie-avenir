"use client";

import { useActionState } from "react";
import { deleteContactReplyTemplate, saveContactReplyTemplate } from "@/app/admin/contact-reply-template-actions";
import { ActionMessage } from "@/components/admin/action-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { initialAdminActionState } from "@/lib/admin-action-state";
import type { ContactProfile, ContactReplyTemplateRecord } from "@/lib/cms-types";

const profileOptions: Array<{ value: ContactProfile; label: string }> = [
  { value: "young", label: "Jeune" },
  { value: "parent", label: "Parent / proche" },
  { value: "professional", label: "Professionnel" },
  { value: "partner", label: "Partenaire" },
];

function profileLabel(profile: ContactProfile) {
  return profileOptions.find((option) => option.value === profile)?.label ?? profile;
}

function ContactReplyTemplateForm({
  template,
  defaultOrder,
}: {
  template?: ContactReplyTemplateRecord;
  defaultOrder: number;
}) {
  const [state, action] = useActionState(
    saveContactReplyTemplate.bind(null, template?.id ?? null),
    initialAdminActionState,
  );

  return (
    <form className="admin-reply-template-form" action={action}>
      <div className="admin-fields-grid">
        <label className="admin-field">
          <span>Profil concerné <b>*</b></span>
          <select name="profile" defaultValue={template?.profile ?? "young"}>
            {profileOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="admin-field">
          <span>Nom du modèle <b>*</b></span>
          <input name="label" defaultValue={template?.label ?? ""} maxLength={80} required placeholder="Ex. Proposer un rendez-vous" />
        </label>
        <label className="admin-field admin-field-full">
          <span>Objet de l’e-mail <b>*</b></span>
          <input name="subject" defaultValue={template?.subject ?? ""} maxLength={160} required placeholder="VIE AVENIR — …" />
        </label>
        <label className="admin-field admin-field-full">
          <span>Titre mis en avant <b>*</b></span>
          <input name="heading" defaultValue={template?.heading ?? ""} maxLength={180} required />
        </label>
        <label className="admin-field admin-field-full">
          <span>Message <b>*</b></span>
          <textarea name="body" defaultValue={template?.body ?? ""} rows={7} maxLength={5000} required />
          <small>Le prénom du destinataire est automatiquement ajouté avant ce texte.</small>
        </label>
        <label className="admin-field">
          <span>Texte du bouton (facultatif)</span>
          <input name="cta_label" defaultValue={template?.cta_label ?? ""} maxLength={80} placeholder="Ex. Compléter le formulaire" />
        </label>
        <label className="admin-field">
          <span>Lien du bouton (facultatif)</span>
          <input name="cta_url" type="url" defaultValue={template?.cta_url ?? ""} maxLength={2048} placeholder="https://…" />
          <small>Pour ajouter un bouton, les deux champs doivent être renseignés.</small>
        </label>
        <label className="admin-field">
          <span>Ordre d’affichage</span>
          <input name="display_order" type="number" min={0} max={999} defaultValue={template?.display_order ?? defaultOrder} required />
          <small>Le nombre le plus petit apparaît en premier.</small>
        </label>
      </div>
      <div className="admin-entry-actions">
        <ActionMessage state={state} />
        <SubmitButton pendingLabel="Enregistrement…">{template ? "Enregistrer les modifications" : "Créer le modèle"}</SubmitButton>
      </div>
    </form>
  );
}

function DeleteContactReplyTemplateForm({ templateId }: { templateId: string }) {
  const [state, action] = useActionState(
    deleteContactReplyTemplate.bind(null, templateId),
    initialAdminActionState,
  );

  return (
    <form className="admin-inline-delete" action={action}>
      <label>
        <span>Saisissez SUPPRIMER pour retirer définitivement ce modèle</span>
        <input name="confirmation" autoComplete="off" required />
      </label>
      <SubmitButton className="admin-danger-button" pendingLabel="Suppression…">Supprimer</SubmitButton>
      <ActionMessage state={state} />
    </form>
  );
}

export function ContactReplyTemplateManager({ templates }: { templates: ContactReplyTemplateRecord[] }) {
  const defaultOrder = Math.min(999, Math.max(0, ...templates.map((template) => template.display_order)) + 10);

  return (
    <section className="admin-reply-template-manager">
      <header>
        <div>
          <p className="admin-eyebrow">Bibliothèque</p>
          <h2>Modèles de réponse</h2>
          <span>Créez, modifiez ou supprimez les messages proposés lors d’une réponse. La réponse libre reste toujours disponible.</span>
        </div>
        <span className="admin-template-count">{templates.length} modèle{templates.length > 1 ? "s" : ""}</span>
      </header>

      <details className="admin-reply-template-create">
        <summary><span aria-hidden="true">＋</span> Enregistrer un nouveau modèle</summary>
        <ContactReplyTemplateForm defaultOrder={defaultOrder} />
      </details>

      {templates.length ? (
        <div className="admin-reply-template-list">
          {templates.map((template) => (
            <details key={template.id}>
              <summary>
                <span><strong>{template.label}</strong><small>{profileLabel(template.profile)}</small></span>
                <span className="admin-template-order">Ordre {template.display_order}</span>
              </summary>
              <div className="admin-reply-template-editor">
                <ContactReplyTemplateForm template={template} defaultOrder={template.display_order} />
                <DeleteContactReplyTemplateForm templateId={template.id} />
              </div>
            </details>
          ))}
        </div>
      ) : <p className="admin-template-empty">Aucun modèle enregistré. Vous pouvez tout de même envoyer une réponse libre.</p>}
    </section>
  );
}
