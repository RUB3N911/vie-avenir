import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { getCustomFormForAdmin, getCustomFormResponses } from "@/lib/custom-form-data";

export default async function CustomFormResponsesPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ page?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const form = await getCustomFormForAdmin(id);
  if (!form) notFound();
  const rawPage = Number((await searchParams).page ?? 1);
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 && rawPage <= 100000 ? rawPage : 1;
  const { responses, total } = await getCustomFormResponses(id, page);
  const pages = Math.max(1, Math.ceil(total / 25));
  return <main className="admin-page admin-editor-page custom-forms-admin"><Link className="admin-breadcrumb" href={`/admin/formulaires/${id}`}>← Modifier le formulaire</Link><header className="admin-page-header"><div><p className="admin-eyebrow">{form.title}</p><h1>Réponses <small>({total})</small></h1><span>Les questions affichées correspondent à la version remplie par chaque personne.</span></div></header>
    {responses.length ? <div className="custom-responses">{responses.map((response, index) => <details className="admin-form-card" key={response.id} open={index === 0}>
      <summary><strong>Réponse du {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Martinique" }).format(new Date(response.created_at))}</strong><small>Version {response.revision} · heure de Martinique</small></summary>
      <dl>{response.questions_snapshot.map((question) => { const answer = response.answers[question.id]; return <div key={question.id}><dt>{question.label}</dt><dd>{Array.isArray(answer) ? (answer.length ? answer.join(", ") : "Non renseigné") : answer || "Non renseigné"}</dd></div>; })}</dl>
    </details>)}</div> : <div className="admin-empty-state"><strong>Aucune réponse sur cette page.</strong><p>Les envois apparaîtront ici après validation du formulaire.</p></div>}
    <nav className="custom-pagination" aria-label="Pages de réponses">{page > 1 ? <Link href={`?page=${page - 1}`}>← Précédente</Link> : null}<span>Page {page} / {pages}</span>{page < pages ? <Link href={`?page=${page + 1}`}>Suivante →</Link> : null}</nav>
  </main>;
}
