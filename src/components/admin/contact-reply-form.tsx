"use client";

import { useActionState, useState } from "react";
import { sendContactRequestReply } from "@/app/admin/contact-reply-actions";
import { ActionMessage } from "@/components/admin/action-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { initialAdminActionState } from "@/lib/admin-action-state";
import type { ContactProfile } from "@/lib/cms-types";
import { getContactReplyTemplates } from "@/lib/contact-reply-templates";

export function ContactReplyForm({
  requestId,
  replyToken,
  profile,
  recipientEmail,
  emailConfigured,
}: {
  requestId: string;
  replyToken: string;
  profile: ContactProfile;
  recipientEmail: string;
  emailConfigured: boolean;
}) {
  const templates = getContactReplyTemplates(profile);
  const initialTemplate = templates[0];
  const [selectedKey, setSelectedKey] = useState(initialTemplate.key);
  const [subject, setSubject] = useState(initialTemplate.subject);
  const [heading, setHeading] = useState(initialTemplate.heading);
  const [body, setBody] = useState(initialTemplate.body);
  const selectedTemplate = templates.find((template) => template.key === selectedKey) ?? initialTemplate;
  const boundAction = sendContactRequestReply.bind(null, requestId);
  const [state, action] = useActionState(boundAction, initialAdminActionState);

  function selectTemplate(key: string) {
    const template = templates.find((candidate) => candidate.key === key);
    if (!template) return;
    setSelectedKey(template.key);
    setSubject(template.subject);
    setHeading(template.heading);
    setBody(template.body);
  }

  return (
    <section className="admin-contact-reply">
      <div className="admin-contact-reply-heading">
        <div>
          <span className="admin-contact-reply-icon" aria-hidden="true">✉</span>
          <div><h3>Répondre par e-mail</h3><p>Choisissez un modèle adapté au profil, puis personnalisez-le avant l’envoi.</p></div>
        </div>
        <span className="admin-contact-recipient">À&nbsp;: {recipientEmail}</span>
      </div>
      {!emailConfigured ? <p className="admin-contact-email-warning" role="status">L’envoi est indisponible tant que RESEND_API_KEY et RESEND_FROM_EMAIL ne sont pas configurées.</p> : null}
      <form className="admin-contact-reply-form" action={action}>
        <input name="reply_token" type="hidden" value={replyToken} readOnly />
        <input name="template_key" type="hidden" value={selectedKey} readOnly />
        <div className="admin-fields-grid">
          <label className="admin-field admin-field-full">
            <span>Modèle de réponse <b>*</b></span>
            <select value={selectedKey} onChange={(event) => selectTemplate(event.target.value)}>
              {templates.map((template) => <option value={template.key} key={template.key}>{template.label}</option>)}
            </select>
          </label>
          <label className="admin-field admin-field-full">
            <span>Objet de l’e-mail <b>*</b></span>
            <input name="subject" value={subject} onChange={(event) => setSubject(event.target.value)} required maxLength={160} />
          </label>
          <label className="admin-field admin-field-full">
            <span>Titre mis en avant <b>*</b></span>
            <input name="heading" value={heading} onChange={(event) => setHeading(event.target.value)} required maxLength={180} />
          </label>
          <label className="admin-field admin-field-full">
            <span>Message <b>*</b></span>
            <textarea name="body" value={body} onChange={(event) => setBody(event.target.value)} required rows={7} maxLength={5000} />
            <small>Le prénom est ajouté automatiquement. Les réponses à l’e-mail arrivent à contact@vieavenir.fr.</small>
          </label>
        </div>
        {selectedTemplate.cta ? (
          <div className="admin-contact-cta-note">
            <span aria-hidden="true">↗</span>
            <p>Ce modèle ajoute le bouton <strong>« {selectedTemplate.cta.label} »</strong> vers le formulaire de préparation des interventions.</p>
            <a href={selectedTemplate.cta.url} target="_blank" rel="noreferrer">Vérifier le lien</a>
          </div>
        ) : null}
        <div className="admin-form-actions">
          <ActionMessage state={state} />
          <SubmitButton pendingLabel="Envoi en cours…" disabled={!emailConfigured}>Envoyer la réponse</SubmitButton>
        </div>
      </form>
    </section>
  );
}
