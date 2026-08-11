import Image from "next/image";
import Link from "next/link";
import { navigation, type NavigationPath } from "@/data/navigation";

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

export function SiteFooter() {
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
      <p>Des rencontres qui changent des trajectoires.</p>
      <nav className="footer-links" aria-label="Navigation de pied de page">
        <Link href="/notre-mission">Mission</Link>
        <Link href="/nos-actions">Actions</Link>
        <Link href="/evenements">Événements</Link>
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
