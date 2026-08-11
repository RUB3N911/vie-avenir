import type { AdminActionState } from "@/lib/admin-action-state";

export function ActionMessage({ state }: { state: AdminActionState }) {
  if (state.status === "idle") return null;
  return (
    <p className={`admin-form-message is-${state.status}`} role="status" aria-live="polite">
      {state.message}
    </p>
  );
}
