/**
 * Commentaires juridiques (Me Violaine) rattachés aux passages du contrat de collaboration.
 */

export const AVOCATE_COMMENTS = [
  {
    id: 'bilan-annuel',
    articleKey: '1',
    match: /bilan relatif à l'exécution du présent contrat/i,
    comment:
      "L'Ordre des infirmiers souligne l'importance de réaliser un bilan annuel de la collaboration. Ce temps d'échange permet aux parties de faire le point sur les conditions d'exécution du contrat, d'identifier les éventuels ajustements nécessaires et de préserver l'équilibre de la relation libérale.\n\nEn cas d'évolution des modalités de collaboration, il convient de formaliser toute modification par un avenant écrit, signé par les parties, puis transmis à l'Ordre des infirmiers.",
  },
  {
    id: 'patientele-moyens',
    articleKey: '2',
    apercuThemeId: 'patientele',
    questionnaireStep: 2,
    match: /réserver au Collaborateur un minimum/i,
    comment:
      "Ces précisions revêtent une importance particulière. La jurisprudence rappelle en effet qu'il ne suffit pas d'affirmer, de manière générale, l'indépendance du collaborateur : le contrat doit également prévoir, de façon concrète, les conditions lui permettant de développer sa patientèle personnelle.\n\nIl est donc recommandé de définir clairement le temps et les moyens mis à sa disposition à cette fin. Un engagement réel, identifiable et suffisamment précis permet de sécuriser la collaboration et de préserver l'équilibre de la relation libérale.",
  },
  {
    id: 'planning-subordination',
    articleKey: '3',
    apercuThemeId: 'organisation',
    questionnaireStep: 3,
    match: /ne pas gérer unilatéralement le planning, les congés ou les tournées/i,
    comment:
      "En pratique, lorsque le planning, les congés ou les tournées sont déterminés de manière unilatérale par le titulaire, cette organisation peut être regardée comme un indice d'un lien de subordination. Elle est alors susceptible de fragiliser la qualification libérale de la relation et d'entraîner, le cas échéant, une requalification en contrat de travail.\n\nIl est donc recommandé de prévoir une organisation concertée, respectueuse de l'autonomie professionnelle du collaborateur, afin de sécuriser la collaboration et de préserver son caractère libéral.",
  },
  {
    id: 'recensement-conjoint',
    articleKey: '4',
    match: /procèdent annuellement et conjointement à un recensement de leur patientèle/i,
    comment:
      "Cette précision permet de rappeler que le recensement de la patientèle est une démarche commune, qui repose sur la coopération des deux parties.\n\nLa jurisprudence a déjà pu souligner que cette obligation ne pesait pas uniquement sur le collaborateur, mais devait être mise en œuvre conjointement. En l'absence de preuve d'un manquement imputable à une seule partie, les demandes de résolution du contrat peuvent être rejetées.\n\nEn pratique, il est donc recommandé d'organiser ce recensement de manière régulière, transparente et concertée, afin de sécuriser la collaboration et d'éviter les difficultés en fin de contrat.",
  },
  {
    id: 'synthese-facturation',
    articleKey: '6',
    apercuThemeId: 'forfaits',
    questionnaireStep: 6,
    match: /synthèse issue du logiciel de facturation est annexée au présent contrat chaque mois/i,
    comment:
      "Cette annexe est utile pour sécuriser la collaboration et faciliter la transparence entre les parties. Le commentaire de l'Ordre recommande en effet de prévoir un document permettant d'identifier clairement les modalités de facturation, de répartition et de reversement des forfaits.\n\nLa jurisprudence rappelle également l'importance de conserver des éléments comptables clairs et exploitables. À défaut de justificatifs suffisants, les demandes de redevance ou de régularisation complémentaire peuvent être rejetées.\n\nEn pratique, il est donc préférable d'annexer au contrat une synthèse issue du logiciel de facturation et de l'actualiser à chaque changement d'organisation ou de planning.",
  },
  {
    id: 'redevance-suspension',
    articleKey: '7',
    apercuThemeId: 'redevance',
    questionnaireStep: 8,
    match: /impossibilité d'accéder aux locaux du fait du Titulaire/i,
    comment:
      "Cette précision permet de sécuriser les relations entre les parties, notamment en fin de contrat.\n\nLa jurisprudence a déjà rappelé qu'un titulaire ne peut pas réclamer une redevance complémentaire lorsque le collaborateur a été privé d'accès aux locaux pendant la période de préavis. Dans un arrêt du 16 mai 2017, la cour d'appel d'Aix-en-Provence a ainsi rejeté une telle demande.\n\nPar ailleurs, le commentaire de l'Ordre recommande de prévoir une redevance proportionnée au temps de présence effectif du collaborateur. La proratisation permet donc d'assurer une répartition plus juste des charges et de limiter les risques de contestation.",
  },
  {
    id: 'assurance-locaux',
    articleKey: '9',
    match: /attestation d'assurance couvrant les locaux mis à sa disposition/i,
    comment:
      "Cette précision permet de clarifier les assurances de chacun. Le Collaborateur doit être couvert pour sa responsabilité professionnelle, c'est-à-dire pour les actes qu'il réalise dans le cadre de son activité. De son côté, le Titulaire doit pouvoir justifier que les locaux mis à disposition sont bien assurés.\n\nEn pratique, annexer les attestations d'assurance au contrat permet d'éviter les incertitudes en cas de sinistre ou de difficulté liée à l'utilisation des locaux.",
  },
  {
    id: 'planning-conges',
    articleKey: '10',
    match: /fixation des dates et durées des congés, sont déterminées d'un commun accord/i,
    comment:
      "Cette clause vise à préserver l'équilibre de la collaboration libérale. Le planning, les congés et les absences doivent être organisés d'un commun accord, afin de respecter l'indépendance de chacun et d'éviter toute situation pouvant être interprétée comme un lien de subordination.\n\nEn effet, une fixation unilatérale des congés peut constituer un indice de subordination. La cour d'appel de Pau l'a notamment retenu en 2015.\n\nLa clause permet également d'assurer la continuité des soins. La cour d'appel de Poitiers, dans un arrêt du 28 février 2023, a validé le principe selon lequel l'organisation des congés peut prévoir que le cabinet ne soit pas simultanément déserté par les professionnels.",
  },
  {
    id: 'arret-maladie',
    articleKey: '12',
    match: /En cas de maladie, le Collaborateur organise, dans la mesure du possible, son remplacement/i,
    comment:
      "Cette clause permet d'organiser concrètement la continuité des soins pendant l'absence du Collaborateur, en prévoyant la recherche d'un remplaçant et, si nécessaire, l'aide du Titulaire dans cette démarche.\n\nElle protège également le Collaborateur pendant son arrêt maladie.",
  },
  {
    id: 'duree-determinee',
    articleKey: '14',
    apercuThemeId: 'duree',
    questionnaireStep: 9,
    showWhen: function (ctx) {
      return ctx && ctx.dureeType === 'determinee';
    },
    match: /présent contrat est conclu à compter du/i,
    comment:
      "Attention : Sauf situation exceptionnelle dûment justifiée par les parties, notamment en cas de longue maladie, d'hospitalisation ou de circonstances particulières, la durée du contrat ne peut être inférieure à six mois.",
  },
  {
    id: 'duree-indeterminee',
    articleKey: '14',
    apercuThemeId: 'duree',
    questionnaireStep: 9,
    showWhen: function (ctx) {
      return ctx && ctx.dureeType === 'indeterminee';
    },
    match: /présent contrat est conclu pour une durée indéterminée/i,
    comment:
      "Cette clause permet de clarifier dès le départ la durée de la collaboration : soit pour une durée déterminée, soit pour une durée indéterminée.\n\nLorsque le contrat est conclu pour une durée déterminée, il est important d'éviter les contrats trop courts. Le commentaire de l'Ordre rappelle en effet qu'une durée inférieure à six mois ne correspond pas, sauf situation exceptionnelle, à l'esprit de la collaboration libérale et peut fragiliser le contrat.\n\nPour les contrats à durée indéterminée, il est utile de prévoir un point régulier entre les parties. Ce réexamen permet d'adapter le contrat à l'évolution de la collaboration, notamment en ce qui concerne les conditions d'exercice, la patientèle, les moyens mis à disposition, la rémunération ou encore la redevance.",
  },
  {
    id: 'periode-essai',
    articleKey: '15',
    apercuThemeId: 'duree',
    match: /PÉRIODE D['\u2019]ESSAI/i,
    comment:
      "Cette clause permet de clarifier les conditions dans lesquelles il peut être mis fin à la collaboration pendant la période d'essai.",
  },
  {
    id: 'fin-contrat-preavis',
    articleKey: '16',
    apercuThemeId: 'duree',
    match: /FIN DE CONTRAT ET PRÉAVIS/i,
    comment:
      "Cette clause permet d'encadrer clairement les conditions de fin de la collaboration, afin que chaque partie connaisse les démarches à respecter, notamment le délai de préavis et la forme de la notification.\n\nDe manière générale, le droit de mettre fin au contrat doit être exercé de bonne foi. La jurisprudence a déjà admis qu'une résiliation pouvait être abusive lorsqu'elle était utilisée pour priver le Collaborateur de droits prévus au contrat, notamment un droit de priorité. Dans ce cas, une indemnisation peut être accordée au titre de la perte de chance.",
  },
  {
    id: 'non-concurrence',
    articleKey: '19',
    match: /ne pas s'installer, directement ou indirectement, à titre libéral, pendant une durée de 12/i,
    comment:
      "Les rayons de 6 à 10 km ou exclusion d'une commune sont fréquemment admis. C'est pourquoi nous proposons de retenir 10 km. 20 km peuvent être jugés licites en zone rurale ; un périmètre couvrant de facto toute une ville moyenne peut être sanctionné.\n\nNous vous recommandons 1 an pour maximiser les chances de validité de la clause en cas de litige. En effet, si deux ans sont qualifiés de durée habituellement retenue et largement validés, ce n'est pas toujours le cas. Trois ans et plus peuvent être admis rarement selon le contexte.",
  },
];

function normalizeText(s) {
  return String(s || '')
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/\u00a0/g, ' ');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** @param {string} comment */
export function renderCommentHtml(comment) {
  const body = String(comment || '')
    .split(/\n\n+/)
    .filter(Boolean)
    .map(function (p) {
      return '<p>' + escapeHtml(p.trim()) + '</p>';
    })
    .join('');
  return (
    '<aside class="ac-avocate-note" role="note">' +
    '<p class="ac-avocate-note__label">Commentaire de Me Violaine</p>' +
    '<div class="ac-avocate-note__body">' +
    body +
    '</div></aside>'
  );
}

/** @param {{ isPreamble?: boolean, heading?: string, lines?: string[] }} section */
export function getCommentsForArticleSection(section) {
  if (!section || section.isPreamble) return [];
  const keyMatch = String(section.heading || '').match(/Article\s+(\d+(?:\.\d+)?)(?:er|re)?\b/i);
  const key = keyMatch ? keyMatch[1] : null;
  if (!key) return [];
  const fullText = normalizeText(
    (section.heading || '') + '\n' + (section.lines || []).join('\n')
  );
  return AVOCATE_COMMENTS.filter(function (c) {
    if (c.articleKey !== key) return false;
    if (!c.match) return true;
    return (
      c.match.test(fullText) ||
      c.match.test(normalizeText(section.heading || ''))
    );
  });
}

/** @deprecated use getCommentsForArticleSection */
export function getCommentsForArticle(section) {
  return getCommentsForArticleSection(section);
}

/** @param {number} step @param {{ dureeType?: string }} [ctx] */
export function getCommentsForQuestionnaireStep(step, ctx) {
  return AVOCATE_COMMENTS.filter(function (c) {
    if (c.questionnaireStep !== step) return false;
    if (typeof c.showWhen === 'function' && !c.showWhen(ctx || {})) return false;
    return true;
  });
}

/** @param {string} themeId */
export function getCommentsForApercuTheme(themeId) {
  return AVOCATE_COMMENTS.filter(function (c) {
    return c.apercuThemeId === themeId;
  });
}

/** @param {string} line */
export function findCommentsMatchingLine(line) {
  const text = normalizeText(line);
  if (!text.trim()) return [];
  return AVOCATE_COMMENTS.filter(function (c) {
    return c.match && c.match.test(text);
  });
}

/** @param {string} bodyText */
export function findCommentsInBody(bodyText) {
  const found = [];
  const seen = {};
  String(bodyText || '')
    .split('\n')
    .forEach(function (line) {
      findCommentsMatchingLine(line.trim()).forEach(function (c) {
        if (!seen[c.id]) {
          seen[c.id] = true;
          found.push(c);
        }
      });
    });
  return found;
}

export function getCommentById(id) {
  return AVOCATE_COMMENTS.find(function (c) {
    return c.id === id;
  });
}
