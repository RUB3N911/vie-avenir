export const navigation = [
  { href: "/notre-mission", label: "Notre mission" },
  { href: "/nos-actions", label: "Nos actions" },
  { href: "/evenements", label: "Événements" },
  { href: "/partenaires", label: "Partenaires" },
] as const;

export type NavigationPath = (typeof navigation)[number]["href"];
