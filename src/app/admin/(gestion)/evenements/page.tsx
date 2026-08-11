import Link from "next/link";
import { getAllEventsForAdmin, formatEventDate } from "@/lib/cms-data";

const publicationLabels = { draft: "Brouillon", published: "Publié", archived: "Archivé" } as const;
const registrationLabels = { coming_soon: "Bientôt", open: "Ouvert", full: "Complet", cancelled: "Annulé", closed: "Clôturé" } as const;

export default async function EventsAdminPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [events, query] = await Promise.all([getAllEventsForAdmin(), searchParams]);
  const notice = query.cree ? "L’événement a été créé." : query.supprime ? "L’événement a été supprimé." : null;

  return (
    <main className="admin-page">
      <header className="admin-page-header"><div><p className="admin-eyebrow">Programmation</p><h1>Événements</h1><span>Préparez vos rendez-vous en brouillon, puis publiez-les lorsqu’ils sont prêts.</span></div><Link className="admin-primary-button" href="/admin/evenements/nouveau">+ Ajouter un événement</Link></header>
      {notice ? <p className="admin-page-notice" role="status">✓ {notice}</p> : null}
      <section className="admin-event-list">
        <div className="admin-event-list-heading"><span>Événement</span><span>Date</span><span>Inscriptions</span><span>Visibilité</span><span>Action</span></div>
        {events.length ? events.map((event) => <article key={event.id}><div><strong>{event.title}</strong><span>{event.venue_name ?? "Lieu à confirmer"} · {event.city}</span></div><time dateTime={event.starts_at}>{formatEventDate(event.starts_at).long}</time><span className={`admin-badge registration-${event.registration_status}`}>{registrationLabels[event.registration_status]}</span><span className={`admin-badge publication-${event.publication_status}`}>{publicationLabels[event.publication_status]}</span><Link href={`/admin/evenements/${event.id}`}>Modifier →</Link></article>) : <div className="admin-empty-state"><strong>Aucun événement pour le moment.</strong><p>Commencez par préparer votre premier rendez-vous.</p><Link href="/admin/evenements/nouveau">Créer un événement</Link></div>}
      </section>
    </main>
  );
}
