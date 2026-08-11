"use client";

import { useActionState } from "react";
import { deleteEvent } from "@/app/admin/actions";
import { ActionMessage } from "@/components/admin/action-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { initialAdminActionState } from "@/lib/admin-action-state";

export function DeleteEventForm({ eventId }: { eventId: string }) {
  const [state, action] = useActionState(deleteEvent.bind(null, eventId), initialAdminActionState);
  return (
    <form className="admin-danger-zone" action={action}>
      <div><h2>Supprimer cet événement</h2><p>Cette action retire définitivement l’événement du site et de l’administration.</p></div>
      <label><span>Saisissez <strong>SUPPRIMER</strong> pour confirmer</span><input name="confirmation" autoComplete="off" required /></label>
      <ActionMessage state={state} />
      <SubmitButton className="admin-danger-button" pendingLabel="Suppression…">Supprimer définitivement</SubmitButton>
    </form>
  );
}
