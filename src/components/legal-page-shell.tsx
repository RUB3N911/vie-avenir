import type { ReactNode } from "react";
import Link from "next/link";
import { Arrow, SectionLabel, SiteFooter, SiteHeader } from "@/layouts/site-shell";

type LegalNavigationItem = {
  id: string;
  label: string;
};

type LegalPageShellProps = {
  children: ReactNode;
  description: string;
  eyebrow: string;
  navigation: readonly LegalNavigationItem[];
  relatedHref: string;
  relatedLabel: string;
  title: string;
  updatedAt: string;
  variant?: "legal" | "privacy";
};

type LegalSectionProps = {
  children: ReactNode;
  id: string;
  number: string;
  title: string;
};

export function LegalPageShell({
  children,
  description,
  eyebrow,
  navigation,
  relatedHref,
  relatedLabel,
  title,
  updatedAt,
  variant = "legal",
}: LegalPageShellProps) {
  return (
    <>
      <SiteHeader />
      <main className={`legal-page legal-page-${variant}`}>
        <header className="legal-hero">
          <div className="legal-hero-frame page-container">
            <div className="legal-hero-copy">
              <SectionLabel>{eyebrow}</SectionLabel>
              <h1>{title}</h1>
              <p>{description}</p>
              <p className="legal-updated">Mis à jour le {updatedAt}</p>
            </div>
            <div className="legal-hero-seal" aria-hidden="true">
              <span>VA</span>
              <small>Clair · utile · accessible</small>
            </div>
          </div>
        </header>

        <div className="legal-body">
          <div className="legal-layout page-container">
            <aside className="legal-aside">
              <p>Sur cette page</p>
              <nav aria-label={`Sommaire — ${title}`}>
                <ol>
                  {navigation.map((item, index) => (
                    <li key={item.id}>
                      <a href={`#${item.id}`}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
              <div className="legal-aside-help">
                <strong>Une question ?</strong>
                <span>Écrivez-nous, nous vous répondrons simplement.</span>
                <Link href="/contact">Nous contacter <Arrow /></Link>
              </div>
            </aside>

            <article className="legal-content">
              {children}
              <nav className="legal-related" aria-label="Autre information juridique">
                <div>
                  <p>À consulter aussi</p>
                  <h2>{relatedLabel}</h2>
                </div>
                <Link className="button button-dark" href={relatedHref}>
                  Consulter <Arrow />
                </Link>
              </nav>
            </article>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export function LegalSection({ children, id, number, title }: LegalSectionProps) {
  return (
    <section className="legal-card" id={id}>
      <header className="legal-card-heading">
        <span>{number}</span>
        <h2>{title}</h2>
      </header>
      <div className="legal-card-body">{children}</div>
    </section>
  );
}
