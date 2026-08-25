import { getPublishedEventBySlug } from "@/lib/cms-data";
import { getSiteUrl } from "@/lib/site";

function icsDate(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcs(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getPublishedEventBySlug(slug);
  if (!event) return new Response("Événement introuvable", { status: 404 });

  const end = event.ends_at ?? new Date(new Date(event.starts_at).getTime() + 2 * 60 * 60 * 1000).toISOString();
  const location = [event.venue_name, event.venue_address, event.city].filter(Boolean).join(", ");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VIE AVENIR//Événements//FR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.id}@vie-avenir.fr`,
    `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `DTSTART:${icsDate(event.starts_at)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(event.description ?? event.summary)}`,
    `LOCATION:${escapeIcs(location)}`,
    `URL:${getSiteUrl()}/evenements/${event.slug}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  const filename = `${event.slug}.ics`;
  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
