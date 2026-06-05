"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFunnel } from "@/components/FunnelProvider";
import { BtnPrimary, BtnSecondary, ChoiceButton, FunnelShell } from "@/components/ui";
import type { Facturation } from "@/lib/funnel-types";

const STEPS = 5;

export default function QuestionnairePage() {
  const router = useRouter();
  const { state, dispatch } = useFunnel();
  const [step, setStep] = useState(0);
  const q = state.questionnaire;

  const progress = Math.round(((step + 1) / STEPS) * 100);

  function next() {
    if (step < STEPS - 1) setStep(step + 1);
    else router.push("/parcours/apercu");
  }

  function back() {
    if (step > 0) setStep(step - 1);
    else router.push("/parcours/verification-email");
  }

  return (
    <FunnelShell step={3} backHref={step === 0 ? "/parcours/verification-email" : undefined}>
      <div className="ac-progress">
        <div className="ac-progress__meta">
          <span>
            Question {step + 1} sur {STEPS}
          </span>
          <span className="ac-progress__pct">{progress} %</span>
        </div>
        <div className="ac-progress__track">
          <div className="ac-progress__fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {step === 0 && (
        <>
          <h1 className="ac-title ac-title--sm ac-title--page">Quel type de remplacement ?</h1>
          <p className="ac-microcopy ac-spacer-sm">Pas de mauvaise réponse — on adapte les clauses.</p>
          <div className="ac-stack-sm ac-spacer-lg">
            {(
              [
                ["continu", "Remplacement continu", "Du … au … sur une période déterminée"],
                ["discontinu", "Remplacement discontinu", "Certains jours ou périodes seulement"],
              ] as const
            ).map(([val, title, desc]) => (
              <ChoiceButton
                key={val}
                selected={q.typeRemplacement === val}
                onClick={() =>
                  dispatch({ type: "PATCH_QUESTIONNAIRE", patch: { typeRemplacement: val } })
                }
                title={title}
                description={desc}
              />
            ))}
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <h1 className="ac-title ac-title--sm ac-title--page">
            {q.typeRemplacement === "continu" ? "Quelles dates ?" : "Quels jours / périodes ?"}
          </h1>
          <p className="ac-microcopy ac-spacer-sm">Tu pourras ajuster plus tard — sans culpabilité.</p>
          {q.typeRemplacement === "continu" ? (
            <div className="ac-stack-md ac-spacer-lg">
              <label className="ac-label">
                Date de début
                <input
                  type="date"
                  value={q.dateDebut}
                  onChange={(e) =>
                    dispatch({ type: "PATCH_QUESTIONNAIRE", patch: { dateDebut: e.target.value } })
                  }
                  className="ac-input"
                />
              </label>
              <label className="ac-label">
                Date de fin
                <input
                  type="date"
                  value={q.dateFin}
                  onChange={(e) =>
                    dispatch({ type: "PATCH_QUESTIONNAIRE", patch: { dateFin: e.target.value } })
                  }
                  className="ac-input"
                />
              </label>
            </div>
          ) : (
            <textarea
              rows={4}
              placeholder="Ex. lundi/mercredi 7h–13h, week-end alterné…"
              value={q.periodes}
              onChange={(e) =>
                dispatch({ type: "PATCH_QUESTIONNAIRE", patch: { periodes: e.target.value } })
              }
              className="ac-textarea ac-spacer-lg"
            />
          )}
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="ac-title ac-title--sm ac-title--page">Comment tu factures ?</h1>
          <p className="ac-microcopy ac-spacer-sm">On t&apos;explique l&apos;impact de chaque option.</p>
          <div className="ac-stack-sm ac-spacer-lg">
            {(
              [
                ["directe", "Facturation directe", "Tu factures toi-même pendant le remplacement"],
                ["via-remplace", "Via la CPS du remplacé", "Le remplacé facture pour toi"],
              ] as const
            ).map(([val, title, desc]) => (
              <ChoiceButton
                key={val}
                selected={q.facturation === val}
                onClick={() =>
                  dispatch({
                    type: "PATCH_QUESTIONNAIRE",
                    patch: { facturation: val as Facturation },
                  })
                }
                title={title}
                description={desc}
              />
            ))}
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h1 className="ac-title ac-title--sm ac-title--page">Une redevance au remplacé ?</h1>
          <div className="ac-choice-row ac-spacer-lg">
            {(["oui", "non"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => dispatch({ type: "PATCH_QUESTIONNAIRE", patch: { redevance: v } })}
                className={`ac-choice${q.redevance === v ? " ac-choice--selected" : ""}`}
              >
                {v}
              </button>
            ))}
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <h1 className="ac-title ac-title--sm ac-title--page">Qui es-tu dans ce contrat ?</h1>
          <div className="ac-stack-md ac-spacer-lg">
            <label className="ac-label">
              Ton nom (remplaçant·e)
              <input
                value={q.nomRemplacant}
                onChange={(e) =>
                  dispatch({ type: "PATCH_QUESTIONNAIRE", patch: { nomRemplacant: e.target.value } })
                }
                placeholder="Marie Dupont"
                className="ac-input"
              />
            </label>
            <label className="ac-label">
              Infirmier·ère remplacé·e
              <input
                value={q.nomRemplace}
                onChange={(e) =>
                  dispatch({ type: "PATCH_QUESTIONNAIRE", patch: { nomRemplace: e.target.value } })
                }
                className="ac-input"
              />
            </label>
          </div>
        </>
      )}

      <div className="ac-btn-row">
        <BtnSecondary onClick={back}>Retour</BtnSecondary>
        <BtnPrimary onClick={next}>{step === STEPS - 1 ? "Voir l'aperçu" : "Continuer"}</BtnPrimary>
      </div>
    </FunnelShell>
  );
}
