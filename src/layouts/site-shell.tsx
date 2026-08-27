import Image from "next/image";
import Link from "next/link";
import { SocialIcon, type SocialNetwork } from "@/components/social-icon";
import { navigation, type NavigationPath } from "@/data/navigation";
import { getAssociationSettings } from "@/lib/cms-data";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type SiteHeaderProps = {
  activePath?: NavigationPath | "/contact";
};

const Arrow = () => <span aria-hidden="true">↗</span>;

export function SiteHeader({ activePath }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="VIE AVENIR — accueil">
        <Image
          src="/images/brand/logo-vie-avenir.webp"
          alt="VIE AVENIR — Va et deviens !"
          width={300}
          height={200}
          priority
        />
      </Link>

      <nav className="desktop-nav" aria-label="Navigation principale">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={activePath === item.href ? "is-active" : undefined}
            aria-current={activePath === item.href ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <Link
        className={`button button-small ${activePath === "/contact" ? "button-pink" : "button-dark"}`}
        href="/contact"
        aria-current={activePath === "/contact" ? "page" : undefined}
      >
        Nous rejoindre <Arrow />
      </Link>

      <details className="mobile-menu">
        <summary aria-label="Ouvrir le menu"><span /><span /><span /></summary>
        <nav aria-label="Navigation mobile">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={activePath === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/contact" aria-current={activePath === "/contact" ? "page" : undefined}>
            Nous rejoindre
          </Link>
        </nav>
      </details>
    </header>
  );
}

export async function SiteFooter() {
  const settings = await getAssociationSettings();
  const whatsappUrl = buildWhatsAppUrl(settings.phone, settings.whatsapp);
  const publicContacts = [
    settings.public_email ? { href: `mailto:${settings.public_email}`, label: settings.public_email, external: false } : null,
    whatsappUrl ? { href: whatsappUrl, label: "WhatsApp", external: true } : null,
  ].filter((item): item is { href: string; label: string; external: boolean } => Boolean(item));
  const socialLinks = [
    settings.instagram_url ? { href: settings.instagram_url, label: "Instagram", network: "instagram" as const } : null,
    settings.tiktok_url ? { href: settings.tiktok_url, label: "TikTok", network: "tiktok" as const } : null,
    settings.facebook_url ? { href: settings.facebook_url, label: "Facebook", network: "facebook" as const } : null,
    settings.linkedin_url ? { href: settings.linkedin_url, label: "LinkedIn", network: "linkedin" as const } : null,
  ].filter((item): item is { href: string; label: string; network: SocialNetwork } => Boolean(item));

  return (
    <footer>
      <Link className="footer-brand" href="/" aria-label="VIE AVENIR — accueil">
        <Image
          src="/images/brand/logo-vie-avenir.webp"
          alt="VIE AVENIR"
          width={300}
          height={200}
          sizes="300px"
        />
      </Link>
      <div className="footer-intro">
        <p>Des rencontres qui changent des trajectoires.</p>
        {publicContacts.length ? (
          <div className="footer-contact-links">
            {publicContacts.map((item) => (
              <a
                href={item.href}
                key={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
              >
                {item.label}
              </a>
            ))}
          </div>
        ) : null}
        {socialLinks.length ? (
          <nav className="footer-social-links" aria-label="Réseaux sociaux">
            {socialLinks.map((item) => (
              <a
                href={item.href}
                key={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Suivre VIE AVENIR sur ${item.label}`}
                title={item.label}
              >
                <SocialIcon network={item.network} />
              </a>
            ))}
          </nav>
        ) : null}
      </div>
      <nav className="footer-links" aria-label="Navigation de pied de page">
        <Link href="/notre-mission">Mission</Link>
        <Link href="/nos-actions">Actions</Link>
        <Link href="/evenements">Événements</Link>
        <Link href="/galerie">Galerie</Link>
        <Link href="/partenaires">Partenaires</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <div className="footer-meta">
        <p className="copyright">© 2026 VIE AVENIR · Martinique</p>
        <nav className="footer-legal-links" aria-label="Informations légales">
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/politique-confidentialite">Confidentialité</Link>
        </nav>
      </div>
    </footer>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="page-kicker"><span aria-hidden="true" />{children}</p>;
}

type CalloutProps = {
  eyebrow: string;
  title: string;
  description?: string;
  buttonLabel: string;
  href: string;
};

export function Callout({ eyebrow, title, description, buttonLabel, href }: CalloutProps) {
  return (
    <section className="page-callout">
      <div>
        <p>{eyebrow}</p>
        <h2>{title}</h2>
        {description ? <span>{description}</span> : null}
      </div>
      <Link className="button button-pink" href={href}>{buttonLabel} <Arrow /></Link>
    </section>
  );
}

export { Arrow };
