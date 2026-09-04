import type { ContactProfile } from "./cms-types";

export const professionalInterventionFormUrl = "https://www.vieavenir.fr/formulaires/devenez-une-voix-de-l-avenir-avec-l-association-vie-avenir";

const title = "Préparons vos futures interventions";
const invitation = "Merci pour votre envie de transmettre et de partager votre expérience avec les jeunes. Afin de mieux vous connaître et de préparer vos futures interventions avec VIE AVENIR, nous vous invitons à compléter ce formulaire.";
const buttonLabel = "Compléter le formulaire";

export function getProfessionalFollowUp(profile: ContactProfile): { html: string; text: string } {
  if (profile !== "professional") return { html: "", text: "" };

  return {
    html: `<div style="margin:24px 0;padding:20px;border-radius:16px;background:#fff5fa;border-left:4px solid #e6007e;">
       <h2 style="margin:0 0 12px;color:#0d1b3d;font-size:20px;line-height:1.35;">${title}</h2>
       <p style="margin:0 0 18px;color:#35405a;font-size:16px;line-height:1.7;">${invitation}</p>
       <p style="margin:0 0 16px;"><a href="${professionalInterventionFormUrl}" style="display:inline-block;padding:14px 20px;border-radius:999px;background:#c6006d;color:#ffffff;font-size:14px;font-weight:800;text-decoration:none;">${buttonLabel}</a></p>
       <p style="margin:0;color:#687086;font-size:12px;line-height:1.6;">Si le bouton ne s’ouvre pas, copiez ce lien dans votre navigateur :<br><a href="${professionalInterventionFormUrl}" style="color:#b00060;word-break:break-all;overflow-wrap:anywhere;">${professionalInterventionFormUrl}</a></p>
     </div>`,
    text: [title, "", invitation, "", `${buttonLabel} : ${professionalInterventionFormUrl}`].join("\n"),
  };
}
