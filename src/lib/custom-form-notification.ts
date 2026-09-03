import type { ResendEmail, ResendResult } from "./resend-email";

type FormNotification = {
  enabled: boolean;
  isNewResponse: boolean;
  formId: string;
  formTitle: string;
  submissionId: string;
  siteUrl: string;
};

const contactEmail = "contact@vieavenir.fr";
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);

export function buildCustomFormNotification(input: FormNotification): ResendEmail {
  const responsesUrl = new URL(`/admin/formulaires/${encodeURIComponent(input.formId)}/reponses`, input.siteUrl).toString();
  const title = input.formTitle.replace(/[\r\n]+/g, " ").trim();
  return {
    to: contactEmail,
    replyTo: contactEmail,
    subject: `Nouvelle réponse — ${title}`,
    text: `VIE AVENIR\n\nUne nouvelle réponse a été enregistrée pour le formulaire « ${title} ».\n\nConsulter les réponses (connexion administrateur requise) : ${responsesUrl}\n\nLes réponses ne sont pas reproduites dans cet e-mail afin de préserver leur confidentialité.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#0d1b3d;line-height:1.6"><h1 style="font-size:24px;color:#e6007e">VIE AVENIR</h1><h2 style="font-size:20px">Nouvelle réponse à votre formulaire</h2><p>Une nouvelle réponse a été enregistrée pour <strong>${escapeHtml(title)}</strong>.</p><p><a href="${escapeHtml(responsesUrl)}" style="display:inline-block;padding:12px 20px;background:#e6007e;color:#fff;text-decoration:none;border-radius:8px">Consulter les réponses</a></p><p style="font-size:14px;color:#667085">Connexion administrateur requise. Les réponses ne sont pas reproduites dans cet e-mail afin de préserver leur confidentialité.</p></div>`,
    tags: [{ name: "category", value: "custom_form_response" }, { name: "form_id", value: input.formId }],
    idempotencyKey: `custom-form-${input.formId}-${input.submissionId}`,
  };
}

// The caller supplies Next's after(): sending starts only after the response is saved
// and does not delay or invalidate the participant's confirmation.
export function scheduleCustomFormNotification(
  input: FormNotification,
  after: (task: () => Promise<void>) => void,
  sendEmail: (email: ResendEmail) => Promise<ResendResult>,
  onFailure: (reason: string) => void,
): void {
  if (!input.enabled || !input.isNewResponse) return;
  try {
    after(async () => {
      try {
        const result = await sendEmail(buildCustomFormNotification(input));
        if (!result.ok) onFailure(result.reason ?? "provider_error");
      } catch {
        onFailure("network_error");
      }
    });
  } catch {
    onFailure("scheduling_error");
  }
}
