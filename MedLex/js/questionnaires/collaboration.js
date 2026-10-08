/* Parcours collaboration. Défilement : questionnaire-runner.js. Métadonnées : parcours-type.js. */
(function () {
  var blocForfaitPct = document.getElementById("bloc-forfait-pct");
  var blocRedevancePct = document.getElementById("bloc-redevance-pct");
  var blocRedevanceMontant = document.getElementById("bloc-redevance-montant");
  var blocDates = document.getElementById("bloc-dates");
  var lieuAdresse = document.getElementById("lieu-adresse");
  var tAdresse = document.getElementById("t-adresse");

  function updateConditionals(q) {
    q.toggle(blocForfaitPct, q.selectedValue("forfait-mode") === "pourcentages");
    var revType = q.selectedValue("redevance-type") || "pourcentage";
    q.toggle(blocRedevancePct, revType === "pourcentage");
    q.toggle(blocRedevanceMontant, revType === "forfait");
    q.toggle(blocDates, q.selectedValue("duree-type") === "determinee");
    if (q.step === 4 && lieuAdresse && tAdresse && !lieuAdresse.value && tAdresse.value) {
      lieuAdresse.value = tAdresse.value;
    }
  }

  function renderAvocateNotes(q) {
    var host = document.getElementById("q-avocate-notes");
    if (!host) return;
    if (!window.MedLexAvocateComments) {
      host.innerHTML = "";
      return;
    }
    var ctx = { dureeType: q.selectedValue("duree-type") || "indeterminee" };
    var notes = window.MedLexAvocateComments.getCommentsForQuestionnaireStep(q.step, ctx);
    host.innerHTML = notes
      .map(function (note) {
        return window.MedLexAvocateComments.renderCommentHtml(note.comment);
      })
      .join("");
  }

  function persist() {
    if (window.ParcoursCollaborationSnapshot) window.ParcoursCollaborationSnapshot.save();
  }

  var q = window.MedLexQuestionnaire({
    steps: 10,
    type: "collaboration",
    onStep: function (api) {
      updateConditionals(api);
      renderAvocateNotes(api);
    },
    onSave: persist,
    onFinish: persist,
    onRestore: function () {
      if (window.ParcoursCollaborationSnapshot) window.ParcoursCollaborationSnapshot.restorePending();
    },
  });

  if (tAdresse) {
    tAdresse.addEventListener("blur", function () {
      if (lieuAdresse && !lieuAdresse.value) lieuAdresse.value = tAdresse.value;
    });
  }
})();
