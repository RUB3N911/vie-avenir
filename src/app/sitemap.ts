import type { MetadataRoute } from "next";
import { getPublishedEvents, getPublishedGalleryAlbums } from "@/lib/cms-data";
import { getSiteUrl, siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [events, albums] = await Promise.all([getPublishedEvents(), getPublishedGalleryAlbums()]);

  const staticRoutes: MetadataRoute.Sitemap = siteConfig.routes.map((route, index) => {
    const isLegalPage = route === "/mentions-legales" || route === "/politique-confidentialite";
    const isLivingContent = route === "/evenements" || route === "/galerie";

    return {
      url: `${siteUrl}${route}`,
      lastModified: new Date("2026-08-25"),
      changeFrequency: isLivingContent ? "weekly" : "monthly",
      priority: index === 0 ? 1 : isLivingContent ? 0.9 : isLegalPage ? 0.3 : 0.8,
    };
  });

  return [
    ...staticRoutes,
    ...events.map((event) => ({
      url: `${siteUrl}/evenements/${event.slug}`,
      lastModified: new Date(event.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...albums.map((album) => ({
      url: `${siteUrl}/galerie/${album.slug}`,
      lastModified: new Date(album.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
