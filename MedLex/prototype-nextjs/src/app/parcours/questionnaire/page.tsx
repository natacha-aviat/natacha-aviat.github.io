"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFunnel } from "@/components/FunnelProvider";
import { BtnPrimary, BtnSecondary, ChoiceButton, FunnelShell, YesNoRow } from "@/components/ui";
import type { Facturation, QuestionnaireData } from "@/lib/funnel-types";

const STEPS = 13;

function patch(
  dispatch: ReturnType<typeof useFunnel>["dispatch"],
  p: Partial<QuestionnaireData>
) {
  dispatch({ type: "PATCH_QUESTIONNAIRE", patch: p });
}

export default function QuestionnairePage() {
  const router = useRouter();
  const { state, dispatch } = useFunnel();
  const [step, setStep] = useState(0);
  const q = state.questionnaire;

  const progress = Math.round(((step + 1) / STEPS) * 100);
  const isContinu = q.typeRemplacement === "continue";

  function syncLieuFromParties(lieu: QuestionnaireData["lieu"]) {
    if (lieu === "cabinet-remplace" && q.rAdresse) {
      patch(dispatch, { adresseLieu: q.rAdresse });
    } else if (lieu === "cabinet-remplacant" && q.rpAdresse) {
      patch(dispatch, { adresseLieu: q.rpAdresse });
    }
  }

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
                ["continue", "Remplacement continu", "Du … au … sur une période déterminée"],
                ["discontinu", "Remplacement discontinu", "Certains jours ou périodes seulement"],
                ["planning", "Planning variable", "Jours ou créneaux selon un planning à préciser"],
              ] as const
            ).map(([val, title, desc]) => (
              <ChoiceButton
                key={val}
                selected={q.typeRemplacement === val}
                onClick={() => patch(dispatch, { typeRemplacement: val })}
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
            {isContinu ? "Quelles dates ?" : "Quels jours / périodes ?"}
          </h1>
          <p className="ac-microcopy ac-spacer-sm">Tu pourras ajuster plus tard — sans culpabilité.</p>
          {isContinu ? (
            <div className="ac-stack-md ac-spacer-lg">
              <label className="ac-label">
                Date de début
                <input
                  type="date"
                  value={q.dateDebut}
                  onChange={(e) => patch(dispatch, { dateDebut: e.target.value })}
                  className="ac-input"
                />
              </label>
              <label className="ac-label">
                Date de fin
                <input
                  type="date"
                  value={q.dateFin}
                  onChange={(e) => patch(dispatch, { dateFin: e.target.value })}
                  className="ac-input"
                />
              </label>
            </div>
          ) : (
            <textarea
              rows={4}
              placeholder="Ex. lundi/mercredi 7h–13h, week-end alterné…"
              value={q.periodes}
              onChange={(e) => patch(dispatch, { periodes: e.target.value })}
              className="ac-textarea ac-spacer-lg"
            />
          )}
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="ac-title ac-title--sm ac-title--page">Remplacement temporaire ?</h1>
          <p className="ac-microcopy ac-spacer-sm">
            Le contrat de remplacement doit porter sur une durée déterminée.
          </p>
          <YesNoRow
            className="ac-spacer-lg"
            value={q.temporaire}
            onChange={(v) => patch(dispatch, { temporaire: v })}
          />
          {q.temporaire === "non" && (
            <p className="ac-microcopy ac-spacer-sm">
              Un remplacement non temporaire relève d&apos;un autre cadre — on t&apos;oriente si besoin.
            </p>
          )}
        </>
      )}

      {step === 3 && (
        <>
          <h1 className="ac-title ac-title--sm ac-title--page">Motif du remplacement</h1>
          <label className="ac-label ac-spacer-lg">
            Motif principal
            <select
              value={q.motif}
              onChange={(e) => patch(dispatch, { motif: e.target.value })}
              className="ac-input"
            >
              <option value="conge-maternite">Congé maternité / paternité</option>
              <option value="maladie">Maladie ou accident</option>
              <option value="formation">Formation ou congé sabbatique</option>
              <option value="autre">Autre</option>
            </select>
          </label>
          {q.motif === "autre" && (
            <label className="ac-label">
              Précise le motif
              <input
                value={q.motifAutre}
                onChange={(e) => patch(dispatch, { motifAutre: e.target.value })}
                className="ac-input"
                placeholder="Ex. congé sans solde…"
              />
            </label>
          )}
        </>
      )}

      {step === 4 && (
        <>
          <h1 className="ac-title ac-title--sm ac-title--page">L&apos;infirmier·ère remplacé·e</h1>
          <div className="ac-stack-md ac-spacer-lg">
            <label className="ac-label">
              Civilité
              <select
                value={q.rCivilite}
                onChange={(e) => patch(dispatch, { rCivilite: e.target.value })}
                className="ac-input"
              >
                <option>Mme</option>
                <option>M.</option>
                <option>Dr</option>
              </select>
            </label>
            <label className="ac-label">
              Nom et prénom
              <input
                value={q.rNom}
                onChange={(e) => patch(dispatch, { rNom: e.target.value })}
                className="ac-input"
              />
            </label>
            <label className="ac-label">
              N° ordinal
              <input
                value={q.rOrdinal}
                onChange={(e) => patch(dispatch, { rOrdinal: e.target.value })}
                className="ac-input"
                placeholder="Ex. 75 123 456 7"
              />
            </label>
            <label className="ac-label">
              N° RPPS
              <input
                value={q.rRpps}
                onChange={(e) => patch(dispatch, { rRpps: e.target.value })}
                className="ac-input"
                placeholder="11 chiffres"
              />
            </label>
            <label className="ac-label">
              Adresse professionnelle
              <textarea
                rows={2}
                value={q.rAdresse}
                onChange={(e) => patch(dispatch, { rAdresse: e.target.value })}
                onBlur={() => q.lieu === "cabinet-remplace" && syncLieuFromParties("cabinet-remplace")}
                className="ac-textarea"
              />
            </label>
            <label className="ac-label">
              Mode d&apos;exercice
              <select
                value={q.modeExercice}
                onChange={(e) =>
                  patch(dispatch, { modeExercice: e.target.value as "seul" | "associes" })
                }
                className="ac-input"
              >
                <option value="seul">Exercice seul·e</option>
                <option value="associes">En association ou SEL</option>
              </select>
            </label>
          </div>
          {q.modeExercice !== "seul" && (
            <>
              <p className="ac-microcopy ac-spacer-sm">
                Les associé·e·s sont-ils informés et d&apos;accord ?
              </p>
              <YesNoRow
                className="ac-spacer-sm"
                value={q.associes}
                onChange={(v) => patch(dispatch, { associes: v })}
              />
              {q.associes === "non" && (
                <p className="ac-microcopy ac-spacer-sm">
                  L&apos;accord des associé·e·s est en général requis — Me Violaine peut t&apos;aider à
                  cadrer ça.
                </p>
              )}
            </>
          )}
        </>
      )}

      {step === 5 && (
        <>
          <h1 className="ac-title ac-title--sm ac-title--page">Toi, remplaçant·e</h1>
          <div className="ac-stack-md ac-spacer-lg">
            <label className="ac-label">
              Civilité
              <select
                value={q.rpCivilite}
                onChange={(e) => patch(dispatch, { rpCivilite: e.target.value })}
                className="ac-input"
              >
                <option>Mme</option>
                <option>M.</option>
              </select>
            </label>
            <label className="ac-label">
              Nom et prénom
              <input
                value={q.rpNom}
                onChange={(e) => patch(dispatch, { rpNom: e.target.value })}
                className="ac-input"
              />
            </label>
            <label className="ac-label">
              N° ordinal
              <input
                value={q.rpOrdinal}
                onChange={(e) => patch(dispatch, { rpOrdinal: e.target.value })}
                className="ac-input"
              />
            </label>
            <label className="ac-label">
              N° RPPS
              <input
                value={q.rpRpps}
                onChange={(e) => patch(dispatch, { rpRpps: e.target.value })}
                className="ac-input"
              />
            </label>
            <label className="ac-label">
              Statut
              <select
                value={q.rpStatut}
                onChange={(e) => patch(dispatch, { rpStatut: e.target.value })}
                className="ac-input"
              >
                <option>Cabinet déjà installé·e</option>
                <option>Première installation / autre situation</option>
              </select>
            </label>
            <label className="ac-label">
              Adresse professionnelle
              <textarea
                rows={2}
                value={q.rpAdresse}
                onChange={(e) => patch(dispatch, { rpAdresse: e.target.value })}
                onBlur={() => q.lieu === "cabinet-remplacant" && syncLieuFromParties("cabinet-remplacant")}
                className="ac-textarea"
              />
            </label>
            <label className="ac-label">
              Autres remplacements en cours ?
              <select
                value={q.multiRemplacements}
                onChange={(e) =>
                  patch(dispatch, { multiRemplacements: e.target.value as "un" | "plus" })
                }
                className="ac-input"
              >
                <option value="un">Un seul remplacement</option>
                <option value="plus">Plusieurs remplacements simultanés</option>
              </select>
            </label>
          </div>
          {q.multiRemplacements === "plus" && (
            <p className="ac-microcopy">
              Plusieurs remplacements en parallèle : vérifie les règles ordinales — on t&apos;alerte dans
              le contrat.
            </p>
          )}
        </>
      )}

      {step === 6 && (
        <>
          <h1 className="ac-title ac-title--sm ac-title--page">Lieu d&apos;exercice</h1>
          <div className="ac-stack-md ac-spacer-lg">
            <label className="ac-label">
              Lieu principal
              <select
                value={q.lieu}
                onChange={(e) => {
                  const lieu = e.target.value as QuestionnaireData["lieu"];
                  patch(dispatch, { lieu });
                  syncLieuFromParties(lieu);
                }}
                className="ac-input"
              >
                <option value="cabinet-remplace">Cabinet du remplacé·e</option>
                <option value="cabinet-remplacant">Cabinet du remplaçant·e</option>
                <option value="autre">Autre lieu</option>
              </select>
            </label>
            <label className="ac-label">
              Adresse du lieu
              <textarea
                rows={2}
                value={q.adresseLieu}
                onChange={(e) => patch(dispatch, { adresseLieu: e.target.value })}
                className="ac-textarea"
              />
            </label>
          </div>
        </>
      )}

      {step === 7 && (
        <>
          <h1 className="ac-title ac-title--sm ac-title--page">Organisation du remplacement</h1>
          <p className="ac-microcopy ac-spacer-sm">
            Un accord préalable sur l&apos;organisation des soins est-il prévu ?
          </p>
          <YesNoRow
            className="ac-spacer-lg"
            value={q.accord}
            onChange={(v) => patch(dispatch, { accord: v })}
          />
          {q.accord === "non" && (
            <p className="ac-microcopy">
              On te recommande de prévoir un échange avant le début — une clause le rappellera dans le
              contrat.
            </p>
          )}
        </>
      )}

      {step === 8 && (
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
                onClick={() => patch(dispatch, { facturation: val as Facturation })}
                title={title}
                description={desc}
              />
            ))}
          </div>
          {q.facturation === "via-remplace" && (
            <div className="ac-stack-md">
              <label className="ac-label">
                Tiers payant pendant le remplacement ?
                <select
                  value={q.tiersPayant}
                  onChange={(e) =>
                    patch(dispatch, { tiersPayant: e.target.value as "oui" | "non" })
                  }
                  className="ac-input"
                >
                  <option value="non">Non</option>
                  <option value="oui">Oui</option>
                </select>
              </label>
              <label className="ac-label">
                Taux de tiers payant (%)
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={q.tauxTiersPayant}
                  onChange={(e) => patch(dispatch, { tauxTiersPayant: e.target.value })}
                  className="ac-input"
                  placeholder="0"
                />
              </label>
            </div>
          )}
        </>
      )}

      {step === 9 && (
        <>
          <h1 className="ac-title ac-title--sm ac-title--page">Redevance au remplacé·e</h1>
          <YesNoRow
            className="ac-spacer-lg"
            value={q.redevance}
            onChange={(v) => patch(dispatch, { redevance: v })}
          />
          {q.redevance === "oui" && (
            <label className="ac-label ac-spacer-lg">
              Taux de redevance (%)
              <input
                type="number"
                min={0}
                max={100}
                value={q.tauxRedevance}
                onChange={(e) => patch(dispatch, { tauxRedevance: e.target.value })}
                className="ac-input"
                placeholder="15"
              />
            </label>
          )}
          <label className="ac-label">
            Mode de règlement
            <select
              value={q.modeReglement}
              onChange={(e) => patch(dispatch, { modeReglement: e.target.value })}
              className="ac-input"
            >
              <option>Virement bancaire</option>
              <option>Chèque</option>
              <option>Autre</option>
            </select>
          </label>
        </>
      )}

      {step === 10 && (
        <>
          <h1 className="ac-title ac-title--sm ac-title--page">Délais de résiliation</h1>
          <p className="ac-microcopy ac-spacer-sm">Préavis en cas d&apos;accord mutuel ou de manquement.</p>
          <div className="ac-stack-md ac-spacer-lg">
            <label className="ac-label">
              Préavis d&apos;accord mutuel (jours)
              <input
                type="number"
                min={0}
                value={q.preavisAccord}
                onChange={(e) => patch(dispatch, { preavisAccord: e.target.value })}
                className="ac-input"
              />
            </label>
            <label className="ac-label">
              Préavis pour manquement (jours)
              <input
                type="number"
                min={0}
                value={q.preavisManquement}
                onChange={(e) => patch(dispatch, { preavisManquement: e.target.value })}
                className="ac-input"
              />
            </label>
          </div>
        </>
      )}

      {step === 11 && (
        <>
          <h1 className="ac-title ac-title--sm ac-title--page">Clause de non-concurrence</h1>
          <p className="ac-microcopy ac-spacer-sm">
            Utile si le remplacement dépasse 3 mois — on l&apos;adapte au cadre légal.
          </p>
          <YesNoRow
            className="ac-spacer-lg"
            value={q.nonconcurrence}
            onChange={(v) => patch(dispatch, { nonconcurrence: v })}
          />
        </>
      )}

      {step === 12 && (
        <>
          <h1 className="ac-title ac-title--sm ac-title--page">Annexes complémentaires ?</h1>
          <YesNoRow
            className="ac-spacer-lg"
            value={q.annexes}
            onChange={(v) => patch(dispatch, { annexes: v })}
          />
          {q.annexes === "oui" && (
            <label className="ac-label ac-spacer-lg">
              Liste ou description des annexes
              <textarea
                rows={4}
                value={q.annexesTexte}
                onChange={(e) => patch(dispatch, { annexesTexte: e.target.value })}
                className="ac-textarea"
                placeholder="Ex. liste des patients à charge, planning détaillé…"
              />
            </label>
          )}
        </>
      )}

      <div className="ac-btn-row">
        <BtnSecondary onClick={back}>Retour</BtnSecondary>
        <BtnPrimary onClick={next}>{step === STEPS - 1 ? "Voir l'aperçu" : "Continuer"}</BtnPrimary>
      </div>
    </FunnelShell>
  );
}
