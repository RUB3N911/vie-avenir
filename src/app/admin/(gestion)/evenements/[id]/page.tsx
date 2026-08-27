import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteEventForm } from "@/components/admin/delete-event-form";
import { EventForm } from "@/components/admin/event-form";
import { getEventForAdmin } from "@/lib/cms-data";

export default async function EditEventPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const event = await getEventForAdmin(id);
  if (!event) notFound();
  return (
    <main className="admin-page admin-editor-page">
      <Link className="admin-breadcrumb" href="/admin/evenements">← Retour aux événements</Link>
      <header className="admin-page-header"><div><p className="admin-eyebrow">Modifier l’événement</p><h1>{event.title}</h1><span>Les changements publiés apparaissent sur le site dès l’enregistrement.</span></div><Link className="admin-primary-button" href={`/admin/evenements/${event.id}/inscriptions`}>Gérer les inscriptions →</Link></header>
      {query.enregistre ? <p className="admin-page-notice" role="status">✓ Les modifications sont enregistrées.</p> : null}
      <EventForm event={event} />
      <DeleteEventForm eventId={event.id} />
    </main>
  );
}
