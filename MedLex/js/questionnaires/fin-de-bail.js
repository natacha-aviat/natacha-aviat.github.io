/* Parcours fin de bail. Défilement : questionnaire-runner.js. Métadonnées : parcours-type.js. */
(function () {
  var saveLabel = "Enregistrer et retour au document";

  function isBlocked(q) {
    if (q.selectedValue("usage-pro") === "non") return true;
    if (q.selectedValue("litige") === "oui") return true;
    if (
      q.selectedValue("situation") === "proprietaire-non-renouvellement" &&
      q.selectedValue("role") === "proprietaire" &&
      q.selectedValue("delai-six-mois") === "non"
    ) {
      return true;
    }
    if (q.selectedValue("notification-recommande") === "non") return true;
    return false;
  }

  function selectChoice(group, value) {
    document.querySelectorAll('[data-select="' + group + '"]').forEach(function (btn) {
      btn.classList.toggle("ac-choice--selected", btn.getAttribute("data-value") === value);
    });
  }

  function updateConditionals(q) {
    q.toggle(document.getElementById("block-usage"), q.selectedValue("usage-pro") === "non");
    q.toggle(document.getElementById("block-litige"), q.selectedValue("litige") === "oui");

    var isModelB = q.selectedValue("situation") === "proprietaire-non-renouvellement";
    if (isModelB && q.selectedValue("role") !== "proprietaire") selectChoice("role", "proprietaire");
    if (!isModelB && q.selectedValue("role") !== "locataire" && q.selectedValue("situation") === "locataire-quitte") {
      selectChoice("role", "locataire");
    }

    var isProprio = q.selectedValue("role") === "proprietaire";
    q.toggle(document.getElementById("bloc-delai-six"), isModelB && isProprio);
    q.toggle(document.getElementById("block-delai"), isModelB && isProprio && q.selectedValue("delai-six-mois") === "non");
    q.toggle(document.getElementById("bloc-preavis"), !isModelB);

    var preavis = q.selectedValue("preavis-six");
    var info = document.getElementById("info-preavis");
    if (info) {
      if (preavis === "ne-sais-pas") {
        info.textContent = "Le délai légal est de 6 mois. Il sera appliqué dans le courrier.";
        q.toggle(info, true);
      } else if (preavis === "non") {
        info.textContent =
          "Le délai de 6 mois est obligatoire, sauf faute de l’une ou l’autre des parties. Si tu continues, le délai de 6 mois sera automatiquement appliqué.";
        q.toggle(info, true);
      } else {
        info.textContent = "";
        q.toggle(info, false);
      }
    }

    q.toggle(document.getElementById("block-notification"), q.selectedValue("notification-recommande") === "non");
  }

  function persist() {
    if (window.ParcoursFinDeBailSnapshot) window.ParcoursFinDeBailSnapshot.save();
  }

  window.MedLexQuestionnaire({
    steps: 8,
    type: "fin-de-bail",
    saveLabel: saveLabel,
    isBlocked: isBlocked,
    onStep: updateConditionals,
    onSave: persist,
    onFinish: persist,
    onRestore: function () {
      if (!window.ParcoursFinDeBailSnapshot) return;
      window.ParcoursFinDeBailSnapshot.restorePending();
      var existing = window.ParcoursFinDeBailSnapshot.load();
      if (existing) window.ParcoursFinDeBailSnapshot.applyVisible(existing);
    },
  });
})();
