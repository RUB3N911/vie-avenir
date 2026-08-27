"use client";

import { useActionState } from "react";
import { sendEventParticipantMessage } from "@/app/admin/registration-actions";
import { ActionMessage } from "@/components/admin/action-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { initialAdminActionState } from "@/lib/admin-action-state";

export function EventParticipantMessageForm({ eventId }: { eventId: string }) {
  const actionWithEvent = sendEventParticipantMessage.bind(null, eventId);
  const [state, action] = useActionState(actionWithEvent, initialAdminActionState);

  return (
    <form className="admin-form admin-participant-message-form" action={action}>
      <div className="admin-fields-grid">
        <label className="admin-field">
          <span>Destinataires <b>*</b></span>
          <select name="audience" defaultValue="confirmed">
            <option value="confirmed">Participants confirmés</option>
            <option value="waitlisted">Liste d’attente</option>
            <option value="all">Confirmés et liste d’attente</option>
          </select>
        </label>
        <label className="admin-field admin-field-wide">
          <span>Objet <b>*</b></span>
          <input name="subject" required maxLength={160} placeholder="Ex. Informations pratiques pour samedi" />
        </label>
        <label className="admin-field admin-field-full">
          <span>Message <b>*</b></span>
          <textarea name="body" required rows={8} maxLength={5000} placeholder="Rédigez ici le message qui sera envoyé…" />
          <small>Chaque destinataire reçoit un e-mail individuel. Les autres adresses restent invisibles et les réponses arrivent à contact@vieavenir.fr.</small>
        </label>
      </div>
      <div className="admin-form-actions"><ActionMessage state={state} /><SubmitButton>Envoyer le message</SubmitButton></div>
    </form>
  );
}
