export type EventRegistrationFormValues = {
  first_name: string;
  last_name: string;
  birth_date: string;
  city: string;
  contact_email: string;
  contact_phone: string;
  guardian_name: string;
  guardian_email: string;
  guardian_phone: string;
  accessibility_needs: string;
  photo_consent: boolean;
  privacy_consent: boolean;
  guardian_consent: boolean;
};

export type EventRegistrationField = keyof EventRegistrationFormValues;

export type EventRegistrationActionState = {
  status: "idle" | "error" | "confirmed" | "waitlisted";
  message: string;
  fieldErrors?: Partial<Record<EventRegistrationField, string>>;
  values?: EventRegistrationFormValues;
};

export const initialEventRegistrationValues: EventRegistrationFormValues = {
  first_name: "",
  last_name: "",
  birth_date: "",
  city: "",
  contact_email: "",
  contact_phone: "",
  guardian_name: "",
  guardian_email: "",
  guardian_phone: "",
  accessibility_needs: "",
  photo_consent: false,
  privacy_consent: false,
  guardian_consent: false,
};

export const initialEventRegistrationState: EventRegistrationActionState = {
  status: "idle",
  message: "",
  values: initialEventRegistrationValues,
};
