/**
 * Capture / restauration snapshot questionnaire collaboration.
 */

/** @returns {object} */
export function collectQuestionnaireSnapshot() {
  if (typeof window.ParcoursCollaborationSnapshot !== 'undefined') {
    return window.ParcoursCollaborationSnapshot.collect();
  }
  return { version: 1, parcours: 'collaboration', fields: {}, radios: {}, moyens: [] };
}

/** @param {object} snap */
export function applyQuestionnaireSnapshot(snap) {
  if (typeof window.ParcoursCollaborationSnapshot !== 'undefined') {
    return window.ParcoursCollaborationSnapshot.apply(snap);
  }
  return false;
}
