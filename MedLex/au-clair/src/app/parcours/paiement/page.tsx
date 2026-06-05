"use client";

import { useRouter } from "next/navigation";
import { useFunnel } from "@/components/FunnelProvider";
import {
  BtnPrimary,
  ChoiceButton,
  FunnelShell,
  SimulateBar,
  StatusBadge,
} from "@/components/ui";
import type { PaymentMode } from "@/lib/funnel-types";

export default function PaiementPage() {
  const router = useRouter();
  const { state, dispatch } = useFunnel();

  const paid = state.userPaid && state.otherPaid;
  const partial = state.userPaid || state.otherPaid;

  return (
    <>
      <FunnelShell step={6} backHref="/parcours/invitation">
        <h1 className="ac-title ac-title--page">Paiement partageable</h1>
        <p className="ac-microcopy ac-spacer-sm">
          Peu importe qui paie en premier — l&apos;autre peut régler sa part ensuite.
        </p>

        {state.refundTriggered && (
          <div className="ac-alert ac-alert--danger">
            <StatusBadge status="rembourse" />
            <p>Délai d&apos;1 mois dépassé : remboursement automatique simulé.</p>
          </div>
        )}

        {partial && !paid && !state.refundTriggered && (
          <div className="ac-alert ac-alert--info">
            <StatusBadge status="en-attente-paiement" />
            <p>
              {state.userPaid ? "Tu as payé" : "L'autre partie a payé"} — en attente de l&apos;autre
              règlement.
            </p>
          </div>
        )}

        <div className="ac-highlight">
          <p>
            Si l&apos;autre partie n&apos;a pas réglé sous 1 mois, on te rembourse automatiquement.
          </p>
        </div>

        <p className="ac-price">Montant : 29 € TTC / contrat</p>

        <div className="ac-stack-sm ac-spacer-lg">
          {(
            [
              ["ma-part", "Je paie ma part", "14,50 € — ta moitié du contrat"],
              ["tout", "Je paie tout", "29 € — tu règles les deux parts d'un coup"],
            ] as const
          ).map(([mode, title, desc]) => (
            <ChoiceButton
              key={mode}
              selected={state.paymentMode === mode}
              onClick={() => dispatch({ type: "SET_PAYMENT_MODE", mode: mode as PaymentMode })}
              title={title}
              description={desc}
            />
          ))}
        </div>

        <BtnPrimary
          fullWidth
          disabled={!state.paymentMode || state.refundTriggered}
          onClick={() => {
            if (state.paymentMode === "tout") {
              dispatch({ type: "SIMULATE_PAY", who: "both" });
            } else {
              dispatch({ type: "SIMULATE_PAY", who: "user" });
            }
            router.push("/parcours/signature");
          }}
        >
          Payer (simulation)
        </BtnPrimary>

        <p className="ac-microcopy--xs">Aucun paiement réel — Stripe viendra plus tard.</p>
      </FunnelShell>
      <SimulateBar
        actions={[
          {
            label: "Simuler : l'autre a payé",
            onClick: () => dispatch({ type: "SIMULATE_PAY", who: "other" }),
          },
          {
            label: "Simuler : remboursement 1 mois",
            onClick: () => dispatch({ type: "SIMULATE_REFUND" }),
          },
        ]}
      />
    </>
  );
}
