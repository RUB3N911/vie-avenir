import Link from "next/link";
import { getAllEventsForAdmin, getAssociationSettingsForAdmin, formatEventDate, pickNextEvent } from "@/lib/cms-data";

export default async function AdminDashboardPage() {
  const [events, settings] = await Promise.all([
    getAllEventsForAdmin(),
    getAssociationSettingsForAdmin(),
  ]);
  const published = events.filter((event) => event.publication_status === "published");
  const drafts = events.filter((event) => event.publication_status === "draft");
  const nextEvent = pickNextEvent([...published].sort((a, b) => a.starts_at.localeCompare(b.starts_at)));
  const infoValues = [settings.public_email, settings.phone, settings.address, settings.rna_number, settings.instagram_url, settings.tiktok_url, settings.facebook_url, settings.linkedin_url];
  const completion = Math.round((infoValues.filter(Boolean).length / infoValues.length) * 100);

  return (
    <main className="admin-page">
      <header className="admin-page-header"><div><p className="admin-eyebrow">Vue d’ensemble</p><h1>Bonjour 👋</h1><span>Voici ce qui se prépare pour VIE AVENIR.</span></div><Link className="admin-primary-button" href="/admin/evenements/nouveau">+ Ajouter un événement</Link></header>

      <section className="admin-stats" aria-label="Indicateurs">
        <article className="tone-pink"><span>Événements publiés</span><strong>{published.length}</strong><small>visibles sur le site</small></article>
        <article className="tone-orange"><span>Brouillons</span><strong>{drafts.length}</strong><small>à compléter ou valider</small></article>
        <article className="tone-green"><span>Fiche association</span><strong>{completion}%</strong><small>des informations clés</small></article>
      </section>

      <div className="admin-dashboard-grid">
        <section className="admin-panel admin-next-event"><div className="admin-panel-heading"><div><p className="admin-eyebrow">Prochain rendez-vous</p><h2>{nextEvent?.title ?? "Aucun événement publié"}</h2></div><Link href="/admin/evenements">Tout voir →</Link></div>{nextEvent ? <div className="admin-next-event-content"><div className="admin-date-block"><strong>{formatEventDate(nextEvent.starts_at).day}</strong><span>{formatEventDate(nextEvent.starts_at).month}<br />{formatEventDate(nextEvent.starts_at).year}</span></div><div><p>{nextEvent.summary}</p><span>{nextEvent.venue_name ?? "Lieu à confirmer"} · {nextEvent.city}</span></div><Link href={`/admin/evenements/${nextEvent.id}`}>Modifier</Link></div> : <p className="admin-empty-copy">Créez un événement, puis passez sa visibilité sur « Publié ».</p>}</section>
        <section className="admin-panel admin-checklist"><div className="admin-panel-heading"><div><p className="admin-eyebrow">À compléter</p><h2>Informations officielles</h2></div><Link href="/admin/informations">Modifier →</Link></div><ul><li className={settings.public_email ? "is-done" : ""}><span>{settings.public_email ? "✓" : "1"}</span>Adresse e-mail publique</li><li className={settings.rna_number ? "is-done" : ""}><span>{settings.rna_number ? "✓" : "2"}</span>Numéro RNA</li><li className={settings.address ? "is-done" : ""}><span>{settings.address ? "✓" : "3"}</span>Adresse du siège</li><li className={settings.instagram_url || settings.tiktok_url || settings.facebook_url || settings.linkedin_url ? "is-done" : ""}><span>{settings.instagram_url || settings.tiktok_url || settings.facebook_url || settings.linkedin_url ? "✓" : "4"}</span>Réseaux sociaux</li></ul></section>
      </div>
    </main>
  );
}
