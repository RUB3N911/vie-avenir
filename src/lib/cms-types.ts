export type PublicationStatus = "draft" | "published" | "archived";
export type RegistrationStatus =
  | "coming_soon"
  | "open"
  | "full"
  | "cancelled"
  | "closed";

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
  program: string[];
  created_at: string;
  updated_at: string;
};

export type AssociationSettings = {
  legal_name: string;
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
