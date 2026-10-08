/* Parcours bail professionnel. Défilement : questionnaire-runner.js. Métadonnées : parcours-type.js. */
(function () {
  var loyerHc = document.getElementById("loyer-hc");
  var depot = document.getElementById("depot-garantie");
  var dateEffet = document.getElementById("date-effet");
  var dateExp = document.getElementById("date-expiration");

  function suggestExpiration() {
    if (!dateEffet || !dateEffet.value || (dateExp && dateExp.value)) return;
    var d = new Date(dateEffet.value + "T12:00:00");
    if (Number.isNaN(d.getTime())) return;
    d.setFullYear(d.getFullYear() + 6);
    d.setDate(d.getDate() - 1);
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    if (dateExp) dateExp.value = y + "-" + m + "-" + day;
  }

  function suggestDepot() {
    if (!loyerHc || !depot || depot.value) return;
    if (loyerHc.value) depot.value = loyerHc.value;
  }

  function updateConditionals(q) {
    q.toggle(document.getElementById("bloc-nature-autre"), q.selectedValue("nature-immeuble") === "autre");
    q.toggle(document.getElementById("bloc-tva"), q.selectedValue("tva-applicable") === "oui");
    if (q.step === 3) suggestExpiration();
    if (q.step === 5) suggestDepot();
  }

  function persist() {
    if (window.ParcoursBailProfessionnelSnapshot) window.ParcoursBailProfessionnelSnapshot.save();
  }

  var q = window.MedLexQuestionnaire({
    steps: 9,
    type: "bail-professionnel",
    onStep: updateConditionals,
    onSave: persist,
    onFinish: persist,
    onRestore: function () {
      if (!window.ParcoursBailProfessionnelSnapshot) return;
      window.ParcoursBailProfessionnelSnapshot.restorePending();
      var existing = window.ParcoursBailProfessionnelSnapshot.load();
      if (existing) window.ParcoursBailProfessionnelSnapshot.applyVisible(existing);
    },
  });

  if (dateEffet) dateEffet.addEventListener("change", suggestExpiration);
  if (loyerHc) loyerHc.addEventListener("blur", suggestDepot);
})();
