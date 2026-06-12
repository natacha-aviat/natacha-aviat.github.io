/**
 * Export PDF direct (sans ouvrir un nouvel onglet) — style Au Clair.
 */

import { html2PdfOptions } from './preview-document.js';

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
`;

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
    s.async = true;
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

    if (typeof window.html2pdf !== 'function') {
      throw new Error('html2pdf indisponible');
    }

    const chain = window.html2pdf().set(html2PdfOptions({}, filename)).from(captureRoot).save();
    if (chain && typeof chain.then === 'function') {
      await chain;
    }
  } finally {
    if (host && host.parentNode) {
      host.parentNode.removeChild(host);
    }
  }
}
