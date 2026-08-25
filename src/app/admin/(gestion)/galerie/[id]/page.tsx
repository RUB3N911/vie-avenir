import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteGalleryAlbumForm } from "@/components/admin/delete-gallery-album-form";
import { GalleryAlbumForm } from "@/components/admin/gallery-album-form";
import { GalleryMediaEditor } from "@/components/admin/gallery-media-editor";
import { GalleryMediaUploader } from "@/components/admin/gallery-media-uploader";
import { getAllEventsForAdmin, getGalleryAlbumForAdmin } from "@/lib/cms-data";

export default async function EditGalleryAlbumPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [album, events] = await Promise.all([getGalleryAlbumForAdmin(id), getAllEventsForAdmin()]);
  if (!album) notFound();
  const nextOrder = album.media.reduce((maximum, item) => Math.max(maximum, item.display_order), -1) + 1;

  return (
    <main className="admin-page admin-editor-page">
      <Link className="admin-breadcrumb" href="/admin/galerie">← Retour à la galerie</Link>
      <header className="admin-page-header"><div><p className="admin-eyebrow">Gérer l’album</p><h1>{album.title}</h1><span>Ajoutez les médias en brouillon, renseignez-les, puis publiez ceux qui sont prêts.</span></div>{album.published ? <Link className="admin-preview-link" href={`/galerie/${album.slug}`} target="_blank">Voir l’album public ↗</Link> : null}</header>
      {query.cree ? <p className="admin-page-notice" role="status">✓ L’album est créé. Vous pouvez maintenant ajouter ses médias.</p> : null}
      <GalleryAlbumForm album={album} events={events} />
      <GalleryMediaUploader albumId={album.id} initialOrder={nextOrder} />
      <GalleryMediaEditor media={album.media} albumSlug={album.slug} />
      <DeleteGalleryAlbumForm albumId={album.id} />
    </main>
  );
}
