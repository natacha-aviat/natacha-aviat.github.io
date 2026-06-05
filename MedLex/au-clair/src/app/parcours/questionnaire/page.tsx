"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFunnel } from "@/components/FunnelProvider";
import { BtnPrimary, BtnSecondary, FunnelShell } from "@/components/ui";
import type { Facturation, TypeRemplacement } from "@/lib/funnel-types";

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
      <div className="mb-6">
        <div className="mb-1.5 flex justify-between text-xs text-[#5f6b7a]">
          <span>Question {step + 1} sur {STEPS}</span>
          <span className="font-semibold text-[#0fa3a3]">{progress} %</span>
        </div>
        <div className="h-2 rounded-full bg-[#e8edf1]">
          <div className="h-full rounded-full bg-[#0fa3a3] transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {step === 0 && (
        <>
          <h1 className="mb-2 text-xl font-bold text-[#16314d]">Quel type de remplacement ?</h1>
          <p className="mb-4 text-sm text-[#5f6b7a]">Pas de mauvaise réponse — on adapte les clauses.</p>
          <div className="space-y-2">
            {(
              [
                ["continu", "Remplacement continu", "Du … au … sur une période déterminée"],
                ["discontinu", "Remplacement discontinu", "Certains jours ou périodes seulement"],
              ] as const
            ).map(([val, title, desc]) => (
              <button
                key={val}
                type="button"
                onClick={() =>
                  dispatch({ type: "PATCH_QUESTIONNAIRE", patch: { typeRemplacement: val } })
                }
                className={`w-full rounded-[14px] border p-4 text-left transition ${
                  q.typeRemplacement === val
                    ? "border-[#0fa3a3] bg-[#0fa3a3]/5"
                    : "border-[#e8edf1] bg-white"
                }`}
              >
                <p className="font-semibold text-[#16314d]">{title}</p>
                <p className="text-sm text-[#5f6b7a]">{desc}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <h1 className="mb-2 text-xl font-bold text-[#16314d]">
            {q.typeRemplacement === "continu" ? "Quelles dates ?" : "Quels jours / périodes ?"}
          </h1>
          <p className="mb-4 text-sm text-[#5f6b7a]">Tu pourras ajuster plus tard — sans culpabilité.</p>
          {q.typeRemplacement === "continu" ? (
            <div className="space-y-3">
              <label className="block text-sm">
                Date de début
                <input
                  type="date"
                  value={q.dateDebut}
                  onChange={(e) =>
                    dispatch({ type: "PATCH_QUESTIONNAIRE", patch: { dateDebut: e.target.value } })
                  }
                  className="mt-1 w-full rounded-[14px] border border-[#e8edf1] px-4 py-3"
                />
              </label>
              <label className="block text-sm">
                Date de fin
                <input
                  type="date"
                  value={q.dateFin}
                  onChange={(e) =>
                    dispatch({ type: "PATCH_QUESTIONNAIRE", patch: { dateFin: e.target.value } })
                  }
                  className="mt-1 w-full rounded-[14px] border border-[#e8edf1] px-4 py-3"
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
              className="w-full rounded-[14px] border border-[#e8edf1] px-4 py-3 text-base"
            />
          )}
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="mb-2 text-xl font-bold text-[#16314d]">Comment tu factures ?</h1>
          <p className="mb-4 text-sm text-[#5f6b7a]">On t&apos;explique l&apos;impact de chaque option.</p>
          <div className="space-y-2">
            {(
              [
                ["directe", "Facturation directe", "Tu factures toi-même pendant le remplacement"],
                ["via-remplace", "Via la CPS du remplacé", "Le remplacé facture pour toi"],
              ] as const
            ).map(([val, title, desc]) => (
              <button
                key={val}
                type="button"
                onClick={() =>
                  dispatch({
                    type: "PATCH_QUESTIONNAIRE",
                    patch: { facturation: val as Facturation },
                  })
                }
                className={`w-full rounded-[14px] border p-4 text-left ${
                  q.facturation === val ? "border-[#0fa3a3] bg-[#0fa3a3]/5" : "border-[#e8edf1] bg-white"
                }`}
              >
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-[#5f6b7a]">{desc}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h1 className="mb-2 text-xl font-bold text-[#16314d]">Une redevance au remplacé ?</h1>
          <div className="flex gap-2">
            {(["oui", "non"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => dispatch({ type: "PATCH_QUESTIONNAIRE", patch: { redevance: v } })}
                className={`flex-1 rounded-[14px] border py-3 font-semibold capitalize ${
                  q.redevance === v ? "border-[#0fa3a3] bg-[#0fa3a3]/5" : "border-[#e8edf1] bg-white"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <h1 className="mb-2 text-xl font-bold text-[#16314d]">Qui es-tu dans ce contrat ?</h1>
          <label className="mb-3 block text-sm">
            Ton nom (remplaçant·e)
            <input
              value={q.nomRemplacant}
              onChange={(e) =>
                dispatch({ type: "PATCH_QUESTIONNAIRE", patch: { nomRemplacant: e.target.value } })
              }
              placeholder="Marie Dupont"
              className="mt-1 w-full rounded-[14px] border border-[#e8edf1] px-4 py-3"
            />
          </label>
          <label className="block text-sm">
            Infirmier·ère remplacé·e
            <input
              value={q.nomRemplace}
              onChange={(e) =>
                dispatch({ type: "PATCH_QUESTIONNAIRE", patch: { nomRemplace: e.target.value } })
              }
              className="mt-1 w-full rounded-[14px] border border-[#e8edf1] px-4 py-3"
            />
          </label>
        </>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <BtnSecondary onClick={back}>Retour</BtnSecondary>
        <BtnPrimary onClick={next}>{step === STEPS - 1 ? "Voir l'aperçu" : "Continuer"}</BtnPrimary>
      </div>
    </FunnelShell>
  );
}
