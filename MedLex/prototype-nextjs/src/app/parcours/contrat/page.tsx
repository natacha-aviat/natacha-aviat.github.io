"use client";

import { useRouter } from "next/navigation";
import { useFunnel } from "@/components/FunnelProvider";
import { BtnPrimary, BtnSecondary, FunnelShell } from "@/components/ui";
import { CONTRACT_ARTICLES } from "@/lib/demo-data";
import { typeRemplacementLabel } from "@/lib/funnel-types";

export default function ContratPage() {
  const router = useRouter();
  const { state } = useFunnel();
  const remplacant = state.questionnaire.rpNom || state.questionnaire.nomRemplacant || "Marie Dupont";
  const remplace = state.questionnaire.rNom || state.otherParty.name;

  return (
    <FunnelShell step={7} backHref="/parcours/paiement" total={9}>
      <h1 className="ac-title ac-title--page">Ton contrat</h1>
      <p className="ac-microcopy ac-spacer-sm">
        Paiement confirmé — tu peux relire le texte intégral avant de passer à la signature.
      </p>
      <span className="ac-unlocked-badge">✓ Texte complet débloqué</span>

      <div className="ac-contract-doc" tabIndex={0} aria-label="Aperçu du contrat de remplacement">
        <p className="ac-contract-doc__title">Contrat de remplacement infirmier libéral</p>
        <p className="ac-contract-doc__subtitle">
          Entre {remplacant} et {remplace} ·{" "}
          Remplacement {typeRemplacementLabel(state.questionnaire.typeRemplacement)}
        </p>
        {CONTRACT_ARTICLES.map((article) => (
          <article key={article.title} className="ac-contract-doc__article">
            <h2>{article.title}</h2>
            <p>{article.body}</p>
          </article>
        ))}
      </div>

      <div className="ac-btn-row ac-btn-row--stack">
        <BtnSecondary
          fullWidth
          onClick={() => alert("Téléchargement PDF simulé — génération réelle à venir.")}
        >
          Télécharger le PDF (simulation)
        </BtnSecondary>
        <BtnPrimary fullWidth onClick={() => router.push("/parcours/signature")}>
          Passer à la signature
        </BtnPrimary>
      </div>
      <p className="ac-microcopy--xs">Maquette — aucun PDF réel n&apos;est généré.</p>
    </FunnelShell>
  );
}
