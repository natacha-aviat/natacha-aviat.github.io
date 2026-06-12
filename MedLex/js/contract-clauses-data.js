/**
 * Thèmes didactiques pour l’aperçu et la relecture guidée du contrat.
 * Les motifs utilisent \b pour éviter qu’« Article 1 » matche « Article 10 ».
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

  window.MedLexClauseThemes = {
    collaboration: COLLABORATION,
    remplacement: REMPLACEMENT,
    /** Pour l’aperçu (titres + desc sans match). */
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
})();
