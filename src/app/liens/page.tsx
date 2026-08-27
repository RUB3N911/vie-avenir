import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LinkHubIcon } from "@/components/link-hub-icon";
import { SocialIcon, type SocialNetwork } from "@/components/social-icon";
import {
  formatEventDate,
  getAssociationSettings,
  getPublishedLinkHubLinks,
  getUpcomingPublishedEvent,
} from "@/lib/cms-data";
import type { LinkHubLink } from "@/lib/cms-types";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Tous nos liens",
  description: "Retrouvez les événements, les actions, les réseaux sociaux et les contacts de VIE AVENIR.",
  alternates: { canonical: "/liens" },
};

function LinkButton({ link }: { link: LinkHubLink }) {
  const content = (
    <>
      <span className="link-hub-button-icon"><LinkHubIcon name={link.icon} /></span>
      <strong>{link.label}</strong>
      <span className="link-hub-button-arrow" aria-hidden="true">↗</span>
    </>
  );
  const className = `link-hub-button${link.is_featured ? " is-featured" : ""}`;

  return link.url.startsWith("/") && !link.url.startsWith("//") ? (
    <Link className={className} href={link.url}>{content}</Link>
  ) : (
    <a className={className} href={link.url} target="_blank" rel="noreferrer">{content}</a>
  );
}

export default async function LinksPage() {
  const [settings, links, nextEvent] = await Promise.all([
    getAssociationSettings(),
    getPublishedLinkHubLinks(),
    getUpcomingPublishedEvent(),
  ]);
  const upcomingEvent = nextEvent;
  const eventDate = upcomingEvent ? formatEventDate(upcomingEvent.starts_at) : null;
  const whatsappUrl = buildWhatsAppUrl(settings.phone, settings.whatsapp);
  const socialLinks = [
    settings.instagram_url ? { href: settings.instagram_url, label: "Instagram", network: "instagram" as const } : null,
    settings.tiktok_url ? { href: settings.tiktok_url, label: "TikTok", network: "tiktok" as const } : null,
    settings.facebook_url ? { href: settings.facebook_url, label: "Facebook", network: "facebook" as const } : null,
    settings.linkedin_url ? { href: settings.linkedin_url, label: "LinkedIn", network: "linkedin" as const } : null,
  ].filter((item): item is { href: string; label: string; network: SocialNetwork } => Boolean(item));

  return (
    <main className="link-hub-page">
      <span className="link-hub-orbit link-hub-orbit-one" aria-hidden="true" />
      <span className="link-hub-orbit link-hub-orbit-two" aria-hidden="true" />
      <section className="link-hub-shell" aria-labelledby="link-hub-title">
        <header className="link-hub-brand">
          <Link href="/" aria-label="VIE AVENIR — Accueil">
            <Image src="/images/brand/logo-vie-avenir.webp" alt="VIE AVENIR" width={300} height={200} priority />
          </Link>
          <p>Association martiniquaise · 14—25 ans</p>
          <h1 id="link-hub-title">VA ET DEVIENS !</h1>
          <span>Des rencontres qui changent des trajectoires.</span>
        </header>

        {upcomingEvent && eventDate ? (
          <Link className="link-hub-event" href={`/evenements/${upcomingEvent.slug}`}>
            <time dateTime={upcomingEvent.starts_at}>
              <strong>{eventDate.day}</strong>
              <span>{eventDate.month}<br />{eventDate.year}</span>
            </time>
            <span><small>Prochain rendez-vous</small><strong>{upcomingEvent.title}</strong></span>
            <b aria-hidden="true">↗</b>
          </Link>
        ) : null}

        <nav className="link-hub-list" aria-label="Liens utiles">
          {links.map((link) => <LinkButton key={link.id} link={link} />)}
        </nav>

        {whatsappUrl ? (
          <a className="link-hub-whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer">
            <span aria-hidden="true">◔</span>
            Nous écrire sur WhatsApp
            <b aria-hidden="true">↗</b>
          </a>
        ) : null}

        {socialLinks.length ? (
          <nav className="link-hub-socials" aria-label="Réseaux sociaux">
            {socialLinks.map((item) => (
              <a key={item.href} href={item.href} target="_blank" rel="noreferrer" aria-label={`Suivre VIE AVENIR sur ${item.label}`} title={item.label}>
                <SocialIcon network={item.network} />
              </a>
            ))}
          </nav>
        ) : null}

        <footer className="link-hub-footer">
          <Link href="/">VIE AVENIR · LE CARBET, MARTINIQUE</Link>
          <span aria-hidden="true">✦</span>
        </footer>
      </section>
    </main>
  );
}
