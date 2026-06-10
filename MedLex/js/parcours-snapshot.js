/**
 * Capture / restauration des réponses du questionnaire parcours (boutons ac-choice + champs).
 * Stockage sessionStorage pour alimenter la génération du contrat sur contrat.html.
 */
(function () {
  var STORAGE_KEY = 'medlex-parcours-questionnaire-snapshot';

  function selectedValue(group) {
    var btn = document.querySelector('[data-select="' + group + '"].ac-choice--selected');
    return btn ? btn.getAttribute('data-value') : null;
  }

  function collect() {
    var fields = {};
    var radios = {};

    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function (el) {
      var t = el.type;
      if (t === 'radio' || t === 'button' || t === 'submit' || t === 'file') return;
      if (t === 'checkbox') {
        fields[el.id] = el.checked;
        return;
      }
      fields[el.id] = el.value;
    });

    fields['type-remplacement'] = selectedValue('type') || 'continue';
    fields['facturation'] = selectedValue('facturation') || 'directe';
    var rev = selectedValue('redevance') || 'oui';
    fields['redevance'] = rev === 'oui' ? 'Oui' : 'Non';
    radios['nonconcurrence'] = selectedValue('nonconcurrence') || 'non';
    radios['annexes'] = selectedValue('annexes') || 'non';

    return { version: 1, fields: fields, radios: radios };
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

  function ensureSelect(form, id, options, value) {
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('select');
      el.id = id;
      form.appendChild(el);
    }
    if (!el.options.length) {
      options.forEach(function (opt) {
        var o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.label;
        el.appendChild(o);
      });
    }
    el.value = value != null ? String(value) : '';
    return el;
  }

  function ensureInput(form, id, value, type) {
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('input');
      el.id = id;
      el.type = type || 'text';
      form.appendChild(el);
    }
    if (el.type === 'checkbox') {
      el.checked = Boolean(value);
    } else {
      el.value = value != null ? String(value) : '';
    }
    return el;
  }

  function ensureTextarea(form, id, value) {
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('textarea');
      el.id = id;
      form.appendChild(el);
    }
    el.value = value != null ? String(value) : '';
    return el;
  }

  function ensureRadios(form, name, value) {
    ['oui', 'non'].forEach(function (v) {
      var id = name + '-' + v;
      var el = document.getElementById(id);
      if (!el) {
        el = document.createElement('input');
        el.type = 'radio';
        el.name = name;
        el.id = id;
        el.value = v;
        form.appendChild(el);
      }
      el.checked = v === value;
    });
  }

  function apply(snap) {
    if (!snap || snap.version !== 1) return false;
    var form = ensureHiddenForm();
    var f = snap.fields || {};
    var r = snap.radios || {};

    ensureSelect(form, 'type-remplacement', [
      { value: 'continue', label: 'Remplacement continu' },
      { value: 'discontinu', label: 'Remplacement discontinu' },
      { value: 'planning', label: 'Planning variable' },
    ], f['type-remplacement']);

    ensureInput(form, 'date-debut', f['date-debut'], 'date');
    ensureInput(form, 'date-fin', f['date-fin'], 'date');
    ensureTextarea(form, 'periodes-discontinues', f['periodes-discontinues']);

    ensureSelect(form, 'motif', [
      { value: 'conge-maternite', label: 'Congé maternité / paternité' },
      { value: 'maladie', label: 'Maladie ou accident' },
      { value: 'formation', label: 'Formation ou congé sabbatique' },
      { value: 'autre', label: 'Autre' },
    ], f['motif']);
    ensureInput(form, 'motif-autre-texte', f['motif-autre-texte']);

    ensureSelect(form, 'r-civilite', [
      { value: 'Mme', label: 'Mme' },
      { value: 'M.', label: 'M.' },
      { value: 'Dr', label: 'Dr' },
    ], f['r-civilite'] || 'Mme');
    ensureInput(form, 'r-nom', f['r-nom']);
    ensureInput(form, 'r-ordinal', f['r-ordinal']);
    ensureInput(form, 'r-rpps', f['r-rpps']);
    ensureTextarea(form, 'r-adresse', f['r-adresse']);

    ensureSelect(form, 'mode-exercice', [
      { value: 'seul', label: 'Exercice seul·e' },
      { value: 'associes', label: 'En association ou SEL' },
    ], f['mode-exercice'] || 'seul');

    ensureSelect(form, 'rp-civilite', [
      { value: 'Mme', label: 'Mme' },
      { value: 'M.', label: 'M.' },
    ], f['rp-civilite'] || 'Mme');
    ensureInput(form, 'rp-nom', f['rp-nom']);
    ensureInput(form, 'rp-ordinal', f['rp-ordinal']);
    ensureInput(form, 'rp-rpps', f['rp-rpps']);
    ensureSelect(form, 'rp-statut', [
      { value: '0', label: 'Cabinet déjà installé·e' },
      { value: '1', label: 'Première installation / autre situation' },
    ], f['rp-statut-index'] != null ? String(f['rp-statut-index']) : '0');
    if (f['rp-statut'] && document.getElementById('rp-statut')) {
      var statutEl = document.getElementById('rp-statut');
      for (var i = 0; i < statutEl.options.length; i++) {
        if (statutEl.options[i].textContent.trim() === String(f['rp-statut']).trim()) {
          statutEl.selectedIndex = i;
          break;
        }
      }
    }
    ensureTextarea(form, 'rp-adresse', f['rp-adresse']);
    ensureSelect(form, 'multi-remplacements', [
      { value: 'un', label: 'Un seul remplacement' },
      { value: 'plus', label: 'Plusieurs remplacements simultanés' },
    ], f['multi-remplacements'] || 'un');

    ensureSelect(form, 'lieu', [
      { value: 'cabinet-remplace', label: 'Cabinet du remplacé·e' },
      { value: 'cabinet-remplacant', label: 'Cabinet du remplaçant·e' },
      { value: 'autre', label: 'Autre lieu' },
    ], f['lieu'] || 'cabinet-remplace');
    ensureTextarea(form, 'adresse-lieu', f['adresse-lieu']);

    ensureSelect(form, 'facturation', [
      { value: 'directe', label: 'Facturation directe' },
      { value: 'via-remplace', label: 'Via la CPS du remplacé' },
    ], f['facturation'] || 'directe');

    ensureSelect(form, 'tiers-payant', [
      { value: 'non', label: 'Non' },
      { value: 'oui', label: 'Oui' },
    ], f['tiers-payant'] || 'non');
    ensureInput(form, 'taux-tiers-payant', f['taux-tiers-payant'], 'number');

    ensureSelect(form, 'redevance', [
      { value: 'Oui', label: 'Oui' },
      { value: 'Non', label: 'Non' },
    ], f['redevance'] || 'Oui');
    ensureInput(form, 'taux-redevance', f['taux-redevance'], 'number');
    ensureSelect(form, 'mode-reglement', [
      { value: 'Virement bancaire', label: 'Virement bancaire' },
      { value: 'Chèque', label: 'Chèque' },
      { value: 'Autre', label: 'Autre' },
    ], f['mode-reglement'] || 'Virement bancaire');

    ensureInput(form, 'preavis-accord', f['preavis-accord'], 'number');
    ensureInput(form, 'preavis-manquement', f['preavis-manquement'], 'number');

    ensureRadios(form, 'nonconcurrence', r['nonconcurrence'] || 'non');
    ensureRadios(form, 'annexes', r['annexes'] || 'non');
    ensureTextarea(form, 'annexes-texte', f['annexes-texte']);

    return true;
  }

  function save() {
    var snap = collect();
    if (document.getElementById('rp-statut')) {
      var statut = document.getElementById('rp-statut');
      snap.fields['rp-statut'] = statut.selectedOptions[0]
        ? statut.selectedOptions[0].textContent.trim()
        : '';
      snap.fields['rp-statut-index'] = statut.selectedIndex;
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
    } catch (e) {
      console.warn('Impossible de sauvegarder le questionnaire', e);
    }
    return snap;
  }

  function load() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
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

    if (f['type-remplacement']) selectChoice('type', f['type-remplacement']);
    if (f['facturation']) selectChoice('facturation', f['facturation']);
    selectChoice('redevance', f['redevance'] === 'Oui' ? 'oui' : 'non');
    if (r['nonconcurrence']) selectChoice('nonconcurrence', r['nonconcurrence']);
    if (r['annexes']) selectChoice('annexes', r['annexes']);

    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function (el) {
      if (!(el.id in f)) return;
      var v = f[el.id];
      if (el.type === 'checkbox') {
        el.checked = Boolean(v);
      } else if (el.tagName === 'SELECT' && f[el.id + '-index'] != null) {
        el.selectedIndex = Number(f[el.id + '-index']);
      } else if (el.tagName === 'SELECT') {
        el.value = v != null ? String(v) : '';
        if (el.value !== String(v)) {
          for (var i = 0; i < el.options.length; i++) {
            if (el.options[i].textContent.trim() === String(v).trim()) {
              el.selectedIndex = i;
              break;
            }
          }
        }
      } else {
        el.value = v != null ? String(v) : '';
      }
    });

    document.querySelectorAll('select').forEach(function (el) {
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    return true;
  }

  function restorePending() {
    var pendingKey = 'medlex-pending-restore-json';
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

  window.ParcoursSnapshot = {
    STORAGE_KEY: STORAGE_KEY,
    collect: collect,
    save: save,
    load: load,
    apply: apply,
    applyVisible: applyVisible,
    restorePending: restorePending,
  };
})();
