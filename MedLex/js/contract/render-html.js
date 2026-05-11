/**
 * Rendu HTML du corps du contrat (aperçu + zone capturée pour le PDF).
 */

import { escapeHtml, escapeRegExp } from './utils.js';

/** @param {Record<string, string|boolean>} a */
function collectHighlightValues(a) {
  const candidates = [
    a.rCiv,
    a.rNom,
    a.rOrdinal,
    a.rRpps,
    a.rAdresse,
    a.rpCiv,
    a.rpNom,
    a.rpOrdinal,
    a.rpRpps,
    a.rpStatut,
    a.rpAdresse,
    a.motif,
    a.duAu2_1,
    a.reponse2_2,
    a.facturationLabel,
    a.redevance,
    a.tauxRedevance,
    a.modeReglement,
    a.tauxTiersPayant,
    a.preavisAccord,
    a.preavisManquement,
    a.question11Titre,
    a.question11Corps,
    a.nonconcurrence,
    a.signatureDate,
    a.signatureLieu,
    a.signatureLigneRemplace,
    a.signatureLigneRemplacant,
  ];

  const values = [];
  for (const v of candidates) {
    const s = String(v || '').trim();
    if (!s || s === 'Non renseigné') continue;
    if (/^\d+(?:[.,]\d+)?$/.test(s)) continue;
    if (!values.includes(s)) values.push(s);
  }
  values.sort((x, y) => y.length - x.length);
  return values;
}

function highlightAnswerValuesInLine(line, values) {
  let out = escapeHtml(line);
  for (const v of values) {
    const esc = escapeHtml(v);
    out = out.replace(new RegExp(escapeRegExp(esc), 'g'), `<strong>${esc}</strong>`);
  }
  return out;
}

/**
 * @param {string} bodyText
 * @param {Record<string, string|boolean>} a
 */
export function buildContractRenderedHtml(bodyText, a) {
  const highlightValues = collectHighlightValues(a);
  return bodyText
    .split('\n')
    .map((line) =>
      line.trim() === ''
        ? '<br />'
        : `<p style="margin:0 0 8px;line-height:1.5">${highlightAnswerValuesInLine(line, highlightValues)}</p>`
    )
    .join('');
}
