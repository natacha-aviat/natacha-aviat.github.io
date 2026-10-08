(function () {
  if (window.ParcoursType) {
    window.ParcoursType.set('fin-de-bail');
  }

  var STEPS = 8;
  var params = new URLSearchParams(window.location.search);
  var fromContrat = params.get('from') === 'contrat';
  var stepParam = parseInt(params.get('step'), 10);
  var step = !isNaN(stepParam) && stepParam >= 0 && stepParam < STEPS ? stepParam : 0;

  var steps = document.querySelectorAll('.ac-q-step');
  var label = document.getElementById('q-label');
  var pct = document.getElementById('q-pct');
  var fill = document.getElementById('q-fill');
  var backLink = document.getElementById('q-back');
  var prevBtn = document.getElementById('q-prev');
  var nextBtn = document.getElementById('q-next');

  function selectedValue(group) {
    var btn = document.querySelector('[data-select="' + group + '"].ac-choice--selected');
    return btn ? btn.getAttribute('data-value') : null;
  }

  function toggle(el, show) {
    if (el) el.classList.toggle('ac-hidden', !show);
  }

  function isBlocked() {
    if (selectedValue('usage-pro') === 'non') return true;
    if (selectedValue('litige') === 'oui') return true;
    if (
      selectedValue('situation') === 'proprietaire-non-renouvellement' &&
      selectedValue('role') === 'proprietaire' &&
      selectedValue('delai-six-mois') === 'non'
    ) {
      return true;
    }
    if (selectedValue('notification-recommande') === 'non') return true;
    return false;
  }

  function saveAndReturnContrat() {
    if (window.ParcoursFinDeBailSnapshot) {
      window.ParcoursFinDeBailSnapshot.save();
    }
    window.location.href = 'contrat.html';
  }

  function ensureContratSaveBtn() {
    if (!fromContrat) return;
    var row = document.querySelector('.ac-btn-row');
    if (!row) return;
    var btn = document.getElementById('q-save-contrat');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'q-save-contrat';
      btn.className = 'ac-btn ac-btn--secondary';
      btn.textContent = 'Enregistrer et retour au document';
      btn.addEventListener('click', saveAndReturnContrat);
      row.appendChild(btn);
    }
  }

  function selectChoice(group, value) {
    document.querySelectorAll('[data-select="' + group + '"]').forEach(function (btn) {
      btn.classList.toggle('ac-choice--selected', btn.getAttribute('data-value') === value);
    });
  }

  function updateConditionals() {
    toggle(document.getElementById('block-usage'), selectedValue('usage-pro') === 'non');
    toggle(document.getElementById('block-litige'), selectedValue('litige') === 'oui');

    var isModelB = selectedValue('situation') === 'proprietaire-non-renouvellement';
    if (isModelB && selectedValue('role') !== 'proprietaire') {
      selectChoice('role', 'proprietaire');
    }
    if (!isModelB && selectedValue('role') !== 'locataire' && selectedValue('situation') === 'locataire-quitte') {
      selectChoice('role', 'locataire');
    }

    var isProprio = selectedValue('role') === 'proprietaire';
    toggle(document.getElementById('bloc-delai-six'), isModelB && isProprio);
    toggle(
      document.getElementById('block-delai'),
      isModelB && isProprio && selectedValue('delai-six-mois') === 'non'
    );

    toggle(document.getElementById('bloc-preavis'), !isModelB);

    var preavis = selectedValue('preavis-six');
    var info = document.getElementById('info-preavis');
    if (info) {
      if (preavis === 'ne-sais-pas') {
        info.textContent = 'Le délai légal est de 6 mois. Il sera appliqué dans le courrier.';
        toggle(info, true);
      } else if (preavis === 'non') {
        info.textContent =
          'Le délai de 6 mois est obligatoire, sauf faute de l’une ou l’autre des parties. Si tu continues, le délai de 6 mois sera automatiquement appliqué.';
        toggle(info, true);
      } else {
        info.textContent = '';
        toggle(info, false);
      }
    }

    toggle(document.getElementById('block-notification'), selectedValue('notification-recommande') === 'non');

    if (nextBtn) {
      if (isBlocked()) {
        nextBtn.disabled = true;
        nextBtn.title = 'Cette situation ne permet pas de continuer avec ce document.';
      } else {
        nextBtn.disabled = false;
        nextBtn.removeAttribute('title');
      }
    }
  }

  function render() {
    var progress = Math.round(((step + 1) / STEPS) * 100);
    steps.forEach(function (el, i) {
      el.classList.toggle('is-active', i === step);
    });
    if (label) label.textContent = '';
    if (pct) pct.textContent = (step + 1) + '/' + STEPS;
    if (fill) fill.style.width = progress + '%';
    if (backLink) {
      if (fromContrat && step === 0) {
        backLink.href = 'contrat.html';
        backLink.onclick = null;
      } else {
        backLink.href = step === 0 ? 'verification-email.html' : '#';
        backLink.onclick =
          step === 0
            ? null
            : function (e) {
                e.preventDefault();
                step--;
                render();
              };
      }
    }
    ensureContratSaveBtn();
    if (nextBtn) {
      nextBtn.textContent =
        step === STEPS - 1
          ? fromContrat
            ? 'Enregistrer et retour au document'
            : "Voir l'aperçu"
          : 'Suivant';
    }
    updateConditionals();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('[data-select]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      updateConditionals();
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      if (step > 0) {
        step--;
        render();
      } else if (fromContrat) {
        window.location.href = 'contrat.html';
      } else {
        window.location.href = 'verification-email.html';
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (isBlocked()) return;
      if (step < STEPS - 1) {
        step++;
        render();
        return;
      }
      if (window.ParcoursFinDeBailSnapshot) {
        window.ParcoursFinDeBailSnapshot.save();
      }
      if (fromContrat) {
        window.location.href = 'contrat.html';
      } else {
        window.location.href = 'apercu.html';
      }
    });
  }

  if (window.ParcoursFinDeBailSnapshot) {
    window.ParcoursFinDeBailSnapshot.restorePending();
    var existing = window.ParcoursFinDeBailSnapshot.load();
    if (existing) window.ParcoursFinDeBailSnapshot.applyVisible(existing);
  }

  render();
})();
