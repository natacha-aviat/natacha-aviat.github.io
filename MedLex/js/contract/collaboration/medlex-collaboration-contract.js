/**
 * Point d'entrée contrat de collaboration — window.MedLexCollaborationContract
 */

import { $ } from '../utils.js';
import { collectQuestionnaireSnapshot, applyQuestionnaireSnapshot } from './snapshot.js';
import { collectAnswers } from './answers.js';
import { loadTemplate, buildContractText } from './template-engine.js';
import { buildContractRenderedHtml } from './render-html.js';
import { buildHtmlPreviewDocument } from '../preview-document.js';
import { PDF_FILENAME, STORAGE_KEY_PENDING_RESTORE } from './constants.js';

function collaborationQuestionnaireUrl() {
  if (typeof window !== 'undefined' && window.location && window.location.href) {
    try {
      if (/\/parcours\//.test(window.location.pathname)) {
        return new URL('questionnaire-collaboration.html', window.location.href).href.split('#')[0];
      }
    } catch {
      /* ignore */
    }
  }
  return '';
}

async function downloadPdf() {
  const btn = $('download-pdf');
  const prev = btn?.textContent;
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Ouverture…';
  }

  try {
    const templateRaw = await loadTemplate();
    const answers = collectAnswers();
    const bodyText = buildContractText(templateRaw, answers);
    const win = window.open('', '_blank');
    if (!win) {
      alert(
        'Impossible d’ouvrir une nouvelle fenêtre. Autorisez les fenêtres pop-up pour ce site, puis réessayez.'
      );
      return;
    }
    window.medlexLastPreviewWindow = win;
    const snap = collectQuestionnaireSnapshot();
    win.document.open();
    win.document.write(
      buildHtmlPreviewDocument(bodyText, answers, {
        autoDownloadPdf: true,
        formSnapshot: snap,
        buildRenderedHtml: buildContractRenderedHtml,
        questionnairePageUrl: collaborationQuestionnaireUrl(),
        pdfFilename: PDF_FILENAME,
        pendingRestoreKey: STORAGE_KEY_PENDING_RESTORE,
        previewTitle: 'Aperçu contrat de collaboration',
      })
    );
    win.document.close();
  } catch (e) {
    console.error(e);
    alert(
      e instanceof Error ? `Impossible de générer le PDF : ${e.message}` : 'Impossible de générer le PDF.'
    );
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = prev || 'Télécharger le PDF';
    }
  }
}

window.MedLexCollaborationContract = {
  downloadPdf,
  loadTemplate,
  collectAnswers,
  buildContractText,
  buildContractRenderedHtml,
  collectQuestionnaireSnapshot,
  applyQuestionnaireSnapshot,
};
