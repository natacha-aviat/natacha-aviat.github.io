/**
 * Capture / restauration des réponses du questionnaire fin de bail.
 */
(function () {
  var STORAGE_KEY = 'medlex-parcours-fin-de-bail-snapshot';
  var PENDING_KEY = 'medlex-pending-restore-fin-de-bail-json';

  var RADIO_GROUPS = [
    'usage-pro',
    'litige',
    'situation',
    'role',
    'delai-six-mois',
    'preavis-six',
    'notification-recommande',
  ];

  function selectedValue(group) {
    var btn = document.querySelector('[data-select="' + group + '"].ac-choice--selected');
    return btn ? btn.getAttribute('data-value') : null;
  }

  function deriveModele(radios) {
    var situation = radios.situation;
    if (situation === 'proprietaire-non-renouvellement') return 'B';
    return 'A';
  }

  function collect() {
    var fields = {};
    var radios = {};

    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function (el) {
      var t = el.type;
      if (t === 'radio' || t === 'button' || t === 'submit' || t === 'checkbox') return;
      fields[el.id] = el.value;
    });

    RADIO_GROUPS.forEach(function (g) {
      var v = selectedValue(g);
      if (v) radios[g] = v;
    });

    radios.modele = deriveModele(radios);

    return {
      version: 1,
      parcours: 'fin-de-bail',
      fields: fields,
      radios: radios,
    };
  }

  function ensureHiddenForm() {
    var form = document.getElementById('questionnaire-form');
    if (form) return form;
    form = document.createElement('form');
    form.id = 'questionnaire-form';
    form.className = 'ac-hidden';
    form.setAttribute('aria-hidden', 'true');
    document.body.appendChild(form);
    return form;
  }

  function ensureField(form, id, value, tag, type) {
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement(tag || 'input');
      el.id = id;
      if (tag === 'input' || !tag) el.type = type || 'text';
      form.appendChild(el);
    }
    el.value = value != null ? String(value) : '';
    return el;
  }

  function apply(snap) {
    if (!snap || snap.version !== 1) return false;
    var form = ensureHiddenForm();
    var f = snap.fields || {};
    var r = snap.radios || {};

    Object.keys(f).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) {
        var tag =
          id.indexOf('adresse') !== -1 || id === 'precision-local' || id.indexOf('identite') !== -1
            ? 'textarea'
            : 'input';
        el = document.createElement(tag);
        el.id = id;
        if (tag === 'input') el.type = id.indexOf('date') !== -1 ? 'date' : 'text';
        form.appendChild(el);
      }
      el.value = f[id] != null ? String(f[id]) : '';
    });

    RADIO_GROUPS.concat(['modele']).forEach(function (key) {
      ensureField(form, key, r[key] || '', 'input', 'hidden');
    });

    if (!r.modele) {
      ensureField(form, 'modele', deriveModele(r), 'input', 'hidden');
    }

    return true;
  }

  function save() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(collect()));
    } catch (e) {
      /* ignore */
    }
  }

  function load() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function selectChoice(group, value) {
    document.querySelectorAll('[data-select="' + group + '"]').forEach(function (btn) {
      btn.classList.toggle('ac-choice--selected', btn.getAttribute('data-value') === value);
    });
  }

  function applyVisible(snap) {
    if (!snap || snap.version !== 1) return false;
    var f = snap.fields || {};
    var r = snap.radios || {};

    RADIO_GROUPS.forEach(function (key) {
      if (r[key]) selectChoice(key, r[key]);
    });

    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function (el) {
      if (!(el.id in f)) return;
      el.value = f[el.id] != null ? String(f[el.id]) : '';
    });

    return true;
  }

  function restorePending() {
    var raw = null;
    try {
      raw = sessionStorage.getItem(PENDING_KEY) || localStorage.getItem(PENDING_KEY);
    } catch (e) {
      return false;
    }
    if (!raw) return false;
    try {
      var snap = JSON.parse(raw);
      if (!applyVisible(snap)) return false;
      save();
      try {
        sessionStorage.removeItem(PENDING_KEY);
        localStorage.removeItem(PENDING_KEY);
      } catch (e2) {
        /* ignore */
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  window.ParcoursFinDeBailSnapshot = {
    STORAGE_KEY: STORAGE_KEY,
    collect: collect,
    apply: apply,
    applyVisible: applyVisible,
    save: save,
    load: load,
    restorePending: restorePending,
  };
})();
