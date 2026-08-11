import Link from "next/link";
import { Arrow, SectionLabel, SiteFooter, SiteHeader } from "@/layouts/site-shell";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="not-found-page">
        <section className="not-found-hero">
          <div className="not-found-copy">
            <SectionLabel>Petit détour</SectionLabel>
            <p className="not-found-code" aria-hidden="true">404</p>
            <h1>Ce chemin ne mène <em>nulle part.</em></h1>
            <p>
              La page recherchée a peut-être été déplacée ou n’existe pas encore. Pas d’inquiétude : votre prochain chemin commence juste ici.
            </p>
            <div className="not-found-actions">
              <Link className="button button-primary" href="/">Retour à l’accueil <Arrow /></Link>
              <Link className="text-link text-link-pink" href="/contact">Nous contacter <span>→</span></Link>
            </div>
          </div>
          <div className="not-found-orbit" aria-hidden="true">
            <div><span>VA</span><small>ET DEVIENS !</small></div>
          </div>
        </section>

        <nav className="not-found-shortcuts" aria-label="Suggestions de pages">
          <Link href="/notre-mission"><span>01</span><strong>Comprendre notre mission</strong><i aria-hidden="true">↗</i></Link>
          <Link href="/nos-actions"><span>02</span><strong>Découvrir nos actions</strong><i aria-hidden="true">↗</i></Link>
          <Link href="/evenements"><span>03</span><strong>Voir les événements</strong><i aria-hidden="true">↗</i></Link>
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}
