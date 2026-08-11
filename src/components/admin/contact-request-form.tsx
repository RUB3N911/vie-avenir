"use client";

import { useActionState } from "react";
import { saveContactRequest } from "@/app/admin/content-actions";
import { ActionMessage } from "@/components/admin/action-message";
import { SubmitButton } from "@/components/admin/submit-button";
import type { ContactRequestRecord } from "@/lib/cms-types";
import { initialAdminActionState } from "@/lib/admin-action-state";

export function ContactRequestForm({ request }: { request: ContactRequestRecord }) {
  const boundAction = saveContactRequest.bind(null, request.id);
  const [state, action] = useActionState(boundAction, initialAdminActionState);
  return <form className="admin-request-followup" action={action}><label className="admin-field"><span>État du suivi</span><select name="status" defaultValue={request.status}><option value="new">Nouvelle</option><option value="in_progress">En cours</option><option value="replied">Réponse envoyée</option><option value="closed">Clôturée</option></select></label><label className="admin-field"><span>Notes internes</span><textarea name="admin_notes" rows={4} defaultValue={request.admin_notes ?? ""} placeholder="Relance, personne en charge, prochaine action…" /></label><div className="admin-entry-actions"><ActionMessage state={state} /><SubmitButton>Enregistrer le suivi</SubmitButton></div></form>;
}
