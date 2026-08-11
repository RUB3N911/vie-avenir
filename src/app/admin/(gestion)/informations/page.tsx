import { AssociationForm } from "@/components/admin/association-form";
import { getAssociationSettingsForAdmin } from "@/lib/cms-data";

export default async function AssociationAdminPage() {
  const settings = await getAssociationSettingsForAdmin();
  return (
    <main className="admin-page admin-editor-page">
      <header className="admin-page-header"><div><p className="admin-eyebrow">L’association</p><h1>Informations officielles</h1><span>Renseignez uniquement ce qui est confirmé. Les champs vides restent invisibles sur le site public.</span></div></header>
      <AssociationForm settings={settings} />
    </main>
  );
}
