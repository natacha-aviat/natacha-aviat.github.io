/**
 * Point d'entrée contrat de collaboration — window.MedLexCollaborationContract
 */

import { $ } from '../utils.js';
import { collectQuestionnaireSnapshot, applyQuestionnaireSnapshot } from './snapshot.js';
import { collectAnswers } from './answers.js';
import { loadTemplate, buildContractText } from './template-engine.js';
import { buildContractRenderedHtml } from './render-html.js';
import { PDF_FILENAME } from './constants.js';
import { downloadContractPdf } from '../pdf-export.js';

async function downloadPdf() {
  const btn = $('download-pdf');
  const prev = btn?.textContent;
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Téléchargement…';
  }

  try {
    const docEl = document.getElementById('contract-doc');
    if (docEl && docEl.querySelector('.ac-contract-doc__body')) {
      await downloadContractPdf({
        filename: PDF_FILENAME,
        sourceElement: docEl,
      });
      return;
    }

    const templateRaw = await loadTemplate();
    const answers = collectAnswers();
    const bodyText = buildContractText(templateRaw, answers);
    const bodyHtml = buildContractRenderedHtml(bodyText, answers);

    await downloadContractPdf({
      filename: PDF_FILENAME,
      title: 'Contrat de collaboration infirmier libéral',
      subtitle: answers.tNom + ' et ' + answers.cNom,
      bodyHtml: bodyHtml,
    });
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
