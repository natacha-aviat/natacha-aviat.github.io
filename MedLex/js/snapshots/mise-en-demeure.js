/**
 * Capture / restauration des réponses du questionnaire mise en demeure.
 */
(function () {
  var STORAGE_KEY = 'medlex-parcours-mise-en-demeure-snapshot';
  var PENDING_KEY = 'medlex-pending-restore-mise-en-demeure-json';

  var RADIO_GROUPS = [
    'usage-pro',
    'faute-bailleur',
    'preuves',
    'urgence',
    'ack-gravite',
    'ack-contestation',
    'ack-juge',
    'ack-risque',
    'ack-loyers',
    'persistance',
    'usage-normal',
    'envoi-lrar',
  ];

  var OBLIGATION_VALUES = ['reparations', 'jouissance', 'travaux', 'confidentialite'];
  var CONSEQUENCE_VALUES = [
    'fermeture',
    'annulation',
    'interdiction',
    'penal',
    'acces',
    'confidentialite',
    'degats',
    'sante',
  ];

  function selectedValue(group) {
    var btn = document.querySelector('[data-select="' + group + '"].ac-choice--selected');
    return btn ? btn.getAttribute('data-value') : null;
  }

  function collectChecked(name) {
    var out = [];
    document.querySelectorAll('input[name="' + name + '"]:checked').forEach(function (el) {
      out.push(el.value);
    });
    return out;
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

    return {
      version: 1,
      parcours: 'mise-en-demeure',
      fields: fields,
      radios: radios,
      obligations: collectChecked('obligations'),
      consequences: collectChecked('consequences'),
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

  function ensureCheckbox(form, name, id, value, checked) {
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('input');
      el.type = 'checkbox';
      el.name = name;
      el.id = id;
      el.value = value;
      form.appendChild(el);
    }
    el.checked = Boolean(checked);
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
        var long =
          id.indexOf('adresse') !== -1 ||
          id.indexOf('description') !== -1 ||
          id.indexOf('persistance') !== -1 ||
          id.indexOf('impossibilite') !== -1 ||
          id.indexOf('liste') !== -1 ||
          id.indexOf('mesure') !== -1 ||
          id.indexOf('identite') !== -1;
        var tag = long ? 'textarea' : 'input';
        el = document.createElement(tag);
        el.id = id;
        if (tag === 'input') el.type = id.indexOf('date') !== -1 ? 'date' : 'text';
        form.appendChild(el);
      }
      el.value = f[id] != null ? String(f[id]) : '';
    });

    RADIO_GROUPS.forEach(function (key) {
      ensureField(form, key, r[key] || '', 'input', 'hidden');
    });

    OBLIGATION_VALUES.forEach(function (val) {
      ensureCheckbox(
        form,
        'obligations',
        'obligation-' + val,
        val,
        Array.isArray(snap.obligations) && snap.obligations.indexOf(val) !== -1
      );
    });

    CONSEQUENCE_VALUES.forEach(function (val) {
      ensureCheckbox(
        form,
        'consequences',
        'consequence-' + val,
        val,
        Array.isArray(snap.consequences) && snap.consequences.indexOf(val) !== -1
      );
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

    RADIO_GROUPS.forEach(function (key) {
      if (r[key]) selectChoice(key, r[key]);
    });

    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function (el) {
      if (!(el.id in f)) return;
      el.value = f[el.id] != null ? String(f[el.id]) : '';
    });

    if (Array.isArray(snap.obligations)) {
      document.querySelectorAll('input[name="obligations"]').forEach(function (el) {
        el.checked = snap.obligations.indexOf(el.value) !== -1;
      });
    }
    if (Array.isArray(snap.consequences)) {
      document.querySelectorAll('input[name="consequences"]').forEach(function (el) {
        el.checked = snap.consequences.indexOf(el.value) !== -1;
      });
    }

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

  window.ParcoursMiseEnDemeureSnapshot = {
    STORAGE_KEY: STORAGE_KEY,
    collect: collect,
    apply: apply,
    applyVisible: applyVisible,
    save: save,
    load: load,
    restorePending: restorePending,
  };
})();
