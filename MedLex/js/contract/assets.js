/**
 * URL d'un fichier servi depuis la racine MedLex
 * (fonts/, vendor/, etc.), que la page soit à la racine ou dans parcours/.
 */
export function medlexAssetUrl(pathFromRoot) {
  if (typeof window !== 'undefined' && window.location && window.location.href) {
    try {
      var inParcours = /\/parcours\//.test(window.location.pathname);
      var rel = (inParcours ? '../' : './') + pathFromRoot;
      return new URL(rel, window.location.href).href;
    } catch {
      /* ignore */
    }
  }
  return './' + pathFromRoot;
}
