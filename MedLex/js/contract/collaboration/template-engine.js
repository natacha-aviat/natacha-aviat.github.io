/**
 * Chaîne du contrat de collaboration : conditionnels et placeholders.
 */

import { TEMPLATE_URL, EMBEDDED_TEMPLATE_MIN_LENGTH } from './constants.js';
import { escapeRegExp, isFileProtocol } from '../utils.js';

function stripOptionBlock(text, startMarker, endMarker) {
  const re = new RegExp(
    `${escapeRegExp(startMarker)}[\\s\\S]*?(?=${escapeRegExp(endMarker)}|$)`,
    'u'
  );
  return text.replace(re, '');
}

/**
 * @param {string} raw
 * @param {Record<string, string|boolean>} a
 */
export function applyConditionals(raw, a) {
  let text = raw;

  if (a.patienteleUnite === 'journees') {
    text = stripOptionBlock(text, 'OPTION PATIENTELE DEMI-JOURNEES', 'b)');
  } else {
    text = stripOptionBlock(text, 'OPTION PATIENTELE JOURNEES', 'OPTION PATIENTELE DEMI-JOURNEES');
    text = text.replace('OPTION PATIENTELE DEMI-JOURNEES\n', '');
  }

  if (a.collabUnite === 'journees') {
    text = stripOptionBlock(text, 'OPTION COLLAB DEMI-JOURNEES', 'Le Collaborateur tient');
  } else {
    text = stripOptionBlock(text, 'OPTION COLLAB JOURNEES', 'OPTION COLLAB DEMI-JOURNEES');
    text = text.replace('OPTION COLLAB DEMI-JOURNEES\n', '');
  }

  if (a.forfaitMode === 'tour-role') {
    text = stripOptionBlock(text, 'OPTION FORFAIT EGAL', 'OPTION FORFAIT PCT');
    text = stripOptionBlock(text, 'OPTION FORFAIT PCT', 'Il sera tenu');
    text = text.replace('OPTION FORFAIT TOUR\n', '');
  } else if (a.forfaitMode === 'parts-egales') {
    text = stripOptionBlock(text, 'OPTION FORFAIT TOUR', 'OPTION FORFAIT EGAL');
    text = stripOptionBlock(text, 'OPTION FORFAIT PCT', 'Il sera tenu');
    text = text.replace('OPTION FORFAIT EGAL\n', '');
  } else {
    text = stripOptionBlock(text, 'OPTION FORFAIT TOUR', 'OPTION FORFAIT EGAL');
    text = stripOptionBlock(text, 'OPTION FORFAIT EGAL', 'OPTION FORFAIT PCT');
    text = text.replace('OPTION FORFAIT PCT\n', '');
  }

  if (a.redevanceType === 'pourcentage') {
    text = stripOptionBlock(text, 'OPTION REDEVANCE FORFAIT', 'Elle correspond');
    text = text.replace('OPTION REDEVANCE PCT\n', '');
  } else {
    text = stripOptionBlock(text, 'OPTION REDEVANCE PCT', 'OPTION REDEVANCE FORFAIT');
    text = text.replace('OPTION REDEVANCE FORFAIT\n', '');
  }

  if (a.dureeDeterminee) {
    text = stripOptionBlock(text, 'OPTION DUREE INDETERMINEE', 'ARTICLE 15');
    text = text.replace('OPTION DUREE DETERMINEE\n', '');
    text = stripOptionBlock(text, 'OPTION FIN INDETERMINEE', 'ARTICLE 17');
    text = text.replace('OPTION FIN DETERMINEE\n', '');
  } else {
    text = stripOptionBlock(text, 'OPTION DUREE DETERMINEE', 'OPTION DUREE INDETERMINEE');
    text = text.replace('OPTION DUREE INDETERMINEE\n', '');
    text = stripOptionBlock(text, 'OPTION FIN DETERMINEE', 'OPTION FIN INDETERMINEE');
    text = text.replace('OPTION FIN INDETERMINEE\n', '');
  }

  return text.replace(/\n{3,}/g, '\n\n');
}

/**
 * @param {string} text
 * @param {Record<string, string|boolean>} a
 */
export function applyReplacements(text, a) {
  const pairs = [
    ['RÉPONSES T.1 ET T.2', `${a.tCiv} ${a.tNom}`],
    ['RÉPONSE T.3', a.tOrdinal],
    ['RÉPONSE T.4', a.tRpps],
    ['RÉPONSE T.5', a.tAdresse],
    ['RÉPONSES C.1 ET C.2', `${a.cCiv} ${a.cNom}`],
    ['RÉPONSE C.3', a.cOrdinal],
    ['RÉPONSE C.4', a.cRpps],
    ['RÉPONSE C.5', a.cAdresse],
    ['RÉPONSE 2.1', a.patienteleBloc],
    ['RÉPONSE 3.1', a.collabBloc],
    ['RÉPONSE 5.1', a.lieuAdresse],
    ['RÉPONSE 5.2', a.moyensListe],
    ['RÉPONSE 6.2.PCT', a.forfaitPctText],
    ['RÉPONSE 6.2.REVERSEUR', a.forfaitReverseur],
    ['RÉPONSE 6.2.DELAI', a.forfaitDelai],
    ['RÉPONSE 7.PCT', a.redevancePct],
    ['RÉPONSE 7.MONTANT', a.redevanceMontant],
    ['RÉPONSE 7.JOUR', a.redevanceJour],
    ['RÉPONSE 14.INTRO', a.dureeIntro],
    ['RÉPONSE 14.DEBUT', a.dateDebut],
    ['RÉPONSE 14.FIN', a.dateFin],
    ['RÉPONSE SIGNATURE DATE', a.signatureDate],
    ['RÉPONSE SIGNATURE LIEU', a.signatureLieu],
    ['RÉPONSE SIGNATURE LIGNE TITULAIRE', a.signatureLigneTitulaire],
    ['RÉPONSE SIGNATURE LIGNE COLLABORATEUR', a.signatureLigneCollaborateur],
  ];

  let out = text;
  for (const [k, v] of pairs) {
    out = out.replace(new RegExp(escapeRegExp(k), 'g'), String(v));
  }
  return out;
}

export async function loadTemplate() {
  const embedded =
    typeof window.__MEDLEX_COLLABORATION_TEMPLATE__ === 'string'
      ? window.__MEDLEX_COLLABORATION_TEMPLATE__
      : '';
  if (embedded.length > EMBEDDED_TEMPLATE_MIN_LENGTH) {
    return embedded;
  }
  if (isFileProtocol()) {
    throw new Error(
      'Modèle embarqué manquant (medlex-collaboration-template-embedded.js). Rechargez la page ou ouvrez le site via GitHub Pages.'
    );
  }
  const res = await fetch(TEMPLATE_URL, { cache: 'no-store' });
  if (!res.ok) {
    if (embedded.length > 0) return embedded;
    throw new Error(`Template collaboration introuvable (${res.status})`);
  }
  return res.text();
}

/**
 * @param {string} templateRaw
 * @param {Record<string, string|boolean>} a
 */
export function buildContractText(templateRaw, a) {
  let text = applyConditionals(templateRaw, a);
  text = applyReplacements(text, a);
  return text;
}
