import { getAdminIdentity } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function csvCell(value: string | number | boolean | null) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminIdentity();
  if (!admin) return new Response("Non autorisé", { status: 401 });
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return new Response("Base indisponible", { status: 503 });

  const [{ data: event }, { data: registrations, error }] = await Promise.all([
    supabase.from("events").select("title, starts_at").eq("id", id).maybeSingle(),
    supabase.from("event_registrations").select("*").eq("event_id", id).order("created_at"),
  ]);
  if (!event) return new Response("Événement introuvable", { status: 404 });
  if (error) return new Response("Export impossible", { status: 500 });

  const headers = ["Prénom", "Nom", "Date de naissance", "E-mail", "Téléphone", "Commune", "Responsable légal", "E-mail responsable", "Téléphone responsable", "Besoins particuliers", "Droit à l’image", "Statut", "Date d’inscription"];
  const rows = (registrations ?? []).map((row) => [row.participant_first_name, row.participant_last_name, row.birth_date, row.contact_email, row.contact_phone, row.city, row.guardian_name, row.guardian_email, row.guardian_phone, row.accessibility_needs, row.photo_consent ? "Oui" : "Non", row.status, row.created_at]);
  const csv = `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(";")).join("\r\n")}`;
  const slug = event.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inscriptions-${slug || "evenement"}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
