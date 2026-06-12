/**
 * parcours/apercu.html — clauses d’aperçu selon remplacement ou collaboration.
 */
(function () {
  var LOCKED_BLOCK =
    '<div class="ac-locked">' +
    '<div class="ac-locked__blur" aria-hidden="true">' +
    '<div class="ac-locked__line"></div>' +
    '<div class="ac-locked__line ac-locked__line--80"></div>' +
    '<div class="ac-locked__line ac-locked__line--60"></div>' +
    '</div>' +
    '<div class="ac-locked__overlay">' +
    '<span aria-hidden="true">🔒</span>' +
    '<span class="ac-locked__text">Texte complet débloqué après paiement</span>' +
    '</div>' +
    '</div>';

  var CLAUSES_REMPLACEMENT = [
    {
      title: 'Durée du remplacement',
      desc: 'Ce paragraphe te protège en cas de prolongation imprévue — personne ne reste dans le flou.',
    },
    {
      title: 'Modalités de facturation',
      desc: 'Ce paragraphe te protège si un litige survient sur qui facture quoi, et comment.',
    },
    {
      title: 'Redevance au remplacé',
      desc: 'Ce paragraphe te protège sur le montant et le calendrier de reversement, sans ambiguïté.',
    },
    {
      title: 'Résiliation anticipée',
      desc: "Ce paragraphe te protège si l'une de vous doit arrêter le remplacement plus tôt que prévu.",
    },
    {
      title: 'Responsabilité professionnelle',
      desc: 'Ce paragraphe te protège sur la couverture RCP et les obligations ordinale pendant le remplacement.',
    },
    {
      title: 'Non-concurrence',
      desc: 'Ce paragraphe te protège si le remplacement dépasse 3 mois — cadre légal, pas surprise.',
    },
  ];

  var CLAUSES_COLLABORATION = [
    {
      title: 'Patientèle du collaborateur',
      desc: 'Ce paragraphe encadre le temps consacré à ta patientèle personnelle — journées ou demi-journées, clair pour les deux.',
    },
    {
      title: 'Organisation de la collaboration',
      desc: 'Ce paragraphe fixe le temps minimum dédié à la collaboration et évite une requalification en salariat.',
    },
    {
      title: 'Lieu d’exercice et moyens',
      desc: 'Ce paragraphe précise l’adresse du cabinet et les moyens mis à disposition (salle de soins, secrétariat, dossiers…).',
    },
    {
      title: 'Répartition des forfaits',
      desc: 'Ce paragraphe te protège sur la clé de répartition et les délais de reversement en cas de prise en charge commune.',
    },
    {
      title: 'Redevance de collaboration',
      desc: 'Ce paragraphe fixe la redevance (pourcentage du CA ou forfait mensuel) et la date limite de versement.',
    },
    {
      title: 'Durée et fin du contrat',
      desc: 'Ce paragraphe cadre la durée (déterminée ou indéterminée) et les conditions de préavis en cas de rupture.',
    },
  ];

  function renderClauses(clauses) {
    return clauses
      .map(function (c) {
        return (
          '<article class="ac-card">' +
          '<h2 class="ac-card__title">' +
          c.title +
          '</h2>' +
          '<p class="ac-card__desc">' +
          c.desc +
          '</p>' +
          LOCKED_BLOCK +
          '</article>'
        );
      })
      .join('');
  }

  function init() {
    if (!window.ParcoursType) return;

    window.ParcoursType.applyApercuBackLinks();

    var isCollab = window.ParcoursType.isCollaboration();
    var list = document.getElementById('apercu-clauses');
    if (list) {
      list.innerHTML = renderClauses(isCollab ? CLAUSES_COLLABORATION : CLAUSES_REMPLACEMENT);
    }

    var title = document.querySelector('.ac-title--page');
    if (title) {
      title.textContent = isCollab
        ? 'Ce qui sera dans ton contrat de collaboration'
        : 'Ce qui sera dans ton contrat';
    }

    if (isCollab) {
      document.title = 'Aperçu du contrat de collaboration · Au Clair';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
