"use client";

import { useActionState } from "react";
import { deleteGalleryAlbum } from "@/app/admin/gallery-actions";
import { ActionMessage } from "@/components/admin/action-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { initialAdminActionState } from "@/lib/admin-action-state";

export function DeleteGalleryAlbumForm({ albumId }: { albumId: string }) {
  const [state, action] = useActionState(deleteGalleryAlbum.bind(null, albumId), initialAdminActionState);
  return (
    <form className="admin-danger-zone" action={action}>
      <div><h2>Supprimer l’album</h2><p>Cette action supprime également tous ses médias et ne peut pas être annulée.</p></div>
      <label className="admin-field"><span>Saisissez SUPPRIMER</span><input name="confirmation" autoComplete="off" /></label>
      <SubmitButton className="admin-danger-button">Supprimer définitivement</SubmitButton>
      <ActionMessage state={state} />
    </form>
  );
}
