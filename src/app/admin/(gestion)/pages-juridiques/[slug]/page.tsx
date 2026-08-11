import Link from "next/link";
import { notFound } from "next/navigation";
import { LegalPageForm } from "@/components/admin/legal-page-form";
import { getLegalPageForAdmin } from "@/lib/cms-data";
import type { LegalPageSlug } from "@/lib/cms-types";

const legalSlugs = new Set<LegalPageSlug>(["mentions-legales", "politique-confidentialite"]);

export default async function EditLegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!legalSlugs.has(slug as LegalPageSlug)) notFound();
  const page = await getLegalPageForAdmin(slug as LegalPageSlug);

  return (
    <main className="admin-page admin-editor-page">
      <Link className="admin-breadcrumb" href="/admin/pages-juridiques">← Retour aux pages juridiques</Link>
      <header className="admin-page-header"><div><p className="admin-eyebrow">Modifier la page</p><h1>{page.title}</h1><span>L’enregistrement publie immédiatement les nouveaux textes sur le site.</span></div></header>
      <LegalPageForm page={page} />
    </main>
  );
}
