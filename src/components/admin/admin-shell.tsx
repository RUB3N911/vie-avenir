import Image from "next/image";
import Link from "next/link";
import { signOutAdmin } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";

export function AdminShell({ children, email }: { children: React.ReactNode; email: string }) {
  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin" aria-label="Administration VIE AVENIR">
          <Image src="/images/brand/logo-vie-avenir.webp" alt="VIE AVENIR" width={180} height={120} priority />
          <span>Administration</span>
        </Link>
        <AdminNav />
        <div className="admin-sidebar-footer">
          <p><span>{email.slice(0, 1).toUpperCase()}</span><small>Connecté·e</small>{email}</p>
          <form action={signOutAdmin}><button type="submit">Se déconnecter</button></form>
          <Link href="/" target="_blank">Voir le site public ↗</Link>
        </div>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}
