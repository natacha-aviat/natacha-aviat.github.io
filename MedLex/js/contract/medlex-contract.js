/**
 * Point d’entrée : expose `window.MedLexContract` après chargement de
 * `medlex-contract-template-embedded.js` (variable globale du template).
 */

import { $ } from './utils.js';
import { collectQuestionnaireSnapshot, applyQuestionnaireSnapshot } from './snapshot.js';
import { collectAnswers } from './answers.js';
import { loadTemplate, buildContractText } from './template-engine.js';
import { buildContractRenderedHtml } from './render-html.js';
import { buildHtmlPreviewDocument } from './preview-document.js';

async function downloadPdf() {
  const multi = $('multi-remplacements')?.value;
  if (multi === 'plus') {
    alert(
      'Le Remplaçant ne peut pas remplacer plus de deux infirmiers concomitamment. Corrigez la section 5 avant de générer le PDF.'
    );
    return;
  }

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
        'Impossible d’ouvrir une nouvelle fenêtre. Autorisez les fenêtres pop-up pour ce site, puis réessayez « Télécharger le projet PDF ».'
      );
      return;
    }
    window.medlexLastPreviewWindow = win;
    win.document.open();
    const snap = collectQuestionnaireSnapshot();
    win.document.write(
      buildHtmlPreviewDocument(bodyText, answers, {
        autoDownloadPdf: true,
        formSnapshot: snap,
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
      btn.textContent = prev || 'Télécharger le projet PDF';
    }
  }
}

async function openHtmlPreview(previewWindow) {
  const win = previewWindow || window.open('', '_blank');
  if (!win) {
    throw new Error("Impossible d'ouvrir l'aperçu (fenêtre bloquée par le navigateur).");
  }
  window.medlexLastPreviewWindow = win;
  try {
    const templateRaw = await loadTemplate();
    const answers = collectAnswers();
    const bodyText = buildContractText(templateRaw, answers);
    const snap = collectQuestionnaireSnapshot();
    win.document.open();
    win.document.write(buildHtmlPreviewDocument(bodyText, answers, { formSnapshot: snap }));
    win.document.close();
  } catch (e) {
    try {
      win.close();
    } catch (_) {
      /* ignore */
    }
    throw e;
  }
}

window.MedLexContract = {
  openHtmlPreview,
  downloadPdf,
  loadTemplate,
  collectAnswers,
  buildContractText,
  buildContractRenderedHtml,
  buildHtmlPreviewDocument,
  collectQuestionnaireSnapshot,
  applyQuestionnaireSnapshot,
};
