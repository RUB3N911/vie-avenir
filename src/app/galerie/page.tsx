import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Arrow, Callout, SectionLabel, SiteFooter, SiteHeader } from "@/layouts/site-shell";
import { formatEventDate, getPublishedGalleryAlbums } from "@/lib/cms-data";

export const metadata: Metadata = {
  title: "Galerie",
  description: "Découvrez en photos et en vidéos les rencontres, ateliers et moments forts de VIE AVENIR en Martinique.",
};

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const albums = await getPublishedGalleryAlbums();

  return (
    <main>
      <SiteHeader activePath="/galerie" />
      <section className="gallery-hero">
        <p>Galerie VIE AVENIR</p>
        <h1>Des moments qui donnent envie d’avancer.</h1>
        <span>Photos, vidéos et souvenirs de nos ateliers, rencontres et projets avec la jeunesse martiniquaise.</span>
      </section>

      <section className="page-section gallery-index-section">
        <div className="page-container">
          <SectionLabel>Nos albums</SectionLabel>
          <h2>La vie de l’association, en images.</h2>
          {albums.length ? (
            <div className="gallery-album-grid">
              {albums.map((album) => {
                const cover = album.media.find((item) => item.is_cover) ?? album.media[0];
                return (
                  <Link href={`/galerie/${album.slug}`} className="gallery-album-card" key={album.id}>
                    <span className="gallery-album-visual">
                      {cover?.media_type === "photo" ? <Image src={cover.file_url} alt={cover.alt_text || `Album ${album.title}`} fill sizes="(max-width: 760px) 100vw, 50vw" /> : null}
                      {cover?.media_type === "video" ? <video src={cover.file_url} muted playsInline preload="metadata" aria-label={`Aperçu vidéo de ${album.title}`} /> : null}
                      {!cover ? <span className="gallery-album-placeholder" aria-hidden="true">VA</span> : null}
                      <b>{album.media.length} média{album.media.length > 1 ? "s" : ""}</b>
                    </span>
                    <span className="gallery-album-copy">
                      {album.event ? <small>{formatEventDate(album.event.starts_at).long}</small> : <small>VIE AVENIR</small>}
                      <strong>{album.title}</strong>
                      {album.description ? <span>{album.description}</span> : null}
                      <i>Voir l’album <Arrow /></i>
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="gallery-empty-state"><strong>Les premiers souvenirs arrivent bientôt.</strong><p>La galerie se remplira au fil de nos prochains rendez-vous.</p><Link className="button button-dark" href="/evenements">Voir les événements <Arrow /></Link></div>
          )}
        </div>
      </section>

      <Callout eyebrow="Envie de vivre le prochain moment ?" title="Rejoins l’aventure VIE AVENIR." buttonLabel="Voir les événements" href="/evenements" />
      <SiteFooter />
    </main>
  );
}
