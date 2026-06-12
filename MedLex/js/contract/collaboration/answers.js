/**
 * Lecture du questionnaire collaboration → objet réponses pour le moteur de template.
 */

import {
  $,
  val,
  formatDate,
  formatDateDuJour,
  abregeCivilite,
  extraitVilleDepuisAdresse,
} from '../utils.js';

const MOYENS_LABELS = {
  'salle-attente': "la salle d'attente",
  'salle-soins': 'la salle de soins',
  secretariat: 'le secrétariat',
  telephone: 'le téléphone',
  internet: "l'accès à internet",
  dossiers: 'les moyens de conservation des dossiers patients y compris les prescriptions',
  documentation: 'la documentation',
};

function hiddenVal(id, fallback = '') {
  const el = $(id);
  if (!el) return fallback;
  return el.value != null && String(el.value).trim() !== '' ? String(el.value).trim() : fallback;
}

function blocTemps(nbId, uniteId, periodeId) {
  const nb = val(nbId, 'Non renseigné');
  const unite = hiddenVal(uniteId, 'journees');
  const periode = hiddenVal(periodeId, 'semaine');
  const uniteLabel = unite === 'demi-journees' ? 'demi-journées' : 'journées';
  const periodeLabel = periode === 'mois' ? 'mois' : 'semaine';
  return `${nb} ${uniteLabel} par ${periodeLabel}`;
}

function moyensListe() {
  const checked = document.querySelectorAll('input[name="moyens"]:checked');
  const labels = [];
  checked.forEach(function (el) {
    const lbl = MOYENS_LABELS[el.value];
    if (lbl) labels.push(`- ${lbl}`);
  });
  const autre = val('moyens-autre');
  if (autre) labels.push(`- ${autre}`);
  return labels.length ? labels.join('\n') : 'Non renseigné';
}

/** @returns {Record<string, string|boolean>} */
export function collectAnswers() {
  const tCiv = val('t-civilite', 'M./Mme');
  const cCiv = val('c-civilite', 'M./Mme');
  const tNom = val('t-nom', 'Non renseigné');
  const cNom = val('c-nom', 'Non renseigné');

  const patienteleUnite = hiddenVal('patientele-unite', 'journees');
  const collabUnite = hiddenVal('collab-unite', 'journees');
  const forfaitMode = hiddenVal('forfait-mode', 'tour-role');
  const redevanceType = hiddenVal('redevance-type', 'pourcentage');
  const dureeType = hiddenVal('duree-type', 'indeterminee');

  const pctT = val('forfait-pct-titulaire', '50');
  const pctC = val('forfait-pct-collab', '50');

  let forfaitPctText = `${pctT} % pour ${tCiv} ${tNom}, ${pctC} % pour ${cCiv} ${cNom}`;

  const lieu = val('lieu-adresse') || val('t-adresse');
  const adressePourVille = lieu || val('t-adresse');

  const dureeDeterminee = dureeType === 'determinee';

  return {
    tCiv,
    tNom,
    tOrdinal: val('t-ordinal', 'Non renseigné'),
    tRpps: val('t-rpps', 'Non renseigné'),
    tAdresse: val('t-adresse', 'Non renseigné'),
    cCiv,
    cNom,
    cOrdinal: val('c-ordinal', 'Non renseigné'),
    cRpps: val('c-rpps', 'Non renseigné'),
    cAdresse: val('c-adresse', 'Non renseigné'),
    patienteleUnite,
    patienteleBloc: blocTemps('patientele-nb', 'patientele-unite', 'patientele-periode'),
    collabUnite,
    collabBloc: blocTemps('collab-nb', 'collab-unite', 'collab-periode'),
    lieuAdresse: lieu || 'Non renseigné',
    moyensListe: moyensListe(),
    forfaitMode,
    forfaitPctText,
    forfaitReverseur: val('forfait-reverseur', 'Non renseigné'),
    forfaitDelai: val('forfait-delai', '10'),
    redevanceType,
    redevancePct: val('redevance-pct', '0'),
    redevanceMontant: val('redevance-montant', '0'),
    redevanceJour: val('redevance-jour', '10'),
    dureeType,
    dureeDeterminee,
    dureeIntro: dureeDeterminee ? 'durée déterminée' : 'durée indéterminée',
    dateDebut: formatDate($('date-debut')?.value),
    dateFin: formatDate($('date-fin')?.value),
    signatureDate: formatDateDuJour(),
    signatureLieu: extraitVilleDepuisAdresse(adressePourVille),
    signatureLigneTitulaire: `${abregeCivilite(tCiv)} ${tNom}`.trim(),
    signatureLigneCollaborateur: `${abregeCivilite(cCiv)} ${cNom}`.trim(),
  };
}
