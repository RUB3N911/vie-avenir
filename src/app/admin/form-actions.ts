"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { customFormSchema, type CustomFormActionState } from "@/lib/custom-forms";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function saveCustomForm(formId: string | null, _previousState: CustomFormActionState, formData: FormData): Promise<CustomFormActionState> {
  const admin = await requireAdmin();
  if (formId && !z.uuid().safeParse(formId).success) return { status: "error", message: "Formulaire introuvable." };
  const rawQuestions = formData.get("questions");
  if (typeof rawQuestions !== "string" || rawQuestions.length > 150000) return { status: "error", message: "Les questions sont invalides ou trop volumineuses." };
  let questions: unknown;
  try { questions = JSON.parse(rawQuestions); } catch { return { status: "error", message: "Les questions sont invalides." }; }
  const parsed = customFormSchema.safeParse({ ...Object.fromEntries(formData), questions });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Vérifiez le formulaire." };
  const revision = Number(formData.get("revision"));
  if (formId && (!Number.isInteger(revision) || revision < 1)) return { status: "error", message: "Rechargez le formulaire avant de l’enregistrer." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Le service est momentanément indisponible." };
  const id = formId ?? randomUUID();
  const payload = { ...parsed.data, updated_by: admin.id };
  try {
    const result = formId
      ? await supabase.from("custom_forms").update(payload).eq("id", id).eq("revision", revision).select("revision").maybeSingle()
      : await supabase.from("custom_forms").insert({ id, ...payload }).select("revision").single();
    if (result.error) {
      console.error("Échec de l’enregistrement du formulaire", result.error.code);
      return { status: "error", message: result.error.code === "23505" ? "Cette adresse est déjà utilisée par un autre formulaire." : "Le formulaire n’a pas pu être enregistré. Réessayez." };
    }
    if (!result.data) return { status: "error", message: "Ce formulaire a été modifié dans un autre onglet. Copiez vos changements puis rechargez la page." };
    revalidatePath("/admin/formulaires");
    revalidatePath(`/admin/formulaires/${id}`);
    revalidatePath("/formulaires/[slug]", "page");
    if (formId) return { status: "success", message: "Le formulaire est enregistré.", revision: result.data.revision };
  } catch {
    return { status: "error", message: "Connexion interrompue. Vos modifications restent affichées ; réessayez." };
  }
  redirect(`/admin/formulaires/${id}?created=1`);
}
