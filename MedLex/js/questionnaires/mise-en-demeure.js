/* Parcours mise en demeure. Défilement : questionnaire-runner.js. Métadonnées : parcours-type.js. */
(function () {
  var saveLabel = "Enregistrer et retour au document";

  function acksOk(q) {
    return (
      q.selectedValue("ack-gravite") === "oui" &&
      q.selectedValue("ack-contestation") === "oui" &&
      q.selectedValue("ack-juge") === "oui" &&
      q.selectedValue("ack-risque") === "oui" &&
      q.selectedValue("ack-loyers") === "oui"
    );
  }

  function isBlocked(q) {
    if (q.selectedValue("usage-pro") === "non") return true;
    if (q.selectedValue("faute-bailleur") === "non") return true;
    if (q.selectedValue("preuves") === "non") return true;
    if (q.selectedValue("urgence") === "oui") return true;
    if (q.step >= 3 && !acksOk(q)) return true;
    if (q.selectedValue("persistance") === "non") return true;
    if (q.selectedValue("usage-normal") === "oui") return true;
    if (q.selectedValue("envoi-lrar") === "non") return true;
    return false;
  }

  function updateConditionals(q) {
    q.toggle(document.getElementById("block-usage"), q.selectedValue("usage-pro") === "non");
    q.toggle(document.getElementById("block-faute"), q.selectedValue("faute-bailleur") === "non");
    q.toggle(document.getElementById("bloc-obligations"), q.selectedValue("faute-bailleur") !== "non");
    q.toggle(document.getElementById("block-preuves"), q.selectedValue("preuves") === "non");
    q.toggle(document.getElementById("bloc-pieces"), q.selectedValue("preuves") === "oui");
    q.toggle(document.getElementById("block-urgence"), q.selectedValue("urgence") === "oui");
    q.toggle(document.getElementById("bloc-acks"), q.selectedValue("urgence") !== "oui");
    q.toggle(document.getElementById("block-acks"), q.step === 3 && q.selectedValue("urgence") !== "oui" && !acksOk(q));
    q.toggle(document.getElementById("block-persistance"), q.selectedValue("persistance") === "non");
    q.toggle(document.getElementById("label-persistance-detail"), q.selectedValue("persistance") === "oui");
    q.toggle(document.getElementById("block-usage-normal"), q.selectedValue("usage-normal") === "oui");
    q.toggle(document.getElementById("bloc-impossibilite"), q.selectedValue("usage-normal") === "non");
    q.toggle(document.getElementById("block-lrar"), q.selectedValue("envoi-lrar") === "non");
  }

  function persist() {
    if (window.ParcoursMiseEnDemeureSnapshot) window.ParcoursMiseEnDemeureSnapshot.save();
  }

  window.MedLexQuestionnaire({
    steps: 10,
    type: "mise-en-demeure",
    saveLabel: saveLabel,
    isBlocked: isBlocked,
    onStep: updateConditionals,
    onSave: persist,
    onFinish: persist,
    onRestore: function () {
      if (!window.ParcoursMiseEnDemeureSnapshot) return;
      window.ParcoursMiseEnDemeureSnapshot.restorePending();
      var existing = window.ParcoursMiseEnDemeureSnapshot.load();
      if (existing) window.ParcoursMiseEnDemeureSnapshot.applyVisible(existing);
    },
  });
})();
