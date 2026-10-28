/**
 * Catalogue des parcours LibéLex.
 *
 * Pour en ajouter un : une entrée ici, une page parcours/questionnaire-….html,
 * un fichier js/questionnaires/, un snapshot js/snapshots/,
 * et un dossier js/contract/<id>/. Le reste (choix, email, aperçu, contrat) lit ce catalogue.
 */
(function () {
  var STORAGE_KEY = "ac-parcours-type";
  var DEFAULT_ID = "remplacement";

  var TYPE_LABELS = {
    continue: "Remplacement continu",
    discontinu: "Remplacement discontinu",
    planning: "Planning variable",
  };

  var CATALOG = {
    remplacement: {
      id: "remplacement",
      questionnaire: "questionnaire.html",
      label: "Contrat de remplacement",
      labelShort: "Remplacement",
      documentTitle: "Contrat de remplacement infirmier libéral",
      noun: "contrat",
      apercuHeading: "Ce qui sera dans ton contrat",
      apercuTitle: "Aperçu du contrat · LibéLex",
      ariaPreview: "Aperçu du contrat de remplacement",
      snapshot: "ParcoursSnapshot",
      embedded: "../js/contract/embedded/libelex-contract-template-embedded.js",
      module: "./contract/libelex-contract.js",
      contractGlobal: "LibéLexContract",
      defaultExport: true,
      pdf: "contrat-de-remplacement-libelex.pdf",
      subtitle: function (answers) {
        return (
          (answers.rpNom || "") +
          " et " +
          (answers.rNom || "") +
          " · " +
          (TYPE_LABELS[answers.typeRemplacement] || "Remplacement")
        );
      },
    },
    collaboration: {
      id: "collaboration",
      questionnaire: "questionnaire-collaboration.html",
      label: "Contrat de collaboration",
      labelShort: "Collaboration",
      documentTitle: "Contrat de collaboration infirmier libéral",
      noun: "contrat",
      apercuHeading: "Ce qui sera dans ton contrat de collaboration",
      apercuTitle: "Aperçu du contrat de collaboration · LibéLex",
      ariaPreview: "Aperçu du contrat de collaboration",
      snapshot: "ParcoursCollaborationSnapshot",
      embedded: "../js/contract/embedded/libelex-collaboration-template-embedded.js",
      module: "./contract/collaboration/libelex-collaboration-contract.js",
      contractGlobal: "LibéLexCollaborationContract",
      pdf: "contrat-de-collaboration-libelex.pdf",
      subtitle: function (answers) {
        return (answers.tNom || "") + " et " + (answers.cNom || "");
      },
    },
    "fin-de-bail": {
      id: "fin-de-bail",
      questionnaire: "questionnaire-fin-de-bail.html",
      label: "Fin de bail professionnel",
      labelShort: "Fin de bail",
      documentTitle: "Fin de bail professionnel",
      noun: "courrier",
      pageHeading: "Ton courrier",
      pageLead:
        "Paiement confirmé — parcours le courrier, ou consulte le texte intégral avant la signature.",
      apercuHeading: "Ce qui sera dans ton courrier de fin de bail",
      apercuTitle: "Aperçu fin de bail · LibéLex",
      ariaPreview: "Aperçu du courrier de fin de bail",
      snapshot: "ParcoursFinDeBailSnapshot",
      embedded: "../js/contract/embedded/libelex-fin-de-bail-templates-embedded.js",
      module: "./contract/fin-de-bail/libelex-fin-de-bail-contract.js",
      contractGlobal: "LibéLexFinDeBailContract",
      pdf: "conge-bail-professionnel-libelex.pdf",
      answersFirst: true,
      templateUsesAnswers: true,
      subtitle: function (answers) {
        var kind = answers.isModeleB
          ? "Congé pour non-renouvellement (propriétaire)"
          : "Notification de congé (locataire)";
        return kind + " — " + (answers.identitePreneur || "") + " · " + (answers.identiteBailleur || "");
      },
    },
    "mise-en-demeure": {
      id: "mise-en-demeure",
      questionnaire: "questionnaire-mise-en-demeure.html",
      label: "Mise en demeure du bailleur",
      labelShort: "Mise en demeure",
      documentTitle: "Mise en demeure du bailleur",
      noun: "courrier",
      pageHeading: "Ton courrier",
      pageLead:
        "Paiement confirmé — parcours le courrier, ou consulte le texte intégral avant la signature.",
      apercuHeading: "Ce qui sera dans ta mise en demeure",
      apercuTitle: "Aperçu mise en demeure · LibéLex",
      ariaPreview: "Aperçu de la mise en demeure",
      snapshot: "ParcoursMiseEnDemeureSnapshot",
      embedded: "../js/contract/embedded/libelex-mise-en-demeure-template-embedded.js",
      module: "./contract/mise-en-demeure/libelex-mise-en-demeure-contract.js",
      contractGlobal: "LibéLexMiseEnDemeureContract",
      pdf: "mise-en-demeure-bailleur-libelex.pdf",
      answersFirst: true,
      subtitle: function (answers) {
        return (answers.identitePreneur || "") + " → " + (answers.identiteBailleur || "");
      },
    },
    "bail-professionnel": {
      id: "bail-professionnel",
      questionnaire: "questionnaire-bail-professionnel.html",
      label: "Bail professionnel",
      labelShort: "Bail pro",
      documentTitle: "Bail professionnel",
      noun: "bail",
      pageHeading: "Ton bail",
      pageLead:
        "Paiement confirmé — parcours le bail section par section, ou consulte le texte intégral avant la signature.",
      apercuHeading: "Ce qui sera dans ton bail professionnel",
      apercuTitle: "Aperçu bail professionnel · LibéLex",
      ariaPreview: "Aperçu du bail professionnel",
      snapshot: "ParcoursBailProfessionnelSnapshot",
      embedded: "../js/contract/embedded/libelex-bail-professionnel-template-embedded.js",
      module: "./contract/bail-professionnel/libelex-bail-professionnel-contract.js",
      contractGlobal: "LibéLexBailProfessionnelContract",
      pdf: "bail-professionnel-libelex.pdf",
      answersFirst: true,
      subtitle: function (answers) {
        return (answers.identitePreneur || "") + " · " + (answers.identiteBailleur || "");
      },
    },
  };

  function known(type) {
    return Boolean(type && CATALOG[type]);
  }

  function normalize(type) {
    return known(type) ? type : DEFAULT_ID;
  }

  function entry(type) {
    return CATALOG[normalize(type == null ? get() : type)];
  }

  function set(type) {
    try {
      sessionStorage.setItem(STORAGE_KEY, normalize(type));
    } catch (e) {
      /* navigation privée */
    }
  }

  function get() {
    try {
      var value = sessionStorage.getItem(STORAGE_KEY);
      return value ? normalize(value) : DEFAULT_ID;
    } catch (e) {
      return DEFAULT_ID;
    }
  }

  function snapshotApi(type) {
    var item = entry(type);
    return item && window[item.snapshot];
  }

  function applyHref(selector) {
    var href = entry().questionnaire;
    document.querySelectorAll(selector).forEach(function (el) {
      el.setAttribute("href", href);
    });
  }

  function initFromQuery() {
    var type = new URLSearchParams(window.location.search).get("type");
    if (known(type)) set(type);
  }

  window.ParcoursType = {
    STORAGE_KEY: STORAGE_KEY,
    set: set,
    get: get,
    known: known,
    entry: entry,
    snapshotApi: snapshotApi,
    isCollaboration: function () {
      return get() === "collaboration";
    },
    isFinDeBail: function () {
      return get() === "fin-de-bail";
    },
    isMiseEnDemeure: function () {
      return get() === "mise-en-demeure";
    },
    isBailProfessionnel: function () {
      return get() === "bail-professionnel";
    },
    questionnaireUrl: function () {
      return entry().questionnaire;
    },
    label: function () {
      return entry().label;
    },
    labelShort: function () {
      return entry().labelShort;
    },
    applyQuestionnaireLinks: function () {
      applyHref("[data-ac-questionnaire-link]");
    },
    applyApercuBackLinks: function () {
      applyHref("[data-ac-apercu-back]");
    },
    initFromQuery: initFromQuery,
  };
})();
