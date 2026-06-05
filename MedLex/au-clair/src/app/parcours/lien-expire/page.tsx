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
      <div className="text-center">
        <p className="mb-2 text-4xl" aria-hidden>
          ⏱
        </p>
        <h1 className="mb-2 text-2xl font-bold text-[#16314d]">Ce lien a expiré</h1>
        <p className="mb-6 text-sm text-[#5f6b7a]">
          Pas de panique — on t&apos;en renvoie un tout de suite. Clique ci-dessous pour simuler le
          renvoi.
        </p>
        <BtnPrimary
          onClick={() => {
            dispatch({ type: "SET_MAGIC_LINK_EXPIRED", expired: false });
            dispatch({ type: "VERIFY_EMAIL" });
            router.push("/parcours/questionnaire");
          }}
        >
          Renvoyer un lien (simulation)
        </BtnPrimary>
        <Link
          href="/parcours/email"
          className="mt-4 block text-sm font-medium text-[#0fa3a3]"
        >
          Recommencer avec un autre email
        </Link>
      </div>
    </FunnelShell>
  );
}
