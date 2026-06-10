(function () {
  document.querySelectorAll("[data-select]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var group = btn.getAttribute("data-select");
      document.querySelectorAll('[data-select="' + group + '"]').forEach(function (b) {
        b.classList.remove("ac-choice--selected");
      });
      btn.classList.add("ac-choice--selected");
    });
  });
})();
