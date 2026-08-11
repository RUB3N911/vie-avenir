import Link from "next/link";
import { EventForm } from "@/components/admin/event-form";

export default function NewEventPage() {
  return (
    <main className="admin-page admin-editor-page">
      <Link className="admin-breadcrumb" href="/admin/evenements">← Retour aux événements</Link>
      <header className="admin-page-header"><div><p className="admin-eyebrow">Nouvel événement</p><h1>Préparer un rendez-vous</h1><span>Vous pouvez l’enregistrer comme brouillon et revenir le compléter plus tard.</span></div></header>
      <EventForm />
    </main>
  );
}
