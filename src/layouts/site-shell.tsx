import Image from "next/image";
import Link from "next/link";
import { navigation, type NavigationPath } from "@/data/navigation";
import { getAssociationSettings } from "@/lib/cms-data";

type SiteHeaderProps = {
  activePath?: NavigationPath | "/contact";
};

const Arrow = () => <span aria-hidden="true">↗</span>;

type SocialNetwork = "instagram" | "tiktok" | "facebook" | "linkedin";

function SocialIcon({ network }: { network: SocialNetwork }) {
  if (network === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" className="social-icon-fill" />
      </svg>
    );
  }

  if (network === "tiktok") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 3v10.2a4.7 4.7 0 1 1-4-4.65" />
        <path d="M15 3c.45 2.7 2.1 4.2 4.5 4.5" />
      </svg>
    );
  }

  if (network === "facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path className="social-icon-fill" d="M13.7 21v-8h2.8l.42-3H13.7V8.08c0-.87.24-1.46 1.5-1.46H17V3.94c-.31-.04-1.39-.13-2.64-.13-2.61 0-4.4 1.59-4.4 4.52V10H7v3h2.96v8h3.74Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle className="social-icon-fill" cx="6.5" cy="6.5" r="1.8" />
      <path className="social-icon-fill" d="M5 9.5h3V19H5zM10 9.5h2.85v1.3c.78-1.03 1.83-1.68 3.42-1.68 2.89 0 3.73 1.9 3.73 4.37V19h-3v-4.86c0-1.16-.02-2.65-1.62-2.65-1.62 0-1.87 1.26-1.87 2.57V19H10V9.5Z" />
    </svg>
  );
}

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
  const publicContacts = [
    settings.public_email ? { href: `mailto:${settings.public_email}`, label: settings.public_email } : null,
    settings.phone ? { href: `tel:${settings.phone.replace(/\s/g, "")}`, label: settings.phone } : null,
  ].filter((item): item is { href: string; label: string } => Boolean(item));
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
            {publicContacts.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}
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
