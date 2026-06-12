/**
 * Capture / restauration des réponses du questionnaire collaboration.
 */
(function () {
  var STORAGE_KEY = 'medlex-parcours-collaboration-snapshot';

  var MOYENS_VALUES = [
    'salle-attente',
    'salle-soins',
    'secretariat',
    'telephone',
    'internet',
    'dossiers',
    'documentation',
  ];

  function selectedValue(group) {
    var btn = document.querySelector('[data-select="' + group + '"].ac-choice--selected');
    return btn ? btn.getAttribute('data-value') : null;
  }

  function collect() {
    var fields = {};
    var radios = {};

    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function (el) {
      var t = el.type;
      if (t === 'radio' || t === 'button' || t === 'submit') return;
      if (t === 'checkbox') return;
      fields[el.id] = el.value;
    });

    var moyens = [];
    document.querySelectorAll('input[name="moyens"]:checked').forEach(function (el) {
      moyens.push(el.value);
    });

    [
      'patientele-unite',
      'patientele-periode',
      'collab-unite',
      'collab-periode',
      'forfait-mode',
      'redevance-type',
      'duree-type',
    ].forEach(function (g) {
      var v = selectedValue(g);
      if (v) radios[g] = v;
    });

    return { version: 1, parcours: 'collaboration', fields: fields, radios: radios, moyens: moyens };
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
      if (tag === 'input') el.type = type || 'text';
      form.appendChild(el);
    }
    if (el.type === 'checkbox') {
      el.checked = Boolean(value);
    } else {
      el.value = value != null ? String(value) : '';
    }
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
        var tag = id.indexOf('adresse') !== -1 || id === 'moyens-autre' ? 'textarea' : 'input';
        el = document.createElement(tag);
        el.id = id;
        if (tag === 'input') el.type = id.indexOf('date') !== -1 ? 'date' : 'text';
        form.appendChild(el);
      }
      el.value = f[id] != null ? String(f[id]) : '';
    });

    [
      'patientele-unite',
      'patientele-periode',
      'collab-unite',
      'collab-periode',
      'forfait-mode',
      'redevance-type',
      'duree-type',
    ].forEach(function (key) {
      ensureField(form, key, r[key] || '', 'input', 'hidden');
    });

    MOYENS_VALUES.forEach(function (val) {
      var id = 'moyen-' + val;
      var el = document.getElementById(id);
      if (!el) {
        el = document.createElement('input');
        el.type = 'checkbox';
        el.name = 'moyens';
        el.id = id;
        el.value = val;
        form.appendChild(el);
      }
      el.checked = Array.isArray(snap.moyens) && snap.moyens.indexOf(val) !== -1;
    });

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

    [
      'patientele-unite',
      'patientele-periode',
      'collab-unite',
      'collab-periode',
      'forfait-mode',
      'redevance-type',
      'duree-type',
    ].forEach(function (key) {
      if (r[key]) selectChoice(key, r[key]);
    });

    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function (el) {
      if (!(el.id in f)) return;
      var v = f[el.id];
      if (el.type === 'checkbox') {
        el.checked = Boolean(v);
      } else {
        el.value = v != null ? String(v) : '';
      }
    });

    if (Array.isArray(snap.moyens)) {
      document.querySelectorAll('input[name="moyens"]').forEach(function (el) {
        el.checked = snap.moyens.indexOf(el.value) !== -1;
      });
    }

    return true;
  }

  function restorePending() {
    var pendingKey = 'medlex-pending-restore-collaboration-json';
    var raw = null;
    try {
      raw = sessionStorage.getItem(pendingKey) || localStorage.getItem(pendingKey);
    } catch (e) {
      return false;
    }
    if (!raw) return false;
    try {
      var snap = JSON.parse(raw);
      if (!applyVisible(snap)) return false;
      save();
      sessionStorage.removeItem(pendingKey);
      try {
        localStorage.removeItem(pendingKey);
      } catch (e2) {
        /* ignore */
      }
      return true;
    } catch (e3) {
      return false;
    }
  }

  window.ParcoursCollaborationSnapshot = {
    STORAGE_KEY: STORAGE_KEY,
    collect: collect,
    save: save,
    load: load,
    apply: apply,
    applyVisible: applyVisible,
    restorePending: restorePending,
  };
})();
