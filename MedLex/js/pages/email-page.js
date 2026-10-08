/**
 * parcours/email.html — enregistre le type de contrat et adapte le fil d’Ariane.
 */
(function () {
  var params = new URLSearchParams(window.location.search);
  var preset = params.get('type');

  if (window.ParcoursType) {
    window.ParcoursType.initFromQuery();
  }

  if (window.ParcoursType && window.ParcoursType.known(preset)) {
    var back = document.querySelector('.ac-back');
    if (back) {
      back.setAttribute('href', '../index.html');
    }
  }
})();
