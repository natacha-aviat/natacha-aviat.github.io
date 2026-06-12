/**
 * Export PDF direct — texte vectoriel jsPDF, charte Au Clair.
 */

import { html2PdfOptions } from './pdf-options.js';
import {
  PDF_THEME,
  PDF_TYPO,
  registerInterFonts,
  applyInterFontsIfCached,
  isArticleHeading,
} from './pdf-theme.js';

let engineReady = false;

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

function jsPdfAvailable() {
  return Boolean(window.jspdf && window.jspdf.jsPDF);
}

function loadJsPdf() {
  if (jsPdfAvailable()) {
    return Promise.resolve();
  }
  return new Promise(function (resolve, reject) {
    const existing = document.querySelector('script[data-medlex-html2pdf="1"]');
    if (existing) {
      if (jsPdfAvailable()) {
        resolve();
        return;
      }
      existing.addEventListener('load', function () {
        resolve();
      });
      existing.addEventListener('error', function () {
        reject(new Error('Impossible de charger jsPDF'));
      });
      window.setTimeout(function () {
        if (jsPdfAvailable()) {
          resolve();
        }
      }, 0);
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
      reject(new Error('Impossible de charger jsPDF'));
    };
    document.head.appendChild(s);
  });
}

/**
 * Précharge jsPDF et les polices Inter (à appeler au chargement de la page contrat).
 */
export async function preloadPdfEngine() {
  await loadJsPdf();
  if (!jsPdfAvailable()) {
    throw new Error('jsPDF indisponible');
  }
  const pdf = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  await registerInterFonts(pdf);
  engineReady = true;
}

export function isPdfEngineReady() {
  return engineReady && jsPdfAvailable();
}

function buildRootFromHtml(title, subtitle, bodyHtml) {
  const root = document.createElement('div');
  if (title) {
    const h = document.createElement('p');
    h.className = 'ac-contract-doc__title';
    h.textContent = title;
    root.appendChild(h);
  }
  if (subtitle) {
    const sub = document.createElement('p');
    sub.className = 'ac-contract-doc__subtitle';
    sub.textContent = subtitle;
    root.appendChild(sub);
  }
  const body = document.createElement('div');
  body.className = 'ac-contract-doc__body';
  body.innerHTML = bodyHtml;
  root.appendChild(body);
  return root;
}

function collectPdfBlocks(root) {
  const blocks = [];

  const titleEl = root.querySelector('.ac-contract-doc__title, .medlex-pdf-root__title');
  if (titleEl && titleEl.innerText.trim()) {
    blocks.push({ type: 'title', text: titleEl.innerText.trim() });
  }

  const subEl = root.querySelector('.ac-contract-doc__subtitle, .medlex-pdf-root__subtitle');
  if (subEl && subEl.innerText.trim()) {
    blocks.push({ type: 'subtitle', text: subEl.innerText.trim() });
  }

  const body = root.querySelector('.ac-contract-doc__body, .medlex-pdf-root__body');
  if (body) {
    body.childNodes.forEach(function (node) {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      if (node.tagName === 'P') {
        blocks.push({ type: 'paragraph', el: node });
      } else if (node.tagName === 'BR') {
        blocks.push({ type: 'spacer' });
      }
    });
  }

  return blocks;
}

function getWordsFromParagraph(p) {
  const words = [];
  function walk(node, bold) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      text.split(/\s+/).filter(Boolean).forEach(function (part) {
        words.push({ text: part, bold: bold });
      });
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (node.tagName === 'STRONG' || node.tagName === 'B') {
      node.childNodes.forEach(function (child) {
        walk(child, true);
      });
      return;
    }
    node.childNodes.forEach(function (child) {
      walk(child, bold);
    });
  }
  p.childNodes.forEach(function (child) {
    walk(child, false);
  });
  return words;
}

/**
 * @param {HTMLElement} root
 * @param {string} filename
 */
function buildPdfBlob(root, filename) {
  const JsPDF = window.jspdf && window.jspdf.jsPDF;
  if (!JsPDF) {
    throw new Error('jsPDF indisponible');
  }

  const opts = html2PdfOptions({}, filename);
  const margins = opts.margin || [18, 18, 18, 18];
  const marginTop = margins[0];
  const marginRight = margins[1];
  const marginBottom = margins[2];
  const marginLeft = margins[3];

  const pdf = new JsPDF(opts.jsPDF);
  const hasInter = applyInterFontsIfCached(pdf);
  const fontFamily = hasInter ? 'Inter' : 'helvetica';

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const maxWidth = pageWidth - marginLeft - marginRight;

  const ctx = {
    pdf: pdf,
    fontFamily: fontFamily,
    marginLeft: marginLeft,
    marginRight: marginRight,
    marginTop: marginTop,
    marginBottom: marginBottom,
    pageWidth: pageWidth,
    pageHeight: pageHeight,
    maxWidth: maxWidth,
    bodyFontSize: PDF_TYPO.body,
    bodyLineHeight: PDF_TYPO.bodyLineHeight,
    y: marginTop,
  };

  function setFont(style, size) {
    pdf.setFont(fontFamily, style);
    pdf.setFontSize(size);
  }

  function newPageIfNeeded(lineH) {
    if (ctx.y + lineH > pageHeight - marginBottom) {
      pdf.addPage();
      ctx.y = marginTop;
    }
  }

  function drawBrandHeader() {
    const headerY = 12;
    pdf.setFillColor(PDF_THEME.teal[0], PDF_THEME.teal[1], PDF_THEME.teal[2]);
    pdf.circle(marginLeft + 1.4, headerY, 1.1, 'F');
    setFont('bold', PDF_TYPO.brand);
    pdf.setTextColor(PDF_THEME.ink[0], PDF_THEME.ink[1], PDF_THEME.ink[2]);
    pdf.text('Au Clair', marginLeft + 4.5, headerY + 1.1);
    pdf.setDrawColor(PDF_THEME.gray[0], PDF_THEME.gray[1], PDF_THEME.gray[2]);
    pdf.setLineWidth(0.35);
    pdf.line(marginLeft, headerY + 5, pageWidth - marginRight, headerY + 5);
    ctx.y = headerY + 11;
  }

  function measureWord(word, bold, fontSize) {
    setFont(bold ? 'bold' : 'normal', fontSize);
    return pdf.getTextWidth(word);
  }

  function writeWrapped(text, options) {
    const fontSize = options.fontSize || PDF_TYPO.body;
    const style = options.bold ? 'bold' : 'normal';
    const color = options.color || PDF_THEME.muted;
    const align = options.align || 'left';
    const lh = options.lineHeight || PDF_TYPO.bodyLineHeight;

    setFont(style, fontSize);
    pdf.setTextColor(color[0], color[1], color[2]);

    const lines = pdf.splitTextToSize(text, maxWidth);
    for (let i = 0; i < lines.length; i++) {
      newPageIfNeeded(lh);
      const x = align === 'center' ? pageWidth / 2 : marginLeft;
      pdf.text(lines[i], x, ctx.y, { align: align });
      ctx.y += lh;
    }
  }

  function writeRichParagraph(p) {
    const words = getWordsFromParagraph(p);
    if (!words.length) return;

    let line = [];
    let lineWidth = 0;
    const spaceW = measureWord(' ', false, ctx.bodyFontSize);

    function flushLine() {
      if (!line.length) return;
      newPageIfNeeded(ctx.bodyLineHeight);
      let x = marginLeft;
      line.forEach(function (w, idx) {
        setFont(w.bold ? 'bold' : 'normal', ctx.bodyFontSize);
        const c = w.bold ? PDF_THEME.ink : PDF_THEME.muted;
        pdf.setTextColor(c[0], c[1], c[2]);
        const chunk = (idx > 0 ? ' ' : '') + w.text;
        pdf.text(chunk, x, ctx.y);
        x += pdf.getTextWidth(chunk);
      });
      ctx.y += ctx.bodyLineHeight;
      line = [];
      lineWidth = 0;
    }

    words.forEach(function (w) {
      const wW = measureWord(w.text, w.bold, ctx.bodyFontSize);
      const addW = line.length ? spaceW + wW : wW;
      if (line.length && lineWidth + addW > maxWidth) {
        flushLine();
      }
      line.push(w);
      lineWidth += line.length === 1 ? wW : spaceW + wW;
    });
    flushLine();
  }

  drawBrandHeader();

  const blocks = collectPdfBlocks(root);
  blocks.forEach(function (block) {
    if (block.type === 'title') {
      ctx.y += 2;
      writeWrapped(block.text, {
        fontSize: PDF_TYPO.title,
        bold: true,
        color: PDF_THEME.ink,
        align: 'center',
        lineHeight: PDF_TYPO.titleLineHeight,
      });
      ctx.y += 1.5;
    } else if (block.type === 'subtitle') {
      writeWrapped(block.text, {
        fontSize: PDF_TYPO.subtitle,
        color: PDF_THEME.muted,
        align: 'center',
        lineHeight: PDF_TYPO.subtitleLineHeight,
      });
      ctx.y += 5;
    } else if (block.type === 'spacer') {
      ctx.y += PDF_TYPO.blockGap;
    } else if (block.type === 'paragraph') {
      const plain = block.el.innerText.trim();
      if (!plain) {
        ctx.y += PDF_TYPO.blockGap;
        return;
      }

      if (isArticleHeading(plain)) {
        ctx.y += 3;
        writeWrapped(plain, {
          fontSize: PDF_TYPO.article,
          bold: true,
          color: PDF_THEME.ink,
          lineHeight: PDF_TYPO.articleLineHeight,
        });
        ctx.y += 2;
        return;
      }

      const hasBold = block.el.querySelector('strong, b');
      if (hasBold) {
        writeRichParagraph(block.el);
      } else {
        writeWrapped(plain, {
          fontSize: PDF_TYPO.body,
          color: PDF_THEME.muted,
          lineHeight: PDF_TYPO.bodyLineHeight,
        });
      }
      ctx.y += 1.2;
    }
  });

  return pdf.output('blob');
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
  }, 1000);
}

function resolveRoot(opts) {
  if (opts.sourceElement) {
    return { root: opts.sourceElement, tempHost: null };
  }
  if (opts.bodyHtml) {
    const root = buildRootFromHtml(opts.title || '', opts.subtitle || '', opts.bodyHtml);
    const tempHost = document.createElement('div');
    tempHost.setAttribute('aria-hidden', 'true');
    tempHost.style.cssText = 'position:fixed;left:-9999px;top:0;visibility:hidden;';
    tempHost.appendChild(root);
    document.body.appendChild(tempHost);
    return { root: root, tempHost: tempHost };
  }
  throw new Error('Aucun contenu à exporter en PDF.');
}

function cleanupHost(tempHost) {
  if (tempHost && tempHost.parentNode) {
    tempHost.parentNode.removeChild(tempHost);
  }
}

/**
 * Téléchargement synchrone — à appeler directement dans le gestionnaire de clic.
 * @param {{ filename: string; sourceElement?: HTMLElement; title?: string; subtitle?: string; bodyHtml?: string }} opts
 */
export function downloadContractPdfNow(opts) {
  if (!jsPdfAvailable()) {
    throw new Error('Le moteur PDF n’est pas prêt. Réessayez dans quelques secondes.');
  }

  const filename = opts.filename || 'contrat-medlex.pdf';
  const resolved = resolveRoot(opts);

  try {
    const blob = buildPdfBlob(resolved.root, filename);
    if (!blob) {
      throw new Error('Génération du PDF vide');
    }
    triggerBlobDownload(blob, filename);
  } finally {
    cleanupHost(resolved.tempHost);
  }
}

/**
 * @param {{ filename: string; sourceElement?: HTMLElement; title?: string; subtitle?: string; bodyHtml?: string }} opts
 */
export async function downloadContractPdf(opts) {
  if (!engineReady) {
    await preloadPdfEngine();
  }
  downloadContractPdfNow(opts);
}
