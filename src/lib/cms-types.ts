export type PublicationStatus = "draft" | "published" | "archived";
export type RegistrationStatus =
  | "coming_soon"
  | "open"
  | "full"
  | "cancelled"
  | "closed";

export type ProgramItem = {
  title: string;
  description: string;
};

export type LegalPageSlug = "mentions-legales" | "politique-confidentialite";

export type LegalPageSection = {
  id: string;
  title: string;
  body: string;
  note: string;
};

export type LegalPageRecord = {
  slug: LegalPageSlug;
  eyebrow: string;
  title: string;
  description: string;
  summary_title: string | null;
  summary_items: string[];
  sections: LegalPageSection[];
  updated_at: string;
};

export type ContactProfile = "young" | "parent" | "professional" | "partner";
export type ContactRequestStatus = "new" | "in_progress" | "replied" | "closed";

export type ContactRequestRecord = {
  id: string;
  profile: ContactProfile;
  name: string;
  email: string;
  phone: string | null;
  age: number | null;
  organization: string | null;
  subject: string;
  message: string;
  details: Record<string, string>;
  status: ContactRequestStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type SitePresentation = {
  story_title: string | null;
  story_body: string | null;
  team_intro: string | null;
  minor_charter_title: string | null;
  minor_charter_body: string | null;
  minor_charter_published: boolean;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
  display_order: number;
  published: boolean;
};

export type ConfirmedPartner = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
  display_order: number;
  published: boolean;
};

export type Testimonial = {
  id: string;
  author_name: string;
  author_role: ContactProfile;
  quote: string;
  image_url: string | null;
  display_order: number;
  published: boolean;
};

export type EventRecord = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  venue_name: string | null;
  venue_address: string | null;
  city: string;
  age_min: number;
  age_max: number;
  capacity: number | null;
  price_label: string;
  access_details: string | null;
  registration_url: string | null;
  registration_deadline: string | null;
  registration_status: RegistrationStatus;
  publication_status: PublicationStatus;
  image_url: string | null;
  program: ProgramItem[];
  created_at: string;
  updated_at: string;
};

export type AssociationSettings = {
  legal_name: string;
  association_status: string | null;
  public_email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  postal_code: string | null;
  city: string;
  rna_number: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  website_url: string | null;
};
