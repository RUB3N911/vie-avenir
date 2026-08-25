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
    "/galerie",
    "/partenaires",
    "/contact",
    "/mentions-legales",
    "/politique-confidentialite",
  ],
} as const;

export const legalConfig = {
  publisher: "VIE AVENIR",
  location: "Martinique, France",
  publicationDirector: "La présidence de l’association VIE AVENIR",
  registrationNotice:
    "L’adresse complète du siège social et le numéro RNA seront publiés dès leur validation officielle.",
  host: {
    name: "Vercel Inc.",
    address: "440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis",
    website: "https://vercel.com",
  },
  privacyRetention: "12 mois après le dernier échange",
  updatedAt: "11 août 2026",
} as const;

export function getSiteUrl() {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : siteConfig.defaultUrl);

  return url.replace(/\/$/, "");
}
