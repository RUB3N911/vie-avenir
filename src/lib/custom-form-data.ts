import "server-only";

import { cache } from "react";
import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CustomForm, CustomFormResponse } from "@/lib/custom-forms";

export async function getCustomFormsForAdmin() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Le service de formulaires est indisponible.");
  const { data, error } = await supabase.from("custom_forms")
    .select("id,title,slug,status,questions,updated_at,custom_form_responses(count)")
    .order("updated_at", { ascending: false });
  if (error) throw new Error("Impossible de charger les formulaires.");
  return (data ?? []) as unknown as Array<Pick<CustomForm, "id" | "title" | "slug" | "status" | "questions" | "updated_at"> & { custom_form_responses: Array<{ count: number }> }>;
}

export async function getCustomFormForAdmin(id: string): Promise<CustomForm | null> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Le service de formulaires est indisponible.");
  const { data, error } = await supabase.from("custom_forms").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error("Impossible de charger ce formulaire.");
  return data as CustomForm | null;
}

export const getPublicCustomForm = cache(async (slug: string): Promise<CustomForm | null> => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Le service de formulaires est indisponible.");
  const { data, error } = await supabase.from("custom_forms")
    .select("id,title,slug,description,confirmation_message,status,questions,revision,created_at,updated_at")
    .eq("slug", slug).in("status", ["published", "closed"]).maybeSingle();
  if (error) throw new Error("Impossible de charger ce formulaire.");
  return data as CustomForm | null;
});

export async function getCustomFormResponses(formId: string, page: number) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Le service de formulaires est indisponible.");
  const { data, count, error } = await supabase.from("custom_form_responses")
    .select("id,form_id,revision,questions_snapshot,answers,created_at", { count: "exact" })
    .eq("form_id", formId).order("created_at", { ascending: false }).order("id")
    .range((page - 1) * 25, page * 25 - 1);
  if (error) throw new Error("Impossible de charger les réponses.");
  return { responses: (data ?? []) as CustomFormResponse[], total: count ?? 0 };
}
