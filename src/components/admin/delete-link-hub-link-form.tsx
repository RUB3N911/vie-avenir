"use client";

import { useActionState } from "react";
import { deleteLinkHubLink } from "@/app/admin/link-actions";
import { ActionMessage } from "@/components/admin/action-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { initialAdminActionState } from "@/lib/admin-action-state";

export function DeleteLinkHubLinkForm({ linkId }: { linkId: string }) {
  const [state, action] = useActionState(deleteLinkHubLink.bind(null, linkId), initialAdminActionState);
  return (
    <form className="admin-inline-delete" action={action}>
      <label><span>Saisissez SUPPRIMER pour retirer définitivement ce lien</span><input name="confirmation" autoComplete="off" required /></label>
      <SubmitButton className="admin-danger-button" pendingLabel="Suppression…">Supprimer</SubmitButton>
      <ActionMessage state={state} />
    </form>
  );
}
