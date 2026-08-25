"use client";

import { useActionState } from "react";
import Image from "next/image";
import { deleteGalleryMedia, saveGalleryMedia } from "@/app/admin/gallery-actions";
import { ActionMessage } from "@/components/admin/action-message";
import { SubmitButton } from "@/components/admin/submit-button";
import type { GalleryMedia } from "@/lib/cms-types";
import { initialAdminActionState } from "@/lib/admin-action-state";

function GalleryMediaItem({ item, albumSlug }: { item: GalleryMedia; albumSlug: string }) {
  const [saveState, saveAction] = useActionState(saveGalleryMedia.bind(null, item.id, albumSlug), initialAdminActionState);
  const [deleteState, deleteAction] = useActionState(deleteGalleryMedia.bind(null, item.id, albumSlug), initialAdminActionState);

  return (
    <article className="admin-gallery-media-item">
      <div className="admin-gallery-media-preview">
        {item.media_type === "photo" ? <Image src={item.file_url} alt={item.alt_text || item.title || "Aperçu du média"} fill sizes="240px" /> : <video src={item.file_url} controls preload="metadata" />}
        <span>{item.media_type === "photo" ? "Photo" : "Vidéo"}</span>
      </div>
      <form action={saveAction} className="admin-gallery-media-form">
        <div className="admin-fields-grid">
          <label className="admin-field"><span>Titre</span><input name="title" defaultValue={item.title ?? ""} maxLength={160} /></label>
          <label className="admin-field"><span>Ordre</span><input name="display_order" type="number" min="0" max="999" defaultValue={item.display_order} /></label>
          <label className="admin-field admin-field-full"><span>Texte alternatif</span><input name="alt_text" defaultValue={item.alt_text ?? ""} maxLength={240} placeholder="Décrivez l’image pour les personnes qui ne la voient pas" /></label>
          <label className="admin-field admin-field-full"><span>Légende</span><textarea name="caption" rows={2} defaultValue={item.caption ?? ""} maxLength={1000} /></label>
          <div className="admin-gallery-media-options admin-field-full">
            <label className="admin-check-field"><input name="consent_confirmed" type="checkbox" defaultChecked={item.consent_confirmed} /><span><strong>Autorisation confirmée</strong><small>Obligatoire avant publication.</small></span></label>
            <label className="admin-check-field"><input name="published" type="checkbox" defaultChecked={item.published} /><span><strong>Publier</strong><small>Afficher ce média dans l’album public.</small></span></label>
            <label className="admin-check-field"><input name="is_cover" type="checkbox" defaultChecked={item.is_cover} /><span><strong>Couverture</strong><small>Utiliser comme aperçu de l’album.</small></span></label>
          </div>
        </div>
        <div className="admin-entry-actions"><ActionMessage state={saveState} /><SubmitButton>Enregistrer</SubmitButton></div>
      </form>
      <form action={deleteAction} className="admin-inline-delete admin-gallery-media-delete">
        <label><span>Saisissez SUPPRIMER</span><input name="confirmation" autoComplete="off" /></label>
        <SubmitButton className="">Supprimer</SubmitButton>
        <ActionMessage state={deleteState} />
      </form>
    </article>
  );
}

export function GalleryMediaEditor({ media, albumSlug }: { media: GalleryMedia[]; albumSlug: string }) {
  return (
    <section className="admin-content-section admin-gallery-media-section">
      <header><p className="admin-eyebrow">03 · Médias de l’album</p><h2>{media.length} média{media.length > 1 ? "s" : ""}</h2><span>Complétez les légendes, confirmez les autorisations, puis publiez les médias prêts.</span></header>
      {media.length ? <div className="admin-gallery-media-list">{media.map((item) => <GalleryMediaItem item={item} albumSlug={albumSlug} key={item.id} />)}</div> : <div className="admin-empty-state"><strong>Aucun média pour le moment.</strong><p>Ajoutez les premières photos ou vidéos avec le formulaire ci-dessus.</p></div>}
    </section>
  );
}
