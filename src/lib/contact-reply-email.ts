import type { ContactProfile } from "./cms-types";
import type { ResendEmail } from "./resend-email";

const contactEmail = "contact@vieavenir.fr";

type ContactReplyEmailInput = {
  requestId: string;
  replyToken: string;
  profile: ContactProfile;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  heading: string;
  body: string;
  cta?: {
    label: string;
    url: string;
  };
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function emailShell(preheader: string, content: string) {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(preheader)}</title>
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

export function buildContactReplyEmail(input: ContactReplyEmailInput): ResendEmail {
  const bodyHtml = escapeHtml(input.body).replaceAll("\n", "<br>");
  const isYoung = input.profile === "young";
  const ctaHtml = input.cta
    ? `<p style="margin:22px 0 16px;"><a href="${escapeHtml(input.cta.url)}" style="display:inline-block;padding:14px 20px;border-radius:999px;background:#c6006d;color:#ffffff;font-size:14px;font-weight:800;text-decoration:none;">${escapeHtml(input.cta.label)}</a></p>
       <p style="margin:0;color:#687086;font-size:12px;line-height:1.6;">Si le bouton ne s’ouvre pas, copiez ce lien dans votre navigateur :<br><a href="${escapeHtml(input.cta.url)}" style="color:#b00060;word-break:break-all;overflow-wrap:anywhere;">${escapeHtml(input.cta.url)}</a></p>`
    : "";
  const ctaText = input.cta ? ["", `${input.cta.label} : ${input.cta.url}`] : [];

  return {
    to: input.recipientEmail,
    replyTo: contactEmail,
    subject: input.subject,
    html: emailShell(
      input.subject,
      `<p style="margin:0 0 10px;color:#b00060;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">Réponse à ${isYoung ? "ton" : "votre"} message</p>
       <h1 style="margin:0 0 18px;color:#0d1b3d;font-size:28px;line-height:1.2;">Bonjour ${escapeHtml(input.recipientName)},</h1>
       <div style="margin:24px 0;padding:20px;border-radius:16px;background:#fff5fa;border-left:4px solid #e6007e;">
         <h2 style="margin:0 0 12px;color:#0d1b3d;font-size:20px;line-height:1.35;">${escapeHtml(input.heading)}</h2>
         <p style="margin:0;color:#35405a;font-size:16px;line-height:1.75;">${bodyHtml}</p>
         ${ctaHtml}
       </div>
       <p style="margin:0;color:#687086;font-size:12px;line-height:1.6;">Ce message ${isYoung ? "t’est" : "vous est"} envoyé par VIE AVENIR à la suite de ${isYoung ? "ta" : "votre"} demande. ${isYoung ? "Tu peux" : "Vous pouvez"} y répondre directement pour apporter une précision.</p>`,
    ),
    text: [
      `Bonjour ${input.recipientName},`,
      "",
      input.heading,
      "",
      input.body,
      ...ctaText,
      "",
      `Vous pouvez répondre directement à cet e-mail pour contacter VIE AVENIR (${contactEmail}).`,
    ].join("\n"),
    tags: [
      { name: "category", value: "contact-reply" },
      { name: "profile", value: input.profile },
    ],
    idempotencyKey: `contact-reply-${input.requestId}-${input.replyToken}`,
  };
}
