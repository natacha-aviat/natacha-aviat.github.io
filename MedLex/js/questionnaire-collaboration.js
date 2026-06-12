(function () {
  var STEPS = 10;
  var params = new URLSearchParams(window.location.search);
  var fromContrat = params.get("from") === "contrat";
  var stepParam = parseInt(params.get("step"), 10);
  var step = !isNaN(stepParam) && stepParam >= 0 && stepParam < STEPS ? stepParam : 0;

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

  function saveAndReturnContrat() {
    if (window.ParcoursCollaborationSnapshot) {
      window.ParcoursCollaborationSnapshot.save();
    }
    window.location.href = "contrat.html";
  }

  function ensureContratSaveBtn() {
    if (!fromContrat) return;
    var row = document.querySelector(".ac-btn-row");
    if (!row) return;
    var btn = document.getElementById("q-save-contrat");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.id = "q-save-contrat";
      btn.className = "ac-btn ac-btn--secondary";
      btn.textContent = "Enregistrer et retour au contrat";
      btn.addEventListener("click", saveAndReturnContrat);
      row.appendChild(btn);
    }
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
      if (fromContrat && step === 0) {
        backLink.href = "contrat.html";
        backLink.onclick = null;
      } else {
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
    }
    ensureContratSaveBtn();
    if (nextBtn) {
      nextBtn.textContent =
        step === STEPS - 1
          ? fromContrat
            ? "Enregistrer et retour au contrat"
            : "Voir l'aperçu"
          : "Continuer";
    }
    updateConditionals();
    renderAvocateNotes();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderAvocateNotes() {
    var host = document.getElementById("q-avocate-notes");
    if (!host) return;
    if (!window.MedLexAvocateComments) {
      host.innerHTML = "";
      return;
    }
    var ctx = { dureeType: selectedValue("duree-type") || "indeterminee" };
    var notes = window.MedLexAvocateComments.getCommentsForQuestionnaireStep(step, ctx);
    host.innerHTML = notes
      .map(function (note) {
        return window.MedLexAvocateComments.renderCommentHtml(note.comment);
      })
      .join("");
  }

  document.querySelectorAll("[data-select]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      updateConditionals();
      renderAvocateNotes();
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
      } else if (fromContrat) {
        window.location.href = "contrat.html";
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
        window.location.href = fromContrat ? "contrat.html" : "apercu.html";
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
