"use client";

import { useActionState, useState } from "react";
import { sendContactRequestReply } from "@/app/admin/contact-reply-actions";
import { ActionMessage } from "@/components/admin/action-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { initialAdminActionState } from "@/lib/admin-action-state";
import type { ContactProfile, ContactReplyTemplateRecord } from "@/lib/cms-types";

function getFreeReply(profile: ContactProfile, requestSubject: string) {
  const possessive = profile === "young" ? "ta" : "votre";
  const subject = requestSubject.replace(/[\r\n]+/g, " ").trim();
  return {
    subject: subject ? `VIE AVENIR — ${subject}`.slice(0, 160) : `VIE AVENIR — Réponse à ${possessive} demande`,
    heading: profile === "young" ? "Merci pour ton message" : "Merci pour votre message",
    body: "",
  };
}

export function ContactReplyForm({
  requestId,
  replyToken,
  profile,
  requestSubject,
  recipientEmail,
  emailConfigured,
  templates,
}: {
  requestId: string;
  replyToken: string;
  profile: ContactProfile;
  requestSubject: string;
  recipientEmail: string;
  emailConfigured: boolean;
  templates: ContactReplyTemplateRecord[];
}) {
  const freeReply = getFreeReply(profile, requestSubject);
  const [selectedId, setSelectedId] = useState("");
  const [subject, setSubject] = useState(freeReply.subject);
  const [heading, setHeading] = useState(freeReply.heading);
  const [body, setBody] = useState(freeReply.body);
  const selectedTemplate = templates.find((template) => template.id === selectedId) ?? null;
  const boundAction = sendContactRequestReply.bind(null, requestId);
  const [state, action] = useActionState(boundAction, initialAdminActionState);

  function selectTemplate(id: string) {
    setSelectedId(id);
    const template = templates.find((candidate) => candidate.id === id);
    const reply = template ?? freeReply;
    setSubject(reply.subject);
    setHeading(reply.heading);
    setBody(reply.body);
  }

  return (
    <section className="admin-contact-reply">
      <div className="admin-contact-reply-heading">
        <div>
          <span className="admin-contact-reply-icon" aria-hidden="true">✉</span>
          <div><h3>Répondre par e-mail</h3><p>Rédigez librement votre réponse ou partez d’un modèle enregistré.</p></div>
        </div>
        <span className="admin-contact-recipient">À&nbsp;: {recipientEmail}</span>
      </div>
      {!emailConfigured ? <p className="admin-contact-email-warning" role="status">L’envoi est indisponible tant que RESEND_API_KEY et RESEND_FROM_EMAIL ne sont pas configurées.</p> : null}
      <form className="admin-contact-reply-form" action={action}>
        <input name="reply_token" type="hidden" value={replyToken} readOnly />
        <div className="admin-fields-grid">
          <label className="admin-field admin-field-full">
            <span>Mode de réponse</span>
            <select name="template_id" value={selectedId} onChange={(event) => selectTemplate(event.target.value)}>
              <option value="">Réponse libre — sans modèle</option>
              {templates.map((template) => <option value={template.id} key={template.id}>{template.label}</option>)}
            </select>
            <small>Le choix d’un modèle remplit les champs ci-dessous. Vous pouvez ensuite personnaliser le texte.</small>
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
        {selectedTemplate?.cta_label && selectedTemplate.cta_url ? (
          <div className="admin-contact-cta-note">
            <span aria-hidden="true">↗</span>
            <p>Ce modèle ajoute le bouton <strong>« {selectedTemplate.cta_label} »</strong> dans l’e-mail.</p>
            <a href={selectedTemplate.cta_url} target="_blank" rel="noreferrer">Vérifier le lien</a>
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
