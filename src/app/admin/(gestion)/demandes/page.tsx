import { ContactRequestForm } from "@/components/admin/contact-request-form";
import { contactJourneys } from "@/data/contact-journeys";
import { requireAdmin } from "@/lib/admin-auth";
import { getContactRequestsForAdmin } from "@/lib/cms-data";

const statusLabels = { new: "Nouvelle", in_progress: "En cours", replied: "Réponse envoyée", closed: "Clôturée" } as const;

export default async function ContactRequestsAdminPage() {
  await requireAdmin();
  const requests = await getContactRequestsForAdmin();
  return <main className="admin-page"><header className="admin-page-header"><div><p className="admin-eyebrow">Nous rejoindre</p><h1>Demandes reçues</h1><span>Les quatre parcours du site arrivent ici. Les notes de suivi restent strictement internes.</span></div></header><section className="admin-request-list">{requests.length ? requests.map((request) => <details key={request.id}><summary><div><span className={`admin-badge request-${request.status}`}>{statusLabels[request.status]}</span><strong>{request.name}</strong><small>{contactJourneys[request.profile].title}</small></div><time dateTime={request.created_at}>{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Martinique" }).format(new Date(request.created_at))}</time></summary><div className="admin-request-body"><dl><div><dt>E-mail</dt><dd><a href={`mailto:${request.email}`}>{request.email}</a></dd></div>{request.phone ? <div><dt>Téléphone</dt><dd><a href={`tel:${request.phone}`}>{request.phone}</a></dd></div> : null}{request.age != null ? <div><dt>Âge</dt><dd>{request.age} ans</dd></div> : null}{request.organization ? <div><dt>Structure</dt><dd>{request.organization}</dd></div> : null}<div><dt>Demande</dt><dd>{request.details.request_type}</dd></div><div><dt>Objet</dt><dd>{request.subject}</dd></div></dl><article><h3>Message</h3><p>{request.message}</p></article><ContactRequestForm request={request} /></div></details>) : <div className="admin-empty-state"><strong>Aucune demande reçue.</strong><p>Les messages envoyés depuis les quatre parcours apparaîtront ici.</p></div>}</section></main>;
}
