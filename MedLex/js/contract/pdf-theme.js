/**
 * Charte graphique Au Clair pour l’export PDF (alignée sur parcours.css).
 */

import { pdfLog, pdfWarn } from './pdf-debug.js';

/** @type {{ ink: number[]; muted: number[]; teal: number[]; gray: number[]; white: number[] }} */
export const PDF_THEME = {
  ink: [22, 49, 77],
  muted: [95, 107, 122],
  teal: [15, 163, 163],
  gray: [232, 237, 241],
  white: [255, 255, 255],
};

/** Tailles en pt — calquées sur .ac-contract-doc */
export const PDF_TYPO = {
  brand: 11,
  title: 12,
  subtitle: 9,
  body: 10,
  article: 10.5,
  bodyLineHeight: 5.8,
  titleLineHeight: 6.5,
  subtitleLineHeight: 4.8,
  articleLineHeight: 6,
  blockGap: 2.8,
};

const FONT_TIMEOUT_MS = 8000;

const FONT_SOURCES = {
  regular: 'inter-latin-400-normal.ttf',
  bold: 'inter-latin-700-normal.ttf',
};

/** @type {{ regular: string; bold: string } | null} */
let interFontsCache = null;

function isFileProtocol() {
  return typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';
}

function getLocalFontUrl(filename) {
  if (typeof window !== 'undefined' && window.location && window.location.href) {
    try {
      const inParcours = /\/parcours\//.test(window.location.pathname);
      const rel = inParcours ? '../fonts/' + filename : './fonts/' + filename;
      return new URL(rel, window.location.href).href;
    } catch {
      /* ignore */
    }
  }
  return './fonts/' + filename;
}

function getFontUrls(filename) {
  return [
    getLocalFontUrl(filename),
    'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/' + filename,
  ];
}

function fetchFontAsBase64(url) {
  return new Promise(function (resolve, reject) {
    const timer = window.setTimeout(function () {
      reject(new Error('Délai dépassé pour la police'));
    }, FONT_TIMEOUT_MS);

    pdfLog('Chargement police…', url);
    fetch(url, { cache: 'force-cache' })
      .then(function (res) {
        if (!res.ok) {
          throw new Error('Police introuvable (' + res.status + ') : ' + url);
        }
        return res.arrayBuffer();
      })
      .then(function (buf) {
        window.clearTimeout(timer);
        pdfLog('Police chargée', { url: url, octets: buf.byteLength });
        const bytes = new Uint8Array(buf);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        resolve(btoa(binary));
      })
      .catch(function (err) {
        window.clearTimeout(timer);
        pdfWarn('Échec chargement police', { url: url, erreur: err.message || err });
        reject(err);
      });
  });
}

async function fetchFontWithFallback(filename) {
  const urls = getFontUrls(filename);
  let lastErr = null;
  for (let i = 0; i < urls.length; i++) {
    try {
      return await fetchFontAsBase64(urls[i]);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('Police introuvable : ' + filename);
}

/**
 * Applique Inter au document jsPDF si les polices sont en cache.
 * @param {import('jspdf').jsPDF} pdf
 */
export function applyInterFontsIfCached(pdf) {
  if (!interFontsCache) {
    pdfLog('Inter non en cache → Helvetica');
    return false;
  }
  pdf.addFileToVFS('Inter-Regular.ttf', interFontsCache.regular);
  pdf.addFileToVFS('Inter-Bold.ttf', interFontsCache.bold);
  pdf.addFont('Inter-Regular.ttf', 'Inter', 'normal');
  pdf.addFont('Inter-Bold.ttf', 'Inter', 'bold');
  pdfLog('Police Inter appliquée au document');
  return true;
}

/**
 * @param {import('jspdf').jsPDF} pdf
 */
export async function registerInterFonts(pdf) {
  if (isFileProtocol()) {
    pdfLog('Protocole file:// — police Inter ignorée (Helvetica). Ouvrez le site via http://localhost pour Inter.');
    return false;
  }
  if (interFontsCache) {
    pdfLog('Inter déjà en cache');
    return applyInterFontsIfCached(pdf);
  }
  pdfLog('Chargement Inter (local puis CDN)…');
  try {
    const [regular, bold] = await Promise.all([
      fetchFontWithFallback(FONT_SOURCES.regular),
      fetchFontWithFallback(FONT_SOURCES.bold),
    ]);
    interFontsCache = { regular, bold };
    pdfLog('Inter enregistrée avec succès');
    return applyInterFontsIfCached(pdf);
  } catch (e) {
    pdfWarn('Inter indisponible, repli Helvetica', e);
    return false;
  }
}

export function isArticleHeading(text) {
  return /^(Article|ARTICLE)\s+\d+/i.test(String(text || '').trim());
}

export function interFontsReady() {
  return interFontsCache !== null;
}
