/**
 * Rendu HTML du corps du contrat de collaboration.
 */

import { escapeHtml, escapeRegExp } from '../utils.js';

/** @param {Record<string, string|boolean>} a */
function collectHighlightValues(a) {
  const candidates = [
    a.tCiv,
    a.tNom,
    a.tOrdinal,
    a.tRpps,
    a.tAdresse,
    a.cCiv,
    a.cNom,
    a.cOrdinal,
    a.cRpps,
    a.cAdresse,
    a.patienteleBloc,
    a.collabBloc,
    a.lieuAdresse,
    a.moyensListe,
    a.forfaitPctText,
    a.forfaitReverseur,
    a.redevancePct,
    a.redevanceMontant,
    a.dureeIntro,
    a.dateDebut,
    a.dateFin,
    a.signatureDate,
    a.signatureLieu,
    a.signatureLigneTitulaire,
    a.signatureLigneCollaborateur,
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
