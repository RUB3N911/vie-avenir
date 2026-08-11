import Link from "next/link";
import { formatLegalUpdatedAt, getAllLegalPagesForAdmin } from "@/lib/cms-data";

export default async function LegalPagesAdminPage() {
  const pages = await getAllLegalPagesForAdmin();

  return (
    <main className="admin-page">
      <header className="admin-page-header"><div><p className="admin-eyebrow">Contenus du site</p><h1>Pages juridiques</h1><span>Modifiez les textes tout en conservant les informations officielles synchronisées automatiquement.</span></div></header>
      <section className="admin-legal-page-list">
        {pages.map((page) => (
          <article key={page.slug}>
            <div><p className="admin-eyebrow">Page publique</p><h2>{page.title}</h2><span>{page.description}</span></div>
            <small>Dernière mise à jour : {formatLegalUpdatedAt(page.updated_at)}</small>
            <div><Link href={`/${page.slug}`} target="_blank">Voir ↗</Link><Link className="admin-primary-button" href={`/admin/pages-juridiques/${page.slug}`}>Modifier</Link></div>
          </article>
        ))}
      </section>
    </main>
  );
}
