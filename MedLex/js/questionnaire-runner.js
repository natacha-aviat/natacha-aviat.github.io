/* Défilement commun des questionnaires : étape, retour, progression, blocage. */
(function () {
  function selectedValue(group) {
    var btn = document.querySelector('[data-select="' + group + '"].ac-choice--selected');
    return btn ? btn.getAttribute("data-value") : null;
  }

  function toggle(el, show) {
    if (el) el.classList.toggle("ac-hidden", !show);
  }

  window.MedLexQuestionnaire = function (opts) {
    opts = opts || {};
    var STEPS = opts.steps;
    var params = new URLSearchParams(window.location.search);
    var fromContrat = params.get("from") === "contrat";
    var stepParam = parseInt(params.get("step"), 10);
    var step = !isNaN(stepParam) && stepParam >= 0 && stepParam < STEPS ? stepParam : 0;
    var backHref = opts.backHref || "verification-email.html";
    var previewHref = opts.previewHref || "apercu.html";
    var contratHref = opts.contratHref || "contrat.html";
    var saveLabel = opts.saveLabel || "Enregistrer et retour au contrat";
    var previewLabel = opts.previewLabel || "Voir l'aperçu";
    var blockTitle = opts.blockTitle || "Cette situation ne permet pas de continuer avec ce document.";

    var steps = document.querySelectorAll(".ac-q-step");
    var label = document.getElementById("q-label");
    var pct = document.getElementById("q-pct");
    var fill = document.getElementById("q-fill");
    var backLink = document.getElementById("q-back");
    var prevBtn = document.getElementById("q-prev");
    var nextBtn = document.getElementById("q-next");

    var api = {
      get step() {
        return step;
      },
      fromContrat: fromContrat,
      selectedValue: selectedValue,
      toggle: toggle,
      nextBtn: nextBtn,
      refresh: refresh,
      render: render,
    };

    function persist(hook) {
      if (typeof hook === "function") hook(api);
    }

    function saveAndReturn() {
      persist(opts.onSave);
      window.location.href = contratHref;
    }

    function ensureContratSaveBtn() {
      if (!fromContrat) return;
      var row = document.querySelector(".ac-btn-row");
      if (!row || document.getElementById("q-save-contrat")) return;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.id = "q-save-contrat";
      btn.className = "ac-btn ac-btn--secondary";
      btn.textContent = saveLabel;
      btn.addEventListener("click", saveAndReturn);
      row.appendChild(btn);
    }

    function blocked() {
      return typeof opts.isBlocked === "function" && opts.isBlocked(api);
    }

    function applyBlock() {
      if (!nextBtn || typeof opts.isBlocked !== "function") return;
      if (blocked()) {
        nextBtn.disabled = true;
        nextBtn.setAttribute("data-situation-block", "1");
        nextBtn.title = blockTitle;
      } else if (nextBtn.getAttribute("data-situation-block") === "1") {
        nextBtn.removeAttribute("data-situation-block");
        nextBtn.disabled = false;
        nextBtn.removeAttribute("title");
      }
    }

    function refresh() {
      if (opts.onStep) opts.onStep(api);
      applyBlock();
    }

    function render() {
      var progress = Math.round(((step + 1) / STEPS) * 100);
      steps.forEach(function (el, i) {
        el.classList.toggle("is-active", i === step);
      });
      if (label) label.textContent = "";
      if (pct) pct.textContent = step + 1 + "/" + STEPS;
      if (fill) fill.style.width = progress + "%";
      if (backLink) {
        if (fromContrat && step === 0) {
          backLink.href = contratHref;
          backLink.onclick = null;
        } else {
          backLink.href = step === 0 ? backHref : "#";
          backLink.onclick =
            step === 0
              ? null
              : function (e) {
                  e.preventDefault();
                  step -= 1;
                  render();
                };
        }
      }
      ensureContratSaveBtn();
      if (nextBtn) {
        nextBtn.textContent = step === STEPS - 1 ? (fromContrat ? saveLabel : previewLabel) : "Suivant";
      }
      refresh();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    document.querySelectorAll("[data-select]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (opts.onSelect) opts.onSelect(btn, api);
        refresh();
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        if (step > 0) {
          step -= 1;
          render();
        } else if (fromContrat) {
          window.location.href = contratHref;
        } else {
          window.location.href = backHref;
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (blocked()) return;
        if (step < STEPS - 1) {
          step += 1;
          render();
          return;
        }
        persist(opts.onFinish);
        window.location.href = fromContrat ? contratHref : previewHref;
      });
    }

    if (opts.type && window.ParcoursType) window.ParcoursType.set(opts.type);
    if (opts.onRestore) opts.onRestore(api);
    render();
    return api;
  };
})();
