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
    var clauses =
      window.MedLexClauseThemes && window.MedLexClauseThemes.forApercu
        ? window.MedLexClauseThemes.forApercu(isCollab ? 'collaboration' : 'remplacement')
        : [];

    var list = document.getElementById('apercu-clauses');
    if (list) {
      list.innerHTML = renderClauses(clauses);
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
