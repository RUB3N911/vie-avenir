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
  details: Record<string, string | string[]>;
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

export type EventParticipantStatus =
  | "confirmed"
  | "waitlisted"
  | "cancelled"
  | "attended"
  | "no_show";

export type EventRegistrationRecord = {
  id: string;
  event_id: string;
  participant_first_name: string;
  participant_last_name: string;
  birth_date: string;
  contact_email: string;
  contact_phone: string;
  city: string | null;
  guardian_name: string | null;
  guardian_email: string | null;
  guardian_phone: string | null;
  accessibility_needs: string | null;
  photo_consent: boolean;
  privacy_consent_at: string;
  guardian_consent_at: string | null;
  status: EventParticipantStatus;
  admin_notes: string | null;
  status_updated_at: string;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
};

export type EventRegistrationAudience = "confirmed" | "waitlisted" | "all";
export type EventMessageDeliveryStatus = "sending" | "sent" | "partial" | "failed";

export type EventRegistrationMessage = {
  id: string;
  event_id: string;
  audience: EventRegistrationAudience;
  subject: string;
  body: string;
  recipient_count: number;
  delivered_count: number;
  failed_count: number;
  delivery_status: EventMessageDeliveryStatus;
  sent_at: string;
  sent_by: string;
};

export type GalleryMediaType = "photo" | "video";

export type GalleryMedia = {
  id: string;
  album_id: string;
  media_type: GalleryMediaType;
  file_url: string;
  storage_path: string;
  title: string | null;
  caption: string | null;
  alt_text: string | null;
  mime_type: string;
  file_size: number;
  display_order: number;
  is_cover: boolean;
  published: boolean;
  consent_confirmed: boolean;
  created_at: string;
  updated_at: string;
};

export type GalleryAlbumEvent = Pick<EventRecord, "id" | "slug" | "title" | "starts_at">;

export type GalleryAlbum = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  event_id: string | null;
  published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  event: GalleryAlbumEvent | null;
  media: GalleryMedia[];
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
  facebook_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
};

export type LinkHubIconName =
  | "link"
  | "spark"
  | "calendar"
  | "users"
  | "briefcase"
  | "heart"
  | "gallery"
  | "globe";

export type LinkHubLink = {
  id: string;
  label: string;
  url: string;
  icon: LinkHubIconName;
  is_featured: boolean;
  published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};
