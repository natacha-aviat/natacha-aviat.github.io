"use client";

import { useRouter } from "next/navigation";
import { useFunnel } from "@/components/FunnelProvider";
import { BtnPrimary, FunnelShell, SimulateBar } from "@/components/ui";

export default function SignaturePage() {
  const router = useRouter();
  const { state, dispatch } = useFunnel();
  const done = state.userSigned && state.otherSigned;

  return (
    <>
      <FunnelShell step={8} backHref="/parcours/contrat" total={9}>
        {done ? (
          <div className="ac-centre">
            <p className="ac-emoji ac-emoji--ok" aria-hidden>
              ✓
            </p>
            <h1 className="ac-title ac-title--page">Contrat signé</h1>
            <p className="ac-microcopy ac-spacer-lg">Il est dans ton tableau de bord.</p>
            <BtnPrimary href="/parcours/tableau-de-bord" fullWidth>
              Voir mon tableau de bord
            </BtnPrimary>
          </div>
        ) : (
          <>
            <h1 className="ac-title ac-title--page">Signature électronique</h1>
            <p className="ac-microcopy ac-spacer-lg">
              Signature simulée — DocuSign / Yousign viendront plus tard.
            </p>

            <div className="ac-signatures">
              <div className="ac-card ac-card--flat">
                <p className="ac-card__title">Toi</p>
                <p className="ac-card__desc">
                  {state.questionnaire.rpNom || "Remplaçant·e"} ·{" "}
                  {state.userSigned ? (
                    <span className="ac-status-ok">Signé ✓</span>
                  ) : (
                    <span className="ac-status-warn">À signer</span>
                  )}
                </p>
              </div>
              <div className="ac-card ac-card--flat">
                <p className="ac-card__title">{state.otherParty.name}</p>
                <p className="ac-card__desc">
                  {state.otherParty.role} ·{" "}
                  {state.otherSigned ? (
                    <span className="ac-status-ok">Signé ✓</span>
                  ) : (
                    <span className="ac-status-muted">En attente</span>
                  )}
                </p>
              </div>
            </div>

            <div className="ac-sign-pad">
              <p>Zone de signature (simulation)</p>
              <p className="ac-sign-pad__fake">{state.questionnaire.rpNom || "Marie Dupont"}</p>
            </div>

            {!state.userSigned && (
              <BtnPrimary
                fullWidth
                className="ac-spacer-lg"
                onClick={() => dispatch({ type: "SIMULATE_SIGN", who: "user" })}
              >
                Signer (simulation)
              </BtnPrimary>
            )}
          </>
        )}
      </FunnelShell>
      {!done && (
        <SimulateBar
          actions={[
            {
              label: "Simuler : l'autre a signé",
              onClick: () => dispatch({ type: "SIMULATE_SIGN", who: "other" }),
            },
            {
              label: "Simuler : les deux ont signé",
              onClick: () => {
                dispatch({ type: "SIMULATE_SIGN", who: "both" });
                router.push("/parcours/tableau-de-bord");
              },
            },
          ]}
        />
      )}
    </>
  );
}
