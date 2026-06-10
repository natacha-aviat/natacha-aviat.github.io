/**
 * Page parcours/contrat.html — génération du texte juridique à partir du questionnaire.
 */

function loadScript(src) {
  return new Promise(function (resolve, reject) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = function () {
      resolve();
    };
    s.onerror = function () {
      reject(new Error('Script introuvable : ' + src));
    };
    document.head.appendChild(s);
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

var TYPE_LABELS = {
  continue: 'Remplacement continu',
  discontinu: 'Remplacement discontinu',
  planning: 'Planning variable',
};

function showError(message) {
  var doc = document.getElementById('contract-doc');
  if (!doc) return;
  doc.innerHTML =
    '<p class="ac-contract-doc__title">Contrat de remplacement infirmier libéral</p>' +
    '<p class="ac-microcopy" style="margin-top:1rem;color:var(--ac-ink)">' +
    escapeHtml(message) +
    '</p>' +
    '<p class="ac-microcopy ac-spacer-sm"><a href="questionnaire.html">Revenir au questionnaire</a></p>';
}

function renderContract(docEl, bodyText, answers, Contract) {
  var subtitle =
    escapeHtml(answers.rpNom) +
    ' et ' +
    escapeHtml(answers.rNom) +
    ' · ' +
    escapeHtml(TYPE_LABELS[answers.typeRemplacement] || 'Remplacement');

  var bodyHtml = Contract.buildContractRenderedHtml(bodyText, answers);
  docEl.innerHTML =
    '<p class="ac-contract-doc__title">Contrat de remplacement infirmier libéral</p>' +
    '<p class="ac-contract-doc__subtitle">' +
    subtitle +
    '</p>' +
    '<div class="ac-contract-doc__body">' +
    bodyHtml +
    '</div>';
}

async function initContratPage() {
  var docEl = document.getElementById('contract-doc');
  var pdfBtn = document.getElementById('download-pdf');
  if (!docEl) return;

  var isCollab = window.ParcoursType && window.ParcoursType.isCollaboration();
  if (isCollab) {
    showError(
      'Le contrat de collaboration sera bientôt généré automatiquement. Pour l’instant, complète le questionnaire collaboration — la génération PDF arrive dans une prochaine version.'
    );
    if (pdfBtn) pdfBtn.disabled = true;
    return;
  }

  var snap = window.ParcoursSnapshot && window.ParcoursSnapshot.load();
  if (!snap) {
    showError(
      'Aucune réponse au questionnaire n’a été trouvée. Complète le questionnaire pour générer ton contrat.'
    );
    if (pdfBtn) pdfBtn.disabled = true;
    return;
  }

  if (!window.ParcoursSnapshot.apply(snap)) {
    showError('Impossible de restaurer les réponses du questionnaire.');
    if (pdfBtn) pdfBtn.disabled = true;
    return;
  }

  try {
    await loadScript('../medlex-contract-template-embedded.js');
    var mod = await import('./contract/medlex-contract.js');
    var Contract = mod.default || window.MedLexContract;

    var templateRaw = await Contract.loadTemplate();
    var answers = Contract.collectAnswers();
    var bodyText = Contract.buildContractText(templateRaw, answers);
    renderContract(docEl, bodyText, answers, Contract);
    docEl.removeAttribute('aria-busy');

    if (pdfBtn) {
      pdfBtn.disabled = false;
      pdfBtn.addEventListener('click', function () {
        Contract.downloadPdf();
      });
    }
  } catch (e) {
    console.error(e);
    showError(
      e instanceof Error
        ? 'Erreur lors de la génération : ' + e.message
        : 'Erreur lors de la génération du contrat.'
    );
    if (pdfBtn) pdfBtn.disabled = true;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContratPage);
} else {
  initContratPage();
}
