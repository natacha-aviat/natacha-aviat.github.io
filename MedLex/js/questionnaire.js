(function () {
  var STEPS = 13;
  var step = 0;
  var type = "continue";

  var steps = document.querySelectorAll(".ac-q-step");
  var label = document.getElementById("q-label");
  var pct = document.getElementById("q-pct");
  var fill = document.getElementById("q-fill");
  var backLink = document.getElementById("q-back");
  var prevBtn = document.getElementById("q-prev");
  var nextBtn = document.getElementById("q-next");

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

  function selectedValue(group) {
    var btn = document.querySelector('[data-select="' + group + '"].ac-choice--selected');
    return btn ? btn.getAttribute("data-value") : null;
  }

  function toggle(el, show) {
    if (el) el.classList.toggle("ac-hidden", !show);
  }

  function updateConditionals() {
    var isContinu = type === "continue";
    if (step === 1) {
      if (datesTitle) {
        datesTitle.textContent = isContinu ? "Quelles dates ?" : "Quels jours / périodes ?";
      }
      toggle(datesContinu, isContinu);
      toggle(datesDiscontinuWrap, !isContinu);
    }

    if (motif && motifAutreWrap) {
      toggle(motifAutreWrap, motif.value === "autre");
    }

    if (modeExercice && blocAssocies) {
      toggle(blocAssocies, modeExercice.value !== "seul");
    }
    if (alerteAssocies) {
      toggle(alerteAssocies, selectedValue("associes") === "non");
    }

    if (multi && alerteMulti) {
      toggle(alerteMulti, multi.value === "plus");
    }

    if (blocTiersPayant) {
      toggle(blocTiersPayant, selectedValue("facturation") === "via-remplace");
    }

    if (blocTauxRedevance) {
      toggle(blocTauxRedevance, selectedValue("redevance") === "oui");
    }

    if (blocAnnexesTexte) {
      toggle(blocAnnexesTexte, selectedValue("annexes") === "oui");
    }

    if (alerteTemporaire) {
      toggle(alerteTemporaire, selectedValue("temporaire") === "non");
    }

    if (alerteAccord) {
      toggle(alerteAccord, selectedValue("accord") === "non");
    }
  }

  function syncAdresseLieu() {
    if (!lieu || !adresseLieu) return;
    var v = lieu.value;
    if (v === "cabinet-remplace" && rAdresse && rAdresse.value) {
      adresseLieu.value = rAdresse.value;
    } else if (v === "cabinet-remplacant" && rpAdresse && rpAdresse.value) {
      adresseLieu.value = rpAdresse.value;
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
      var group = btn.getAttribute("data-select");
      document.querySelectorAll('[data-select="' + group + '"]').forEach(function (b) {
        b.classList.remove("ac-choice--selected");
      });
      btn.classList.add("ac-choice--selected");
      if (group === "type" && btn.getAttribute("data-value")) {
        type = btn.getAttribute("data-value");
      }
      updateConditionals();
    });
  });

  if (motif) motif.addEventListener("change", updateConditionals);
  if (modeExercice) modeExercice.addEventListener("change", updateConditionals);
  if (multi) multi.addEventListener("change", updateConditionals);
  if (lieu) {
    lieu.addEventListener("change", function () {
      syncAdresseLieu();
      updateConditionals();
    });
  }
  if (rAdresse) rAdresse.addEventListener("blur", syncAdresseLieu);
  if (rpAdresse) rpAdresse.addEventListener("blur", syncAdresseLieu);

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
        if (window.ParcoursSnapshot) {
          window.ParcoursSnapshot.save();
        }
        window.location.href = "apercu.html";
      }
    });
  }

  if (window.ParcoursSnapshot && window.ParcoursSnapshot.restorePending()) {
    type = selectedValue("type") || type;
    updateConditionals();
  }

  render();
})();
