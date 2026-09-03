import Link from "next/link";
import { getCustomFormsForAdmin } from "@/lib/custom-form-data";
import { formStatusLabels } from "@/lib/custom-forms";

export default async function CustomFormsAdminPage() {
  const forms = await getCustomFormsForAdmin();
  return <main className="admin-page custom-forms-admin">
    <header className="admin-page-header"><div><p className="admin-eyebrow">Questions & réponses</p><h1>Formulaires</h1><span>Créez vos questionnaires et retrouvez leurs réponses au même endroit.</span></div><Link className="admin-primary-button" href="/admin/formulaires/nouveau">＋ Créer un formulaire</Link></header>
    {forms.length ? <div className="custom-form-cards">{forms.map((form) => <article className="admin-form-card" key={form.id}>
      <span className={`admin-badge publication-${form.status === "published" ? "published" : "draft"}`}>{formStatusLabels[form.status]}</span>
      <h2><Link href={`/admin/formulaires/${form.id}`}>{form.title}</Link></h2>
      <p>{form.questions.length} question{form.questions.length > 1 ? "s" : ""} · {form.custom_form_responses[0]?.count ?? 0} réponse(s)</p>
      <div className="custom-form-card-actions"><Link href={`/admin/formulaires/${form.id}`}>Modifier</Link><Link href={`/admin/formulaires/${form.id}/reponses`}>Réponses</Link>{form.status !== "draft" ? <Link href={`/formulaires/${form.slug}`} target="_blank" rel="noreferrer">Ouvrir ↗</Link> : null}</div>
    </article>)}</div> : <div className="admin-empty-state"><strong>Votre premier formulaire commence ici.</strong><p>Créez vos questions, enregistrez un brouillon, puis publiez-le lorsque vous êtes prêt.</p></div>}
  </main>;
}
