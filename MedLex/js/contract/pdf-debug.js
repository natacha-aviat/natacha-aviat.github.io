/**
 * Logs console pour diagnostiquer l’export PDF.
 * Filtrer la console avec : MedLex PDF
 */

const PREFIX = '[MedLex PDF]';

export function pdfLog(message, detail) {
  if (detail !== undefined) {
    console.log(PREFIX, message, detail);
  } else {
    console.log(PREFIX, message);
  }
}

export function pdfWarn(message, detail) {
  if (detail !== undefined) {
    console.warn(PREFIX, message, detail);
  } else {
    console.warn(PREFIX, message);
  }
}

export function pdfError(message, detail) {
  if (detail !== undefined) {
    console.error(PREFIX, message, detail);
  } else {
    console.error(PREFIX, message);
  }
}

export function pdfGroup(label, fn) {
  console.groupCollapsed(PREFIX, label);
  try {
    return fn();
  } finally {
    console.groupEnd();
  }
}
