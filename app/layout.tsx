import type { Metadata } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://vie-avenir.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "VIE AVENIR — Des rencontres qui changent des trajectoires",
    template: "%s | VIE AVENIR",
  },
  description:
    "VIE AVENIR connecte les jeunes de 14 à 25 ans en Martinique avec des professionnels inspirants.",
  applicationName: "VIE AVENIR",
  keywords: [
    "jeunesse Martinique",
    "orientation professionnelle",
    "association Martinique",
    "insertion des jeunes",
    "VIE AVENIR",
  ],
  authors: [{ name: "VIE AVENIR" }],
  creator: "VIE AVENIR",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "VIE AVENIR",
    title: "VIE AVENIR — Des rencontres qui changent des trajectoires",
    description:
      "Des rencontres, des ateliers concrets et des professionnels inspirants pour les jeunes de 14 à 25 ans en Martinique.",
    images: [
      {
        url: "/hero-vie-avenir.webp",
        alt: "Des jeunes échangent avec une professionnelle lors d’une rencontre VIE AVENIR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VIE AVENIR — Va et deviens !",
    description:
      "Des rencontres qui permettent aux jeunes d’imaginer leur avenir autrement.",
    images: ["/hero-vie-avenir.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: process.env.VERCEL
    ? undefined
    : {
        "codex-preview": "development",
      },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
