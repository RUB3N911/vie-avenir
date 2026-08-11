export type AdminActionState = {
  status: "idle" | "error" | "success";
  message: string;
};

export const initialAdminActionState: AdminActionState = {
  status: "idle",
  message: "",
};
