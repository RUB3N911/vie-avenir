import Link from "next/link";
import { Arrow, SiteFooter, SiteHeader } from "@/layouts/site-shell";

export default function NotFound() {
  return (
    <main>
      <SiteHeader />
      <section className="not-found-page">
        <p className="not-found-code" aria-hidden="true">404</p>
        <p className="page-kicker"><span aria-hidden="true" />Petit détour</p>
        <h1>Cette page n’existe pas… encore.</h1>
        <p>
          Le chemin demandé ne mène nulle part pour le moment. Revenez à l’accueil ou découvrez les actions de VIE AVENIR.
        </p>
        <div className="not-found-actions">
          <Link className="button button-primary" href="/">Retour à l’accueil <Arrow /></Link>
          <Link className="text-link text-link-pink" href="/nos-actions">Découvrir nos actions <span>→</span></Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
