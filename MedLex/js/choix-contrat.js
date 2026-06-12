(function () {
  if (window.ParcoursType) {
    window.ParcoursType.initFromQuery();
  }

  var params = new URLSearchParams(window.location.search);
  var preset = params.get("type");
  if (preset === "remplacement" || preset === "collaboration") {
    if (window.ParcoursType) {
      window.ParcoursType.set(preset);
    }
    window.location.replace("email.html?type=" + encodeURIComponent(preset));
    return;
  }

  function selectedParcours() {
    var btn = document.querySelector('[data-select="parcours"].ac-choice--selected');
    return btn ? btn.getAttribute("data-value") : "remplacement";
  }

  var nextBtn = document.getElementById("choix-next");
  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      if (window.ParcoursType) {
        window.ParcoursType.set(selectedParcours());
      }
      window.location.href = "email.html";
    });
  }
})();
