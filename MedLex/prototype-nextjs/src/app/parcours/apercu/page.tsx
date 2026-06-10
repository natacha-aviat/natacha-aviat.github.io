"use client";

import { useRouter } from "next/navigation";
import { CLAUSE_BENEFITS } from "@/lib/demo-data";
import { BtnPrimary, FunnelShell, LockedClausePreview, TrustBadge } from "@/components/ui";

export default function ApercuPage() {
  const router = useRouter();

  return (
    <FunnelShell step={4} backHref="/parcours/questionnaire">
      <h1 className="ac-title ac-title--page">Ce qui sera dans ton contrat</h1>
      <p className="ac-microcopy ac-spacer-sm">
        On te montre le bénéfice de chaque clause — le texte juridique exact se débloque après paiement.
      </p>
      <div className="ac-spacer-sm">
        <TrustBadge />
      </div>

      <div className="ac-clause-list">
        {CLAUSE_BENEFITS.map((c) => (
          <article key={c.id} className="ac-card">
            <h2 className="ac-card__title">{c.title}</h2>
            <p className="ac-card__desc">{c.benefit}</p>
            <LockedClausePreview />
          </article>
        ))}
      </div>

      <div className="ac-spacer-lg">
        <BtnPrimary fullWidth onClick={() => router.push("/parcours/invitation")}>
          Continuer
        </BtnPrimary>
      </div>
    </FunnelShell>
  );
}
