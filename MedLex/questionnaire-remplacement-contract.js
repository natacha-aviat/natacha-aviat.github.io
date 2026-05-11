/**
 * Génère le texte du contrat à partir du template Word exporté (templates/contrat-remplacement-template.txt)
 * et des réponses du formulaire questionnaire-remplacement.html.
 * PDF : même page HTML que l’aperçu ; html2pdf s’exécute dans cette fenêtre (téléchargement auto ou boutons « Imprimer »).
 */
(function () {
  const TEMPLATE_URL = './templates/contrat-remplacement-template.txt';

  /** URL absolue du bundle html2pdf (même origine que le questionnaire → pas d’appel cross-site via document.write). */
  function getHtml2PdfScriptUrl() {
    if (typeof window !== 'undefined' && window.location && window.location.href) {
      try {
        return new URL('html2pdf.bundle.min.js', window.location.href).href;
      } catch (e) {
        /* ignore */
      }
    }
    return './html2pdf.bundle.min.js';
  }

  function isFileProtocol() {
    return typeof window !== 'undefined' && window.location.protocol === 'file:';
  }

  /**
   * Options html2pdf : rendu du HTML du contrat (sans bandeau d’aperçu).
   * @param {Record<string, unknown>} [html2canvasExtra] fusionné dans html2canvas (ex. onclone).
   */
  function html2PdfOptions(html2canvasExtra) {
    return {
      margin: [12, 12, 12, 12],
      filename: 'contrat-de-remplacement-medlex.pdf',
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: Object.assign(
        {
          scale: 2,
          useCORS: true,
          logging: false,
          /** Évite pages blanches en tête si la fenêtre a défilé (bug html2canvas / html2pdf). */
          scrollX: 0,
          scrollY: 0,
        },
        html2canvasExtra || {}
      ),
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };
  }

  /**
   * Chaîne JavaScript sûre pour `JSON.parse(…)` dans un `<script>` HTML
   * (évite coupure sur `</script>`, U+2028/U+2029 dans du texte utilisateur, etc.).
   */
  function jsonLiteralForEmbeddedParse(obj) {
    return JSON.stringify(JSON.stringify(obj));
  }

  /**
   * Capture l’état du formulaire questionnaire (pour reprise depuis l’aperçu).
   * @returns {{ version: number, fields: Record<string, string|boolean>, radios: Record<string, string> }}
   */
  function collectQuestionnaireSnapshot() {
    const form = document.getElementById('questionnaire-form');
    if (!form) {
      return { version: 1, fields: {}, radios: {} };
    }
    const snap = { version: 1, fields: {}, radios: {} };
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      const t = el.type;
      if (t === 'radio') {
        if (el.checked) snap.radios[el.name] = el.value;
        return;
      }
      if (t === 'checkbox') {
        if (el.id) snap.fields[el.id] = el.checked;
        return;
      }
      if (t === 'submit' || t === 'button' || t === 'file') return;
      if (el.id) snap.fields[el.id] = el.value;
    });
    return snap;
  }

  /**
   * Réinjecte un snapshot dans le formulaire et déclenche les mises à jour d’affichage.
   * @param {{ version?: number, fields?: Record<string, string|boolean>, radios?: Record<string, string> }} snap
   */
  function applyQuestionnaireSnapshot(snap) {
    if (!snap || snap.version !== 1) return;
    const form = document.getElementById('questionnaire-form');
    if (!form) return;

    if (snap.fields) {
      Object.keys(snap.fields).forEach(function (id) {
        const el = document.getElementById(id);
        if (!el) return;
        const v = snap.fields[id];
        if (el.type === 'checkbox') {
          el.checked = Boolean(v);
        } else {
          el.value = v != null ? String(v) : '';
        }
      });
    }

    if (snap.radios) {
      Object.keys(snap.radios).forEach(function (name) {
        const val = snap.radios[name];
        form.querySelectorAll('input[type="radio"][name="' + name + '"]').forEach(function (rad) {
          rad.checked = rad.value === val;
        });
      });
    }

    form.querySelectorAll('select').forEach(function (el) {
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    form.querySelectorAll('input[type="radio"]:checked').forEach(function (el) {
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function collectHighlightValues(a) {
    const candidates = [
      a.rCiv,
      a.rNom,
      a.rOrdinal,
      a.rRpps,
      a.rAdresse,
      a.rpCiv,
      a.rpNom,
      a.rpOrdinal,
      a.rpRpps,
      a.rpStatut,
      a.rpAdresse,
      a.motif,
      a.duAu2_1,
      a.reponse2_2,
      a.facturationLabel,
      a.redevance,
      a.tauxRedevance,
      a.modeReglement,
      a.tauxTiersPayant,
      a.preavisAccord,
      a.preavisManquement,
      a.question11Titre,
      a.question11Corps,
      a.nonconcurrence,
      a.signatureDate,
      a.signatureLieu,
      a.signatureLigneRemplace,
      a.signatureLigneRemplacant,
    ];

    const values = [];
    for (const v of candidates) {
      const s = String(v || '').trim();
      if (!s || s === 'Non renseigné') continue;
      // Évite de mettre en gras tous les nombres génériques (ex: 0)
      // qui apparaissent souvent dans le texte et nuisent à la lisibilité.
      if (/^\d+(?:[.,]\d+)?$/.test(s)) continue;
      if (!values.includes(s)) values.push(s);
    }
    values.sort((x, y) => y.length - x.length);
    return values;
  }

  function highlightAnswerValuesInLine(line, values) {
    let out = escapeHtml(line);
    for (const v of values) {
      const esc = escapeHtml(v);
      out = out.replace(new RegExp(escapeRegExp(esc), 'g'), `<strong>${esc}</strong>`);
    }
    return out;
  }

  /**
   * Corps HTML du contrat (paragraphes + mise en évidence), pour aperçu / PDF.
   * @param {string} bodyText
   * @param {Record<string, string|boolean>} answers
   */
  function buildContractRenderedHtml(bodyText, answers) {
    const highlightValues = collectHighlightValues(answers);
    return bodyText
      .split('\n')
      .map((line) =>
        line.trim() === ''
          ? '<br />'
          : `<p style="margin:0 0 8px;line-height:1.5">${highlightAnswerValuesInLine(
              line,
              highlightValues
            )}</p>`
      )
      .join('');
  }

  /**
   * @param {string} bodyText
   * @param {Record<string, string|boolean>} answers
   * @param {{
   *   autoDownloadPdf?: boolean;
   *   formSnapshot?: { version?: number; fields?: Record<string, string|boolean>; radios?: Record<string, string> };
   * }} [opts]
   */
  function buildHtmlPreviewDocument(bodyText, answers, opts) {
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
    var o = window.opener;
    if (o && !o.closed) {
      try {
        /** Cible « * » : l’onglet parent filtre déjà (origine + medlexLastPreviewWindow). */
        o.postMessage({ type: 'medlex-restore-form', payload: snap }, '*');
      } catch (e1) {
        window.alert('Impossible de transmettre les données au questionnaire.');
        return;
      }
      try {
        o.focus();
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
        sessionStorage.setItem('medlex-pending-restore-json', json);
      } catch (e3) {
        try {
          localStorage.setItem('medlex-pending-restore-json', json);
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

  function $(id) {
    return document.getElementById(id);
  }

  function val(id, fallback = '') {
    const el = $(id);
    if (!el) return fallback;
    const v = el.value;
    return v != null && String(v).trim() !== '' ? String(v).trim() : fallback;
  }

  function checkedValue(name, fallback = '') {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : fallback;
  }

  function formatDate(iso) {
    if (!iso) return 'Non renseigné';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('fr-FR');
  }

  /** Date du jour (signature), forme longue en français. */
  function formatDateDuJour() {
    return new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  /** Monsieur / Madame → M. / Mme pour le bloc signature. */
  function abregeCivilite(civilite) {
    const c = String(civilite || '').trim();
    if (c === 'Monsieur') return 'M.';
    if (c === 'Madame') return 'Mme';
    return 'M./Mme';
  }

  /**
   * Tente d’extraire la ville depuis une adresse (ligne avec code postal français en priorité).
   * @param {string} adresse
   */
  function extraitVilleDepuisAdresse(adresse) {
    const s = String(adresse || '').trim();
    if (!s) return 'Non renseigné';
    const lines = s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const lastLine = lines.length ? lines[lines.length - 1] : s;
    const cpVille = lastLine.match(/\b(\d{5})\s+(.+)$/);
    if (cpVille) return cpVille[2].trim();
    const parts = lastLine.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const cand = parts[parts.length - 1];
      const m2 = cand.match(/^\d{5}\s+(.+)$/);
      if (m2) return m2[1].trim();
      return cand;
    }
    return lastLine;
  }

  function motifTexte() {
    const m = $('motif');
    if (!m || m.value === 'autre') return val('motif-autre-texte', 'Non renseigné');
    return m.value || 'Non renseigné';
  }

  function rpEstCabinetInstalle() {
    const s = $('rp-statut');
    return s && s.selectedIndex === 0;
  }

  /**
   * Article 2 : une seule variante selon le type (continu = plage de dates ;
   * discontinu / planning = texte « jours / périodes » uniquement).
   * @param {string} text
   * @param {Record<string, string|boolean>} a
   */
  function reshapeArticle2Duration(text, a) {
    const tr = a.typeRemplacement;
    if (tr !== 'continue' && tr !== 'discontinu' && tr !== 'planning') return text;

    const art2 = 'Article 2 – DURÉE';
    const iArt = text.indexOf(art2);
    if (iArt === -1) return text;

    const header = 'Le présent contrat est conclu :';
    const iHeader = text.indexOf(header, iArt);
    if (iHeader === -1) return text;

    const suite = 'La durée du présent contrat';
    const iSuite = text.indexOf(suite, iHeader);
    if (iSuite === -1) return text;

    const slice = text.slice(iHeader, iSuite);
    if (!slice.includes('Du AU RÉPONSE 2.1')) return text;

    let newBlock;
    if (tr === 'continue') {
      newBlock = `${header}\n\t•\tDu AU RÉPONSE 2.1\n`;
    } else {
      newBlock = `${header}\n\t•\tRÉPONSE 2.2\n`;
    }
    return text.slice(0, iHeader) + newBlock + text.slice(iSuite);
  }

  /** @returns {Record<string, string|boolean>} */
  function collectAnswers() {
    const typeR = $('type-remplacement')?.value || '';

    let duAu2_1;
    let reponse2_2;
    if (typeR === 'continue') {
      duAu2_1 = `Du ${formatDate($('date-debut')?.value)} au ${formatDate($('date-fin')?.value)}`;
      reponse2_2 = '';
    } else if (typeR === 'discontinu' || typeR === 'planning') {
      duAu2_1 = '';
      reponse2_2 = val('periodes-discontinues', 'Non renseigné');
    } else {
      duAu2_1 =
        'Non applicable (remplacement non conclu sur une période continue déterminée)';
      reponse2_2 = val('periodes-discontinues', 'Non renseigné');
    }

    const lieu = $('lieu')?.value || 'cabinet-remplace';
    const adresseLieu = val('adresse-lieu');
    const rAdr = val('r-adresse');
    const rpAdr = val('rp-adresse');

    const facturation = $('facturation')?.value || 'directe';
    const redevance = $('redevance')?.value || 'Non';
    const tauxRedevance = val('taux-redevance', '0');
    const modeReglement = val('mode-reglement', 'Virement bancaire');
    const tauxTiersPayant = val('taux-tiers-payant', '0');

    const modeExercice = $('mode-exercice')?.value || 'seul';

    const annexesOui = checkedValue('annexes', 'non') === 'oui';
    const annexesDetail = val('annexes-texte');
    let question11Titre;
    let question11Corps;
    if (annexesOui) {
      question11Titre = 'Oui.';
      question11Corps =
        annexesDetail || 'Voir liste détaillée aux présentes annexes.';
    } else {
      question11Titre = 'Non.';
      question11Corps = annexesDetail
        ? annexesDetail
        : 'Aucune annexe complémentaire n’est prévue outre les pièces habituelles (ordre, assurance, etc.).';
    }

    const rawAdresseLieu = val('adresse-lieu');
    const rawRAdresse = val('r-adresse');
    const adressePourVille = rawAdresseLieu || rawRAdresse;
    const rCivilSig = val('r-civilite', '');
    const rpCivilSig = val('rp-civilite', '');
    const rNomSig = val('r-nom', 'Non renseigné');
    const rpNomSig = val('rp-nom', 'Non renseigné');

    return {
      typeRemplacement: typeR,
      rCiv: val('r-civilite', 'M./Mme'),
      rNom: val('r-nom', 'Non renseigné'),
      rOrdinal: val('r-ordinal', 'Non renseigné'),
      rRpps: val('r-rpps', 'Non renseigné'),
      rAdresse: rAdr || 'Non renseigné',
      rpCiv: val('rp-civilite', 'M./Mme'),
      rpNom: val('rp-nom', 'Non renseigné'),
      rpOrdinal: val('rp-ordinal', 'Non renseigné'),
      rpRpps: val('rp-rpps', 'Non renseigné'),
      rpStatut: $('rp-statut')?.selectedOptions[0]?.textContent?.trim() || 'Non renseigné',
      rpAdresse: rpAdr || 'Non renseigné',
      motif: motifTexte(),
      duAu2_1: duAu2_1,
      reponse2_2: reponse2_2,
      lieu,
      adresseLieu: adresseLieu || 'Non renseigné',
      facturation,
      facturationLabel:
        $('facturation')?.selectedOptions[0]?.textContent?.trim() || 'Non renseigné',
      redevance,
      redevanceOui: redevance === 'Oui',
      tauxRedevance,
      modeReglement,
      tauxTiersPayant,
      preavisAccord: val('preavis-accord', '0'),
      preavisManquement: val('preavis-manquement', '0'),
      nonconcurrence: checkedValue('nonconcurrence', 'non'),
      modeExercice,
      question11Titre,
      question11Corps,
      signatureDate: formatDateDuJour(),
      signatureLieu: extraitVilleDepuisAdresse(adressePourVille),
      signatureLigneRemplace: `${abregeCivilite(rCivilSig)} ${rNomSig}`.trim(),
      signatureLigneRemplacant: `${abregeCivilite(rpCivilSig)} ${rpNomSig}`.trim(),
      rpEstCabinetInstalle: rpEstCabinetInstalle(),
    };
  }

  /**
   * @param {string} raw
   * @param {Record<string, string|boolean>} a
   */
  function applyConditionals(raw, a) {
    let text = raw;

    if (a.modeExercice === 'seul') {
      text = text.replace(/\n\[OPTION EN FONCTION DE LA QUESTION 3\.6\] :[^\n]*\n/, '\n');
    } else {
      text = text.replace('[OPTION EN FONCTION DE LA QUESTION 3.6] : ', '');
    }

    if (a.rpEstCabinetInstalle) {
      text = text.replace(/^Option 2\u00a0:[^\n]*\n/m, '');
    } else {
      text = text.replace(/^Option 1\u00a0:[^\n]*\n/m, '');
    }

    if (a.lieu === 'cabinet-remplace') {
      text = text.replace(
        /\nOU OPTION 2[\u00a0\s]+RÉPONSE 6\.2[\s\S]*?(?=\nArticle 4 – OBLIGATIONS DES PARTIES)/u,
        ''
      );
    } else {
      text = text.replace(
        /OPTION 1\u00a0RÉPONSE 6\.1[\s\S]*?\nOU OPTION 2[\u00a0\s]+(?=RÉPONSE 6\.2)/u,
        ''
      );
    }

    const a5 = 'Article 5 – HONORAIRES';
    const a6 = 'Article 6 – OBLIGATIONS FISCALES ET SOCIALES';

    if (a.facturation === 'directe') {
      text = text.replace(
        new RegExp(`\\nOU Option 2[\u00a0\\s]*QUESTION 8\\.1[\u00a0\\s]*:[^\n]*\\n[\\s\\S]*?(?=\\n${escapeRegExp(a6)})`, 'u'),
        ''
      );
    } else {
      text = text.replace(
        new RegExp(`${escapeRegExp(a5)}\\nOption 1[\u00a0\\s]*QUESTION 8\\.1[\u00a0\\s]*\\([^\\)]*\\)\\n[\\s\\S]*?(?=\\nOU Option 2)`, 'u'),
        `${a5}\n`
      );
      text = text.replace(/\nOU Option 2[\u00a0\s]*QUESTION 8\.1[\u00a0\s]*:[^\n]*\n/u, '\n');
    }

    if (a.nonconcurrence !== 'oui') {
      text = text.replace(
        /OPTION si contrat supérieure à 3 mois[^\n]+\n/,
        ''
      );
    }

    return text;
  }

  /**
   * @param {string} text
   * @param {Record<string, string|boolean>} a
   */
  function applyReplacements(text, a) {
    const pairs = [
      ['QUESTION 8.option 1-2.a', a.redevanceOui ? 'oui' : 'non'],
      ['QUESTION 8.option 2-2-b', a.tauxRedevance],
      ['QUESTION 8.option 2-4', a.tauxTiersPayant],
      ['QUESTION 8.option 2-3', a.modeReglement],
      ['QUESTION 8.option 1-2.b', a.tauxRedevance],
      ['QUESTION 8.option 1-3', a.modeReglement],
      ['QUESTION 8.1', a.facturationLabel],
      ['QUESTION 9.2', a.preavisManquement],
      ['QUESTION 9.1', a.preavisAccord],
      ['QUESTION 11 TITRE', a.question11Titre],
      ['QUESTION 11 CORPS', a.question11Corps],
      ['RÉPONSES 3.1 ET 3.2', `${a.rCiv} ${a.rNom}`],
      ['RÉPONSES 5.1 ET 5.2', `${a.rpCiv} ${a.rpNom}`],
      ['Du AU RÉPONSE 2.1', a.duAu2_1],
      ['RÉPONSE 2.2', a.reponse2_2],
      ['RÉPONSE 6.2 «\u00a0dans son propre cabinet\u00a0»', '« dans son propre cabinet »'],
      ['RÉPONSE 6.1 «\u00a0dans le cabinet du remplacé\u00a0»', '« dans le cabinet du Remplacé »'],
      ['RÉPONSE 3.3', a.rOrdinal],
      ['RÉPONSE 3.4', a.rRpps],
      ['RÉPONSE 3.5', a.rAdresse],
      ['RÉPONSE 5.3', a.rpOrdinal],
      ['RÉPONSE 5.4', a.rpRpps],
      ['RÉPONSE 5.5', a.rpStatut],
      ['RÉPONSE 5.6', a.rpAdresse],
      ['RÉPONSE 4', a.motif],
      ['RÉPONSE SIGNATURE LIGNE REMPLAÇANT', a.signatureLigneRemplacant],
      ['RÉPONSE SIGNATURE LIGNE REMPLACÉ', a.signatureLigneRemplace],
      ['RÉPONSE SIGNATURE DATE', a.signatureDate],
      ['RÉPONSE SIGNATURE LIEU', a.signatureLieu],
    ];

    let out = text;
    for (const [k, v] of pairs) {
      const esc = escapeRegExp(k);
      out = out.replace(new RegExp(esc, 'g'), v);
    }

    if (a.redevanceOui) {
      out = out.replace(
        /S\u2019il y a une redevance oui\u00a0:/gu,
        'S\u2019il y a une redevance :'
      );
    }
    return out;
  }

  /**
   * @param {string} text
   * @param {Record<string, string|boolean>} a
   */
  function stripRedevanceIfNone(text, a) {
    if (a.redevanceOui) return text;
    let out = text;

    out = out.replace(
      /S\u2019il y a une redevance non\u00a0: Une redevance de[\s\S]*?ne s\u2019applique pas aux indemnit\u00e9s kilom\u00e9triques\.\n/u,
      ''
    );
    out = out.replace(
      /S\u2019il y a une redevance\u00a0: La somme vis[\s\S]*?indemnit\u00e9s kilom\u00e9triques\nCette redevance correspond exclusivement[\s\S]*?logiciel\.\n/u,
      ''
    );
    return out;
  }

  async function loadTemplate() {
    const embedded =
      typeof window.__MEDLEX_CONTRACT_TEMPLATE__ === 'string'
        ? window.__MEDLEX_CONTRACT_TEMPLATE__
        : '';
    if (embedded.length > 500) {
      return embedded;
    }
    if (isFileProtocol()) {
      throw new Error(
        'Modèle embarqué manquant (fichier medlex-contract-template-embedded.js). Rechargez la page ou ouvrez le site via GitHub Pages.'
      );
    }
    const res = await fetch(TEMPLATE_URL, { cache: 'no-store' });
    if (!res.ok) {
      if (embedded.length > 0) return embedded;
      throw new Error(`Template introuvable (${res.status})`);
    }
    return res.text();
  }

  /**
   * @param {Record<string, string|boolean>} a
   */
  function buildContractText(templateRaw, a) {
    let text = applyConditionals(templateRaw, a);
    text = reshapeArticle2Duration(text, a);
    text = applyReplacements(text, a);
    text = stripRedevanceIfNone(text, a);
    return text;
  }

  async function downloadPdf() {
    const multi = $('multi-remplacements')?.value;
    if (multi === 'plus') {
      alert(
        'Le Remplaçant ne peut pas remplacer plus de deux infirmiers concomitamment. Corrigez la section 5 avant de générer le PDF.'
      );
      return;
    }

    const btn = $('download-pdf');
    const prev = btn?.textContent;
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Ouverture…';
    }

    try {
      const templateRaw = await loadTemplate();
      const answers = collectAnswers();
      const bodyText = buildContractText(templateRaw, answers);
      const win = window.open('', '_blank');
      if (!win) {
        alert(
          'Impossible d’ouvrir une nouvelle fenêtre. Autorisez les fenêtres pop-up pour ce site, puis réessayez « Télécharger le projet PDF ».'
        );
        return;
      }
      window.medlexLastPreviewWindow = win;
      win.document.open();
      const snap = collectQuestionnaireSnapshot();
      win.document.write(
        buildHtmlPreviewDocument(bodyText, answers, {
          autoDownloadPdf: true,
          formSnapshot: snap,
        })
      );
      win.document.close();
    } catch (e) {
      console.error(e);
      alert(
        e instanceof Error
          ? `Impossible de générer le PDF : ${e.message}`
          : 'Impossible de générer le PDF.'
      );
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = prev || 'Télécharger le projet PDF';
      }
    }
  }

  async function openHtmlPreview(previewWindow) {
    const win = previewWindow || window.open('', '_blank');
    if (!win) {
      throw new Error("Impossible d'ouvrir l'aperçu (fenêtre bloquée par le navigateur).");
    }
    window.medlexLastPreviewWindow = win;
    try {
      const templateRaw = await loadTemplate();
      const answers = collectAnswers();
      const bodyText = buildContractText(templateRaw, answers);
      const snap = collectQuestionnaireSnapshot();
      win.document.open();
      win.document.write(buildHtmlPreviewDocument(bodyText, answers, { formSnapshot: snap }));
      win.document.close();
    } catch (e) {
      try {
        win.close();
      } catch (_) {}
      throw e;
    }
  }

  window.MedLexContract = {
    openHtmlPreview,
    downloadPdf,
    loadTemplate,
    collectAnswers,
    buildContractText,
    buildContractRenderedHtml,
    buildHtmlPreviewDocument,
    collectQuestionnaireSnapshot,
    applyQuestionnaireSnapshot,
  };
})();
