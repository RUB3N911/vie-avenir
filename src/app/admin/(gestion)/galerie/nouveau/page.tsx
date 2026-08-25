import Link from "next/link";
import { GalleryAlbumForm } from "@/components/admin/gallery-album-form";
import { getAllEventsForAdmin } from "@/lib/cms-data";

export default async function NewGalleryAlbumPage() {
  const events = await getAllEventsForAdmin();
  return (
    <main className="admin-page admin-editor-page">
      <Link className="admin-breadcrumb" href="/admin/galerie">← Retour à la galerie</Link>
      <header className="admin-page-header"><div><p className="admin-eyebrow">Nouvel album</p><h1>Créer un album</h1><span>Commencez par nommer l’album. Vous pourrez ajouter les photos et vidéos à l’étape suivante.</span></div></header>
      <GalleryAlbumForm events={events} />
    </main>
  );
}
