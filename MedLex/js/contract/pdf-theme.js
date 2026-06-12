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

/** @type {{ regular: string; bold: string } | null} */
let interFontsCache = null;

async function fetchFontAsBase64(url) {
  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) {
    throw new Error('Police introuvable : ' + url);
  }
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Enregistre Inter dans jsPDF. Retourne false si chargement impossible (fallback helvetica).
 * @param {import('jspdf').jsPDF} pdf
 */
export async function registerInterFonts(pdf) {
  try {
    if (!interFontsCache) {
      const [regular, bold] = await Promise.all([
        fetchFontAsBase64(FONT_CDN + '/inter-latin-400-normal.ttf'),
        fetchFontAsBase64(FONT_CDN + '/inter-latin-700-normal.ttf'),
      ]);
      interFontsCache = { regular, bold };
    }
    pdf.addFileToVFS('Inter-Regular.ttf', interFontsCache.regular);
    pdf.addFileToVFS('Inter-Bold.ttf', interFontsCache.bold);
    pdf.addFont('Inter-Regular.ttf', 'Inter', 'normal');
    pdf.addFont('Inter-Bold.ttf', 'Inter', 'bold');
    return true;
  } catch (e) {
    console.warn('Inter indisponible pour le PDF, repli sur Helvetica', e);
    return false;
  }
}

export function isArticleHeading(text) {
  return /^(Article|ARTICLE)\s+\d+/i.test(String(text || '').trim());
}
