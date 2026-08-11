"use client";

import { useActionState } from "react";
import { signInAdmin } from "@/app/admin/actions";
import { ActionMessage } from "@/components/admin/action-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { initialAdminActionState } from "@/lib/admin-action-state";

export function LoginForm() {
  const [state, action] = useActionState(signInAdmin, initialAdminActionState);

  return (
    <form className="admin-login-form" action={action}>
      <label>
        <span>Adresse e-mail</span>
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        <span>Mot de passe</span>
        <input name="password" type="password" autoComplete="current-password" minLength={8} required />
      </label>
      <ActionMessage state={state} />
      <SubmitButton pendingLabel="Connexion…">Se connecter <span aria-hidden="true">→</span></SubmitButton>
    </form>
  );
}
