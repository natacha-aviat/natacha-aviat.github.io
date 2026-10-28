/**
 * Point d'entrée fin de bail — window.LibéLexFinDeBailContract
 */

import { collectQuestionnaireSnapshot, applyQuestionnaireSnapshot } from './snapshot.js';
import { collectAnswers } from './answers.js';
import { loadTemplate, buildContractText } from './template-engine.js';
import { buildContractRenderedHtml } from './render-html.js';
import { PDF_FILENAME } from './constants.js';

window.LibéLexFinDeBailContract = {
  loadTemplate: loadTemplate,
  collectAnswers: collectAnswers,
  buildContractText: buildContractText,
  buildContractRenderedHtml: buildContractRenderedHtml,
  collectQuestionnaireSnapshot: collectQuestionnaireSnapshot,
  applyQuestionnaireSnapshot: applyQuestionnaireSnapshot,
  PDF_FILENAME: PDF_FILENAME,
};
