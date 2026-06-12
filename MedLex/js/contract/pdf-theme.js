/**
 * Charte graphique Au Clair pour l’export PDF (alignée sur parcours.css).
 */

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

const FONT_CDN = 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.2.5/files';
const FONT_TIMEOUT_MS = 8000;

/** @type {{ regular: string; bold: string } | null} */
let interFontsCache = null;

function fetchFontAsBase64(url) {
  return new Promise(function (resolve, reject) {
    const timer = window.setTimeout(function () {
      reject(new Error('Délai dépassé pour la police'));
    }, FONT_TIMEOUT_MS);

    fetch(url, { cache: 'force-cache' })
      .then(function (res) {
        if (!res.ok) {
          throw new Error('Police introuvable : ' + url);
        }
        return res.arrayBuffer();
      })
      .then(function (buf) {
        window.clearTimeout(timer);
        const bytes = new Uint8Array(buf);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        resolve(btoa(binary));
      })
      .catch(function (err) {
        window.clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Applique Inter au document jsPDF si les polices sont en cache.
 * @param {import('jspdf').jsPDF} pdf
 */
export function applyInterFontsIfCached(pdf) {
  if (!interFontsCache) return false;
  pdf.addFileToVFS('Inter-Regular.ttf', interFontsCache.regular);
  pdf.addFileToVFS('Inter-Bold.ttf', interFontsCache.bold);
  pdf.addFont('Inter-Regular.ttf', 'Inter', 'normal');
  pdf.addFont('Inter-Bold.ttf', 'Inter', 'bold');
  return true;
}

/**
 * @param {import('jspdf').jsPDF} pdf
 */
export async function registerInterFonts(pdf) {
  if (interFontsCache) {
    return applyInterFontsIfCached(pdf);
  }
  try {
    const [regular, bold] = await Promise.all([
      fetchFontAsBase64(FONT_CDN + '/inter-latin-400-normal.ttf'),
      fetchFontAsBase64(FONT_CDN + '/inter-latin-700-normal.ttf'),
    ]);
    interFontsCache = { regular, bold };
    return applyInterFontsIfCached(pdf);
  } catch (e) {
    console.warn('Inter indisponible pour le PDF, repli sur Helvetica', e);
    return false;
  }
}

export function isArticleHeading(text) {
  return /^(Article|ARTICLE)\s+\d+/i.test(String(text || '').trim());
}

export function interFontsReady() {
  return interFontsCache !== null;
}
