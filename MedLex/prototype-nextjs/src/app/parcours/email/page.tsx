"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useFunnel } from "@/components/FunnelProvider";
import { BtnPrimary, FunnelShell } from "@/components/ui";

export default function EmailPage() {
  const router = useRouter();
  const { state, dispatch } = useFunnel();
  const [email, setEmail] = useState(state.email);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    dispatch({ type: "SET_EMAIL", email: email.trim() });
    router.push("/parcours/verification-email");
  }

  return (
    <FunnelShell step={1} backHref="/">
      <h1 className="ac-title ac-title--page">Ton email</h1>
      <p className="ac-microcopy ac-spacer-sm">
        On t&apos;envoie un lien magique, pas de mot de passe à retenir.
      </p>
      <form onSubmit={onSubmit} className="ac-form ac-spacer-lg">
        <label className="ac-label">
          <span>Adresse email</span>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="prenom.nom@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="ac-input"
          />
        </label>
        <BtnPrimary type="submit" fullWidth>
          Continuer
        </BtnPrimary>
      </form>
      <p className="ac-microcopy--xs">Aucun email réel n&apos;est envoyé dans cette maquette.</p>
    </FunnelShell>
  );
}
