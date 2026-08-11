import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig, isSupabaseConfigured } from "@/lib/supabase/env";

export async function createSupabaseServerClient() {
  if (!isSupabaseConfigured()) return null;

  const { url, publishableKey } = getSupabaseConfig();
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Les Server Components ne peuvent pas toujours écrire les cookies.
          // Le proxy rafraîchit la session avant le rendu de l'administration.
        }
      },
    },
  });
}
