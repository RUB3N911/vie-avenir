import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { CustomFormEditor } from "@/components/admin/custom-form-editor";
import { hasResendConfiguration } from "@/lib/resend-email";

export default async function NewCustomFormPage() {
  await requireAdmin();
  return <main className="admin-page admin-editor-page custom-forms-admin"><Link className="admin-breadcrumb" href="/admin/formulaires">← Formulaires</Link><header className="admin-page-header"><div><p className="admin-eyebrow">Création</p><h1>Nouveau formulaire</h1></div></header><CustomFormEditor emailConfigured={hasResendConfiguration()} /></main>;
}
