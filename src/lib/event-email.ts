import "server-only";

import type { EventRecord, EventRegistrationAudience } from "@/lib/cms-types";
import { sendResendEmail } from "@/lib/resend-email";

const CONTACT_EMAIL = "contact@vieavenir.fr";

type RegistrationMailData = {
  registrationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: "confirmed" | "waitlisted";
  event: Pick<EventRecord, "id" | "slug" | "title" | "starts_at" | "venue_name" | "city">;
};

type BroadcastRecipient = { email: string; firstName: string };

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Martinique",
  }).format(new Date(value));
}

function eventUrl(slug: string) {
  try {
    return new URL(`/evenements/${slug}`, process.env.NEXT_PUBLIC_SITE_URL || "https://vieavenir.fr").toString();
  } catch {
    return `https://vieavenir.fr/evenements/${slug}`;
  }
}

function emailShell(preheader: string, content: string) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;background:#f4f6fa;color:#0d1b3d;font-family:Arial,sans-serif;"><div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:28px 12px;background:#f4f6fa;"><tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;overflow:hidden;border-radius:24px;background:#fff;box-shadow:0 14px 38px rgba(13,27,61,.08);">
  <tr><td style="height:8px;background:linear-gradient(90deg,#e6007e,#ff8a00 45%,#ffd200 72%,#4caf50);"></td></tr>
  <tr><td style="padding:30px 34px 12px;"><div style="font-size:20px;font-weight:800;letter-spacing:.04em;">VIE AVENIR</div><div style="margin-top:4px;color:#b00060;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;">Va et deviens !</div></td></tr>
  <tr><td style="padding:18px 34px 38px;">${content}</td></tr></table>
  <p style="margin:18px 0 0;color:#687086;font-size:11px;">VIE AVENIR · Le Carbet, Martinique</p></td></tr></table></body></html>`;
}

function eventSummary(event: Pick<EventRecord, "slug" | "title" | "starts_at" | "venue_name" | "city">) {
  return `<div style="margin:24px 0;padding:18px 20px;border-radius:16px;background:#fffaf4;border-left:4px solid #ffd200;">
    <strong style="display:block;font-size:16px;">${escapeHtml(event.title)}</strong>
    <span style="display:block;margin-top:8px;color:#5d667b;font-size:13px;line-height:1.6;">${escapeHtml(formatEventDate(event.starts_at))}<br>${escapeHtml([event.venue_name, event.city].filter(Boolean).join(" · "))}</span>
  </div>`;
}

export async function sendRegistrationCreatedEmails(data: RegistrationMailData) {
  const confirmed = data.status === "confirmed";
  const participantSubject = confirmed
    ? `Inscription confirmée — ${data.event.title}`
    : `Liste d’attente — ${data.event.title}`;
  const participantCopy = confirmed
    ? "Ta place est confirmée. Nous t’écrirons si une information pratique évolue."
    : "L’événement est complet pour le moment. Ta demande est enregistrée sur la liste d’attente et nous t’écrirons si une place se libère.";

  const participant = sendResendEmail({
    to: data.email,
    replyTo: CONTACT_EMAIL,
    subject: `VIE AVENIR — ${participantSubject}`,
    html: emailShell(participantSubject, `<p style="margin:0 0 8px;color:#b00060;font-size:12px;font-weight:800;text-transform:uppercase;">${confirmed ? "Inscription confirmée" : "Liste d’attente"}</p><h1 style="margin:0;font-size:28px;line-height:1.2;">Bonjour ${escapeHtml(data.firstName)},</h1>${eventSummary(data.event)}<p style="color:#35405a;font-size:15px;line-height:1.7;">${participantCopy}</p><p style="margin-top:25px;"><a href="${escapeHtml(eventUrl(data.event.slug))}" style="display:inline-block;padding:14px 20px;border-radius:999px;background:#c6006d;color:#fff;font-size:13px;font-weight:800;text-decoration:none;">Voir l’événement</a></p><p style="margin-top:20px;color:#687086;font-size:12px;line-height:1.6;">Une question ou un empêchement ? Réponds simplement à cet e-mail.</p>`),
    text: [`Bonjour ${data.firstName},`, "", participantCopy, "", data.event.title, formatEventDate(data.event.starts_at), [data.event.venue_name, data.event.city].filter(Boolean).join(" · "), "", eventUrl(data.event.slug), "", `Contact : ${CONTACT_EMAIL}`].join("\n"),
    tags: [{ name: "category", value: confirmed ? "event-confirmed" : "event-waitlisted" }],
    idempotencyKey: `event-registration-${data.registrationId}-${data.status}`,
  });

  const notification = sendResendEmail({
    to: CONTACT_EMAIL,
    replyTo: CONTACT_EMAIL,
    subject: `${confirmed ? "Nouvelle inscription" : "Nouvelle demande en attente"} — ${data.event.title}`,
    html: emailShell("Nouvelle inscription à un événement", `<p style="margin:0 0 8px;color:#b00060;font-size:12px;font-weight:800;text-transform:uppercase;">${confirmed ? "Inscription confirmée" : "Liste d’attente"}</p><h1 style="margin:0;font-size:27px;line-height:1.2;">${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</h1>${eventSummary(data.event)}<p style="color:#35405a;font-size:14px;line-height:1.7;"><strong>E-mail :</strong> ${escapeHtml(data.email)}<br><strong>Téléphone :</strong> ${escapeHtml(data.phone)}</p><p style="margin-top:25px;"><a href="${escapeHtml(new URL(`/admin/evenements/${data.event.id}/inscriptions`, process.env.NEXT_PUBLIC_SITE_URL || "https://vieavenir.fr").toString())}" style="display:inline-block;padding:14px 20px;border-radius:999px;background:#0d1b3d;color:#fff;font-size:13px;font-weight:800;text-decoration:none;">Gérer les inscriptions</a></p>`),
    text: [`${confirmed ? "Nouvelle inscription" : "Nouvelle demande en attente"}`, "", `${data.firstName} ${data.lastName}`, data.email, data.phone, "", data.event.title, formatEventDate(data.event.starts_at)].join("\n"),
    tags: [{ name: "category", value: "event-registration-notification" }],
    idempotencyKey: `event-registration-${data.registrationId}-notification`,
  });

  await Promise.all([participant, notification]);
}

export async function sendRegistrationStatusEmail(input: {
  registrationId: string;
  kind: "cancelled" | "promoted";
  email: string;
  firstName: string;
  event: RegistrationMailData["event"];
}) {
  const promoted = input.kind === "promoted";
  const copy = promoted
    ? "Bonne nouvelle : une place vient de se libérer et ton inscription est maintenant confirmée."
    : "Ton inscription a bien été annulée. Si tu penses qu’il s’agit d’une erreur, réponds à cet e-mail.";
  return sendResendEmail({
    to: input.email,
    replyTo: CONTACT_EMAIL,
    subject: `VIE AVENIR — ${promoted ? "Ta place est confirmée" : "Inscription annulée"}`,
    html: emailShell(promoted ? "Une place s’est libérée" : "Inscription annulée", `<h1 style="margin:0;font-size:28px;line-height:1.2;">Bonjour ${escapeHtml(input.firstName)},</h1>${eventSummary(input.event)}<p style="color:#35405a;font-size:15px;line-height:1.7;">${copy}</p>`),
    text: [`Bonjour ${input.firstName},`, "", copy, "", input.event.title, formatEventDate(input.event.starts_at), "", `Contact : ${CONTACT_EMAIL}`].join("\n"),
    tags: [{ name: "category", value: promoted ? "event-promoted" : "event-cancelled" }],
    idempotencyKey: `event-registration-${input.registrationId}-${input.kind}`,
  });
}

export async function sendEventBroadcast(input: {
  messageId: string;
  audience: EventRegistrationAudience;
  event: Pick<EventRecord, "slug" | "title" | "starts_at" | "venue_name" | "city">;
  subject: string;
  body: string;
  recipients: BroadcastRecipient[];
}) {
  const uniqueRecipients = Array.from(
    new Map(input.recipients.map((recipient) => [recipient.email.trim().toLowerCase(), recipient])).values(),
  );
  const bodyHtml = escapeHtml(input.body).replaceAll("\n", "<br>");
  let delivered = 0;
  let failed = 0;

  for (let offset = 0; offset < uniqueRecipients.length; offset += 10) {
    const chunk = uniqueRecipients.slice(offset, offset + 10);
    const results = await Promise.all(chunk.map((recipient, index) => sendResendEmail({
      to: recipient.email,
      replyTo: CONTACT_EMAIL,
      subject: input.subject,
      html: emailShell(input.subject, `<h1 style="margin:0 0 18px;font-size:28px;line-height:1.2;">Bonjour ${escapeHtml(recipient.firstName)},</h1><p style="color:#35405a;font-size:15px;line-height:1.75;">${bodyHtml}</p>${eventSummary(input.event)}<p style="margin-top:20px;color:#687086;font-size:12px;line-height:1.6;">Tu peux répondre directement à cet e-mail pour contacter VIE AVENIR.</p>`),
      text: [`Bonjour ${recipient.firstName},`, "", input.body, "", input.event.title, formatEventDate(input.event.starts_at), "", `Contact : ${CONTACT_EMAIL}`].join("\n"),
      tags: [{ name: "category", value: "event-participants" }, { name: "audience", value: input.audience }],
      idempotencyKey: `event-message-${input.messageId}-${offset + index}`,
    })));
    delivered += results.filter((result) => result.ok).length;
    failed += results.filter((result) => !result.ok).length;
  }

  return { recipientCount: uniqueRecipients.length, delivered, failed };
}
