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
      <FunnelShell step={7} backHref="/parcours/paiement">
        {done ? (
          <div className="text-center">
            <p className="mb-2 text-4xl text-[#34c759]" aria-hidden>
              ✓
            </p>
            <h1 className="mb-2 text-2xl font-bold text-[#16314d]">Contrat signé</h1>
            <p className="mb-6 text-sm text-[#5f6b7a]">Il est dans ton tableau de bord.</p>
            <BtnPrimary href="/parcours/tableau-de-bord">Voir mon tableau de bord</BtnPrimary>
          </div>
        ) : (
          <>
            <h1 className="mb-2 text-2xl font-bold text-[#16314d]">Signature électronique</h1>
            <p className="mb-6 text-sm text-[#5f6b7a]">
              Signature simulée — DocuSign / Yousign viendront plus tard.
            </p>

            <div className="space-y-3">
              <div className="rounded-[14px] border border-[#e8edf1] bg-white p-4">
                <p className="text-sm font-semibold text-[#16314d]">Toi</p>
                <p className="text-sm text-[#5f6b7a]">
                  {state.questionnaire.nomRemplacant || "Remplaçant·e"} ·{" "}
                  {state.userSigned ? (
                    <span className="font-semibold text-[#34c759]">Signé ✓</span>
                  ) : (
                    <span className="text-amber-600">À signer</span>
                  )}
                </p>
              </div>
              <div className="rounded-[14px] border border-[#e8edf1] bg-white p-4">
                <p className="text-sm font-semibold text-[#16314d]">{state.otherParty.name}</p>
                <p className="text-sm text-[#5f6b7a]">
                  {state.otherParty.role} ·{" "}
                  {state.otherSigned ? (
                    <span className="font-semibold text-[#34c759]">Signé ✓</span>
                  ) : (
                    <span className="text-[#5f6b7a]">En attente</span>
                  )}
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[14px] border-2 border-dashed border-[#e8edf1] bg-[#fbfcfd] p-8 text-center">
              <p className="text-sm text-[#5f6b7a]">Zone de signature (simulation)</p>
              <p className="mt-2 font-serif text-2xl italic text-[#16314d]/40">Marie Dupont</p>
            </div>

            {!state.userSigned && (
              <BtnPrimary
                className="mt-6"
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
