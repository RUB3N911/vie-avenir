import Image from "next/image";
import Link from "next/link";
import { getGalleryAlbumsForAdmin } from "@/lib/cms-data";

export default async function GalleryAdminPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [albums, query] = await Promise.all([getGalleryAlbumsForAdmin(), searchParams]);

  return (
    <main className="admin-page">
      <header className="admin-page-header"><div><p className="admin-eyebrow">Photos et vidéos</p><h1>Galerie</h1><span>Créez des albums, ajoutez vos médias, puis publiez uniquement ceux dont la diffusion est autorisée.</span></div><Link className="admin-primary-button" href="/admin/galerie/nouveau">+ Créer un album</Link></header>
      {query.supprime ? <p className="admin-page-notice" role="status">✓ L’album et ses médias ont été supprimés.</p> : null}
      {albums.length ? (
        <section className="admin-gallery-album-grid">
          {albums.map((album) => {
            const cover = album.media.find((item) => item.is_cover) ?? album.media[0];
            const publishedMedia = album.media.filter((item) => item.published && item.consent_confirmed).length;
            return (
              <article key={album.id}>
                <div className="admin-gallery-album-cover">
                  {cover?.media_type === "photo" ? <Image src={cover.file_url} alt={cover.alt_text || album.title} fill sizes="(max-width: 760px) 100vw, 33vw" /> : null}
                  {cover?.media_type === "video" ? <video src={cover.file_url} muted playsInline preload="metadata" /> : null}
                  {!cover ? <span aria-hidden="true">VA</span> : null}
                </div>
                <div className="admin-gallery-album-body">
                  <div><span className={`admin-badge ${album.published ? "publication-published" : "publication-draft"}`}>{album.published ? "Publié" : "Brouillon"}</span><small>{publishedMedia}/{album.media.length} médias publiés</small></div>
                  <h2>{album.title}</h2>
                  <p>{album.description ?? "Aucune description."}</p>
                  <Link href={`/admin/galerie/${album.id}`}>Gérer l’album →</Link>
                </div>
              </article>
            );
          })}
        </section>
      ) : <div className="admin-empty-state admin-panel"><strong>Aucun album pour le moment.</strong><p>Créez un album pour commencer à partager les moments forts de l’association.</p><Link href="/admin/galerie/nouveau">Créer le premier album</Link></div>}
    </main>
  );
}
