"use client";

import { useActionState } from "react";
import { saveGalleryAlbum } from "@/app/admin/gallery-actions";
import { ActionMessage } from "@/components/admin/action-message";
import { SubmitButton } from "@/components/admin/submit-button";
import type { EventRecord, GalleryAlbum } from "@/lib/cms-types";
import { initialAdminActionState } from "@/lib/admin-action-state";

export function GalleryAlbumForm({ album, events }: { album?: GalleryAlbum | null; events: EventRecord[] }) {
  const [state, action] = useActionState(saveGalleryAlbum.bind(null, album?.id ?? null), initialAdminActionState);

  return (
    <form className="admin-form" action={action}>
      <section className="admin-form-card">
        <div className="admin-form-card-heading"><span>01</span><div><h2>L’album</h2><p>Regroupez les photos et vidéos d’un même moment ou événement.</p></div></div>
        <div className="admin-fields-grid">
          <label className="admin-field admin-field-wide"><span>Titre <b>*</b></span><input name="title" defaultValue={album?.title ?? ""} required maxLength={160} /></label>
          <label className="admin-field admin-field-full"><span>Description</span><textarea name="description" rows={4} defaultValue={album?.description ?? ""} maxLength={2000} /></label>
          <label className="admin-field admin-field-wide"><span>Événement associé</span><select name="event_id" defaultValue={album?.event_id ?? ""}><option value="">Aucun événement associé</option>{events.map((event) => <option value={event.id} key={event.id}>{event.title}</option>)}</select></label>
          <label className="admin-field"><span>Ordre d’affichage</span><input name="display_order" type="number" min="0" max="999" defaultValue={album?.display_order ?? 0} /></label>
          <label className="admin-check-field admin-field-full"><input name="published" type="checkbox" defaultChecked={album?.published ?? false} /><span><strong>Publier l’album</strong><small>Seuls les médias publiés et autorisés apparaîtront sur le site.</small></span></label>
        </div>
      </section>
      <div className="admin-form-actions"><ActionMessage state={state} /><SubmitButton>{album ? "Enregistrer l’album" : "Créer l’album"}</SubmitButton></div>
    </form>
  );
}
