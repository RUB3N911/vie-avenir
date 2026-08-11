import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AdminIdentity = {
  id: string;
  email: string;
};

export const getAdminIdentity = cache(async (): Promise<AdminIdentity | null> => {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const { data: admin } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!admin) return null;

  return { id: user.id, email: user.email };
});

export async function requireAdmin() {
  const admin = await getAdminIdentity();
  if (!admin) redirect("/admin/connexion");
  return admin;
}
