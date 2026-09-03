"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getPublicCustomForm } from "@/lib/custom-form-data";
import { validateCustomAnswers, type CustomFormActionState } from "@/lib/custom-forms";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function submitCustomForm(slug: string, _previousState: CustomFormActionState, formData: FormData): Promise<CustomFormActionState> {
  if (formData.get("website")) return { status: "error", message: "L’envoi n’a pas pu être validé." };
  if (formData.get("privacy_consent") !== "on") return { status: "error", message: "Veuillez accepter l’utilisation de vos réponses pour ce formulaire." };
  const submissionId = z.uuid().safeParse(formData.get("submission_id"));
  if (!submissionId.success) return { status: "error", message: "Rechargez la page avant de réessayer." };
  try {
    const form = await getPublicCustomForm(slug);
    if (!form || form.status !== "published") return { status: "error", message: "Ce formulaire n’accepte plus de réponses." };
    if (Number(formData.get("revision")) !== form.revision) return { status: "error", message: "Ce formulaire a été mis à jour. Conservez vos réponses, puis rechargez la page." };
    const parsed = validateCustomAnswers(form.questions, formData);
    if (parsed.error) return { status: "error", message: parsed.error };
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { status: "error", message: "Le service est momentanément indisponible." };
    const { error } = await supabase.from("custom_form_responses").insert({
      form_id: form.id, submission_id: submissionId.data, revision: form.revision,
      answers: parsed.answers, privacy_consent: true,
    });
    if (error) {
      // A retry with the same random submission ID must not record a second response.
      if (error.code !== "23505" || !error.message.includes("custom_form_responses_submission_key")) {
        console.error("Échec de l’envoi du formulaire", error.code);
        return { status: "error", message: "La réponse n’a pas pu être enregistrée. Le formulaire a peut-être été modifié ou fermé. Réessayez après avoir rechargé la page." };
      }
    }
    revalidatePath(`/admin/formulaires/${form.id}/reponses`);
    revalidatePath("/admin/formulaires");
    return { status: "success", message: form.confirmation_message };
  } catch {
    return { status: "error", message: "Le service est momentanément indisponible. Vos réponses restent affichées ; réessayez." };
  }
}
