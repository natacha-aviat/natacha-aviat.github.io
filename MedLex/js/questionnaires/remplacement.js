/* Parcours remplacement. Défilement : questionnaire-runner.js. Métadonnées : parcours-type.js. */
(function () {
  var type = "continue";

  var datesTitle = document.getElementById("dates-title");
  var datesContinu = document.getElementById("dates-continu");
  var datesDiscontinuWrap = document.getElementById("dates-discontinu-wrap");
  var motif = document.getElementById("motif");
  var motifAutreWrap = document.getElementById("motif-autre-wrap");
  var modeExercice = document.getElementById("mode-exercice");
  var blocAssocies = document.getElementById("bloc-associes");
  var alerteAssocies = document.getElementById("alerte-associes");
  var multi = document.getElementById("multi-remplacements");
  var alerteMulti = document.getElementById("alerte-multi");
  var lieu = document.getElementById("lieu");
  var adresseLieu = document.getElementById("adresse-lieu");
  var rAdresse = document.getElementById("r-adresse");
  var rpAdresse = document.getElementById("rp-adresse");
  var blocTiersPayant = document.getElementById("bloc-tiers-payant");
  var blocTauxRedevance = document.getElementById("bloc-taux-redevance");
  var blocAnnexesTexte = document.getElementById("bloc-annexes-texte");
  var alerteTemporaire = document.getElementById("alerte-temporaire");
  var alerteAccord = document.getElementById("alerte-accord");

  function syncAdresseLieu() {
    if (!lieu || !adresseLieu) return;
    var v = lieu.value;
    if (v === "cabinet-remplace" && rAdresse && rAdresse.value) {
      adresseLieu.value = rAdresse.value;
    } else if (v === "cabinet-remplacant" && rpAdresse && rpAdresse.value) {
      adresseLieu.value = rpAdresse.value;
    }
  }

  function updateConditionals(q) {
    var isContinu = type === "continue";
    if (q.step === 1) {
      if (datesTitle) {
        datesTitle.textContent = isContinu ? "Quelles dates ?" : "Quels jours / périodes ?";
      }
      q.toggle(datesContinu, isContinu);
      q.toggle(datesDiscontinuWrap, !isContinu);
    }
    if (motif && motifAutreWrap) q.toggle(motifAutreWrap, motif.value === "autre");
    if (modeExercice && blocAssocies) q.toggle(blocAssocies, modeExercice.value !== "seul");
    if (alerteAssocies) q.toggle(alerteAssocies, q.selectedValue("associes") === "non");
    if (multi && alerteMulti) q.toggle(alerteMulti, multi.value === "plus");
    if (blocTiersPayant) q.toggle(blocTiersPayant, q.selectedValue("facturation") === "via-remplace");
    if (blocTauxRedevance) q.toggle(blocTauxRedevance, q.selectedValue("redevance") === "oui");
    if (blocAnnexesTexte) q.toggle(blocAnnexesTexte, q.selectedValue("annexes") === "oui");
    if (alerteTemporaire) q.toggle(alerteTemporaire, q.selectedValue("temporaire") === "non");
    if (alerteAccord) q.toggle(alerteAccord, q.selectedValue("accord") === "non");
  }

  function persist() {
    if (window.ParcoursSnapshot) window.ParcoursSnapshot.save();
  }

  var q = window.MedLexQuestionnaire({
    steps: 13,
    type: "remplacement",
    onSelect: function (btn) {
      if (btn.getAttribute("data-select") === "type" && btn.getAttribute("data-value")) {
        type = btn.getAttribute("data-value");
      }
    },
    onStep: updateConditionals,
    onSave: persist,
    onFinish: persist,
    onRestore: function (api) {
      if (window.ParcoursSnapshot && window.ParcoursSnapshot.restorePending()) {
        type = api.selectedValue("type") || type;
      }
    },
  });

  if (motif) motif.addEventListener("change", function () { q.refresh(); });
  if (modeExercice) modeExercice.addEventListener("change", function () { q.refresh(); });
  if (multi) multi.addEventListener("change", function () { q.refresh(); });
  if (lieu) {
    lieu.addEventListener("change", function () {
      syncAdresseLieu();
      q.refresh();
    });
  }
  if (rAdresse) rAdresse.addEventListener("blur", syncAdresseLieu);
  if (rpAdresse) rpAdresse.addEventListener("blur", syncAdresseLieu);
})();
