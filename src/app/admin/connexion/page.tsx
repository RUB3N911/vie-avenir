import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getAdminIdentity } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function AdminLoginPage() {
  const admin = await getAdminIdentity();
  if (admin) redirect("/admin");
  const configured = isSupabaseConfigured();

  return (
    <main className="admin-login-page">
      <section className="admin-login-panel">
        <Link href="/" className="admin-login-logo" aria-label="Retour au site VIE AVENIR">
          <Image src="/images/brand/logo-vie-avenir.webp" alt="VIE AVENIR" width={230} height={153} priority />
        </Link>
        <div className="admin-login-copy"><p>Espace privé</p><h1>Pilotez VIE AVENIR simplement.</h1><span>Informations officielles, événements et publications réunis au même endroit.</span></div>
        <div className="admin-login-mark" aria-hidden="true">VA</div>
      </section>
      <section className="admin-login-card">
        <div><p className="admin-eyebrow">Administration</p><h2>Heureux de vous revoir.</h2><span>Connectez-vous avec le compte autorisé par l’association.</span></div>
        {configured ? <LoginForm /> : <div className="admin-setup-notice" role="status"><strong>Raccordement en attente</strong><p>L’interface est prête. La connexion sera activée dès que la base sécurisée aura été reliée au site.</p></div>}
        <Link className="admin-back-link" href="/">← Revenir au site public</Link>
      </section>
    </main>
  );
}
