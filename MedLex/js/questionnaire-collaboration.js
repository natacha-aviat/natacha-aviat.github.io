(function () {
  var STEPS = 10;
  var step = 0;

  var steps = document.querySelectorAll(".ac-q-step");
  var label = document.getElementById("q-label");
  var pct = document.getElementById("q-pct");
  var fill = document.getElementById("q-fill");
  var backLink = document.getElementById("q-back");
  var prevBtn = document.getElementById("q-prev");
  var nextBtn = document.getElementById("q-next");
  var blocForfaitPct = document.getElementById("bloc-forfait-pct");
  var blocRedevancePct = document.getElementById("bloc-redevance-pct");
  var blocRedevanceMontant = document.getElementById("bloc-redevance-montant");
  var blocDates = document.getElementById("bloc-dates");
  var lieuAdresse = document.getElementById("lieu-adresse");
  var tAdresse = document.getElementById("t-adresse");

  function selectedValue(group) {
    var btn = document.querySelector('[data-select="' + group + '"].ac-choice--selected');
    return btn ? btn.getAttribute("data-value") : null;
  }

  function toggle(el, show) {
    if (el) el.classList.toggle("ac-hidden", !show);
  }

  function updateConditionals() {
    toggle(blocForfaitPct, selectedValue("forfait-mode") === "pourcentages");
    var revType = selectedValue("redevance-type") || "pourcentage";
    toggle(blocRedevancePct, revType === "pourcentage");
    toggle(blocRedevanceMontant, revType === "forfait");
    toggle(blocDates, selectedValue("duree-type") === "determinee");

    if (step === 4 && lieuAdresse && tAdresse && !lieuAdresse.value && tAdresse.value) {
      lieuAdresse.value = tAdresse.value;
    }
  }

  function render() {
    var progress = Math.round(((step + 1) / STEPS) * 100);
    steps.forEach(function (el, i) {
      el.classList.toggle("is-active", i === step);
    });
    if (label) label.textContent = "Question " + (step + 1) + " sur " + STEPS;
    if (pct) pct.textContent = progress + " %";
    if (fill) fill.style.width = progress + "%";
    if (backLink) {
      backLink.href = step === 0 ? "verification-email.html" : "#";
      backLink.onclick =
        step === 0
          ? null
          : function (e) {
              e.preventDefault();
              step--;
              render();
            };
    }
    if (nextBtn) {
      nextBtn.textContent = step === STEPS - 1 ? "Voir l'aperçu" : "Continuer";
    }
    updateConditionals();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.querySelectorAll("[data-select]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      updateConditionals();
    });
  });

  if (tAdresse) {
    tAdresse.addEventListener("blur", function () {
      if (lieuAdresse && !lieuAdresse.value) lieuAdresse.value = tAdresse.value;
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      if (step > 0) {
        step--;
        render();
      } else {
        window.location.href = "verification-email.html";
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      if (step < STEPS - 1) {
        step++;
        render();
      } else {
        if (window.ParcoursCollaborationSnapshot) {
          window.ParcoursCollaborationSnapshot.save();
        }
        window.location.href = "apercu.html";
      }
    });
  }

  if (window.ParcoursType) {
    window.ParcoursType.set("collaboration");
  }

  if (window.ParcoursCollaborationSnapshot && window.ParcoursCollaborationSnapshot.restorePending()) {
    updateConditionals();
  }

  render();
})();
