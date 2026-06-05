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
        <div className="ac-centre">
          <p className="ac-emoji" aria-hidden>
            📬
          </p>
          <h1 className="ac-title ac-title--page">Vérifie ta boîte mail</h1>
          <p className="ac-microcopy ac-spacer-lg">
            On vient d&apos;envoyer un lien à{" "}
            <strong className="ac-inline-strong">{state.email || "ton adresse"}</strong>. Clique dessus
            pour continuer — ou simule ci-dessous.
          </p>
          <div className="ac-stack-sm">
            <BtnPrimary
              fullWidth
              onClick={() => {
                dispatch({ type: "VERIFY_EMAIL" });
                router.push("/parcours/questionnaire");
              }}
            >
              J&apos;ai cliqué sur le lien
            </BtnPrimary>
            <BtnSecondary href="/parcours/email" fullWidth>
              Changer d&apos;email
            </BtnSecondary>
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
