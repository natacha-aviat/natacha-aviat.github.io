/**
 * Charge le modèle et remplace les placeholders.
 */

import { TEMPLATE_URL, EMBEDDED_TEMPLATE_MIN_LENGTH } from './constants.js';
import { isFileProtocol } from '../utils.js';

export async function loadTemplate() {
  const embedded =
    typeof window !== 'undefined' ? String(window.__LIBELEX_MISE_EN_DEMEURE_TEMPLATE__ || '') : '';
  if (embedded.length >= EMBEDDED_TEMPLATE_MIN_LENGTH) {
    return embedded;
  }

  if (isFileProtocol()) {
    throw new Error(
      'Modèle embarqué manquant (libelex-mise-en-demeure-template-embedded.js). Rechargez la page ou ouvrez le site via GitHub Pages.'
    );
  }

  const res = await fetch(TEMPLATE_URL);
  if (!res.ok) {
    throw new Error('Impossible de charger le modèle de mise en demeure (' + res.status + ').');
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
    ['[BLOC_REPRESENTANT]', a.blocRepresentant || ''],
    ['[DATE_SIGNATURE_BAIL]', a.dateSignatureBail],
    ['[ADRESSE_LOCAUX]', a.adresseLocaux],
    ['[PRECISION_LOCAL]', a.precisionLocal || ''],
    ['[OBLIGATIONS_INEXECUTEES]', a.obligationsInexecutees],
    ['[DESCRIPTION_FACTUELLE]', a.descriptionFactuelle],
    ['[DATE_DEBUT_MANQUEMENT]', a.dateDebutManquement],
    ['[PERSISTANCE_DETAIL]', a.persistanceDetail],
    ['[IMPOSSIBILITE_USAGE]', a.impossibiliteUsage],
    ['[CONSEQUENCES_CONCRETES]', a.consequencesConcretes],
    ['[MESURES_DEMANDEES]', a.mesuresDemandees],
    ['[DELAI_RAISONNABLE]', a.delaiRaisonnable],
    ['[LISTE_PIECES]', a.listePieces],
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

export function buildContractText(templateRaw, a) {
  return applyReplacements(templateRaw, a);
}
