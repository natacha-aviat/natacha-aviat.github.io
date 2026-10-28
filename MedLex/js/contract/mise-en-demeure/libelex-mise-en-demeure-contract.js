/**
 * Point d'entrée mise en demeure — window.LibéLexMiseEnDemeureContract
 */

import { collectQuestionnaireSnapshot, applyQuestionnaireSnapshot } from './snapshot.js';
import { collectAnswers } from './answers.js';
import { loadTemplate, buildContractText } from './template-engine.js';
import { buildContractRenderedHtml } from './render-html.js';
import { PDF_FILENAME } from './constants.js';

window.LibéLexMiseEnDemeureContract = {
  loadTemplate: loadTemplate,
  collectAnswers: collectAnswers,
  buildContractText: buildContractText,
  buildContractRenderedHtml: buildContractRenderedHtml,
  collectQuestionnaireSnapshot: collectQuestionnaireSnapshot,
  applyQuestionnaireSnapshot: applyQuestionnaireSnapshot,
  PDF_FILENAME: PDF_FILENAME,
};
