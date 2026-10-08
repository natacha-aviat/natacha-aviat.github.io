(function () {
  if (window.ParcoursType) {
    window.ParcoursType.set('bail-professionnel');
  }

  var STEPS = 9;
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
  var loyerHc = document.getElementById('loyer-hc');
  var depot = document.getElementById('depot-garantie');
  var dateEffet = document.getElementById('date-effet');
  var dateExp = document.getElementById('date-expiration');

  function selectedValue(group) {
    var btn = document.querySelector('[data-select="' + group + '"].ac-choice--selected');
    return btn ? btn.getAttribute('data-value') : null;
  }

  function toggle(el, show) {
    if (el) el.classList.toggle('ac-hidden', !show);
  }

  function saveAndReturnContrat() {
    if (window.ParcoursBailProfessionnelSnapshot) {
      window.ParcoursBailProfessionnelSnapshot.save();
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
      btn.textContent = 'Enregistrer et retour au contrat';
      btn.addEventListener('click', saveAndReturnContrat);
      row.appendChild(btn);
    }
  }

  function suggestExpiration() {
    if (!dateEffet || !dateEffet.value || (dateExp && dateExp.value)) return;
    var d = new Date(dateEffet.value + 'T12:00:00');
    if (Number.isNaN(d.getTime())) return;
    d.setFullYear(d.getFullYear() + 6);
    d.setDate(d.getDate() - 1);
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    if (dateExp) dateExp.value = y + '-' + m + '-' + day;
  }

  function suggestDepot() {
    if (!loyerHc || !depot || depot.value) return;
    if (loyerHc.value) depot.value = loyerHc.value;
  }

  function updateConditionals() {
    toggle(document.getElementById('bloc-nature-autre'), selectedValue('nature-immeuble') === 'autre');
    toggle(document.getElementById('bloc-tva'), selectedValue('tva-applicable') === 'oui');
    if (step === 3) suggestExpiration();
    if (step === 5) suggestDepot();
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
            ? 'Enregistrer et retour au contrat'
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

  if (dateEffet) {
    dateEffet.addEventListener('change', suggestExpiration);
  }
  if (loyerHc) {
    loyerHc.addEventListener('blur', suggestDepot);
  }

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
      if (step < STEPS - 1) {
        step++;
        render();
        return;
      }
      if (window.ParcoursBailProfessionnelSnapshot) {
        window.ParcoursBailProfessionnelSnapshot.save();
      }
      if (fromContrat) {
        window.location.href = 'contrat.html';
      } else {
        window.location.href = 'apercu.html';
      }
    });
  }

  if (window.ParcoursBailProfessionnelSnapshot) {
    window.ParcoursBailProfessionnelSnapshot.restorePending();
    var existing = window.ParcoursBailProfessionnelSnapshot.load();
    if (existing) window.ParcoursBailProfessionnelSnapshot.applyVisible(existing);
  }

  render();
})();
