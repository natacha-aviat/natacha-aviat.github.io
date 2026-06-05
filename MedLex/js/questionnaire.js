(function () {
  var STEPS = 5;
  var step = 0;
  var type = "continu";

  var steps = document.querySelectorAll(".ac-q-step");
  var label = document.getElementById("q-label");
  var pct = document.getElementById("q-pct");
  var fill = document.getElementById("q-fill");
  var backLink = document.getElementById("q-back");
  var prevBtn = document.getElementById("q-prev");
  var nextBtn = document.getElementById("q-next");
  var datesTitle = document.getElementById("dates-title");
  var datesContinu = document.getElementById("dates-continu");
  var datesDiscontinu = document.getElementById("dates-discontinu");

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
      backLink.onclick = step === 0 ? null : function (e) {
        e.preventDefault();
        step--;
        render();
      };
    }
    if (nextBtn) {
      nextBtn.textContent = step === STEPS - 1 ? "Voir l'aperçu" : "Continuer";
    }
    if (step === 1) {
      if (type === "continu") {
        if (datesTitle) datesTitle.textContent = "Quelles dates ?";
        if (datesContinu) datesContinu.classList.remove("ac-hidden");
        if (datesDiscontinu) datesDiscontinu.classList.add("ac-hidden");
      } else {
        if (datesTitle) datesTitle.textContent = "Quels jours / périodes ?";
        if (datesContinu) datesContinu.classList.add("ac-hidden");
        if (datesDiscontinu) datesDiscontinu.classList.remove("ac-hidden");
      }
    }
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
        if (step === 1) render();
      }
    });
  });

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
        window.location.href = "apercu.html";
      }
    });
  }

  render();
})();
