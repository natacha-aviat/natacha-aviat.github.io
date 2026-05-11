/** Petits utilitaires DOM, texte et dates (sans dépendance au formulaire). */

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Chaîne JavaScript sûre pour `JSON.parse(…)` dans un `<script>` HTML
 * (évite coupure sur `</script>`, U+2028/U+2029 dans du texte utilisateur, etc.).
 */
export function jsonLiteralForEmbeddedParse(obj) {
  return JSON.stringify(JSON.stringify(obj));
}

export function $(id) {
  return document.getElementById(id);
}

export function val(id, fallback = '') {
  const el = $(id);
  if (!el) return fallback;
  const v = el.value;
  return v != null && String(v).trim() !== '' ? String(v).trim() : fallback;
}

export function checkedValue(name, fallback = '') {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : fallback;
}

export function isFileProtocol() {
  return typeof window !== 'undefined' && window.location.protocol === 'file:';
}

export function formatDate(iso) {
  if (!iso) return 'Non renseigné';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('fr-FR');
}

export function formatDateDuJour() {
  return new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Monsieur / Madame → M. / Mme pour le bloc signature. */
export function abregeCivilite(civilite) {
  const c = String(civilite || '').trim();
  if (c === 'Monsieur') return 'M.';
  if (c === 'Madame') return 'Mme';
  return 'M./Mme';
}

/**
 * Tente d’extraire la ville depuis une adresse (ligne avec code postal français en priorité).
 * @param {string} adresse
 */
export function extraitVilleDepuisAdresse(adresse) {
  const s = String(adresse || '').trim();
  if (!s) return 'Non renseigné';
  const lines = s
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const lastLine = lines.length ? lines[lines.length - 1] : s;
  const cpVille = lastLine.match(/\b(\d{5})\s+(.+)$/);
  if (cpVille) return cpVille[2].trim();
  const parts = lastLine
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    const cand = parts[parts.length - 1];
    const m2 = cand.match(/^\d{5}\s+(.+)$/);
    if (m2) return m2[1].trim();
    return cand;
  }
  return lastLine;
}
