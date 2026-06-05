"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
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
      <h1 className="mb-2 text-2xl font-bold text-[#16314d]">Ton email</h1>
      <p className="mb-6 text-sm text-[#5f6b7a]">
        On t&apos;envoie un lien magique, pas de mot de passe à retenir.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-[#16314d]">Adresse email</span>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="prenom.nom@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-[14px] border border-[#e8edf1] bg-white px-4 py-3.5 text-base outline-none ring-[#0fa3a3] focus:ring-2"
          />
        </label>
        <BtnPrimary type="submit">Continuer</BtnPrimary>
      </form>
      <p className="mt-4 text-xs text-[#5f6b7a]">
        Aucun email réel n&apos;est envoyé dans cette maquette.
      </p>
    </FunnelShell>
  );
}
