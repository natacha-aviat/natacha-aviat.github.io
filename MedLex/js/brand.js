/* Marque du site. Un prochain changement de nom, d’e-mail ou d’année se fait ici. */
(function () {
  var brand = {
    name: "LibéLex",
    email: "contact@libelex.fr",
    year: 2026,
  };
  brand.domain = brand.email.split("@")[1];
  brand.mailto = function (subject) {
    var href = "mailto:" + brand.email;
    if (subject) href += "?subject=" + encodeURIComponent(subject);
    return href;
  };
  window.LibéLexBrand = brand;

  function fill(text) {
    return String(text == null ? "" : text).split("{name}").join(brand.name);
  }

  function apply() {
    var mode = document.documentElement.getAttribute("data-brand-title");
    if (mode === "suffix" && document.title.indexOf(brand.name) === -1) {
      document.title = document.title + " · " + brand.name;
    } else if (mode === "prefix" && document.title.indexOf(brand.name) === -1) {
      document.title = brand.name + " | " + document.title;
    }

    document.querySelectorAll("[data-brand]").forEach(function (el) {
      var key = el.getAttribute("data-brand");
      if (key === "name") el.textContent = brand.name;
      else if (key === "domain") el.textContent = brand.domain;
      else if (key === "year") el.textContent = String(brand.year);
      else if (key === "copyright") el.textContent = "© " + brand.name + " " + brand.year;
      else if (key === "email") {
        el.textContent = brand.email;
        if (el.tagName === "A") el.setAttribute("href", brand.mailto());
      }
    });

    document.querySelectorAll("[data-brand-mailto]").forEach(function (el) {
      el.setAttribute("href", brand.mailto(fill(el.getAttribute("data-brand-mailto"))));
    });

    document.querySelectorAll("meta[data-brand-fill]").forEach(function (el) {
      el.setAttribute("content", fill(el.getAttribute("content")));
    });
  }

  apply();
})();
