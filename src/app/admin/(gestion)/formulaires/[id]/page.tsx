import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { getCustomFormForAdmin } from "@/lib/custom-form-data";
import { CustomFormEditor } from "@/components/admin/custom-form-editor";
import { CustomFormShare } from "@/components/admin/custom-form-share";
import { getFormShareUrl } from "@/lib/form-qr-code";
import { getSiteUrl } from "@/lib/site";

export default async function EditCustomFormPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const form = await getCustomFormForAdmin(id);
  if (!form) notFound();
  const { created } = await searchParams;
  return <main className="admin-page admin-editor-page custom-forms-admin"><Link className="admin-breadcrumb" href="/admin/formulaires">← Formulaires</Link><header className="admin-page-header"><div><p className="admin-eyebrow">Édition</p><h1>{form.title}</h1></div><Link className="admin-primary-button" href={`/admin/formulaires/${id}/reponses`}>Voir les réponses</Link></header>
    {created ? <p className="admin-page-notice" role="status">Le formulaire a été créé.</p> : null}
    <CustomFormShare form={form} shareUrl={getFormShareUrl(getSiteUrl(), form.slug)} />
    <CustomFormEditor form={form} />
  </main>;
}
