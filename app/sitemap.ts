import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://vie-avenir.vercel.app");

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/notre-mission", "/nos-actions", "/evenements", "/partenaires", "/contact"];

  return routes.map((route, index) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date("2026-08-10"),
    changeFrequency: index === 3 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : index === 3 ? 0.9 : 0.8,
  }));
}
