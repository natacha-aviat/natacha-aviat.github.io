/**
 * Export PDF direct sur la page courante — aucun nouvel onglet ni page d’aperçu.
 */

import { html2PdfOptions } from './pdf-options.js';

const PDF_ROOT_STYLES = `
.medlex-pdf-root {
  width: 794px;
  padding: 40px 48px;
  background: #fff;
  font-family: Inter, "Segoe UI", Roboto, Arial, sans-serif;
  font-size: 11pt;
  line-height: 1.65;
  color: #16314d;
  box-sizing: border-box;
}
.medlex-pdf-root .ac-contract-doc,
.medlex-pdf-root.ac-contract-doc {
  max-height: none !important;
  overflow: visible !important;
  box-shadow: none !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
}
.medlex-pdf-root__title,
.medlex-pdf-root .ac-contract-doc__title {
  margin: 0 0 4px;
  font-size: 14pt;
  font-weight: 700;
  text-align: center;
  color: #16314d;
}
.medlex-pdf-root__subtitle,
.medlex-pdf-root .ac-contract-doc__subtitle {
  margin: 0 0 24px;
  font-size: 9pt;
  text-align: center;
  color: #5f6b7a;
}
.medlex-pdf-root__body p,
.medlex-pdf-root .ac-contract-doc__body p {
  margin: 0 0 8px;
  color: #5f6b7a;
}
.medlex-pdf-root__body strong,
.medlex-pdf-root .ac-contract-doc__body strong {
  color: #16314d;
  font-weight: 600;
}
.medlex-pdf-visual-line {
  display: block;
  page-break-inside: avoid !important;
  break-inside: avoid !important;
  -webkit-column-break-inside: avoid !important;
  margin: 0 0 8px;
  line-height: 1.65;
  color: #5f6b7a;
}
.medlex-pdf-visual-line strong {
  color: #16314d;
  font-weight: 600;
}
.medlex-pdf-visual-line--spacer {
  min-height: 0.35em;
  margin-bottom: 4px;
}
`;

function measureTextWidth(text, font) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return text.length * 8;
  ctx.font = font;
  return ctx.measureText(text).width;
}

function getFontFromElement(el) {
  const s = window.getComputedStyle(el);
  return [s.fontStyle, s.fontVariant, s.fontWeight, s.fontSize, s.fontFamily].filter(Boolean).join(' ');
}

function wrapPlainText(text, maxWidth, font) {
  const words = String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return [''];
  const lines = [];
  let current = '';
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const trial = current ? current + ' ' + word : word;
    if (measureTextWidth(trial, font) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = trial;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function replaceParagraphWithLineBlocks(p, maxWidth) {
  const font = getFontFromElement(p);
  const lines = wrapPlainText(p.innerText, maxWidth, font);
  if (lines.length <= 1) {
    p.classList.add('medlex-pdf-visual-line');
    return;
  }
  const parent = p.parentNode;
  if (!parent) return;
  const frag = document.createDocumentFragment();
  lines.forEach(function (line) {
    const div = document.createElement('div');
    div.className = 'medlex-pdf-visual-line';
    div.textContent = line;
    frag.appendChild(div);
  });
  parent.insertBefore(frag, p);
  parent.removeChild(p);
}

/**
 * Découpe les paragraphes longs en lignes visuelles indivisibles pour html2pdf.
 * @param {HTMLElement} root
 */
function preparePdfPagination(root) {
  const padX = 96;
  const maxWidth = Math.max(200, root.clientWidth - padX);

  root
    .querySelectorAll(
      '.medlex-pdf-root__title, .medlex-pdf-root__subtitle, .ac-contract-doc__title, .ac-contract-doc__subtitle'
    )
    .forEach(function (el) {
      el.classList.add('medlex-pdf-visual-line');
    });

  Array.from(root.querySelectorAll('.medlex-pdf-root__body p, .ac-contract-doc__body p')).forEach(function (p) {
    replaceParagraphWithLineBlocks(p, maxWidth);
  });

  root.querySelectorAll('br').forEach(function (br) {
    const div = document.createElement('div');
    div.className = 'medlex-pdf-visual-line medlex-pdf-visual-line--spacer';
    div.innerHTML = '&nbsp;';
    br.replaceWith(div);
  });
}

function getHtml2PdfScriptUrl() {
  if (typeof window !== 'undefined' && window.location && window.location.href) {
    try {
      const inParcours = /\/parcours\//.test(window.location.pathname);
      const rel = inParcours ? '../html2pdf.bundle.min.js' : './html2pdf.bundle.min.js';
      return new URL(rel, window.location.href).href;
    } catch {
      /* ignore */
    }
  }
  return './html2pdf.bundle.min.js';
}

function loadHtml2Pdf() {
  if (typeof window.html2pdf === 'function') {
    return Promise.resolve();
  }
  return new Promise(function (resolve, reject) {
    const existing = document.querySelector('script[data-medlex-html2pdf="1"]');
    if (existing) {
      if (typeof window.html2pdf === 'function') {
        resolve();
        return;
      }
      existing.addEventListener('load', function () {
        resolve();
      });
      existing.addEventListener('error', function () {
        reject(new Error('Impossible de charger html2pdf.js'));
      });
      return;
    }
    const s = document.createElement('script');
    s.src = getHtml2PdfScriptUrl();
    s.async = false;
    s.setAttribute('data-medlex-html2pdf', '1');
    s.onload = function () {
      resolve();
    };
    s.onerror = function () {
      reject(new Error('Impossible de charger html2pdf.js'));
    };
    document.head.appendChild(s);
  });
}

function waitForFonts() {
  if (document.fonts && typeof document.fonts.ready === 'object' && typeof document.fonts.ready.then === 'function') {
    return document.fonts.ready.catch(function () {
      /* ignore */
    });
  }
  return Promise.resolve();
}

function createOffscreenHost() {
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText =
    'position:fixed;left:-12000px;top:0;overflow:visible;pointer-events:none;z-index:-1;';
  document.body.appendChild(host);
  return host;
}

function buildRootFromElement(sourceEl) {
  const root = document.createElement('div');
  root.className = 'medlex-pdf-root';

  const style = document.createElement('style');
  style.textContent = PDF_ROOT_STYLES;
  root.appendChild(style);

  const clone = sourceEl.cloneNode(true);
  clone.removeAttribute('id');
  clone.removeAttribute('tabindex');
  clone.removeAttribute('aria-busy');
  clone.removeAttribute('aria-label');
  root.appendChild(clone);

  return root;
}

function buildRootFromHtml(title, subtitle, bodyHtml) {
  const root = document.createElement('div');
  root.className = 'medlex-pdf-root';

  const style = document.createElement('style');
  style.textContent = PDF_ROOT_STYLES;
  root.appendChild(style);

  if (title) {
    const h = document.createElement('p');
    h.className = 'medlex-pdf-root__title';
    h.textContent = title;
    root.appendChild(h);
  }
  if (subtitle) {
    const sub = document.createElement('p');
    sub.className = 'medlex-pdf-root__subtitle';
    sub.textContent = subtitle;
    root.appendChild(sub);
  }
  const body = document.createElement('div');
  body.className = 'medlex-pdf-root__body';
  body.innerHTML = bodyHtml;
  root.appendChild(body);

  return root;
}

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  window.setTimeout(function () {
    URL.revokeObjectURL(url);
    if (a.parentNode) {
      a.parentNode.removeChild(a);
    }
  }, 250);
}

async function captureElementCanvas(lineEl, opts) {
  const worker = window.html2pdf().set({
    margin: 0,
    html2canvas: opts.html2canvas,
    image: opts.image,
    jsPDF: opts.jsPDF,
  }).from(lineEl).toCanvas();
  return worker.get('canvas');
}

async function renderPdfBlob(captureRoot, filename) {
  const opts = html2PdfOptions({}, filename);
  const lines = Array.from(captureRoot.querySelectorAll('.medlex-pdf-visual-line'));

  const JsPDF = window.jspdf && window.jspdf.jsPDF;
  if (!lines.length || !JsPDF) {
    const worker = window.html2pdf().set(opts).from(captureRoot);
    if (typeof worker.outputPdf === 'function') {
      return worker.outputPdf('blob');
    }
    const pdf = await worker.toPdf().get('pdf');
    return pdf.output('blob');
  }

  const margins = opts.margin || [12, 12, 12, 12];
  const marginTop = margins[0];
  const marginRight = margins[1];
  const marginBottom = margins[2];
  const marginLeft = margins[3];
  const pdf = new JsPDF(opts.jsPDF);
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - marginLeft - marginRight;
  const maxY = pageHeight - marginBottom;
  let y = marginTop;
  const lineGap = 0.4;

  for (let i = 0; i < lines.length; i++) {
    const canvas = await captureElementCanvas(lines[i], opts);
    const imgData = canvas.toDataURL('image/jpeg', opts.image.quality);
    const imgHeightMm = (canvas.height * contentWidth) / canvas.width;

    if (y + imgHeightMm > maxY && y > marginTop) {
      pdf.addPage();
      y = marginTop;
    }

    pdf.addImage(imgData, 'JPEG', marginLeft, y, contentWidth, imgHeightMm);
    y += imgHeightMm + lineGap;
  }

  return pdf.output('blob');
}

/**
 * @param {{ filename: string; sourceElement?: HTMLElement; title?: string; subtitle?: string; bodyHtml?: string }} opts
 */
export async function downloadContractPdf(opts) {
  const filename = opts.filename || 'contrat-medlex.pdf';
  let captureRoot = null;
  let host = null;

  if (opts.sourceElement) {
    captureRoot = buildRootFromElement(opts.sourceElement);
  } else if (opts.bodyHtml) {
    captureRoot = buildRootFromHtml(opts.title || '', opts.subtitle || '', opts.bodyHtml);
  } else {
    throw new Error('Aucun contenu à exporter en PDF.');
  }

  host = createOffscreenHost();
  host.appendChild(captureRoot);

  try {
    await loadHtml2Pdf();
    await waitForFonts();
    await new Promise(function (r) {
      requestAnimationFrame(function () {
        requestAnimationFrame(r);
      });
    });

    preparePdfPagination(captureRoot);

    if (typeof window.html2pdf !== 'function') {
      throw new Error('html2pdf indisponible');
    }

    const blob = await renderPdfBlob(captureRoot, filename);
    if (!blob) {
      throw new Error('Génération du PDF vide');
    }
    triggerBlobDownload(blob, filename);
  } finally {
    if (host && host.parentNode) {
      host.parentNode.removeChild(host);
    }
  }
}
