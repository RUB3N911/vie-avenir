export type EventRegistrationActionState = {
  status: "idle" | "error" | "confirmed" | "waitlisted";
  message: string;
};

export const initialEventRegistrationState: EventRegistrationActionState = {
  status: "idle",
  message: "",
};
