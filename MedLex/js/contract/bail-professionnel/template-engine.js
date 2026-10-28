/**
 * Bail professionnel : conditionnels + placeholders.
 */

import { TEMPLATE_URL, EMBEDDED_TEMPLATE_MIN_LENGTH } from './constants.js';
import { escapeRegExp, isFileProtocol } from '../utils.js';

function stripBetween(text, startMarker, endMarker) {
  const re = new RegExp(
    escapeRegExp(startMarker) + '[\\s\\S]*?(?=' + escapeRegExp(endMarker) + '|$)',
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

  if (a.natureImmeuble === 'copropriete') {
    text = stripBetween(text, 'OPTION NATURE_MONO', 'OPTION NATURE_COPRO');
    text = stripBetween(text, 'OPTION NATURE_AUTRE', 'OPTION NATURE_END');
    text = text.replace('OPTION NATURE_COPRO\n', '');
  } else if (a.natureImmeuble === 'autre') {
    text = stripBetween(text, 'OPTION NATURE_MONO', 'OPTION NATURE_COPRO');
    text = stripBetween(text, 'OPTION NATURE_COPRO', 'OPTION NATURE_AUTRE');
    text = text.replace('OPTION NATURE_AUTRE\n', '');
  } else {
    text = stripBetween(text, 'OPTION NATURE_COPRO', 'OPTION NATURE_AUTRE');
    text = stripBetween(text, 'OPTION NATURE_AUTRE', 'OPTION NATURE_END');
    text = text.replace('OPTION NATURE_MONO\n', '');
  }
  text = text.replace('OPTION NATURE_END\n', '');

  if (a.tvaApplicable) {
    text = stripBetween(text, 'OPTION TVA_NON', 'OPTION TVA_OUI');
    text = text.replace('OPTION TVA_OUI\n', '');
  } else {
    text = stripBetween(text, 'OPTION TVA_OUI', 'OPTION TVA_END');
    text = text.replace('OPTION TVA_NON\n', '');
  }
  text = text.replace('OPTION TVA_END\n', '');

  if (a.sousLocation === 'accord') {
    text = stripBetween(text, 'OPTION SOUSLOC_INTERDITE', 'OPTION SOUSLOC_ACCORD');
    text = stripBetween(text, 'OPTION SOUSLOC_CONDITIONS', 'OPTION SOUSLOC_END');
    text = text.replace('OPTION SOUSLOC_ACCORD\n', '');
  } else if (a.sousLocation === 'conditions') {
    text = stripBetween(text, 'OPTION SOUSLOC_INTERDITE', 'OPTION SOUSLOC_ACCORD');
    text = stripBetween(text, 'OPTION SOUSLOC_ACCORD', 'OPTION SOUSLOC_CONDITIONS');
    text = text.replace('OPTION SOUSLOC_CONDITIONS\n', '');
  } else {
    text = stripBetween(text, 'OPTION SOUSLOC_ACCORD', 'OPTION SOUSLOC_CONDITIONS');
    text = stripBetween(text, 'OPTION SOUSLOC_CONDITIONS', 'OPTION SOUSLOC_END');
    text = text.replace('OPTION SOUSLOC_INTERDITE\n', '');
  }
  text = text.replace('OPTION SOUSLOC_END\n', '');

  if (a.droitPreference) {
    text = stripBetween(text, 'OPTION PREF_NON', 'OPTION PREF_OUI');
    text = text.replace('OPTION PREF_OUI\n', '');
  } else {
    text = stripBetween(text, 'OPTION PREF_OUI', 'OPTION PREF_END');
    text = text.replace('OPTION PREF_NON\n', '');
  }
  text = text.replace('OPTION PREF_END\n', '');

  return text.replace(/\n{3,}/g, '\n\n');
}

export async function loadTemplate() {
  const embedded =
    typeof window !== 'undefined'
      ? String(window.__LIBELEX_BAIL_PROFESSIONNEL_TEMPLATE__ || '')
      : '';
  if (embedded.length >= EMBEDDED_TEMPLATE_MIN_LENGTH) {
    return embedded;
  }
  if (isFileProtocol()) {
    throw new Error(
      'Modèle embarqué manquant (libelex-bail-professionnel-template-embedded.js). Rechargez la page ou ouvrez le site via GitHub Pages.'
    );
  }
  const res = await fetch(TEMPLATE_URL);
  if (!res.ok) {
    throw new Error('Impossible de charger le modèle de bail (' + res.status + ').');
  }
  return await res.text();
}

/**
 * @param {string} text
 * @param {Record<string, string|boolean>} a
 */
export function applyReplacements(text, a) {
  const pairs = [
    ['[IDENTITE_BAILLEUR]', a.identiteBailleur],
    ['[ADRESSE_BAILLEUR]', a.adresseBailleur],
    ['[LIGNE_REPRESENTANT]', a.ligneRepresentant || ''],
    ['[IDENTITE_PRENEUR]', a.identitePreneur],
    ['[ORDINAL_PRENEUR]', a.ordinalPreneur],
    ['[RPPS_PRENEUR]', a.rppsPreneur],
    ['[ADRESSE_PRENEUR]', a.adressePreneur],
    ['[ADRESSE_LOCAUX]', a.adresseLocaux],
    ['[PRECISION_LOCAL]', a.precisionLocal],
    ['[SUPERFICIE]', a.superficie],
    ['[DESCRIPTION_PIECES]', a.descriptionPieces],
    ['[NATURE_AUTRE_DETAIL]', a.natureAutreDetail || ''],
    ['[DATE_EFFET]', a.dateEffet],
    ['[DATE_EXPIRATION]', a.dateExpiration],
    ['[LOYER_HC]', a.loyerHc],
    ['[TAUX_TVA]', a.tauxTva || ''],
    ['[LOYER_TTC]', a.loyerTtc || ''],
    ['[PROVISION_CHARGES]', a.provisionCharges],
    ['[DEPOT_GARANTIE]', a.depotGarantie],
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
  return applyReplacements(applyConditionals(templateRaw, a), a);
}
