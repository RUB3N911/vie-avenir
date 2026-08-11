export const siteConfig = {
  name: "VIE AVENIR",
  slogan: "VA ET DEVIENS !",
  defaultUrl: "https://vie-avenir.vercel.app",
  title: "VIE AVENIR — Des rencontres qui changent des trajectoires",
  description:
    "VIE AVENIR connecte les jeunes de 14 à 25 ans en Martinique avec des professionnels inspirants.",
  openGraphImage: "/images/hero/hero-vie-avenir.webp",
  routes: [
    "",
    "/notre-mission",
    "/nos-actions",
    "/evenements",
    "/partenaires",
    "/contact",
  ],
} as const;

export function getSiteUrl() {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : siteConfig.defaultUrl);

  return url.replace(/\/$/, "");
}
