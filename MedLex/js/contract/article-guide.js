/**
 * Découpage du contrat par article et métadonnées didactiques (PDF + UI).
 */

/** @type {Record<string, { desc?: string, editStep?: number, editSteps?: { step: number, label: string }[] }>} */
export const COLLAB_ARTICLE_META = {
  preamble: {
    desc: 'Identification du titulaire et du collaborateur, et rappel du cadre légal de la collaboration libérale.',
    editSteps: [
      { step: 0, label: 'Modifier le titulaire' },
      { step: 1, label: 'Modifier le collaborateur' },
    ],
  },
  '1': {
    desc: 'Ce passage pose le cadre légal de la collaboration libérale — sans lien de subordination.',
    editStep: 0,
  },
  '2': {
    desc: 'Ce paragraphe encadre le temps consacré à ta patientèle personnelle — journées ou demi-journées, clair pour les deux.',
    editStep: 2,
  },
  '3': {
    desc: 'Ce paragraphe fixe le temps minimum dédié à la collaboration et évite une requalification en salariat.',
    editStep: 3,
  },
  '4': {
    desc: 'Ce paragraphe encadre le suivi de chaque patientèle — un point de repère clair en cas d’évolution ou de fin de collaboration.',
  },
  '5': {
    desc: 'Ce paragraphe précise l’adresse du cabinet et les moyens mis à disposition (salle de soins, secrétariat, dossiers…).',
    editSteps: [
      { step: 4, label: 'Modifier le lieu' },
      { step: 5, label: 'Modifier les moyens' },
    ],
  },
  '6': {
    desc: 'Ce paragraphe te protège sur la clé de répartition des forfaits et les délais de reversement.',
    editSteps: [
      { step: 6, label: 'Modifier les forfaits' },
      { step: 7, label: 'Modifier le reversement' },
    ],
  },
  '7': {
    desc: 'Ce paragraphe fixe la redevance (pourcentage du CA ou forfait mensuel) et la date limite de versement.',
    editStep: 8,
  },
  '8': {
    desc: 'Indépendance professionnelle, déontologie et interdiction du compérage entre vous deux.',
  },
  '9': {
    desc: 'Assurance RCP, charges fiscales et sociales — chacune reste responsable de ses propres obligations.',
  },
  '10': {
    desc: 'Planning, congés et absences : organisés d’un commun accord, sans décision unilatérale.',
  },
  '11': {
    desc: 'Protection en cas de maternité, paternité ou adoption — pas de rupture abusive du contrat.',
  },
  '12': {
    desc: 'Organisation du remplacement en cas d’arrêt maladie et protection contre une rupture liée à la maladie.',
  },
  '13': {
    desc: 'Information des patients sur ta présence au cabinet, dans le respect du libre choix.',
  },
  '14': {
    desc: 'Durée du contrat (déterminée ou indéterminée) et possibilité de l’adapter par avenant.',
    editStep: 9,
  },
  '15': {
    desc: 'Premier mois d’essai : chacune peut mettre fin au contrat avec un court préavis.',
    editStep: 9,
  },
  '16': {
    desc: 'Conditions de fin du contrat, préavis et cas de rupture pour faute grave.',
    editStep: 9,
  },
  '17': {
    desc: 'Droit de priorité du collaborateur en cas de succession ou d’association du titulaire.',
  },
  '18': {
    desc: 'Loyauté réciproque et interdiction de concurrence déloyale à la fin de la collaboration.',
  },
  '19': {
    desc: 'Clause de non-concurrence ou caractère personnel du contrat — selon le paragraphe concerné.',
  },
  '20': {
    desc: 'En cas de différend, recherche d’une solution amiable avant toute action en justice.',
  },
  '21': {
    desc: 'Transmission du contrat signé à l’Ordre des infirmiers dans le délai légal.',
  },
};

/** @type {Record<string, { desc?: string, editStep?: number, editSteps?: { step: number, label: string }[] }>} */
export const REMPL_ARTICLE_META = {
  preamble: {
    desc: 'Identification des parties, motif du remplacement et rappel du cadre du remplacement libéral.',
    editStep: 4,
  },
  '1': {
    desc: 'Objet du remplacement : exercer en lieu et place du remplacé, pour une durée limitée.',
    editStep: 3,
  },
  '2': {
    desc: 'Ce paragraphe te protège en cas de prolongation imprévue — personne ne reste dans le flou.',
    editStep: 1,
  },
  '3': {
    desc: 'Lieu d’exercice du remplacement et conditions matérielles d’accueil.',
    editStep: 6,
  },
  '4': {
    desc: 'Obligations réciproques des parties pendant le remplacement.',
    editStep: 7,
  },
  '4.3': {
    desc: 'Confirmation de ton indépendance professionnelle — pas de lien de subordination.',
    editStep: 7,
  },
  '5': {
    desc: 'Ce paragraphe te protège si un litige survient sur qui facture quoi, et comment.',
    editStep: 8,
  },
  '6': {
    desc: 'Ce paragraphe te protège sur la couverture RCP et les obligations ordinale pendant le remplacement.',
  },
  '7': {
    desc: 'Le contrat est personnel et ne peut pas être cédé à un tiers.',
  },
  '8': {
    desc: "Ce paragraphe te protège si l'une de vous doit arrêter le remplacement plus tôt que prévu.",
    editStep: 10,
  },
  '8.1': { desc: 'Résiliation d’un commun accord entre vous.', editStep: 10 },
  '8.2': { desc: 'Résiliation en cas de manquement grave à l’une des parties.', editStep: 10 },
  '8.3': { desc: 'Cas de résiliation de plein droit (décès, sanctions, etc.).', editStep: 10 },
  '8.4': {
    desc: 'Conséquences financières si le remplacement s’arrête avant la date prévue.',
    editStep: 8,
  },
  '9': { desc: 'Renouvellement éventuel du remplacement.', editStep: 1 },
  '10': { desc: 'Fin du remplacement et restitution de la patientèle.', editStep: 1 },
  '11': {
    desc: 'Ce paragraphe te protège si le remplacement dépasse 3 mois — cadre légal, pas surprise.',
    editStep: 11,
  },
  '12': { desc: 'Règlement amiable des différends avant recours au tribunal.' },
  '13': { desc: 'Transmission du contrat et pièces annexes.' },
  '14': { desc: 'Annexes complémentaires éventuelles au contrat.', editStep: 12 },
};

function isArticleLine(line) {
  return /^(Article|ARTICLE)\s+/i.test(String(line || '').trim());
}

export function articleKeyFromSection(section) {
  if (section.isPreamble) return 'preamble';
  const m = String(section.heading || '').match(/Article\s+(\d+(?:\.\d+)?)(?:er|re)?\b/i);
  return m ? m[1] : 'misc';
}

function titleFromHeading(heading) {
  const parts = String(heading || '').split(/\s+[–\-]\s+/);
  if (parts.length > 1) return parts.slice(1).join(' – ').trim();
  return String(heading || '').trim();
}

/** Titre affiché dans le sommaire PDF (majuscules, comme dans le contrat). */
export function tocDisplayTitle(section) {
  if (section.isPreamble) return 'PRÉAMBULE ET IDENTIFICATION DES PARTIES';
  return titleFromHeading(section.heading).toUpperCase();
}

function shortLabelFromKey(key, isPreamble) {
  if (isPreamble) return 'Intro';
  if (key === 'misc') return 'Passage';
  return 'Art. ' + key.replace('er', '');
}

export function getArticleMeta(parcours, section) {
  const key = articleKeyFromSection(section);
  const store = parcours === 'collaboration' ? COLLAB_ARTICLE_META : REMPL_ARTICLE_META;
  const extra = store[key] || {};
  const title = section.isPreamble ? 'Préambule et parties' : titleFromHeading(section.heading);

  const editSteps = extra.editSteps
    ? extra.editSteps.slice()
    : extra.editStep != null
      ? [{ step: extra.editStep, label: 'Modifier' }]
      : [];

  return {
    key,
    shortLabel: shortLabelFromKey(key, section.isPreamble),
    title,
    desc: extra.desc || 'Ce passage précise tes droits et obligations sur ce point du contrat.',
    editSteps,
  };
}

export function splitSections(bodyText) {
  const lines = String(bodyText || '').split('\n');
  const sections = [];
  const preamble = [];
  let current = null;

  lines.forEach(function (line) {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (isArticleLine(trimmed)) {
      if (current) sections.push(current);
      current = { heading: trimmed, lines: [] };
    } else if (current) {
      current.lines.push(line);
    } else {
      preamble.push(line);
    }
  });
  if (current) sections.push(current);

  if (preamble.length) {
    sections.unshift({
      heading: 'Préambule et identification des parties',
      lines: preamble,
      isPreamble: true,
    });
  }
  return sections;
}

/** @returns {{ shortLabel: string, title: string, desc: string }[]} */
export function buildArticleSections(bodyText, parcours) {
  return splitSections(bodyText).map(function (section) {
    const meta = getArticleMeta(parcours, section);
    return {
      shortLabel: meta.shortLabel,
      title: meta.title,
      desc: meta.desc,
    };
  });
}
