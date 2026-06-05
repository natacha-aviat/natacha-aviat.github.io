"use client";

import { useRouter } from "next/navigation";
import { useFunnel } from "@/components/FunnelProvider";
import {
  BtnPrimary,
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
        <h1 className="mb-2 text-2xl font-bold text-[#16314d]">Paiement partageable</h1>
        <p className="mb-2 text-sm text-[#5f6b7a]">
          Peu importe qui paie en premier — l&apos;autre peut régler sa part ensuite.
        </p>

        {state.refundTriggered && (
          <div className="mb-4 rounded-[14px] border border-red-200 bg-red-50 p-3">
            <StatusBadge status="rembourse" />
            <p className="mt-2 text-sm text-red-800">
              Délai d&apos;1 mois dépassé : remboursement automatique simulé.
            </p>
          </div>
        )}

        {partial && !paid && !state.refundTriggered && (
          <div className="mb-4 rounded-[14px] border border-blue-200 bg-blue-50 p-3">
            <StatusBadge status="en-attente-paiement" />
            <p className="mt-2 text-sm text-blue-900">
              {state.userPaid ? "Tu as payé" : "L'autre partie a payé"} — en attente de l&apos;autre
              règlement.
            </p>
          </div>
        )}

        <div className="mb-4 rounded-[14px] border-2 border-[#0fa3a3]/30 bg-[#0fa3a3]/5 p-4">
          <p className="text-sm font-semibold text-[#16314d]">
            Si l&apos;autre partie n&apos;a pas réglé sous 1 mois, on te rembourse automatiquement.
          </p>
        </div>

        <p className="mb-3 text-sm font-semibold text-[#16314d]">Montant : 29 € TTC / contrat</p>

        <div className="mb-6 space-y-2">
          {(
            [
              ["ma-part", "Je paie ma part", "14,50 € — ta moitié du contrat"],
              ["tout", "Je paie tout", "29 € — tu règles les deux parts d'un coup"],
            ] as const
          ).map(([mode, title, desc]) => (
            <button
              key={mode}
              type="button"
              onClick={() => dispatch({ type: "SET_PAYMENT_MODE", mode: mode as PaymentMode })}
              className={`w-full rounded-[14px] border p-4 text-left ${
                state.paymentMode === mode
                  ? "border-[#0fa3a3] bg-[#0fa3a3]/5"
                  : "border-[#e8edf1] bg-white"
              }`}
            >
              <p className="font-semibold">{title}</p>
              <p className="text-sm text-[#5f6b7a]">{desc}</p>
            </button>
          ))}
        </div>

        <BtnPrimary
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

        <p className="mt-4 text-center text-xs text-[#5f6b7a]">
          Aucun paiement réel — Stripe viendra plus tard.
        </p>
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
