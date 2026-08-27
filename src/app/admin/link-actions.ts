"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import type { AdminActionState } from "@/lib/admin-action-state";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const linkDestination = z
  .string()
  .trim()
  .min(1, "L’adresse du lien est requise.")
  .max(2048, "L’adresse du lien est trop longue.")
  .refine((value) => {
    if (value.startsWith("/") && !value.startsWith("//")) return true;
    if (!URL.canParse(value)) return false;
    const protocol = new URL(value).protocol;
    return protocol === "https:" || protocol === "http:";
  }, "Utilisez une adresse https://… ou un chemin du site comme /contact.");

const linkHubSchema = z.object({
  label: z.string().trim().min(2, "Le titre du bouton est requis.").max(80),
  url: linkDestination,
  icon: z.enum(["link", "spark", "calendar", "users", "briefcase", "heart", "gallery", "globe"]),
  display_order: z.coerce.number().int().min(0).max(999),
});

function revalidateLinkHub() {
  revalidatePath("/liens");
  revalidatePath("/admin/liens");
}

export async function saveLinkHubLink(
  linkId: string | null,
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const result = linkHubSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { status: "error", message: result.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Base de données indisponible." };

  const isFeatured = formData.get("is_featured") === "on";
  if (isFeatured) {
    const { error: resetError } = await supabase
      .from("link_hub_links")
      .update({ is_featured: false, updated_by: admin.id })
      .eq("is_featured", true);
    if (resetError) {
      return { status: "error", message: `Mise en avant impossible : ${resetError.message}` };
    }
  }

  const { error } = await supabase.from("link_hub_links").upsert({
    id: linkId ?? randomUUID(),
    ...result.data,
    is_featured: isFeatured,
    published: formData.get("published") === "on",
    updated_by: admin.id,
  });

  if (error) return { status: "error", message: `Enregistrement impossible : ${error.message}` };
  revalidateLinkHub();
  return {
    status: "success",
    message: linkId ? "Le lien est mis à jour." : "Le lien est ajouté à la page.",
  };
}

export async function deleteLinkHubLink(
  linkId: string,
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  if (formData.get("confirmation") !== "SUPPRIMER") {
    return { status: "error", message: "Saisissez SUPPRIMER pour confirmer." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Base de données indisponible." };
  const { error } = await supabase.from("link_hub_links").delete().eq("id", linkId);
  if (error) return { status: "error", message: `Suppression impossible : ${error.message}` };

  revalidateLinkHub();
  return { status: "success", message: "Le lien a été supprimé." };
}
