"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFunnel } from "@/components/FunnelProvider";
import { BtnPrimary, FunnelShell } from "@/components/ui";

export default function LienExpirePage() {
  const router = useRouter();
  const { dispatch } = useFunnel();

  return (
    <FunnelShell backHref="/parcours/verification-email">
      <div className="ac-centre">
        <p className="ac-emoji" aria-hidden>
          ⏱
        </p>
        <h1 className="ac-title ac-title--page">Ce lien a expiré</h1>
        <p className="ac-microcopy ac-spacer-lg">
          Pas de panique — on t&apos;en renvoie un tout de suite. Clique ci-dessous pour simuler le
          renvoi.
        </p>
        <BtnPrimary
          fullWidth
          onClick={() => {
            dispatch({ type: "SET_MAGIC_LINK_EXPIRED", expired: false });
            dispatch({ type: "VERIFY_EMAIL" });
            router.push("/parcours/questionnaire");
          }}
        >
          Renvoyer un lien (simulation)
        </BtnPrimary>
        <Link href="/parcours/email" className="ac-link ac-link--block">
          Recommencer avec un autre email
        </Link>
      </div>
    </FunnelShell>
  );
}
