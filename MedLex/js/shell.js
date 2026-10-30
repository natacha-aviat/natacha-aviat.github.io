/* Barre du bas, unique pour la landing et le parcours. */
(function () {
  var inParcours = /\/parcours\//.test(window.location.pathname);
  var file = (window.location.pathname.split("/").pop() || "index.html").split("?")[0];
  var prefix = inParcours ? "" : "./parcours/";
  var infosHref = inParcours ? "../index.html" : "./index.html";

  var current = "";
  if (file === "profil.html") current = "profil";
  else if (file === "tableau-de-bord.html") current = "libelex";
  else if (!inParcours) current = "infos";

  function item(href, label, icon, key, extraClass) {
    var attrs = extraClass ? ' class="' + extraClass + '"' : "";
    if (current === key) attrs += ' aria-current="page"';
    return '<a href="' + href + '"' + attrs + ">" + icon + label + "</a>";
  }

  var assetBase = inParcours ? "../" : "./";
  var house =
    '<img class="ac-bottom-nav__logo" src="' +
    assetBase +
    'images/logo-libelex.jpg" alt="" width="22" height="22" />';
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
    item(prefix + "tableau-de-bord.html", window.LibéLexBrand.name, house, "libelex") +
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
