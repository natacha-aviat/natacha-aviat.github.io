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

function currentEntry() {
  if (!window.ParcoursType) return null;
  return window.ParcoursType.entry();
}

function showError(message, questionnaireHref) {
  var doc = document.getElementById('contract-doc');
  var guided = document.getElementById('contract-guided');
  var toggle = document.querySelector('.ac-view-toggle');
  if (!doc) return;
  var item = currentEntry();
  var href = questionnaireHref || (item && item.questionnaire) || 'questionnaire.html';
  var title = (item && item.documentTitle) || 'Contrat';
  if (guided) guided.innerHTML = '';
  if (toggle) toggle.classList.add('ac-hidden');
  doc.classList.remove('ac-hidden');
  doc.innerHTML =
    '<p class="ac-contract-doc__title">' +
    escapeHtml(title) +
    '</p>' +
    '<p class="ac-microcopy" style="margin-top:1rem;color:var(--ac-ink)">' +
    escapeHtml(message) +
    '</p>' +
    '<p class="ac-microcopy ac-spacer-sm"><a href="' +
    escapeHtml(href) +
    '">Revenir au questionnaire</a></p>';
}

function renderContract(docEl, item, bodyText, answers, Contract) {
  var bodyHtml = Contract.buildContractRenderedHtml(bodyText, answers);
  var subtitle = item.subtitle ? item.subtitle(answers) : '';
  docEl.innerHTML =
    '<p class="ac-contract-doc__title">' +
    escapeHtml(item.documentTitle) +
    '</p>' +
    '<p class="ac-contract-doc__subtitle">' +
    escapeHtml(subtitle) +
    '</p>' +
    '<div class="ac-contract-doc__body">' +
    bodyHtml +
    '</div>';
  return { bodyText: bodyText, bodyHtml: bodyHtml };
}

function mountGuidedContractView(parcours, bodyText, bodyHtml) {
  if (!window.MedLexContractGuided) return;
  window.MedLexContractGuided.mount({
    bodyText: bodyText,
    bodyHtml: bodyHtml,
    parcours: parcours,
  });
  window.MedLexContractGuided.initViewToggle();
}

function updatePageChrome(item) {
  var docEl = document.getElementById('contract-doc');
  if (docEl && item.ariaPreview) docEl.setAttribute('aria-label', item.ariaPreview);
  var pageTitle = document.querySelector('.ac-title--page');
  if (pageTitle && item.pageHeading) pageTitle.textContent = item.pageHeading;
  var micro = document.querySelector('.ac-main > .ac-microcopy');
  if (micro && item.pageLead) micro.textContent = item.pageLead;
}

var pdfExportModule = null;
var pdfPreloadPromise = null;

function preloadPdfEngine() {
  if (pdfPreloadPromise) {
    return pdfPreloadPromise;
  }
  console.log('[MedLex PDF]', 'contrat-page : démarrage préchargement…');
  pdfPreloadPromise = import('./contract/pdf-export.js')
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
      pdfPreloadPromise = null;
      console.error('[MedLex PDF]', 'contrat-page : échec préchargement', e);
      throw e;
    });
  return pdfPreloadPromise;
}

function wirePdfDownload(pdfBtn, docEl, filename, pdfMeta) {
  if (!pdfBtn || !docEl) return;

  var meta = pdfMeta || {};

  var labelReady = 'Télécharger le PDF';
  pdfBtn.disabled = true;
  pdfBtn.textContent = 'Préparation du PDF…';

  preloadPdfEngine()
    .then(function () {
      pdfBtn.disabled = false;
      pdfBtn.textContent = labelReady;
    })
    .catch(function () {
      pdfBtn.disabled = false;
      pdfBtn.textContent = labelReady;
    });

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

    function runDownload() {
      pdfExportModule.downloadContractPdfNow({
        filename: filename,
        sourceElement: docEl,
        bodyText: meta.bodyText,
        parcours: meta.parcours,
      });
    }

    function resetBtn() {
      pdfBtn.disabled = false;
      pdfBtn.textContent = prev || labelReady;
    }

    if (pdfExportModule && pdfExportModule.isPdfEngineReady()) {
      try {
        runDownload();
      } catch (e) {
        console.error('[MedLex PDF]', 'contrat-page : erreur au clic', e);
        alert(
          e instanceof Error
            ? 'Impossible de générer le PDF : ' + e.message
            : 'Impossible de générer le PDF.'
        );
      } finally {
        resetBtn();
      }
      return;
    }

    (pdfExportModule ? pdfExportModule.ensurePdfEngineReady() : preloadPdfEngine())
      .then(function () {
        if (!pdfExportModule) {
          throw new Error('Module PDF non chargé.');
        }
        runDownload();
      })
      .catch(function (e) {
        console.error('[MedLex PDF]', 'contrat-page : erreur au clic', e);
        alert(
          e instanceof Error
            ? 'Impossible de générer le PDF : ' + e.message
            : 'Impossible de générer le PDF.'
        );
      })
      .finally(resetBtn);
  });
}

async function loadContractApi(item) {
  await loadScript(item.embedded);
  var mod = await import(item.module);
  var Contract = item.defaultExport ? mod.default || window[item.contractGlobal] : window[item.contractGlobal] || mod.default;
  if (!Contract) throw new Error('Module contrat introuvable : ' + item.id);
  return Contract;
}

async function initParcours(item, docEl, pdfBtn) {
  var snapApi = window.ParcoursType && window.ParcoursType.snapshotApi(item.id);
  var noun = item.noun || 'contrat';

  function fail(message) {
    showError(message, item.questionnaire);
    if (pdfBtn) pdfBtn.disabled = true;
  }

  var snap = snapApi && snapApi.load();
  if (!snap) {
    fail('Aucune réponse au questionnaire n’a été trouvée. Complète le questionnaire pour générer ton ' + noun + '.');
    return;
  }
  if (!snapApi.apply(snap)) {
    fail('Impossible de restaurer les réponses du questionnaire.');
    return;
  }

  try {
    var Contract = await loadContractApi(item);
    var answers = item.answersFirst ? Contract.collectAnswers() : null;
    var templateRaw = item.templateUsesAnswers ? await Contract.loadTemplate(answers) : await Contract.loadTemplate();
    if (!answers) answers = Contract.collectAnswers();
    var bodyText = Contract.buildContractText(templateRaw, answers);
    var rendered = renderContract(docEl, item, bodyText, answers, Contract);
    docEl.removeAttribute('aria-busy');
    mountGuidedContractView(item.id, rendered.bodyText, rendered.bodyHtml);
    wirePdfDownload(pdfBtn, docEl, Contract.PDF_FILENAME || item.pdf, {
      bodyText: rendered.bodyText,
      parcours: item.id,
    });
  } catch (e) {
    console.error(e);
    fail(e instanceof Error ? 'Erreur lors de la génération : ' + e.message : 'Erreur lors de la génération du ' + noun + '.');
  }
}

async function initContratPage() {
  var docEl = document.getElementById('contract-doc');
  var pdfBtn = document.getElementById('download-pdf');
  if (!docEl) return;
  var item = currentEntry();
  if (!item) return;
  updatePageChrome(item);
  await initParcours(item, docEl, pdfBtn);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContratPage);
} else {
  initContratPage();
}
