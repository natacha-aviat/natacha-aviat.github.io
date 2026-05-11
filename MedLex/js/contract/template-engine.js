/**
 * Chaîne du contrat : conditionnels du modèle Word, placeholders, article 2.
 */

import { TEMPLATE_URL, EMBEDDED_TEMPLATE_MIN_LENGTH } from './constants.js';
import { escapeRegExp, isFileProtocol } from './utils.js';

/**
 * Article 2 : une seule variante selon le type (continu = plage de dates ;
 * discontinu / planning = texte « jours / périodes » uniquement).
 * @param {string} text
 * @param {Record<string, string|boolean>} a
 */
export function reshapeArticle2Duration(text, a) {
  const tr = a.typeRemplacement;
  if (tr !== 'continue' && tr !== 'discontinu' && tr !== 'planning') return text;

  const art2 = 'Article 2 – DURÉE';
  const iArt = text.indexOf(art2);
  if (iArt === -1) return text;

  const header = 'Le présent contrat est conclu :';
  const iHeader = text.indexOf(header, iArt);
  if (iHeader === -1) return text;

  const suite = 'La durée du présent contrat';
  const iSuite = text.indexOf(suite, iHeader);
  if (iSuite === -1) return text;

  const slice = text.slice(iHeader, iSuite);
  if (!slice.includes('Du AU RÉPONSE 2.1')) return text;

  let newBlock;
  if (tr === 'continue') {
    newBlock = `${header}\n\t•\tDu AU RÉPONSE 2.1\n`;
  } else {
    newBlock = `${header}\n\t•\tRÉPONSE 2.2\n`;
  }
  return text.slice(0, iHeader) + newBlock + text.slice(iSuite);
}

/**
 * @param {string} raw
 * @param {Record<string, string|boolean>} a
 */
export function applyConditionals(raw, a) {
  let text = raw;

  if (a.modeExercice === 'seul') {
    text = text.replace(/\n\[OPTION EN FONCTION DE LA QUESTION 3\.6\] :[^\n]*\n/, '\n');
  } else {
    text = text.replace('[OPTION EN FONCTION DE LA QUESTION 3.6] : ', '');
  }

  if (a.rpEstCabinetInstalle) {
    text = text.replace(/^Option 2\u00a0:[^\n]*\n/m, '');
  } else {
    text = text.replace(/^Option 1\u00a0:[^\n]*\n/m, '');
  }

  if (a.lieu === 'cabinet-remplace') {
    text = text.replace(
      /\nOU OPTION 2[\u00a0\s]+RÉPONSE 6\.2[\s\S]*?(?=\nArticle 4 – OBLIGATIONS DES PARTIES)/u,
      ''
    );
  } else {
    text = text.replace(
      /OPTION 1\u00a0RÉPONSE 6\.1[\s\S]*?\nOU OPTION 2[\u00a0\s]+(?=RÉPONSE 6\.2)/u,
      ''
    );
  }

  const a5 = 'Article 5 – HONORAIRES';
  const a6 = 'Article 6 – OBLIGATIONS FISCALES ET SOCIALES';

  if (a.facturation === 'directe') {
    text = text.replace(
      new RegExp(
        `\\nOU Option 2[\u00a0\\s]*QUESTION 8\\.1[\u00a0\\s]*:[^\n]*\\n[\\s\\S]*?(?=\\n${escapeRegExp(a6)})`,
        'u'
      ),
      ''
    );
  } else {
    text = text.replace(
      new RegExp(
        `${escapeRegExp(a5)}\\nOption 1[\u00a0\\s]*QUESTION 8\\.1[\u00a0\\s]*\\([^\\)]*\\)\\n[\\s\\S]*?(?=\\nOU Option 2)`,
        'u'
      ),
      `${a5}\n`
    );
    text = text.replace(/\nOU Option 2[\u00a0\s]*QUESTION 8\.1[\u00a0\s]*:[^\n]*\n/u, '\n');
  }

  if (a.nonconcurrence !== 'oui') {
    text = text.replace(/OPTION si contrat supérieure à 3 mois[^\n]+\n/, '');
  }

  return text;
}

/**
 * @param {string} text
 * @param {Record<string, string|boolean>} a
 */
export function applyReplacements(text, a) {
  const pairs = [
    ['QUESTION 8.option 1-2.a', a.redevanceOui ? 'oui' : 'non'],
    ['QUESTION 8.option 2-2-b', a.tauxRedevance],
    ['QUESTION 8.option 2-4', a.tauxTiersPayant],
    ['QUESTION 8.option 2-3', a.modeReglement],
    ['QUESTION 8.option 1-2.b', a.tauxRedevance],
    ['QUESTION 8.option 1-3', a.modeReglement],
    ['QUESTION 8.1', a.facturationLabel],
    ['QUESTION 9.2', a.preavisManquement],
    ['QUESTION 9.1', a.preavisAccord],
    ['QUESTION 11 TITRE', a.question11Titre],
    ['QUESTION 11 CORPS', a.question11Corps],
    ['RÉPONSES 3.1 ET 3.2', `${a.rCiv} ${a.rNom}`],
    ['RÉPONSES 5.1 ET 5.2', `${a.rpCiv} ${a.rpNom}`],
    ['Du AU RÉPONSE 2.1', a.duAu2_1],
    ['RÉPONSE 2.2', a.reponse2_2],
    ['RÉPONSE 6.2 «\u00a0dans son propre cabinet\u00a0»', '« dans son propre cabinet »'],
    ['RÉPONSE 6.1 «\u00a0dans le cabinet du remplacé\u00a0»', '« dans le cabinet du Remplacé »'],
    ['RÉPONSE 3.3', a.rOrdinal],
    ['RÉPONSE 3.4', a.rRpps],
    ['RÉPONSE 3.5', a.rAdresse],
    ['RÉPONSE 5.3', a.rpOrdinal],
    ['RÉPONSE 5.4', a.rpRpps],
    ['RÉPONSE 5.5', a.rpStatut],
    ['RÉPONSE 5.6', a.rpAdresse],
    ['RÉPONSE 4', a.motif],
    ['RÉPONSE SIGNATURE LIGNE REMPLAÇANT', a.signatureLigneRemplacant],
    ['RÉPONSE SIGNATURE LIGNE REMPLACÉ', a.signatureLigneRemplace],
    ['RÉPONSE SIGNATURE DATE', a.signatureDate],
    ['RÉPONSE SIGNATURE LIEU', a.signatureLieu],
  ];

  let out = text;
  for (const [k, v] of pairs) {
    const esc = escapeRegExp(k);
    out = out.replace(new RegExp(esc, 'g'), v);
  }

  if (a.redevanceOui) {
    out = out.replace(/S\u2019il y a une redevance oui\u00a0:/gu, 'S\u2019il y a une redevance :');
  }
  return out;
}

/**
 * @param {string} text
 * @param {Record<string, string|boolean>} a
 */
export function stripRedevanceIfNone(text, a) {
  if (a.redevanceOui) return text;
  let out = text;

  out = out.replace(
    /S\u2019il y a une redevance non\u00a0: Une redevance de[\s\S]*?ne s\u2019applique pas aux indemnit\u00e9s kilom\u00e9triques\.\n/u,
    ''
  );
  out = out.replace(
    /S\u2019il y a une redevance\u00a0: La somme vis[\s\S]*?indemnit\u00e9s kilom\u00e9triques\nCette redevance correspond exclusivement[\s\S]*?logiciel\.\n/u,
    ''
  );
  return out;
}

export async function loadTemplate() {
  const embedded =
    typeof window.__MEDLEX_CONTRACT_TEMPLATE__ === 'string' ? window.__MEDLEX_CONTRACT_TEMPLATE__ : '';
  if (embedded.length > EMBEDDED_TEMPLATE_MIN_LENGTH) {
    return embedded;
  }
  if (isFileProtocol()) {
    throw new Error(
      'Modèle embarqué manquant (fichier medlex-contract-template-embedded.js). Rechargez la page ou ouvrez le site via GitHub Pages.'
    );
  }
  const res = await fetch(TEMPLATE_URL, { cache: 'no-store' });
  if (!res.ok) {
    if (embedded.length > 0) return embedded;
    throw new Error(`Template introuvable (${res.status})`);
  }
  return res.text();
}

/**
 * @param {string} templateRaw
 * @param {Record<string, string|boolean>} a
 */
export function buildContractText(templateRaw, a) {
  let text = applyConditionals(templateRaw, a);
  text = reshapeArticle2Duration(text, a);
  text = applyReplacements(text, a);
  text = stripRedevanceIfNone(text, a);
  return text;
}
