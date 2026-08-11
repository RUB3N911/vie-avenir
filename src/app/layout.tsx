import type { Metadata } from "next";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import { getSiteUrl, siteConfig } from "@/lib/site";
import "./globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfig.title,
    template: "%s | VIE AVENIR",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "jeunesse Martinique",
    "orientation professionnelle",
    "association Martinique",
    "insertion des jeunes",
    "VIE AVENIR",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description:
      "Des rencontres, des ateliers concrets et des professionnels inspirants pour les jeunes de 14 à 25 ans en Martinique.",
    images: [
      {
        url: siteConfig.openGraphImage,
        alt: "Des jeunes échangent avec une professionnelle lors d’une rencontre VIE AVENIR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VIE AVENIR — Va et deviens !",
    description:
      "Des rencontres qui permettent aux jeunes d’imaginer leur avenir autrement.",
    images: [siteConfig.openGraphImage],
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
