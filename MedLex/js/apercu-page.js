/**
 * parcours/apercu.html — clauses d’aperçu selon le parcours.
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
    '<span class="ac-locked__text">Contenu masqué jusqu’au paiement</span>' +
    '</div>' +
    '</div>';

  function renderClauses(clauses) {
    var avocate = window.MedLexAvocateComments;
    return clauses
      .map(function (c) {
        var notesHtml = '';
        if (avocate && c.themeId) {
          notesHtml = avocate
            .getCommentsForApercuTheme(c.themeId)
            .map(function (note) {
              return avocate.renderCommentHtml(note.comment);
            })
            .join('');
        }
        return (
          '<article class="ac-card">' +
          '<h2 class="ac-card__title">' +
          c.title +
          '</h2>' +
          '<p class="ac-card__desc">' +
          c.desc +
          '</p>' +
          notesHtml +
          LOCKED_BLOCK +
          '</article>'
        );
      })
      .join('');
  }

  function init() {
    if (!window.ParcoursType) return;

    window.ParcoursType.applyApercuBackLinks();

    var parcours = window.ParcoursType.get();
    var clauses =
      window.MedLexClauseThemes && window.MedLexClauseThemes.forApercu
        ? window.MedLexClauseThemes.forApercu(parcours)
        : [];

    var list = document.getElementById('apercu-clauses');
    if (list) {
      list.innerHTML = renderClauses(clauses);
    }

    var title = document.querySelector('.ac-title--page');
    if (title) {
      if (parcours === 'collaboration') {
        title.textContent = 'Ce qui sera dans ton contrat de collaboration';
      } else if (parcours === 'fin-de-bail') {
        title.textContent = 'Ce qui sera dans ton courrier de fin de bail';
      } else if (parcours === 'mise-en-demeure') {
        title.textContent = 'Ce qui sera dans ta mise en demeure';
      } else if (parcours === 'bail-professionnel') {
        title.textContent = 'Ce qui sera dans ton bail professionnel';
      } else {
        title.textContent = 'Ce qui sera dans ton contrat';
      }
    }

    if (parcours === 'collaboration') {
      document.title = 'Aperçu du contrat de collaboration · MedLex';
    } else if (parcours === 'fin-de-bail') {
      document.title = 'Aperçu fin de bail · MedLex';
    } else if (parcours === 'mise-en-demeure') {
      document.title = 'Aperçu mise en demeure · MedLex';
    } else if (parcours === 'bail-professionnel') {
      document.title = 'Aperçu bail professionnel · MedLex';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
