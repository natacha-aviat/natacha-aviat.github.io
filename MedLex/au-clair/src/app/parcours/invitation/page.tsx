"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useFunnel } from "@/components/FunnelProvider";
import {
  BtnPrimary,
  BtnSecondary,
  FunnelShell,
  SimulateBar,
  StatusBadge,
} from "@/components/ui";

export default function InvitationPage() {
  const router = useRouter();
  const { state, dispatch } = useFunnel();
  const [email, setEmail] = useState(state.otherParty.email);
  const waiting = state.invitationSent && !state.thirdPartyValidated;

  function onInvite(e: FormEvent) {
    e.preventDefault();
    dispatch({ type: "SET_OTHER_PARTY", party: { email } });
    dispatch({ type: "SEND_INVITATION" });
  }

  if (waiting) {
    return (
      <>
        <FunnelShell step={5} backHref="/parcours/apercu">
          <div className="text-center">
            <p className="mb-2 text-3xl text-[#34c759]" aria-hidden>
              ✓
            </p>
            <h1 className="mb-2 text-2xl font-bold text-[#16314d]">Invitation envoyée</h1>
            <StatusBadge status="en-attente-tiers" />
            <p className="mt-4 text-sm text-[#5f6b7a]">
              En attente de validation de <strong>{state.otherParty.name}</strong> (
              {state.otherParty.email || "email"}). Elle remplit ses infos elle-même — avant tout
              paiement.
            </p>
            <BtnPrimary className="mt-8" onClick={() => router.push("/parcours/paiement")}>
              Continuer (maquette)
            </BtnPrimary>
          </div>
        </FunnelShell>
        <SimulateBar
          actions={[
            {
              label: "Simuler : elle a validé",
              onClick: () => {
                dispatch({ type: "SIMULATE_THIRD_VALIDATED" });
                router.push("/parcours/paiement");
              },
            },
          ]}
        />
      </>
    );
  }

  return (
    <FunnelShell step={5} backHref="/parcours/apercu">
      <h1 className="mb-2 text-2xl font-bold text-[#16314d]">Inviter l&apos;autre partie</h1>
      <p className="mb-4 text-sm text-[#5f6b7a]">
        Elle remplit ses infos elle-même et valide qu&apos;elle est d&apos;accord — avant tout paiement.
      </p>

      <div className="mb-6 rounded-[14px] border border-[#e8edf1] bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#0fa3a3]">Récap</p>
        <p className="mt-1 font-semibold text-[#16314d]">{state.otherParty.name}</p>
        <p className="text-sm text-[#5f6b7a]">Rôle : {state.otherParty.role}</p>
        <p className="mt-2 text-sm text-[#5f6b7a]">
          Contrat de remplacement · {state.questionnaire.typeRemplacement || "—"}
        </p>
      </div>

      <form onSubmit={onInvite} className="space-y-4">
        <label className="block text-sm">
          Email de l&apos;autre partie
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="collegue@email.com"
            className="mt-1 w-full rounded-[14px] border border-[#e8edf1] px-4 py-3.5"
          />
        </label>
        <BtnPrimary type="submit">Inviter</BtnPrimary>
        <BtnSecondary href="/parcours/apercu">Retour à l&apos;aperçu</BtnSecondary>
      </form>
    </FunnelShell>
  );
}
