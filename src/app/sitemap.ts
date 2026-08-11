import type { MetadataRoute } from "next";
import { getSiteUrl, siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return siteConfig.routes.map((route, index) => {
    const isLegalPage = route === "/mentions-legales" || route === "/politique-confidentialite";

    return {
      url: `${siteUrl}${route}`,
      lastModified: new Date("2026-08-11"),
      changeFrequency: index === 3 ? "weekly" : "monthly",
      priority: index === 0 ? 1 : index === 3 ? 0.9 : isLegalPage ? 0.3 : 0.8,
    };
  });
}
