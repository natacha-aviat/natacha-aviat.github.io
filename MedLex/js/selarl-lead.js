/* Coordonnées du test SELARL, conservées dans le navigateur (maquette statique). */
(function () {
  var CURRENT_KEY = "libelex-selarl-lead";
  var LIST_KEY = "libelex-selarl-leads";

  function readJson(storage, key, fallback) {
    try {
      var raw = storage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function current() {
    return readJson(sessionStorage, CURRENT_KEY, null);
  }

  function save(lead) {
    if (!lead.id) lead.id = String(Date.now());
    lead.updatedAt = new Date().toISOString();
    sessionStorage.setItem(CURRENT_KEY, JSON.stringify(lead));
    var all = readJson(localStorage, LIST_KEY, []);
    if (!Array.isArray(all)) all = [];
    var index = -1;
    for (var i = 0; i < all.length; i++) {
      if (all[i] && all[i].id === lead.id) {
        index = i;
        break;
      }
    }
    if (index >= 0) all[index] = lead;
    else all.push(lead);
    localStorage.setItem(LIST_KEY, JSON.stringify(all));
    return lead;
  }

  window.LibéLexSelarlLead = {
    current: current,
    save: save,
  };
})();
