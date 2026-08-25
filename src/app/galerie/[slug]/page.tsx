import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GalleryLightbox } from "@/components/gallery-lightbox";
import { Callout, SectionLabel, SiteFooter, SiteHeader } from "@/layouts/site-shell";
import { formatEventDate, getPublishedGalleryAlbumBySlug } from "@/lib/cms-data";

export const dynamic = "force-dynamic";

type GalleryAlbumPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: GalleryAlbumPageProps): Promise<Metadata> {
  const { slug } = await params;
  const album = await getPublishedGalleryAlbumBySlug(slug);
  if (!album) return { title: "Album introuvable" };
  const cover = album.media.find((item) => item.is_cover && item.media_type === "photo")
    ?? album.media.find((item) => item.media_type === "photo");
  return {
    title: `${album.title} — Galerie`,
    description: album.description ?? `Découvrez l’album ${album.title} de VIE AVENIR.`,
    alternates: { canonical: `/galerie/${album.slug}` },
    openGraph: {
      title: album.title,
      description: album.description ?? `Album photo et vidéo de VIE AVENIR`,
      images: cover ? [{ url: cover.file_url, alt: cover.alt_text || album.title }] : [],
    },
  };
}

export default async function GalleryAlbumPage({ params }: GalleryAlbumPageProps) {
  const { slug } = await params;
  const album = await getPublishedGalleryAlbumBySlug(slug);
  if (!album) notFound();

  return (
    <main>
      <SiteHeader activePath="/galerie" />
      <section className="gallery-album-hero">
        <Link href="/galerie">← Retour à la galerie</Link>
        <p>{album.event ? formatEventDate(album.event.starts_at).long : "Album VIE AVENIR"}</p>
        <h1>{album.title}</h1>
        {album.description ? <span>{album.description}</span> : null}
        {album.event ? <Link className="gallery-event-link" href={`/evenements/${album.event.slug}`}>Voir l’événement associé ↗</Link> : null}
      </section>

      <section className="page-section gallery-album-section">
        <div className="page-container">
          <SectionLabel>Photos et vidéos</SectionLabel>
          {album.media.length ? <GalleryLightbox media={album.media} /> : <div className="gallery-empty-state"><strong>Cet album se prépare.</strong><p>Les médias seront bientôt publiés.</p></div>}
        </div>
      </section>

      <Callout eyebrow="À ton tour d’en faire partie" title="Découvre nos prochains rendez-vous." buttonLabel="Voir les événements" href="/evenements" />
      <SiteFooter />
    </main>
  );
}
