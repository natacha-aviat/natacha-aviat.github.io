/* Bloque Suivant tant que le nom et le prénom de l'étape ne sont pas renseignés. */
(function () {
  var nextBtn = document.getElementById("q-next");
  if (!nextBtn) return;

  function isEmpty(el) {
    return !el.value || !String(el.value).trim();
  }

  function activeFields() {
    var active = document.querySelector(".ac-q-step.is-active");
    if (!active) return [];
    return Array.prototype.slice.call(active.querySelectorAll("[data-required='nom']"));
  }

  function hintFor(el) {
    var host = el.closest("label") || el;
    var hint = host.nextElementSibling;
    if (!hint || !hint.classList.contains("ac-required-hint")) {
      hint = document.createElement("p");
      hint.className = "ac-required-hint";
      hint.textContent = "Indique le nom et le prénom pour continuer.";
      if (el.id) hint.id = el.id + "-hint";
      host.insertAdjacentElement("afterend", hint);
    }
    if (hint.id) el.setAttribute("aria-describedby", hint.id);
    return hint;
  }

  function sync() {
    var gaps = activeFields().filter(isEmpty);
    document.querySelectorAll("[data-required='nom']").forEach(function (el) {
      var onStep = Boolean(el.closest(".ac-q-step.is-active"));
      var empty = isEmpty(el);
      el.classList.toggle("is-invalid", onStep && empty);
      el.setAttribute("aria-invalid", onStep && empty ? "true" : "false");
      if (onStep) hintFor(el).hidden = !empty;
    });
    var situation = nextBtn.getAttribute("data-situation-block") === "1";
    nextBtn.disabled = situation || gaps.length > 0;
    if (!situation) {
      if (gaps.length) nextBtn.title = "Indique le nom et le prénom pour continuer.";
      else nextBtn.removeAttribute("title");
    }
  }

  document.addEventListener("input", function (e) {
    var target = e.target;
    if (target && target.matches && target.matches("[data-required='nom']")) sync();
  });

  var main = document.querySelector("main");
  if (main && window.MutationObserver) {
    new MutationObserver(sync).observe(main, {
      attributes: true,
      attributeFilter: ["class"],
      subtree: true,
    });
  }
  if (window.MutationObserver) {
    new MutationObserver(sync).observe(nextBtn, {
      attributes: true,
      attributeFilter: ["data-situation-block"],
    });
  }

  sync();
})();
