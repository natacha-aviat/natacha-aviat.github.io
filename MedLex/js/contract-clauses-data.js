/**
 * Thèmes didactiques (aperçu) et métadonnées par article (relecture guidée).
 */
(function () {
  var COLLABORATION = [
    {
      id: 'cadre',
      title: 'Objet et cadre',
      desc: 'Ce passage pose le cadre légal de la collaboration libérale — sans lien de subordination.',
      match: /Article\s+1(?:er|re)?\b/i,
    },
    {
      id: 'patientele',
      title: 'Patientèle du collaborateur',
      desc: 'Ce paragraphe encadre le temps consacré à ta patientèle personnelle — journées ou demi-journées, clair pour les deux.',
      match: /Article\s+2\b/i,
    },
    {
      id: 'organisation',
      title: 'Organisation de la collaboration',
      desc: 'Ce paragraphe fixe le temps minimum dédié à la collaboration et évite une requalification en salariat.',
      match: /Article\s+3\b/i,
    },
    {
      id: 'recensement',
      title: 'Recensement des patientèles',
      desc: 'Ce paragraphe encadre le suivi de chaque patientèle — un point de repère clair en cas d’évolution ou de fin de collaboration.',
      match: /Article\s+4\b/i,
    },
    {
      id: 'lieu',
      title: 'Lieu d’exercice et moyens',
      desc: 'Ce paragraphe précise l’adresse du cabinet et les moyens mis à disposition (salle de soins, secrétariat, dossiers…).',
      match: /Article\s+5\b/i,
    },
    {
      id: 'forfaits',
      title: 'Répartition des forfaits',
      desc: 'Ce paragraphe te protège sur la clé de répartition et les délais de reversement en cas de prise en charge commune.',
      match: /Article\s+6\b/i,
    },
    {
      id: 'redevance',
      title: 'Redevance de collaboration',
      desc: 'Ce paragraphe fixe la redevance (pourcentage du CA ou forfait mensuel) et la date limite de versement.',
      match: /Article\s+7\b/i,
    },
    {
      id: 'duree',
      title: 'Durée et fin du contrat',
      desc: 'Ce paragraphe cadre la durée (déterminée ou indéterminée) et les conditions de préavis en cas de rupture.',
      match: /Article\s+1[456]\b/i,
    },
  ];

  var REMPLACEMENT = [
    {
      id: 'cadre',
      title: 'Objet et parties',
      desc: 'Ce passage identifie qui remplace qui, pour quel motif, et dans quel cadre.',
      match: /Article\s+1(?:er|re)?\b/i,
    },
    {
      id: 'duree',
      title: 'Durée du remplacement',
      desc: 'Ce paragraphe te protège en cas de prolongation imprévue — personne ne reste dans le flou.',
      match: /Article\s+(?:2|9|10)\b/i,
    },
    {
      id: 'lieu',
      title: 'Lieu et organisation',
      desc: 'Où tu exerces, comment s’organise le remplacement au quotidien.',
      match: /Article\s+3\b|Article\s+4\s/i,
    },
    {
      id: 'facturation',
      title: 'Modalités de facturation',
      desc: 'Ce paragraphe te protège si un litige survient sur qui facture quoi, le reversement de la redevance, et comment.',
      match: /Article\s+5\b|Article\s+8\.4/i,
    },
    {
      id: 'resiliation',
      title: 'Résiliation anticipée',
      desc: "Ce paragraphe te protège si l'une de vous doit arrêter le remplacement plus tôt que prévu.",
      match: /Article\s+8(?!\.4)/i,
    },
    {
      id: 'fiscal',
      title: 'Obligations fiscales et sociales',
      desc: 'Ce paragraphe te protège sur la couverture RCP et les obligations ordinale pendant le remplacement.',
      match: /Article\s+6\b/i,
    },
    {
      id: 'nonconcurrence',
      title: 'Non-concurrence et patientèle',
      desc: 'Ce paragraphe te protège si le remplacement dépasse 3 mois — cadre légal, pas surprise.',
      match: /Article\s+11\b/i,
    },
  ];

  /** @type {Record<string, {desc?: string, editStep?: number}>} */
  var COLLAB_ARTICLE_META = {
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

  /** @type {Record<string, {desc?: string, editStep?: number}>} */
  var REMPL_ARTICLE_META = {
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

  function articleKeyFromSection(section) {
    if (section.isPreamble) return 'preamble';
    var m = String(section.heading || '').match(/Article\s+(\d+(?:\.\d+)?)(?:er|re)?\b/i);
    return m ? m[1] : 'misc';
  }

  function titleFromHeading(heading) {
    var parts = String(heading || '').split(/\s+[–\-]\s+/);
    if (parts.length > 1) return parts.slice(1).join(' – ').trim();
    return String(heading || '').trim();
  }

  function shortLabelFromKey(key, isPreamble) {
    if (isPreamble) return 'Intro';
    if (key === 'misc') return 'Passage';
    return 'Art. ' + key.replace('er', '');
  }

  function getArticleMeta(parcours, section) {
    var key = articleKeyFromSection(section);
    var store = parcours === 'collaboration' ? COLLAB_ARTICLE_META : REMPL_ARTICLE_META;
    var extra = store[key] || {};
    var title = section.isPreamble
      ? 'Préambule et parties'
      : titleFromHeading(section.heading);

    var editSteps = extra.editSteps
      ? extra.editSteps.slice()
      : extra.editStep != null
        ? [{ step: extra.editStep, label: 'Modifier' }]
        : [];

    return {
      key: key,
      shortLabel: shortLabelFromKey(key, section.isPreamble),
      title: title,
      desc:
        extra.desc ||
        'Ce passage précise tes droits et obligations sur ce point du contrat.',
      editSteps: editSteps,
    };
  }

  function questionnaireHref(parcours, editStep) {
    var base =
      parcours === 'collaboration' ? 'questionnaire-collaboration.html' : 'questionnaire.html';
    if (editStep == null) return null;
    return base + '?step=' + editStep + '&from=contrat';
  }

  window.MedLexClauseThemes = {
    collaboration: COLLABORATION,
    remplacement: REMPLACEMENT,
    forApercu: function (parcours) {
      var list = parcours === 'collaboration' ? COLLABORATION : REMPLACEMENT;
      return list
        .filter(function (t) {
          return t.id !== 'cadre';
        })
        .map(function (t) {
          return { title: t.title, desc: t.desc };
        });
    },
  };

  window.MedLexArticleGuide = {
    getArticleMeta: getArticleMeta,
    questionnaireHref: questionnaireHref,
    articleKeyFromSection: articleKeyFromSection,
  };
})();
