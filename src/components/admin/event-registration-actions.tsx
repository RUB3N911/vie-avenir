"use client";

import { useActionState } from "react";
import { manageEventRegistration } from "@/app/admin/registration-actions";
import { initialAdminActionState } from "@/lib/admin-action-state";
import type { EventParticipantStatus } from "@/lib/cms-types";

export function EventRegistrationActions({
  eventId,
  registrationId,
  status,
}: {
  eventId: string;
  registrationId: string;
  status: EventParticipantStatus;
}) {
  const actionWithRegistration = manageEventRegistration.bind(null, registrationId, eventId);
  const [state, action, pending] = useActionState(actionWithRegistration, initialAdminActionState);

  if (status === "cancelled") return <span className="admin-registration-no-action">Aucune action</span>;

  return (
    <form className="admin-registration-actions" action={action}>
      <div>
        {status === "waitlisted" ? <button name="intent" value="promote" disabled={pending}>Confirmer la place</button> : null}
        {status === "confirmed" ? <button name="intent" value="attended" disabled={pending}>Présent</button> : null}
        {status === "confirmed" ? <button name="intent" value="no_show" disabled={pending}>Absent</button> : null}
        {status === "attended" || status === "no_show" ? <button name="intent" value="confirmed" disabled={pending}>Repasser confirmé</button> : null}
        <button className="is-danger" name="intent" value="cancel" disabled={pending}>Annuler</button>
      </div>
      {state.message ? <small className={state.status === "error" ? "is-error" : "is-success"} role="status">{state.message}</small> : null}
    </form>
  );
}
