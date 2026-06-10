/**
 * Type de parcours contrat : remplacement ou collaboration.
 * Stocké en sessionStorage pour router vers le bon questionnaire.
 */
(function () {
  var STORAGE_KEY = "ac-parcours-type";
  var DEFAULT = "remplacement";

  function normalize(type) {
    return type === "collaboration" ? "collaboration" : "remplacement";
  }

  function set(type) {
    try {
      sessionStorage.setItem(STORAGE_KEY, normalize(type));
    } catch (e) {
      /* ignore */
    }
  }

  function get() {
    try {
      var v = sessionStorage.getItem(STORAGE_KEY);
      return v ? normalize(v) : DEFAULT;
    } catch (e) {
      return DEFAULT;
    }
  }

  function isCollaboration() {
    return get() === "collaboration";
  }

  function questionnaireUrl() {
    return isCollaboration() ? "questionnaire-collaboration.html" : "questionnaire.html";
  }

  function label() {
    return isCollaboration() ? "Contrat de collaboration" : "Contrat de remplacement";
  }

  function labelShort() {
    return isCollaboration() ? "Collaboration" : "Remplacement";
  }

  function applyQuestionnaireLinks() {
    document.querySelectorAll("[data-ac-questionnaire-link]").forEach(function (el) {
      el.setAttribute("href", questionnaireUrl());
    });
  }

  function applyApercuBackLinks() {
    document.querySelectorAll("[data-ac-apercu-back]").forEach(function (el) {
      el.setAttribute("href", questionnaireUrl());
    });
  }

  function initFromQuery() {
    var params = new URLSearchParams(window.location.search);
    var type = params.get("type");
    if (type === "remplacement" || type === "collaboration") {
      set(type);
    }
  }

  window.ParcoursType = {
    STORAGE_KEY: STORAGE_KEY,
    set: set,
    get: get,
    isCollaboration: isCollaboration,
    questionnaireUrl: questionnaireUrl,
    label: label,
    labelShort: labelShort,
    applyQuestionnaireLinks: applyQuestionnaireLinks,
    applyApercuBackLinks: applyApercuBackLinks,
    initFromQuery: initFromQuery,
  };
})();
