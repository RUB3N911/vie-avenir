import Link from "next/link";
import { DeleteLinkHubLinkForm } from "@/components/admin/delete-link-hub-link-form";
import { LinkHubLinkForm } from "@/components/admin/link-hub-link-form";
import { getLinkHubLinksForAdmin } from "@/lib/cms-data";

export default async function LinkHubAdminPage() {
  const links = await getLinkHubLinksForAdmin();
  const nextOrder = links.length ? Math.min(999, Math.max(...links.map((link) => link.display_order)) + 10) : 10;

  return (
    <main className="admin-page admin-editor-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Lien en bio</p>
          <h1>Page de liens</h1>
          <span>Ajoutez, ordonnez et mettez en avant les accès utiles. Les réseaux sociaux et WhatsApp sont repris automatiquement depuis les informations de l’association.</span>
        </div>
        <Link className="admin-primary-button" href="/liens" target="_blank">Voir la page ↗</Link>
      </header>

      <aside className="admin-link-hub-note">
        <strong>Adresse à utiliser dans vos biographies et futurs QR codes</strong>
        <span>vieavenir.fr/liens</span>
        <Link href="/admin/informations">Modifier les réseaux sociaux →</Link>
      </aside>

      <section className="admin-content-section">
        <header><p className="admin-eyebrow">Ajouter</p><h2>Créer un nouveau bouton</h2><span>Le bouton peut pointer vers une page du site ou vers une adresse extérieure.</span></header>
        <LinkHubLinkForm defaultOrder={nextOrder} />
      </section>

      <section className="admin-content-section">
        <header><p className="admin-eyebrow">Organisation</p><h2>Liens enregistrés</h2><span>Modifiez le nombre d’ordre pour déplacer un bouton. Les liens masqués restent disponibles dans l’administration.</span></header>
        {links.length ? (
          <div className="admin-link-hub-list">
            {links.map((link) => (
              <article className="admin-entry-editor" key={link.id}>
                <LinkHubLinkForm link={link} />
                <DeleteLinkHubLinkForm linkId={link.id} />
              </article>
            ))}
          </div>
        ) : (
          <div className="admin-empty-state"><strong>Aucun lien enregistré.</strong><p>Ajoutez votre premier bouton avec le formulaire ci-dessus.</p></div>
        )}
      </section>
    </main>
  );
}
