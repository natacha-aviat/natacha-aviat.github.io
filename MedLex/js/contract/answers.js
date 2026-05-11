/**
 * Lecture du formulaire questionnaire → objet « réponses » pour le moteur de template.
 */

import {
  $,
  val,
  checkedValue,
  formatDate,
  formatDateDuJour,
  abregeCivilite,
  extraitVilleDepuisAdresse,
} from './utils.js';

function motifTexte() {
  const m = $('motif');
  if (!m || m.value === 'autre') return val('motif-autre-texte', 'Non renseigné');
  return m.value || 'Non renseigné';
}

function rpEstCabinetInstalle() {
  const s = $('rp-statut');
  return s && s.selectedIndex === 0;
}

/** @returns {Record<string, string|boolean>} */
export function collectAnswers() {
  const typeR = $('type-remplacement')?.value || '';

  let duAu2_1;
  let reponse2_2;
  if (typeR === 'continue') {
    duAu2_1 = `Du ${formatDate($('date-debut')?.value)} au ${formatDate($('date-fin')?.value)}`;
    reponse2_2 = '';
  } else if (typeR === 'discontinu' || typeR === 'planning') {
    duAu2_1 = '';
    reponse2_2 = val('periodes-discontinues', 'Non renseigné');
  } else {
    duAu2_1 = 'Non applicable (remplacement non conclu sur une période continue déterminée)';
    reponse2_2 = val('periodes-discontinues', 'Non renseigné');
  }

  const lieu = $('lieu')?.value || 'cabinet-remplace';
  const adresseLieu = val('adresse-lieu');
  const rAdr = val('r-adresse');
  const rpAdr = val('rp-adresse');

  const facturation = $('facturation')?.value || 'directe';
  const redevance = $('redevance')?.value || 'Non';
  const tauxRedevance = val('taux-redevance', '0');
  const modeReglement = val('mode-reglement', 'Virement bancaire');
  const tauxTiersPayant = val('taux-tiers-payant', '0');

  const modeExercice = $('mode-exercice')?.value || 'seul';

  const annexesOui = checkedValue('annexes', 'non') === 'oui';
  const annexesDetail = val('annexes-texte');
  let question11Titre;
  let question11Corps;
  if (annexesOui) {
    question11Titre = 'Oui.';
    question11Corps = annexesDetail || 'Voir liste détaillée aux présentes annexes.';
  } else {
    question11Titre = 'Non.';
    question11Corps = annexesDetail
      ? annexesDetail
      : 'Aucune annexe complémentaire n’est prévue outre les pièces habituelles (ordre, assurance, etc.).';
  }

  const rawAdresseLieu = val('adresse-lieu');
  const rawRAdresse = val('r-adresse');
  const adressePourVille = rawAdresseLieu || rawRAdresse;
  const rCivilSig = val('r-civilite', '');
  const rpCivilSig = val('rp-civilite', '');
  const rNomSig = val('r-nom', 'Non renseigné');
  const rpNomSig = val('rp-nom', 'Non renseigné');

  return {
    typeRemplacement: typeR,
    rCiv: val('r-civilite', 'M./Mme'),
    rNom: val('r-nom', 'Non renseigné'),
    rOrdinal: val('r-ordinal', 'Non renseigné'),
    rRpps: val('r-rpps', 'Non renseigné'),
    rAdresse: rAdr || 'Non renseigné',
    rpCiv: val('rp-civilite', 'M./Mme'),
    rpNom: val('rp-nom', 'Non renseigné'),
    rpOrdinal: val('rp-ordinal', 'Non renseigné'),
    rpRpps: val('rp-rpps', 'Non renseigné'),
    rpStatut: $('rp-statut')?.selectedOptions[0]?.textContent?.trim() || 'Non renseigné',
    rpAdresse: rpAdr || 'Non renseigné',
    motif: motifTexte(),
    duAu2_1,
    reponse2_2,
    lieu,
    adresseLieu: adresseLieu || 'Non renseigné',
    facturation,
    facturationLabel: $('facturation')?.selectedOptions[0]?.textContent?.trim() || 'Non renseigné',
    redevance,
    redevanceOui: redevance === 'Oui',
    tauxRedevance,
    modeReglement,
    tauxTiersPayant,
    preavisAccord: val('preavis-accord', '0'),
    preavisManquement: val('preavis-manquement', '0'),
    nonconcurrence: checkedValue('nonconcurrence', 'non'),
    modeExercice,
    question11Titre,
    question11Corps,
    signatureDate: formatDateDuJour(),
    signatureLieu: extraitVilleDepuisAdresse(adressePourVille),
    signatureLigneRemplace: `${abregeCivilite(rCivilSig)} ${rNomSig}`.trim(),
    signatureLigneRemplacant: `${abregeCivilite(rpCivilSig)} ${rpNomSig}`.trim(),
    rpEstCabinetInstalle: rpEstCabinetInstalle(),
  };
}
