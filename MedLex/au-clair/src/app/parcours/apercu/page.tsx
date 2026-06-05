"use client";

import { useRouter } from "next/navigation";
import { CLAUSE_BENEFITS } from "@/lib/demo-data";
import { BtnPrimary, FunnelShell, LockedClausePreview, TrustBadge } from "@/components/ui";

export default function ApercuPage() {
  const router = useRouter();

  return (
    <FunnelShell step={4} backHref="/parcours/questionnaire">
      <h1 className="mb-2 text-2xl font-bold text-[#16314d]">Ce que ton contrat te apporte</h1>
      <p className="mb-4 text-sm text-[#5f6b7a]">
        On te montre le bénéfice de chaque clause — le texte juridique exact se débloque après paiement.
      </p>
      <TrustBadge />

      <div className="mt-6 space-y-3">
        {CLAUSE_BENEFITS.map((c) => (
          <article key={c.id} className="rounded-[14px] border border-[#e8edf1] bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-[#16314d]">{c.title}</h2>
            <p className="mt-1 text-sm text-[#5f6b7a]">{c.benefit}</p>
            <LockedClausePreview />
          </article>
        ))}
      </div>

      <div className="mt-8">
        <BtnPrimary onClick={() => router.push("/parcours/invitation")}>Continuer</BtnPrimary>
      </div>
    </FunnelShell>
  );
}
