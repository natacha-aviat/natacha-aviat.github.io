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
          <div className="ac-centre">
            <p className="ac-emoji ac-emoji--ok" aria-hidden>
              ✓
            </p>
            <h1 className="ac-title ac-title--page">Invitation envoyée</h1>
            <StatusBadge status="en-attente-tiers" />
            <p className="ac-microcopy ac-spacer-lg">
              En attente de validation de <strong className="ac-inline-strong">{state.otherParty.name}</strong>{" "}
              ({state.otherParty.email || "email"}). Elle remplit ses infos elle-même — avant tout
              paiement.
            </p>
            <BtnPrimary fullWidth className="ac-spacer-lg" onClick={() => router.push("/parcours/paiement")}>
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
      <h1 className="ac-title ac-title--page">Inviter l&apos;autre partie</h1>
      <p className="ac-microcopy ac-spacer-sm">
        Elle remplit ses infos elle-même et valide qu&apos;elle est d&apos;accord — avant tout paiement.
      </p>

      <div className="ac-card ac-card--flat ac-spacer-lg">
        <p className="ac-card__kicker">Récap</p>
        <p className="ac-card__title ac-spacer-top">{state.otherParty.name}</p>
        <p className="ac-card__desc">Rôle : {state.otherParty.role}</p>
        <p className="ac-card__meta">
          Contrat de remplacement · {state.questionnaire.typeRemplacement || "—"}
        </p>
      </div>

      <form onSubmit={onInvite} className="ac-form">
        <label className="ac-label">
          Email de l&apos;autre partie
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="collegue@email.com"
            className="ac-input"
          />
        </label>
        <BtnPrimary type="submit" fullWidth>
          Inviter
        </BtnPrimary>
        <BtnSecondary href="/parcours/apercu" fullWidth>
          Retour à l&apos;aperçu
        </BtnSecondary>
      </form>
    </FunnelShell>
  );
}
