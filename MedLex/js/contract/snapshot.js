/**
 * Capture / restauration de l’état du formulaire (reprise depuis l’aperçu ou le stockage local).
 * @typedef {{ version: number, fields: Record<string, string|boolean>, radios: Record<string, string> }} FormSnapshot
 */

/** @returns {FormSnapshot} */
export function collectQuestionnaireSnapshot() {
  const form = document.getElementById('questionnaire-form');
  if (!form) {
    return { version: 1, fields: {}, radios: {} };
  }
  const snap = { version: 1, fields: {}, radios: {} };
  form.querySelectorAll('input, select, textarea').forEach(function (el) {
    const t = el.type;
    if (t === 'radio') {
      if (el.checked) snap.radios[el.name] = el.value;
      return;
    }
    if (t === 'checkbox') {
      if (el.id) snap.fields[el.id] = el.checked;
      return;
    }
    if (t === 'submit' || t === 'button' || t === 'file') return;
    if (el.id) snap.fields[el.id] = el.value;
  });
  return snap;
}

/** @param {Partial<FormSnapshot> | null | undefined} snap */
export function applyQuestionnaireSnapshot(snap) {
  if (!snap || snap.version !== 1) return;
  const form = document.getElementById('questionnaire-form');
  if (!form) return;

  if (snap.fields) {
    Object.keys(snap.fields).forEach(function (id) {
      const el = document.getElementById(id);
      if (!el) return;
      const v = snap.fields[id];
      if (el.type === 'checkbox') {
        el.checked = Boolean(v);
      } else {
        el.value = v != null ? String(v) : '';
      }
    });
  }

  if (snap.radios) {
    Object.keys(snap.radios).forEach(function (name) {
      const val = snap.radios[name];
      form.querySelectorAll('input[type="radio"][name="' + name + '"]').forEach(function (rad) {
        rad.checked = rad.value === val;
      });
    });
  }

  form.querySelectorAll('select').forEach(function (el) {
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  form.querySelectorAll('input[type="radio"]:checked').forEach(function (el) {
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
}
