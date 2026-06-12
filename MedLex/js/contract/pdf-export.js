/**
 * Export PDF direct — texte vectoriel jsPDF (pas de capture html2canvas).
 */

import { html2PdfOptions } from './pdf-options.js';

const COLOR_INK = [22, 49, 77];
const COLOR_MUTED = [95, 107, 122];

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

function loadJsPdf() {
  if (window.jspdf && window.jspdf.jsPDF) {
    return Promise.resolve();
  }
  return new Promise(function (resolve, reject) {
    const existing = document.querySelector('script[data-medlex-html2pdf="1"]');
    if (existing) {
      existing.addEventListener('load', function () {
        resolve();
      });
      existing.addEventListener('error', function () {
        reject(new Error('Impossible de charger jsPDF'));
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
      reject(new Error('Impossible de charger jsPDF'));
    };
    document.head.appendChild(s);
  });
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

/**
 * @param {HTMLElement} root
 * @param {string} filename
 */
function renderPdfAsText(root, filename) {
  const JsPDF = window.jspdf && window.jspdf.jsPDF;
  if (!JsPDF) {
    throw new Error('jsPDF indisponible');
  }

  const opts = html2PdfOptions({}, filename);
  const margins = opts.margin || [15, 15, 15, 15];
  const marginTop = margins[0];
  const marginRight = margins[1];
  const marginBottom = margins[2];
  const marginLeft = margins[3];

  const pdf = new JsPDF(opts.jsPDF);
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const maxWidth = pageWidth - marginLeft - marginRight;

  const bodyLineHeight = 5.4;
  const titleLineHeight = 7;
  const subtitleLineHeight = 4.8;
  const blockGap = 2.8;

  let y = marginTop;

  function newPageIfNeeded(lineH) {
    if (y + lineH > pageHeight - marginBottom) {
      pdf.addPage();
      y = marginTop;
    }
  }

  function writeWrapped(text, options) {
    const fontSize = options.fontSize || 11;
    const style = options.bold ? 'bold' : 'normal';
    const color = options.color || COLOR_MUTED;
    const align = options.align || 'left';
    const lh = options.lineHeight || bodyLineHeight;

    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', style);
    pdf.setTextColor(color[0], color[1], color[2]);

    const lines = pdf.splitTextToSize(text, maxWidth);
    for (let i = 0; i < lines.length; i++) {
      newPageIfNeeded(lh);
      const x = align === 'center' ? pageWidth / 2 : marginLeft;
      pdf.text(lines[i], x, y, { align: align });
      y += lh;
    }
  }

  const blocks = collectPdfBlocks(root);
  blocks.forEach(function (block) {
    if (block.type === 'title') {
      y += 2;
      writeWrapped(block.text, {
        fontSize: 14,
        bold: true,
        color: COLOR_INK,
        align: 'center',
        lineHeight: titleLineHeight,
      });
      y += 1.5;
    } else if (block.type === 'subtitle') {
      writeWrapped(block.text, {
        fontSize: 9,
        color: COLOR_MUTED,
        align: 'center',
        lineHeight: subtitleLineHeight,
      });
      y += 5;
    } else if (block.type === 'spacer') {
      y += blockGap;
    } else if (block.type === 'paragraph') {
      const plain = block.el.innerText.trim();
      if (!plain) {
        y += blockGap;
        return;
      }
      writeWrapped(plain, {
        fontSize: 11,
        color: COLOR_MUTED,
        lineHeight: bodyLineHeight,
      });
      y += 1.2;
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
  }, 250);
}

/**
 * @param {{ filename: string; sourceElement?: HTMLElement; title?: string; subtitle?: string; bodyHtml?: string }} opts
 */
export async function downloadContractPdf(opts) {
  const filename = opts.filename || 'contrat-medlex.pdf';
  let root = opts.sourceElement || null;
  let tempHost = null;

  if (!root && opts.bodyHtml) {
    root = buildRootFromHtml(opts.title || '', opts.subtitle || '', opts.bodyHtml);
    tempHost = document.createElement('div');
    tempHost.setAttribute('aria-hidden', 'true');
    tempHost.style.cssText = 'position:fixed;left:-9999px;top:0;visibility:hidden;';
    tempHost.appendChild(root);
    document.body.appendChild(tempHost);
  }

  if (!root) {
    throw new Error('Aucun contenu à exporter en PDF.');
  }

  try {
    await loadJsPdf();
    const blob = renderPdfAsText(root, filename);
    if (!blob) {
      throw new Error('Génération du PDF vide');
    }
    triggerBlobDownload(blob, filename);
  } finally {
    if (tempHost && tempHost.parentNode) {
      tempHost.parentNode.removeChild(tempHost);
    }
  }
}
