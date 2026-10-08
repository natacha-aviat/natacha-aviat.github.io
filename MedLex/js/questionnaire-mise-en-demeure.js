(function () {
  if (window.ParcoursType) {
    window.ParcoursType.set('mise-en-demeure');
  }

  var STEPS = 10;
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

  function acksOk() {
    return (
      selectedValue('ack-gravite') === 'oui' &&
      selectedValue('ack-contestation') === 'oui' &&
      selectedValue('ack-juge') === 'oui' &&
      selectedValue('ack-risque') === 'oui' &&
      selectedValue('ack-loyers') === 'oui'
    );
  }

  function isBlocked() {
    if (selectedValue('usage-pro') === 'non') return true;
    if (selectedValue('faute-bailleur') === 'non') return true;
    if (selectedValue('preuves') === 'non') return true;
    if (selectedValue('urgence') === 'oui') return true;
    if (step >= 3 && !acksOk()) return true;
    if (selectedValue('persistance') === 'non') return true;
    if (selectedValue('usage-normal') === 'oui') return true;
    if (selectedValue('envoi-lrar') === 'non') return true;
    return false;
  }

  function saveAndReturnContrat() {
    if (window.ParcoursMiseEnDemeureSnapshot) {
      window.ParcoursMiseEnDemeureSnapshot.save();
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

  function updateConditionals() {
    toggle(document.getElementById('block-usage'), selectedValue('usage-pro') === 'non');
    toggle(document.getElementById('block-faute'), selectedValue('faute-bailleur') === 'non');
    toggle(document.getElementById('bloc-obligations'), selectedValue('faute-bailleur') !== 'non');
    toggle(document.getElementById('block-preuves'), selectedValue('preuves') === 'non');
    toggle(document.getElementById('bloc-pieces'), selectedValue('preuves') === 'oui');
    toggle(document.getElementById('block-urgence'), selectedValue('urgence') === 'oui');
    toggle(document.getElementById('bloc-acks'), selectedValue('urgence') !== 'oui');
    toggle(document.getElementById('block-acks'), step === 3 && selectedValue('urgence') !== 'oui' && !acksOk());
    toggle(document.getElementById('block-persistance'), selectedValue('persistance') === 'non');
    toggle(document.getElementById('label-persistance-detail'), selectedValue('persistance') === 'oui');
    toggle(document.getElementById('block-usage-normal'), selectedValue('usage-normal') === 'oui');
    toggle(document.getElementById('bloc-impossibilite'), selectedValue('usage-normal') === 'non');
    toggle(document.getElementById('block-lrar'), selectedValue('envoi-lrar') === 'non');

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
      if (window.ParcoursMiseEnDemeureSnapshot) {
        window.ParcoursMiseEnDemeureSnapshot.save();
      }
      if (fromContrat) {
        window.location.href = 'contrat.html';
      } else {
        window.location.href = 'apercu.html';
      }
    });
  }

  if (window.ParcoursMiseEnDemeureSnapshot) {
    window.ParcoursMiseEnDemeureSnapshot.restorePending();
    var existing = window.ParcoursMiseEnDemeureSnapshot.load();
    if (existing) window.ParcoursMiseEnDemeureSnapshot.applyVisible(existing);
  }

  render();
})();
