/**
 * Chaîne fin de bail : charge le modèle A ou B et remplace les placeholders.
 */

import {
  TEMPLATE_URL_A,
  TEMPLATE_URL_B,
  EMBEDDED_TEMPLATE_MIN_LENGTH,
} from './constants.js';
import { isFileProtocol } from '../utils.js';

function getEmbedded(modele) {
  if (modele === 'B') {
    return typeof window !== 'undefined' ? window.__LIBELEX_FIN_DE_BAIL_TEMPLATE_B__ : '';
  }
  return typeof window !== 'undefined' ? window.__LIBELEX_FIN_DE_BAIL_TEMPLATE_A__ : '';
}

/**
 * @param {Record<string, string|boolean>} [answers]
 */
export async function loadTemplate(answers) {
  const modele = answers && answers.modele === 'B' ? 'B' : 'A';
  const embedded = String(getEmbedded(modele) || '');
  if (embedded.length >= EMBEDDED_TEMPLATE_MIN_LENGTH) {
    return embedded;
  }

  if (isFileProtocol()) {
    throw new Error(
      'Modèles embarqués manquants (libelex-fin-de-bail-templates-embedded.js). Rechargez la page ou ouvrez le site via GitHub Pages.'
    );
  }

  const url = modele === 'B' ? TEMPLATE_URL_B : TEMPLATE_URL_A;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Impossible de charger le modèle de congé (' + res.status + ').');
  }
  return await res.text();
}

/**
 * @param {string} text
 * @param {Record<string, string|boolean>} a
 */
export function applyReplacements(text, a) {
  const pairs = [
    ['[IDENTITE_PRENEUR]', a.identitePreneur],
    ['[ADRESSE_PRENEUR]', a.adressePreneur],
    ['[IDENTITE_BAILLEUR]', a.identiteBailleur],
    ['[ADRESSE_BAILLEUR]', a.adresseBailleur],
    ['[REPRESENTANT_BAILLEUR]', a.representantBailleur || ''],
    ['[BLOC_REPRESENTANT]', a.blocRepresentant || ''],
    ['[LIGNE_REPRESENTANT]', a.ligneRepresentant || ''],
    ['[MENTION_REPRESENTATION]', a.mentionRepresentation || ''],
    ['[ADRESSE_LOCAUX]', a.adresseLocaux],
    ['[PRECISION_LOCAL]', a.precisionLocal || ''],
    ['[DATE_BAIL]', a.dateBail],
    ['[DATE_ECHEANCE]', a.dateEcheance],
  ];

  let out = text;
  pairs.forEach(function (pair) {
    out = out.split(pair[0]).join(String(pair[1] != null ? pair[1] : ''));
  });

  return out
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^[ \t]+$/gm, '')
    .trim();
}

/**
 * @param {string} templateRaw
 * @param {Record<string, string|boolean>} a
 */
export function buildContractText(templateRaw, a) {
  return applyReplacements(templateRaw, a);
}
