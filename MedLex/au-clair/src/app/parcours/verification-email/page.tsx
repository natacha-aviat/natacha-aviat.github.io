"use client";

import { useRouter } from "next/navigation";
import { useFunnel } from "@/components/FunnelProvider";
import { BtnPrimary, BtnSecondary, FunnelShell, SimulateBar } from "@/components/ui";

export default function VerificationEmailPage() {
  const router = useRouter();
  const { state, dispatch } = useFunnel();

  return (
    <>
      <FunnelShell step={2} backHref="/parcours/email">
        <div className="text-center">
          <p className="mb-2 text-4xl" aria-hidden>
            📬
          </p>
          <h1 className="mb-2 text-2xl font-bold text-[#16314d]">Vérifie ta boîte mail</h1>
          <p className="mb-6 text-sm text-[#5f6b7a]">
            On vient d&apos;envoyer un lien à{" "}
            <strong className="text-[#16314d]">{state.email || "ton adresse"}</strong>. Clique dessus
            pour continuer — ou simule ci-dessous.
          </p>
          <div className="flex flex-col gap-3">
            <BtnPrimary
              onClick={() => {
                dispatch({ type: "VERIFY_EMAIL" });
                router.push("/parcours/questionnaire");
              }}
            >
              J&apos;ai cliqué sur le lien
            </BtnPrimary>
            <BtnSecondary href="/parcours/email">Changer d&apos;email</BtnSecondary>
          </div>
        </div>
      </FunnelShell>
      <SimulateBar
        actions={[
          {
            label: "Simuler : lien expiré",
            onClick: () => {
              dispatch({ type: "SET_MAGIC_LINK_EXPIRED", expired: true });
              router.push("/parcours/lien-expire");
            },
          },
        ]}
      />
    </>
  );
}
