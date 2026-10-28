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

  var FIN_DE_BAIL = [
    {
      id: 'cadre-bail',
      title: 'Cadre du congé',
      desc: 'Bail professionnel uniquement, résiliation amiable — sans litige ni faute imputable.',
    },
    {
      id: 'modele',
      title: 'Qui prend l’initiative',
      desc: 'Modèle A si le locataire quitte les locaux, modèle B si le propriétaire refuse le renouvellement à l’échéance.',
    },
    {
      id: 'parties',
      title: 'Bailleur et Preneur',
      desc: 'Identités, adresses et éventuel représentant du propriétaire — pour que le courrier soit complet.',
    },
    {
      id: 'locaux',
      title: 'Locaux et dates',
      desc: 'Adresse des locaux, date de signature et d’échéance du bail — références exactes du congé.',
    },
    {
      id: 'preavis',
      title: 'Préavis de six mois',
      desc: 'Délai légal rappelé dans le courrier, avec envoi en lettre recommandée avec avis de réception.',
    },
    {
      id: 'sortie',
      title: 'État des lieux et clés',
      desc: 'Proposition de convenir d’une date pour l’état des lieux, la restitution des clés et du dépôt de garantie.',
    },
  ];

  var MISE_EN_DEMEURE = [
    {
      id: 'cadre-med',
      title: 'Cadre de la mise en demeure',
      desc: 'Premier courrier pour faute du bailleur — pas une résolution anticipée. Bail professionnel uniquement.',
    },
    {
      id: 'manquements',
      title: 'Manquements reprochés',
      desc: 'Obligations inexécutées, description factuelle, persistance et impossibilité d’usage des locaux.',
    },
    {
      id: 'preuves-med',
      title: 'Preuves et pièces jointes',
      desc: 'Éléments justificatifs listés dans le courrier (constat, photos, devis, expertise…).',
    },
    {
      id: 'mesures',
      title: 'Mise en conformité',
      desc: 'Mesures demandées au bailleur et délai raisonnable pour y remédier.',
    },
    {
      id: 'suite',
      title: 'Suite possible',
      desc: 'À défaut d’exécution, possibilité d’un second courrier de résolution anticipée — sans garantie judiciaire.',
    },
  ];

  var BAIL_PROFESSIONNEL = [
    {
      id: 'parties-bail',
      title: 'Parties et locaux',
      desc: 'Identification du Bailleur et du Preneur, désignation des locaux et destination exclusivement professionnelle.',
    },
    {
      id: 'duree-bail',
      title: 'Durée et congés',
      desc: 'Bail de 6 ans, congé du Preneur avec préavis de 6 mois, non-renouvellement par le Bailleur à l’échéance.',
    },
    {
      id: 'loyer-charges',
      title: 'Loyer, charges et dépôt',
      desc: 'Loyer mensuel, TVA éventuelle, révision ILAT, provision sur charges et dépôt de garantie.',
    },
    {
      id: 'obligations-bail',
      title: 'Obligations des parties',
      desc: 'Obligations du Bailleur et du Preneur, accessibilité, déchets DASRI, plaque et assurances.',
    },
    {
      id: 'cession-sousloc',
      title: 'Cession et sous-location',
      desc: 'Cadre de la cession du bail, sous-location, remplacement/collaboration et droit de préférence.',
    },
    {
      id: 'fin-bail-clauses',
      title: 'Fin du bail et garanties',
      desc: 'Clause résolutoire, intérêts de retard, diagnostics, confidentialité et restitution des locaux.',
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

  var FIN_BAIL_ARTICLE_META = {
    preamble: {
      desc: 'Courrier de congé du bail professionnel — identité des parties, locaux et préavis de six mois.',
      editSteps: [
        { step: 2, label: 'Modifier la situation' },
        { step: 3, label: 'Modifier le bailleur' },
        { step: 4, label: 'Modifier le preneur' },
        { step: 5, label: 'Modifier les locaux' },
        { step: 6, label: 'Modifier les dates' },
      ],
    },
  };

  var MISE_EN_DEMEURE_ARTICLE_META = {
    preamble: {
      desc: 'Mise en demeure préalable pour faute du bailleur — faits, mesures demandées et délai.',
      editSteps: [
        { step: 1, label: 'Modifier les manquements' },
        { step: 4, label: 'Modifier les faits' },
        { step: 6, label: 'Modifier les mesures' },
        { step: 7, label: 'Modifier les parties' },
      ],
    },
  };

  var BAIL_PRO_ARTICLE_META = {
    preamble: {
      desc: 'Identification du Bailleur et du Preneur, et rappel du cadre du bail professionnel.',
      editSteps: [
        { step: 0, label: 'Modifier le bailleur' },
        { step: 1, label: 'Modifier le preneur' },
      ],
    },
    '1': {
      desc: 'Désignation des locaux loués — adresse, superficie, pièces et nature de l’immeuble.',
      editStep: 2,
    },
    '2': {
      desc: 'Destination exclusivement professionnelle : cabinet infirmier libéral.',
    },
    '3': {
      desc: 'Durée de 6 ans — dates de prise d’effet et d’expiration.',
      editStep: 3,
    },
    '4': {
      desc: 'Congé du Preneur, non-renouvellement par le Bailleur et résiliation amiable.',
    },
    '5': {
      desc: 'Loyer mensuel, TVA éventuelle et modalités de paiement.',
      editStep: 4,
    },
    '6': { desc: 'Révision annuelle du loyer selon l’indice ILAT.' },
    '7': {
      desc: 'Charges, taxes et provision mensuelle.',
      editStep: 5,
    },
    '8': {
      desc: 'Dépôt de garantie versé à la signature.',
      editStep: 5,
    },
    '9': { desc: 'États des lieux d’entrée et de sortie.' },
    '10': { desc: 'Obligations du Bailleur.' },
    '11': { desc: 'Obligations du Preneur.' },
    '12': { desc: 'Accessibilité, aménagements et conformité professionnelle.' },
    '13': { desc: 'Gestion des déchets professionnels, notamment DASRI.' },
    '14': { desc: 'Plaque professionnelle.' },
    '15': { desc: 'Assurances à souscrire et maintenir.' },
    '16': { desc: 'Cession du bail.' },
    '17': {
      desc: 'Sous-location, remplacement, collaboration et partage de locaux.',
      editStep: 6,
    },
    '18': {
      desc: 'Droit de préférence en cas de vente des locaux.',
      editStep: 7,
    },
    '19': { desc: 'Clause résolutoire.' },
    '20': { desc: 'Intérêts de retard et indemnités d’occupation.' },
    '21': { desc: 'Diagnostics et informations remis au Preneur.' },
    '22': { desc: 'Confidentialité et secret professionnel.' },
    '23': { desc: 'Restitution des locaux en fin de bail.' },
    '24': { desc: 'Élection de domicile.' },
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
    var store =
      parcours === 'collaboration'
        ? COLLAB_ARTICLE_META
        : parcours === 'fin-de-bail'
          ? FIN_BAIL_ARTICLE_META
          : parcours === 'mise-en-demeure'
            ? MISE_EN_DEMEURE_ARTICLE_META
            : parcours === 'bail-professionnel'
              ? BAIL_PRO_ARTICLE_META
              : REMPL_ARTICLE_META;
    var extra = store[key] || {};
    var title =
      (parcours === 'fin-de-bail' || parcours === 'mise-en-demeure') && section.isPreamble
        ? parcours === 'mise-en-demeure'
          ? 'Mise en demeure du bailleur'
          : 'Courrier de fin de bail'
        : section.isPreamble
          ? parcours === 'bail-professionnel'
            ? 'Préambule et parties'
            : 'Préambule et parties'
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
    var base = 'questionnaire.html';
    if (parcours === 'collaboration') base = 'questionnaire-collaboration.html';
    if (parcours === 'fin-de-bail') base = 'questionnaire-fin-de-bail.html';
    if (parcours === 'mise-en-demeure') base = 'questionnaire-mise-en-demeure.html';
    if (parcours === 'bail-professionnel') base = 'questionnaire-bail-professionnel.html';
    if (editStep == null) return null;
    return base + '?step=' + editStep + '&from=contrat';
  }

  window.LibéLexClauseThemes = {
    collaboration: COLLABORATION,
    remplacement: REMPLACEMENT,
    'fin-de-bail': FIN_DE_BAIL,
    'mise-en-demeure': MISE_EN_DEMEURE,
    'bail-professionnel': BAIL_PROFESSIONNEL,
    forApercu: function (parcours) {
      var list =
        parcours === 'collaboration'
          ? COLLABORATION
          : parcours === 'fin-de-bail'
            ? FIN_DE_BAIL
            : parcours === 'mise-en-demeure'
              ? MISE_EN_DEMEURE
              : parcours === 'bail-professionnel'
                ? BAIL_PROFESSIONNEL
                : REMPLACEMENT;
      return list
        .filter(function (t) {
          return parcours === 'fin-de-bail' || parcours === 'mise-en-demeure' || parcours === 'bail-professionnel'
            ? true
            : t.id !== 'cadre';
        })
        .map(function (t) {
          return { themeId: t.id, title: t.title, desc: t.desc };
        });
    },
  };

  window.LibéLexArticleGuide = {
    getArticleMeta: getArticleMeta,
    questionnaireHref: questionnaireHref,
    articleKeyFromSection: articleKeyFromSection,
  };
})();
