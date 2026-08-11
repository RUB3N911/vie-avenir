import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return <AdminShell email={admin.email}>{children}</AdminShell>;
}
