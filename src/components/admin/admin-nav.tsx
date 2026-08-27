"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Tableau de bord", icon: "⌂" },
  { href: "/admin/informations", label: "L’association", icon: "VA" },
  { href: "/admin/evenements", label: "Événements", icon: "◫" },
  { href: "/admin/galerie", label: "Galerie", icon: "▧" },
  { href: "/admin/liens", label: "Page de liens", icon: "↗" },
  { href: "/admin/demandes", label: "Demandes", icon: "✉" },
  { href: "/admin/contenus", label: "Contenus", icon: "✦" },
  { href: "/admin/pages-juridiques", label: "Pages juridiques", icon: "§" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-nav" aria-label="Navigation de l’administration">
      {items.map((item) => {
        const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={active ? "is-active" : undefined} aria-current={active ? "page" : undefined}>
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
