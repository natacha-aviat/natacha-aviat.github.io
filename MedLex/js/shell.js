/* Barre du bas, unique pour la landing et le parcours. */
(function () {
  var inParcours = /\/parcours\//.test(window.location.pathname);
  var file = (window.location.pathname.split("/").pop() || "index.html").split("?")[0];
  var prefix = inParcours ? "" : "./parcours/";
  var infosHref = inParcours ? "../index.html" : "./index.html";

  var current = "";
  if (file === "profil.html") current = "profil";
  else if (file === "tableau-de-bord.html") current = "medlex";
  else if (!inParcours) current = "infos";

  function item(href, label, icon, key, extraClass) {
    var attrs = extraClass ? ' class="' + extraClass + '"' : "";
    if (current === key) attrs += ' aria-current="page"';
    return '<a href="' + href + '"' + attrs + ">" + icon + label + "</a>";
  }

  var house =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/></svg>';
  var person =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.2"/><path d="M5.5 19.2c1.1-2.6 3.4-4 6.5-4s5.4 1.4 6.5 4"/></svg>';
  var info =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 11v5M12 8h.01"/></svg>';
  var news =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M8 8.5h8M8 12h8M8 15.5h5"/></svg>';

  var nav = document.createElement("nav");
  nav.className = "ac-bottom-nav";
  nav.setAttribute("aria-label", "Navigation principale");
  nav.innerHTML =
    item(prefix + "tableau-de-bord.html", "MedLex", house, "medlex") +
    item(prefix + "profil.html", "Profil", person, "profil") +
    item(infosHref, "Infos", info, "infos") +
    item(prefix + "tableau-de-bord.html#news", "News", news, "news") +
    item(
      prefix + "choix-contrat.html",
      "Nouveau",
      '<span class="ac-bottom-nav__plus" aria-hidden="true">+</span>',
      "nouveau",
      "ac-bottom-nav__add"
    );
  document.body.appendChild(nav);
})();
