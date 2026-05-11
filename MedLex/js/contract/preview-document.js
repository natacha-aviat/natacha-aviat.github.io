/**
 * Document HTML d’aperçu (boutons Modifier / Imprimer, script html2pdf).
 */

import { PDF_FILENAME, STORAGE_KEY_PENDING_RESTORE } from './constants.js';
import { escapeHtml, jsonLiteralForEmbeddedParse } from './utils.js';
import { collectQuestionnaireSnapshot } from './snapshot.js';
import { buildContractRenderedHtml } from './render-html.js';

function getHtml2PdfScriptUrl() {
  if (typeof window !== 'undefined' && window.location && window.location.href) {
    try {
      return new URL('html2pdf.bundle.min.js', window.location.href).href;
    } catch {
      /* ignore */
    }
  }
  return './html2pdf.bundle.min.js';
}

/**
 * @param {Record<string, unknown>} [html2canvasExtra] fusionné dans html2canvas (ex. onclone).
 */
export function html2PdfOptions(html2canvasExtra) {
  return {
    margin: [12, 12, 12, 12],
    filename: PDF_FILENAME,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: Object.assign(
      {
        scale: 2,
        useCORS: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
      },
      html2canvasExtra || {}
    ),
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };
}

/**
 * @param {string} bodyText
 * @param {Record<string, string|boolean>} answers
 * @param {{ autoDownloadPdf?: boolean; formSnapshot?: object }} [opts]
 */
export function buildHtmlPreviewDocument(bodyText, answers, opts) {
  const o = opts || {};
  const autoPdf = Boolean(o.autoDownloadPdf);
  const snap =
    o.formSnapshot != null && typeof o.formSnapshot === 'object'
      ? o.formSnapshot
      : collectQuestionnaireSnapshot();
  const rendered = buildContractRenderedHtml(bodyText, answers);
  const h2p = getHtml2PdfScriptUrl();
  const pdfOptsLiteral = jsonLiteralForEmbeddedParse(html2PdfOptions());
  const snapLiteral = jsonLiteralForEmbeddedParse(snap);
  const statusHtml = autoPdf
    ? '<p id="medlex-pdf-auto-status" class="medlex-no-print" style="margin:0 0 12px;font-size:14px;color:#245fda;font-weight:600">Le contrat s’affiche ci-dessous. Le PDF va se télécharger automatiquement…</p>'
    : '';
  const qPageUrlStr =
    typeof window !== 'undefined' && window.location && window.location.href
      ? String(window.location.href).split('#')[0]
      : '';
  const questionnairePageUrlJson = JSON.stringify(qPageUrlStr);

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Aperçu contrat de remplacement</title>
  <style>
    body { margin: 0; background: #f3f6fc; font-family: Inter, Segoe UI, Roboto, Arial, sans-serif; color: #111; }
    main {
      max-width: 900px;
      margin: 24px auto;
      padding: 24px;
      background: #fff;
      border: 1px solid #d8e2f4;
      border-radius: 12px;
    }
    .medlex-btn {
      padding: 10px 18px;
      font: inherit;
      cursor: pointer;
      border: 1px solid #1a5fb4;
      background: #1a5fb4;
      color: #fff;
      border-radius: 8px;
      margin: 8px 0;
    }
    .medlex-btn-secondary {
      border-color: #5b6780;
      background: #fff;
      color: #245fda;
    }
    .medlex-btn-secondary:hover { filter: none; background: #eef4ff; }
    .medlex-btn:hover { filter: brightness(1.05); }
    @media print {
      .medlex-no-print { display: none !important; }
      body { background: #fff; }
      main { box-shadow: none; border: none; margin: 0; max-width: none; padding: 0; border-radius: 0; }
    }
  </style>
</head>
<body>
  <main>
    <div class="medlex-no-print" style="margin-bottom: 16px">
      <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:10px">
        <button type="button" class="medlex-btn medlex-btn-secondary" id="medlex-btn-edit-top">Modifier</button>
        <button type="button" class="medlex-btn" id="medlex-btn-pdf-top">Imprimer</button>
      </div>
      ${statusHtml}
      <h1 style="margin: 0 0 12px; font-size: 20px">Aperçu du contrat généré</h1>
    </div>
    <div id="medlex-print-root">${rendered}</div>
    <div class="medlex-no-print" style="margin-top: 20px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center">
      <button type="button" class="medlex-btn medlex-btn-secondary" id="medlex-btn-edit-bottom">Modifier</button>
      <button type="button" class="medlex-btn" id="medlex-btn-pdf-bottom">Imprimer</button>
    </div>
    <p id="medlex-modifier-hint" class="medlex-no-print" style="font-size:13px;color:#5b6780;margin-top:12px;line-height:1.45"></p>
  </main>
  <script src="${escapeHtml(h2p)}" async data-medlex-html2pdf="1"></script>
  <script>
(function () {
  var pdfOpts = JSON.parse(${pdfOptsLiteral});
  var autoPdf = ${autoPdf ? 'true' : 'false'};
  var qPageUrl = ${questionnairePageUrlJson};
  var snap = JSON.parse(${snapLiteral});
  function goModifier() {
    var hint = document.getElementById('medlex-modifier-hint');
    var openerWin = window.opener;
    if (openerWin && !openerWin.closed) {
      try {
        openerWin.postMessage({ type: 'medlex-restore-form', payload: snap }, '*');
      } catch (e1) {
        window.alert('Impossible de transmettre les données au questionnaire.');
        return;
      }
      try {
        openerWin.focus();
      } catch (eFocus) {}
      if (hint) {
        hint.textContent =
          'Les réponses ont été réinjectées dans l’onglet du questionnaire. Vous pouvez fermer cet aperçu.';
      }
      return;
    }
    if (qPageUrl) {
      var json = JSON.stringify(snap);
      try {
        sessionStorage.setItem(${JSON.stringify(STORAGE_KEY_PENDING_RESTORE)}, json);
      } catch (e3) {
        try {
          localStorage.setItem(${JSON.stringify(STORAGE_KEY_PENDING_RESTORE)}, json);
        } catch (e4) {
          window.alert(
            'Impossible d’enregistrer les données localement. Autorisez le stockage pour ce site ou désactivez le mode privé restreint.'
          );
          return;
        }
      }
      window.location.href = qPageUrl;
      return;
    }
    window.alert(
      'Ouvrez l’aperçu depuis le questionnaire (même site) pour revenir au formulaire avec vos réponses.'
    );
  }
  function runPdf() {
    var root = document.getElementById('medlex-print-root');
    var st = document.getElementById('medlex-pdf-auto-status');
    if (!root || typeof window.html2pdf !== 'function') {
      window.alert('Génération PDF indisponible. Vérifiez votre connexion ou rechargez la page.');
      return Promise.reject(new Error('html2pdf'));
    }
    try {
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
      if (document.body) document.body.scrollLeft = 0;
    } catch (eScroll) {
      /* ignore */
    }
    if (st) st.textContent = 'Génération du fichier PDF…';
    var chain = window.html2pdf().set(pdfOpts).from(root).save();
    if (chain && typeof chain.then === 'function') {
      return chain.then(function () {
        if (st) st.textContent = 'Téléchargement lancé. Vous pouvez fermer cet onglet ou cliquer à nouveau sur « Imprimer ».';
      }).catch(function (e) {
        if (st) st.textContent = 'Échec de la génération du PDF.';
        window.alert('Impossible de générer le PDF : ' + (e && e.message ? e.message : 'erreur inconnue'));
      });
    }
    return Promise.resolve();
  }
  var et = document.getElementById('medlex-btn-edit-top');
  var eb = document.getElementById('medlex-btn-edit-bottom');
  if (et) et.addEventListener('click', goModifier);
  if (eb) eb.addEventListener('click', goModifier);
  function whenHtml2PdfReady(cb) {
    if (typeof window.html2pdf === 'function') {
      cb();
      return;
    }
    var scripts = document.getElementsByTagName('script');
    var s = null;
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].getAttribute('data-medlex-html2pdf') === '1') {
        s = scripts[i];
        break;
      }
    }
    if (s) {
      s.addEventListener('load', function () {
        cb();
      });
      s.addEventListener('error', function () {
        window.alert(
          'Impossible de charger html2pdf.js. Vérifiez que le fichier html2pdf.bundle.min.js est bien dans le même dossier que le questionnaire.'
        );
      });
      return;
    }
    window.setTimeout(function () {
      whenHtml2PdfReady(cb);
    }, 40);
  }
  function wirePdf() {
    var t = document.getElementById('medlex-btn-pdf-top');
    var b = document.getElementById('medlex-btn-pdf-bottom');
    if (t) t.addEventListener('click', function () { runPdf(); });
    if (b) b.addEventListener('click', function () { runPdf(); });
    if (autoPdf) {
      function scheduleAutoPdf() {
        try {
          window.scrollTo(0, 0);
        } catch (eS) {
          /* ignore */
        }
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () {
            var fonts = document.fonts && document.fonts.ready;
            var go = function () {
              window.setTimeout(function () {
                runPdf();
              }, 80);
            };
            if (fonts && typeof fonts.then === 'function') {
              fonts.then(go).catch(go);
            } else {
              go();
            }
          });
        });
      }
      window.setTimeout(scheduleAutoPdf, 120);
    }
  }
  whenHtml2PdfReady(wirePdf);
})();
  </script>
</body>
</html>`;
}
