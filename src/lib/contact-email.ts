import "server-only";

import type { ContactProfile } from "@/lib/cms-types";

const DEFAULT_NOTIFICATION_EMAIL = "contact@vieavenir.fr";
const DEFAULT_SITE_URL = "https://vieavenir.fr";

const profileLabels: Record<ContactProfile, string> = {
  young: "Jeune de 14 à 25 ans",
  parent: "Parent ou responsable légal",
  professional: "Professionnel",
  partner: "Partenaire",
};

export type ContactEmailRequest = {
  id: string;
  createdAt: string;
  profile: ContactProfile;
  name: string;
  email: string;
  phone: string | null;
  age: number | null;
  organization: string | null;
  roleOrJob: string | null;
  requestType: string;
  subject: string;
  message: string;
};

type EmailPayload = {
  from: string;
  to: string;
  reply_to: string;
  subject: string;
  html: string;
  text: string;
  tags: Array<{ name: string; value: string }>;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Martinique",
  }).format(new Date(value));
}

function getAdminUrl() {
  try {
    return new URL("/admin/demandes", process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).toString();
  } catch {
    return `${DEFAULT_SITE_URL}/admin/demandes`;
  }
}

function emailShell(preheader: string, title: string, content: string) {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;background:#f4f6fa;color:#0d1b3d;font-family:Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa;padding:28px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 14px 38px rgba(13,27,61,.08);">
          <tr><td style="height:8px;background:linear-gradient(90deg,#e6007e 0%,#ff8a00 45%,#ffd200 72%,#4caf50 100%);"></td></tr>
          <tr><td style="padding:30px 34px 12px;">
            <div style="font-size:20px;font-weight:800;letter-spacing:.04em;color:#0d1b3d;">VIE AVENIR</div>
            <div style="margin-top:4px;font-size:11px;font-weight:700;letter-spacing:.14em;color:#b00060;text-transform:uppercase;">Va et deviens !</div>
          </td></tr>
          <tr><td style="padding:18px 34px 38px;">${content}</td></tr>
        </table>
        <p style="margin:18px 0 0;color:#687086;font-size:11px;line-height:1.5;">VIE AVENIR · Le Carbet, Martinique</p>
      </td></tr>
    </table>
  </body>
</html>`;
}

function detailRow(label: string, value: string | null | undefined) {
  if (!value) return "";
  return `<tr>
    <td style="width:155px;padding:8px 12px 8px 0;vertical-align:top;color:#687086;font-size:12px;font-weight:700;text-transform:uppercase;">${escapeHtml(label)}</td>
    <td style="padding:8px 0;vertical-align:top;color:#0d1b3d;font-size:14px;line-height:1.55;">${escapeHtml(value).replaceAll("\n", "<br>")}</td>
  </tr>`;
}

function notificationHtml(request: ContactEmailRequest) {
  const rows = [
    detailRow("Profil", profileLabels[request.profile]),
    detailRow("Nom", request.name),
    detailRow("E-mail", request.email),
    detailRow("Téléphone", request.phone),
    detailRow("Âge", request.age == null ? null : String(request.age)),
    detailRow("Structure", request.organization),
    detailRow("Métier / fonction", request.roleOrJob),
    detailRow("Demande", request.requestType),
    detailRow("Objet", request.subject),
    detailRow("Message", request.message),
    detailRow("Reçue le", formatDate(request.createdAt)),
  ].join("");

  return emailShell(
    `Nouvelle demande de ${request.name}`,
    "Nouvelle demande reçue",
    `<p style="margin:0 0 10px;color:#b00060;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">Nouvelle demande</p>
     <h1 style="margin:0 0 22px;color:#0d1b3d;font-size:28px;line-height:1.2;">${escapeHtml(request.subject)}</h1>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e7e9ef;border-bottom:1px solid #e7e9ef;">${rows}</table>
     <p style="margin:28px 0 0;"><a href="${escapeHtml(getAdminUrl())}" style="display:inline-block;padding:14px 20px;border-radius:999px;background:#c6006d;color:#ffffff;font-size:13px;font-weight:800;text-decoration:none;">Ouvrir les demandes dans l’administration</a></p>
     <p style="margin:18px 0 0;color:#687086;font-size:12px;line-height:1.5;">Répondez directement à cet e-mail pour écrire à ${escapeHtml(request.name)}.</p>`,
  );
}

function acknowledgementHtml(request: ContactEmailRequest) {
  return emailShell(
    "Votre demande a bien été reçue par VIE AVENIR.",
    "Demande bien reçue",
    `<p style="margin:0 0 10px;color:#b00060;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">Merci pour votre message</p>
     <h1 style="margin:0 0 18px;color:#0d1b3d;font-size:28px;line-height:1.2;">Bonjour ${escapeHtml(request.name)},</h1>
     <p style="margin:0 0 18px;color:#35405a;font-size:15px;line-height:1.7;">Nous avons bien reçu votre demande concernant <strong>${escapeHtml(request.subject)}</strong>. L’équipe VIE AVENIR en prendra connaissance et vous répondra dans les meilleurs délais.</p>
     <div style="margin:24px 0;padding:18px 20px;border-radius:16px;background:#fffaf4;border-left:4px solid #ffd200;">
       <p style="margin:0 0 7px;color:#687086;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">Votre demande</p>
       <p style="margin:0;color:#0d1b3d;font-size:14px;line-height:1.55;">${escapeHtml(request.requestType)}</p>
     </div>
     <p style="margin:0;color:#687086;font-size:12px;line-height:1.6;">Cet e-mail confirme uniquement la bonne réception de votre message. Vous pouvez y répondre si vous souhaitez apporter une précision.</p>`,
  );
}

function notificationText(request: ContactEmailRequest) {
  return [
    "Nouvelle demande reçue sur le site VIE AVENIR",
    "",
    `Profil : ${profileLabels[request.profile]}`,
    `Nom : ${request.name}`,
    `E-mail : ${request.email}`,
    request.phone ? `Téléphone : ${request.phone}` : null,
    request.age == null ? null : `Âge : ${request.age}`,
    request.organization ? `Structure : ${request.organization}` : null,
    request.roleOrJob ? `Métier / fonction : ${request.roleOrJob}` : null,
    `Demande : ${request.requestType}`,
    `Objet : ${request.subject}`,
    `Message : ${request.message}`,
    `Reçue le : ${formatDate(request.createdAt)}`,
    "",
    `Administration : ${getAdminUrl()}`,
  ].filter(Boolean).join("\n");
}

function acknowledgementText(request: ContactEmailRequest) {
  return [
    `Bonjour ${request.name},`,
    "",
    `Nous avons bien reçu votre demande concernant « ${request.subject} ».`,
    "L’équipe VIE AVENIR en prendra connaissance et vous répondra dans les meilleurs délais.",
    "",
    `Votre demande : ${request.requestType}`,
    "",
    "Cet e-mail confirme uniquement la bonne réception de votre message. Vous pouvez y répondre si vous souhaitez apporter une précision.",
    "",
    "VIE AVENIR · Le Carbet, Martinique",
  ].join("\n");
}

async function sendTrackedEmail(
  apiKey: string,
  requestId: string,
  kind: "notification" | "acknowledgement",
  payload: EmailPayload,
) {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `contact-${requestId}-${kind}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const result = await response.json().catch(() => null) as { id?: string; name?: string } | null;

    if (!response.ok) {
      console.error(JSON.stringify({
        level: "error",
        message: "contact.email_failed",
        request_id: requestId,
        email_kind: kind,
        error_name: result?.name || `http_${response.status}`,
      }));
      return;
    }

    console.info(JSON.stringify({
      level: "info",
      message: "contact.email_sent",
      request_id: requestId,
      email_kind: kind,
      provider_id: result?.id,
    }));
  } catch (error) {
    console.error(JSON.stringify({
      level: "error",
      message: "contact.email_failed",
      request_id: requestId,
      email_kind: kind,
      error_name: error instanceof Error ? error.name : "unknown",
    }));
  }
}

export async function sendContactRequestEmails(request: ContactEmailRequest) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const notificationEmail = process.env.CONTACT_NOTIFICATION_EMAIL?.trim() || DEFAULT_NOTIFICATION_EMAIL;

  if (!apiKey || !from) {
    console.warn(JSON.stringify({
      level: "warn",
      message: "contact.email_skipped",
      request_id: request.id,
      reason: !apiKey ? "missing_api_key" : "missing_from_email",
    }));
    return;
  }

  const safeSubject = normalizeHeader(request.subject);

  await Promise.all([
    sendTrackedEmail(apiKey, request.id, "notification", {
      from,
      to: notificationEmail,
      reply_to: request.email,
      subject: normalizeHeader(`Nouvelle demande VIE AVENIR — ${safeSubject}`),
      html: notificationHtml(request),
      text: notificationText(request),
      tags: [
        { name: "category", value: "contact-notification" },
        { name: "profile", value: request.profile },
      ],
    }),
    sendTrackedEmail(apiKey, request.id, "acknowledgement", {
      from,
      to: request.email,
      reply_to: notificationEmail,
      subject: "VIE AVENIR — Nous avons bien reçu votre demande",
      html: acknowledgementHtml(request),
      text: acknowledgementText(request),
      tags: [
        { name: "category", value: "contact-acknowledgement" },
        { name: "profile", value: request.profile },
      ],
    }),
  ]);
}
