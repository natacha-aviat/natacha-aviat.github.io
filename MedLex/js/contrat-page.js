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

function showError(message, questionnaireHref) {
  var doc = document.getElementById('contract-doc');
  if (!doc) return;
  var href = questionnaireHref || 'questionnaire.html';
  var isCollab = window.ParcoursType && window.ParcoursType.isCollaboration();
  var title = isCollab
    ? 'Contrat de collaboration infirmier libéral'
    : 'Contrat de remplacement infirmier libéral';
  doc.innerHTML =
    '<p class="ac-contract-doc__title">' +
    title +
    '</p>' +
    '<p class="ac-microcopy" style="margin-top:1rem;color:var(--ac-ink)">' +
    escapeHtml(message) +
    '</p>' +
    '<p class="ac-microcopy ac-spacer-sm"><a href="' +
    escapeHtml(href) +
    '">Revenir au questionnaire</a></p>';
}

function renderRemplacementContract(docEl, bodyText, answers, Contract) {
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

function renderCollaborationContract(docEl, bodyText, answers, Contract) {
  var subtitle = escapeHtml(answers.tNom) + ' et ' + escapeHtml(answers.cNom);

  var bodyHtml = Contract.buildContractRenderedHtml(bodyText, answers);
  docEl.innerHTML =
    '<p class="ac-contract-doc__title">Contrat de collaboration infirmier libéral</p>' +
    '<p class="ac-contract-doc__subtitle">' +
    subtitle +
    '</p>' +
    '<div class="ac-contract-doc__body">' +
    bodyHtml +
    '</div>';
}

function updatePageChrome(isCollab) {
  var docEl = document.getElementById('contract-doc');
  if (docEl) {
    docEl.setAttribute(
      'aria-label',
      isCollab ? 'Aperçu du contrat de collaboration' : 'Aperçu du contrat de remplacement'
    );
  }
}

var pdfExportModule = null;

function preloadPdfEngine() {
  console.log('[MedLex PDF]', 'contrat-page : démarrage préchargement…');
  return import('./contract/pdf-export.js')
    .then(function (mod) {
      console.log('[MedLex PDF]', 'contrat-page : module pdf-export importé');
      pdfExportModule = mod;
      return mod.preloadPdfEngine();
    })
    .then(function () {
      console.log('[MedLex PDF]', 'contrat-page : préchargement terminé', {
        pret: pdfExportModule && pdfExportModule.isPdfEngineReady(),
      });
    })
    .catch(function (e) {
      console.error('[MedLex PDF]', 'contrat-page : échec préchargement', e);
    });
}

function wirePdfDownload(pdfBtn, docEl, filename) {
  if (!pdfBtn || !docEl) return;
  pdfBtn.disabled = false;
  preloadPdfEngine();
  pdfBtn.addEventListener('click', function () {
    var prev = pdfBtn.textContent;
    pdfBtn.disabled = true;
    pdfBtn.textContent = 'Téléchargement…';
    console.log('[MedLex PDF]', 'contrat-page : clic bouton', {
      filename: filename,
      moduleCharge: Boolean(pdfExportModule),
      pret: pdfExportModule ? pdfExportModule.isPdfEngineReady() : false,
      contractDoc: Boolean(docEl && docEl.querySelector('.ac-contract-doc__body')),
    });
    try {
      if (!pdfExportModule) {
        throw new Error(
          'Module PDF non chargé — patientez une seconde et réessayez.'
        );
      }
      if (!pdfExportModule.isPdfEngineReady()) {
        throw new Error(
          'Le moteur PDF se prépare encore — patientez une seconde et réessayez.'
        );
      }
      pdfExportModule.downloadContractPdfNow({
        filename: filename,
        sourceElement: docEl,
      });
    } catch (e) {
      console.error('[MedLex PDF]', 'contrat-page : erreur au clic', e);
      alert(
        e instanceof Error
          ? 'Impossible de générer le PDF : ' + e.message
          : 'Impossible de générer le PDF.'
      );
      preloadPdfEngine();
    } finally {
      pdfBtn.disabled = false;
      pdfBtn.textContent = prev || 'Télécharger le PDF';
    }
  });
}

async function initCollaborationContrat(docEl, pdfBtn) {
  var qHref = 'questionnaire-collaboration.html';

  var snap =
    window.ParcoursCollaborationSnapshot && window.ParcoursCollaborationSnapshot.load();
  if (!snap) {
    showError(
      'Aucune réponse au questionnaire n’a été trouvée. Complète le questionnaire pour générer ton contrat.',
      qHref
    );
    if (pdfBtn) pdfBtn.disabled = true;
    return;
  }

  if (!window.ParcoursCollaborationSnapshot.apply(snap)) {
    showError('Impossible de restaurer les réponses du questionnaire.', qHref);
    if (pdfBtn) pdfBtn.disabled = true;
    return;
  }

  try {
    await loadScript('../medlex-collaboration-template-embedded.js');
    await import('./contract/collaboration/medlex-collaboration-contract.js');
    var Contract = window.MedLexCollaborationContract;

    var templateRaw = await Contract.loadTemplate();
    var answers = Contract.collectAnswers();
    var bodyText = Contract.buildContractText(templateRaw, answers);
    renderCollaborationContract(docEl, bodyText, answers, Contract);
    docEl.removeAttribute('aria-busy');

    wirePdfDownload(pdfBtn, docEl, 'contrat-de-collaboration-medlex.pdf');
  } catch (e) {
    console.error(e);
    showError(
      e instanceof Error
        ? 'Erreur lors de la génération : ' + e.message
        : 'Erreur lors de la génération du contrat.',
      qHref
    );
    if (pdfBtn) pdfBtn.disabled = true;
  }
}

async function initRemplacementContrat(docEl, pdfBtn) {
  var qHref = 'questionnaire.html';

  var snap = window.ParcoursSnapshot && window.ParcoursSnapshot.load();
  if (!snap) {
    showError(
      'Aucune réponse au questionnaire n’a été trouvée. Complète le questionnaire pour générer ton contrat.',
      qHref
    );
    if (pdfBtn) pdfBtn.disabled = true;
    return;
  }

  if (!window.ParcoursSnapshot.apply(snap)) {
    showError('Impossible de restaurer les réponses du questionnaire.', qHref);
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
    renderRemplacementContract(docEl, bodyText, answers, Contract);
    docEl.removeAttribute('aria-busy');

    wirePdfDownload(pdfBtn, docEl, 'contrat-de-remplacement-medlex.pdf');
  } catch (e) {
    console.error(e);
    showError(
      e instanceof Error
        ? 'Erreur lors de la génération : ' + e.message
        : 'Erreur lors de la génération du contrat.',
      qHref
    );
    if (pdfBtn) pdfBtn.disabled = true;
  }
}

async function initContratPage() {
  var docEl = document.getElementById('contract-doc');
  var pdfBtn = document.getElementById('download-pdf');
  if (!docEl) return;

  var isCollab = window.ParcoursType && window.ParcoursType.isCollaboration();
  updatePageChrome(isCollab);

  if (isCollab) {
    await initCollaborationContrat(docEl, pdfBtn);
  } else {
    await initRemplacementContrat(docEl, pdfBtn);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContratPage);
} else {
  initContratPage();
}
