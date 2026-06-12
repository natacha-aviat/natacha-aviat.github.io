(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // js/contract/pdf-options.js
  function html2PdfOptions(html2canvasExtra, filename) {
    return {
      margin: [12, 12, 12, 12],
      filename: filename || "contrat-medlex.pdf",
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: Object.assign(
        {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollX: 0,
          scrollY: 0
        },
        html2canvasExtra || {}
      ),
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: {
        mode: ["avoid-all", "css", "legacy"],
        avoid: ".medlex-pdf-visual-line"
      }
    };
  }
  var init_pdf_options = __esm({
    "js/contract/pdf-options.js"() {
    }
  });

  // js/contract/pdf-debug.js
  function pdfLog(message, detail) {
    if (detail !== void 0) {
      console.log(PREFIX, message, detail);
    } else {
      console.log(PREFIX, message);
    }
  }
  function pdfWarn(message, detail) {
    if (detail !== void 0) {
      console.warn(PREFIX, message, detail);
    } else {
      console.warn(PREFIX, message);
    }
  }
  function pdfError(message, detail) {
    if (detail !== void 0) {
      console.error(PREFIX, message, detail);
    } else {
      console.error(PREFIX, message);
    }
  }
  var PREFIX;
  var init_pdf_debug = __esm({
    "js/contract/pdf-debug.js"() {
      PREFIX = "[MedLex PDF]";
    }
  });

  // js/contract/pdf-theme.js
  function isFileProtocol() {
    return typeof window !== "undefined" && window.location && window.location.protocol === "file:";
  }
  function getLocalFontUrl(filename) {
    if (typeof window !== "undefined" && window.location && window.location.href) {
      try {
        const inParcours = /\/parcours\//.test(window.location.pathname);
        const rel = inParcours ? "../fonts/" + filename : "./fonts/" + filename;
        return new URL(rel, window.location.href).href;
      } catch {
      }
    }
    return "./fonts/" + filename;
  }
  function getFontUrls(filename) {
    return [
      getLocalFontUrl(filename),
      "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/" + filename
    ];
  }
  function fetchFontAsBase64(url) {
    return new Promise(function(resolve, reject) {
      const timer = window.setTimeout(function() {
        reject(new Error("D\xE9lai d\xE9pass\xE9 pour la police"));
      }, FONT_TIMEOUT_MS);
      pdfLog("Chargement police\u2026", url);
      fetch(url, { cache: "force-cache" }).then(function(res) {
        if (!res.ok) {
          throw new Error("Police introuvable (" + res.status + ") : " + url);
        }
        return res.arrayBuffer();
      }).then(function(buf) {
        window.clearTimeout(timer);
        pdfLog("Police charg\xE9e", { url, octets: buf.byteLength });
        const bytes = new Uint8Array(buf);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        resolve(btoa(binary));
      }).catch(function(err) {
        window.clearTimeout(timer);
        pdfWarn("\xC9chec chargement police", { url, erreur: err.message || err });
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
    throw lastErr || new Error("Police introuvable : " + filename);
  }
  function applyInterFontsIfCached(pdf) {
    if (!interFontsCache) {
      pdfLog("Inter non en cache \u2192 Helvetica");
      return false;
    }
    pdf.addFileToVFS("Inter-Regular.ttf", interFontsCache.regular);
    pdf.addFileToVFS("Inter-Bold.ttf", interFontsCache.bold);
    pdf.addFont("Inter-Regular.ttf", "Inter", "normal");
    pdf.addFont("Inter-Bold.ttf", "Inter", "bold");
    pdfLog("Police Inter appliqu\xE9e au document");
    return true;
  }
  async function registerInterFonts(pdf) {
    if (isFileProtocol()) {
      pdfLog("Protocole file:// \u2014 police Inter ignor\xE9e (Helvetica). Ouvrez le site via http://localhost pour Inter.");
      return false;
    }
    if (interFontsCache) {
      pdfLog("Inter d\xE9j\xE0 en cache");
      return applyInterFontsIfCached(pdf);
    }
    pdfLog("Chargement Inter (local puis CDN)\u2026");
    try {
      const [regular, bold] = await Promise.all([
        fetchFontWithFallback(FONT_SOURCES.regular),
        fetchFontWithFallback(FONT_SOURCES.bold)
      ]);
      interFontsCache = { regular, bold };
      pdfLog("Inter enregistr\xE9e avec succ\xE8s");
      return applyInterFontsIfCached(pdf);
    } catch (e) {
      pdfWarn("Inter indisponible, repli Helvetica", e);
      return false;
    }
  }
  function isArticleHeading(text) {
    return /^(Article|ARTICLE)\s+\d+/i.test(String(text || "").trim());
  }
  function interFontsReady() {
    return interFontsCache !== null;
  }
  var PDF_THEME, PDF_TYPO, FONT_TIMEOUT_MS, FONT_SOURCES, interFontsCache;
  var init_pdf_theme = __esm({
    "js/contract/pdf-theme.js"() {
      init_pdf_debug();
      PDF_THEME = {
        ink: [22, 49, 77],
        muted: [95, 107, 122],
        teal: [15, 163, 163],
        gray: [232, 237, 241],
        white: [255, 255, 255]
      };
      PDF_TYPO = {
        brand: 11,
        title: 12,
        subtitle: 9,
        body: 10,
        article: 10.5,
        bodyLineHeight: 5.8,
        titleLineHeight: 6.5,
        subtitleLineHeight: 4.8,
        articleLineHeight: 6,
        blockGap: 2.8
      };
      FONT_TIMEOUT_MS = 8e3;
      FONT_SOURCES = {
        regular: "inter-latin-400-normal.ttf",
        bold: "inter-latin-700-normal.ttf"
      };
      interFontsCache = null;
    }
  });

  // js/contract/pdf-export.js
  var pdf_export_exports = {};
  __export(pdf_export_exports, {
    downloadContractPdf: () => downloadContractPdf,
    downloadContractPdfNow: () => downloadContractPdfNow,
    ensurePdfEngineReady: () => ensurePdfEngineReady,
    isPdfEngineReady: () => isPdfEngineReady,
    preloadPdfEngine: () => preloadPdfEngine
  });
  function getJsPdfScriptUrl() {
    if (typeof window !== "undefined" && window.location && window.location.href) {
      try {
        const inParcours = /\/parcours\//.test(window.location.pathname);
        const rel = inParcours ? "../jspdf.umd.min.js" : "./jspdf.umd.min.js";
        return new URL(rel, window.location.href).href;
      } catch {
      }
    }
    return "./jspdf.umd.min.js";
  }
  function waitForJsPdf(maxMs) {
    const deadline = Date.now() + (maxMs || 12e3);
    return new Promise(function(resolve, reject) {
      function tick() {
        if (jsPdfAvailable()) {
          pdfLog("jsPDF d\xE9tect\xE9 apr\xE8s attente");
          resolve();
          return;
        }
        if (Date.now() >= deadline) {
          reject(
            new Error(
              "jsPDF introuvable apr\xE8s " + maxMs + " ms \u2014 v\xE9rifiez que jspdf.umd.min.js est bien charg\xE9."
            )
          );
          return;
        }
        window.setTimeout(tick, 50);
      }
      tick();
    });
  }
  function jsPdfAvailable() {
    return Boolean(window.jspdf && window.jspdf.jsPDF);
  }
  function loadJsPdf() {
    if (jsPdfAvailable()) {
      pdfLog("jsPDF d\xE9j\xE0 disponible", { jspdf: typeof window.jspdf });
      return Promise.resolve();
    }
    const scriptUrl = getJsPdfScriptUrl();
    pdfLog("Chargement jsPDF\u2026", scriptUrl);
    const existing = document.querySelector('script[data-medlex-jspdf="1"]') || document.querySelector('script[data-medlex-html2pdf="1"]');
    if (existing) {
      pdfLog("Balise script jsPDF d\xE9j\xE0 pr\xE9sente", { src: existing.src });
      return waitForJsPdf(12e3);
    }
    return new Promise(function(resolve, reject) {
      const s = document.createElement("script");
      s.src = scriptUrl;
      s.async = false;
      s.setAttribute("data-medlex-jspdf", "1");
      s.onload = function() {
        waitForJsPdf(3e3).then(resolve).catch(reject);
      };
      s.onerror = function() {
        pdfError("Script jsPDF introuvable", s.src);
        reject(new Error("Impossible de charger jsPDF : " + s.src));
      };
      document.head.appendChild(s);
    });
  }
  async function preloadPdfEngine() {
    pdfLog("\u2500\u2500 Pr\xE9chargement moteur PDF \u2500\u2500");
    const t0 = performance.now();
    try {
      await loadJsPdf();
      if (!jsPdfAvailable()) {
        throw new Error("jsPDF indisponible apr\xE8s chargement");
      }
      const pdf = new window.jspdf.jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      let hasInter = false;
      try {
        hasInter = await registerInterFonts(pdf);
      } catch (fontErr) {
        pdfWarn("Polices Inter ignor\xE9es, Helvetica sera utilis\xE9e", fontErr);
      }
      engineReady = true;
      pdfLog("Moteur PDF pr\xEAt", {
        dureeMs: Math.round(performance.now() - t0),
        inter: hasInter,
        engineReady
      });
    } catch (e) {
      engineReady = false;
      pdfError("\xC9chec pr\xE9chargement moteur PDF", e);
      throw e;
    }
  }
  function ensurePdfEngineReady() {
    if (engineReady && jsPdfAvailable()) {
      return Promise.resolve();
    }
    return preloadPdfEngine();
  }
  function isPdfEngineReady() {
    const ready = engineReady && jsPdfAvailable();
    pdfLog("isPdfEngineReady()", {
      ready,
      engineReady,
      jsPdf: jsPdfAvailable(),
      inter: interFontsReady()
    });
    return ready;
  }
  function buildRootFromHtml(title, subtitle, bodyHtml) {
    const root = document.createElement("div");
    if (title) {
      const h = document.createElement("p");
      h.className = "ac-contract-doc__title";
      h.textContent = title;
      root.appendChild(h);
    }
    if (subtitle) {
      const sub = document.createElement("p");
      sub.className = "ac-contract-doc__subtitle";
      sub.textContent = subtitle;
      root.appendChild(sub);
    }
    const body = document.createElement("div");
    body.className = "ac-contract-doc__body";
    body.innerHTML = bodyHtml;
    root.appendChild(body);
    return root;
  }
  function collectPdfBlocks(root) {
    const blocks = [];
    const titleEl = root.querySelector(".ac-contract-doc__title, .medlex-pdf-root__title");
    if (titleEl && titleEl.innerText.trim()) {
      blocks.push({ type: "title", text: titleEl.innerText.trim() });
    }
    const subEl = root.querySelector(".ac-contract-doc__subtitle, .medlex-pdf-root__subtitle");
    if (subEl && subEl.innerText.trim()) {
      blocks.push({ type: "subtitle", text: subEl.innerText.trim() });
    }
    const body = root.querySelector(".ac-contract-doc__body, .medlex-pdf-root__body");
    if (body) {
      body.childNodes.forEach(function(node) {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (node.tagName === "P") {
          blocks.push({ type: "paragraph", el: node });
        } else if (node.tagName === "BR") {
          blocks.push({ type: "spacer" });
        }
      });
    }
    return blocks;
  }
  function getWordsFromParagraph(p) {
    const words = [];
    function walk(node, bold) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        text.split(/\s+/).filter(Boolean).forEach(function(part) {
          words.push({ text: part, bold });
        });
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      if (node.tagName === "STRONG" || node.tagName === "B") {
        node.childNodes.forEach(function(child) {
          walk(child, true);
        });
        return;
      }
      node.childNodes.forEach(function(child) {
        walk(child, bold);
      });
    }
    p.childNodes.forEach(function(child) {
      walk(child, false);
    });
    return words;
  }
  function buildPdfBlob(root, filename) {
    const JsPDF = window.jspdf && window.jspdf.jsPDF;
    if (!JsPDF) {
      throw new Error("jsPDF indisponible");
    }
    const blocks = collectPdfBlocks(root);
    pdfLog("G\xE9n\xE9ration du blob PDF\u2026", {
      filename,
      blocs: blocks.length,
      paragraphes: blocks.filter(function(b) {
        return b.type === "paragraph";
      }).length
    });
    const opts = html2PdfOptions({}, filename);
    const margins = opts.margin || [18, 18, 18, 18];
    const marginTop = margins[0];
    const marginRight = margins[1];
    const marginBottom = margins[2];
    const marginLeft = margins[3];
    const pdf = new JsPDF(opts.jsPDF);
    const hasInter = applyInterFontsIfCached(pdf);
    const fontFamily = hasInter ? "Inter" : "helvetica";
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const maxWidth = pageWidth - marginLeft - marginRight;
    const ctx = {
      pdf,
      fontFamily,
      marginLeft,
      marginRight,
      marginTop,
      marginBottom,
      pageWidth,
      pageHeight,
      maxWidth,
      bodyFontSize: PDF_TYPO.body,
      bodyLineHeight: PDF_TYPO.bodyLineHeight,
      y: marginTop
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
      pdf.circle(marginLeft + 1.4, headerY, 1.1, "F");
      setFont("bold", PDF_TYPO.brand);
      pdf.setTextColor(PDF_THEME.ink[0], PDF_THEME.ink[1], PDF_THEME.ink[2]);
      pdf.text("Au Clair", marginLeft + 4.5, headerY + 1.1);
      pdf.setDrawColor(PDF_THEME.gray[0], PDF_THEME.gray[1], PDF_THEME.gray[2]);
      pdf.setLineWidth(0.35);
      pdf.line(marginLeft, headerY + 5, pageWidth - marginRight, headerY + 5);
      ctx.y = headerY + 11;
    }
    function measureWord(word, bold, fontSize) {
      setFont(bold ? "bold" : "normal", fontSize);
      return pdf.getTextWidth(word);
    }
    function writeWrapped(text, options) {
      const fontSize = options.fontSize || PDF_TYPO.body;
      const style = options.bold ? "bold" : "normal";
      const color = options.color || PDF_THEME.muted;
      const align = options.align || "left";
      const lh = options.lineHeight || PDF_TYPO.bodyLineHeight;
      setFont(style, fontSize);
      pdf.setTextColor(color[0], color[1], color[2]);
      const lines = pdf.splitTextToSize(text, maxWidth);
      for (let i = 0; i < lines.length; i++) {
        newPageIfNeeded(lh);
        const x = align === "center" ? pageWidth / 2 : marginLeft;
        pdf.text(lines[i], x, ctx.y, { align });
        ctx.y += lh;
      }
    }
    function writeRichParagraph(p) {
      const words = getWordsFromParagraph(p);
      if (!words.length) return;
      let line = [];
      let lineWidth = 0;
      const spaceW = measureWord(" ", false, ctx.bodyFontSize);
      function flushLine() {
        if (!line.length) return;
        newPageIfNeeded(ctx.bodyLineHeight);
        let x = marginLeft;
        line.forEach(function(w, idx) {
          setFont(w.bold ? "bold" : "normal", ctx.bodyFontSize);
          const c = w.bold ? PDF_THEME.ink : PDF_THEME.muted;
          pdf.setTextColor(c[0], c[1], c[2]);
          const chunk = (idx > 0 ? " " : "") + w.text;
          pdf.text(chunk, x, ctx.y);
          x += pdf.getTextWidth(chunk);
        });
        ctx.y += ctx.bodyLineHeight;
        line = [];
        lineWidth = 0;
      }
      words.forEach(function(w) {
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
    blocks.forEach(function(block) {
      if (block.type === "title") {
        ctx.y += 2;
        writeWrapped(block.text, {
          fontSize: PDF_TYPO.title,
          bold: true,
          color: PDF_THEME.ink,
          align: "center",
          lineHeight: PDF_TYPO.titleLineHeight
        });
        ctx.y += 1.5;
      } else if (block.type === "subtitle") {
        writeWrapped(block.text, {
          fontSize: PDF_TYPO.subtitle,
          color: PDF_THEME.muted,
          align: "center",
          lineHeight: PDF_TYPO.subtitleLineHeight
        });
        ctx.y += 5;
      } else if (block.type === "spacer") {
        ctx.y += PDF_TYPO.blockGap;
      } else if (block.type === "paragraph") {
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
            lineHeight: PDF_TYPO.articleLineHeight
          });
          ctx.y += 2;
          return;
        }
        const hasBold = block.el.querySelector("strong, b");
        if (hasBold) {
          writeRichParagraph(block.el);
        } else {
          writeWrapped(plain, {
            fontSize: PDF_TYPO.body,
            color: PDF_THEME.muted,
            lineHeight: PDF_TYPO.bodyLineHeight
          });
        }
        ctx.y += 1.2;
      }
    });
    const blob = pdf.output("blob");
    pdfLog("Blob PDF g\xE9n\xE9r\xE9", {
      tailleOctets: blob ? blob.size : 0,
      type: blob ? blob.type : null,
      pages: pdf.internal.getNumberOfPages()
    });
    return blob;
  }
  function triggerBlobDownload(blob, filename) {
    if (!blob || !blob.size) {
      pdfError("Blob vide \u2014 t\xE9l\xE9chargement annul\xE9", { filename });
      throw new Error("Fichier PDF vide");
    }
    pdfLog("D\xE9clenchement t\xE9l\xE9chargement\u2026", {
      filename,
      tailleOctets: blob.size
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    pdfLog("Lien de t\xE9l\xE9chargement cliqu\xE9", { href: url.substring(0, 48) + "\u2026" });
    window.setTimeout(function() {
      URL.revokeObjectURL(url);
      if (a.parentNode) {
        a.parentNode.removeChild(a);
      }
    }, 1e3);
  }
  function resolveRoot(opts) {
    if (opts.sourceElement) {
      return { root: opts.sourceElement, tempHost: null };
    }
    if (opts.bodyHtml) {
      const root = buildRootFromHtml(opts.title || "", opts.subtitle || "", opts.bodyHtml);
      const tempHost = document.createElement("div");
      tempHost.setAttribute("aria-hidden", "true");
      tempHost.style.cssText = "position:fixed;left:-9999px;top:0;visibility:hidden;";
      tempHost.appendChild(root);
      document.body.appendChild(tempHost);
      return { root, tempHost };
    }
    throw new Error("Aucun contenu \xE0 exporter en PDF.");
  }
  function cleanupHost(tempHost) {
    if (tempHost && tempHost.parentNode) {
      tempHost.parentNode.removeChild(tempHost);
    }
  }
  function downloadContractPdfNow(opts) {
    pdfLog("\u2500\u2500 Clic t\xE9l\xE9charger (synchrone) \u2500\u2500");
    pdfLog("\xC9tat moteur", {
      engineReady,
      jsPdf: jsPdfAvailable(),
      inter: interFontsReady()
    });
    if (!jsPdfAvailable()) {
      throw new Error("Le moteur PDF n\u2019est pas pr\xEAt. R\xE9essayez dans quelques secondes.");
    }
    const filename = opts.filename || "contrat-medlex.pdf";
    const resolved = resolveRoot(opts);
    pdfLog("Source contrat", {
      filename,
      elementId: resolved.root.id || "(sans id)",
      classes: resolved.root.className,
      bodyPresent: Boolean(resolved.root.querySelector(".ac-contract-doc__body"))
    });
    const t0 = performance.now();
    try {
      const blob = buildPdfBlob(resolved.root, filename);
      if (!blob) {
        throw new Error("G\xE9n\xE9ration du PDF vide");
      }
      triggerBlobDownload(blob, filename);
      pdfLog("T\xE9l\xE9chargement termin\xE9", { dureeMs: Math.round(performance.now() - t0) });
    } catch (e) {
      pdfError("Erreur downloadContractPdfNow", e);
      throw e;
    } finally {
      cleanupHost(resolved.tempHost);
    }
  }
  async function downloadContractPdf(opts) {
    if (!engineReady) {
      await preloadPdfEngine();
    }
    downloadContractPdfNow(opts);
  }
  var engineReady;
  var init_pdf_export = __esm({
    "js/contract/pdf-export.js"() {
      init_pdf_options();
      init_pdf_theme();
      init_pdf_debug();
      engineReady = false;
    }
  });

  // js/contract/utils.js
  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function jsonLiteralForEmbeddedParse(obj) {
    return JSON.stringify(JSON.stringify(obj));
  }
  function $(id) {
    return document.getElementById(id);
  }
  function val(id, fallback = "") {
    const el = $(id);
    if (!el) return fallback;
    const v = el.value;
    return v != null && String(v).trim() !== "" ? String(v).trim() : fallback;
  }
  function checkedValue(name, fallback = "") {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : fallback;
  }
  function isFileProtocol2() {
    return typeof window !== "undefined" && window.location.protocol === "file:";
  }
  function formatDate(iso) {
    if (!iso) return "Non renseign\xE9";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("fr-FR");
  }
  function formatDateDuJour() {
    return (/* @__PURE__ */ new Date()).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }
  function abregeCivilite(civilite) {
    const c = String(civilite || "").trim();
    if (c === "Monsieur") return "M.";
    if (c === "Madame") return "Mme";
    return "M./Mme";
  }
  function extraitVilleDepuisAdresse(adresse) {
    const s = String(adresse || "").trim();
    if (!s) return "Non renseign\xE9";
    const lines = s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const lastLine = lines.length ? lines[lines.length - 1] : s;
    const cpVille = lastLine.match(/\b(\d{5})\s+(.+)$/);
    if (cpVille) return cpVille[2].trim();
    const parts = lastLine.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const cand = parts[parts.length - 1];
      const m2 = cand.match(/^\d{5}\s+(.+)$/);
      if (m2) return m2[1].trim();
      return cand;
    }
    return lastLine;
  }
  var init_utils = __esm({
    "js/contract/utils.js"() {
    }
  });

  // js/contract/collaboration/snapshot.js
  function collectQuestionnaireSnapshot() {
    if (typeof window.ParcoursCollaborationSnapshot !== "undefined") {
      return window.ParcoursCollaborationSnapshot.collect();
    }
    return { version: 1, parcours: "collaboration", fields: {}, radios: {}, moyens: [] };
  }
  function applyQuestionnaireSnapshot(snap) {
    if (typeof window.ParcoursCollaborationSnapshot !== "undefined") {
      return window.ParcoursCollaborationSnapshot.apply(snap);
    }
    return false;
  }
  var init_snapshot = __esm({
    "js/contract/collaboration/snapshot.js"() {
    }
  });

  // js/contract/collaboration/answers.js
  function hiddenVal(id, fallback = "") {
    const el = $(id);
    if (!el) return fallback;
    return el.value != null && String(el.value).trim() !== "" ? String(el.value).trim() : fallback;
  }
  function blocTemps(nbId, uniteId, periodeId) {
    const nb = val(nbId, "Non renseign\xE9");
    const unite = hiddenVal(uniteId, "journees");
    const periode = hiddenVal(periodeId, "semaine");
    const uniteLabel = unite === "demi-journees" ? "demi-journ\xE9es" : "journ\xE9es";
    const periodeLabel = periode === "mois" ? "mois" : "semaine";
    return `${nb} ${uniteLabel} par ${periodeLabel}`;
  }
  function moyensListe() {
    const checked = document.querySelectorAll('input[name="moyens"]:checked');
    const labels = [];
    checked.forEach(function(el) {
      const lbl = MOYENS_LABELS[el.value];
      if (lbl) labels.push(`- ${lbl}`);
    });
    const autre = val("moyens-autre");
    if (autre) labels.push(`- ${autre}`);
    return labels.length ? labels.join("\n") : "Non renseign\xE9";
  }
  function collectAnswers() {
    const tCiv = val("t-civilite", "M./Mme");
    const cCiv = val("c-civilite", "M./Mme");
    const tNom = val("t-nom", "Non renseign\xE9");
    const cNom = val("c-nom", "Non renseign\xE9");
    const patienteleUnite = hiddenVal("patientele-unite", "journees");
    const collabUnite = hiddenVal("collab-unite", "journees");
    const forfaitMode = hiddenVal("forfait-mode", "tour-role");
    const redevanceType = hiddenVal("redevance-type", "pourcentage");
    const dureeType = hiddenVal("duree-type", "indeterminee");
    const pctT = val("forfait-pct-titulaire", "50");
    const pctC = val("forfait-pct-collab", "50");
    let forfaitPctText = `${pctT} % pour ${tCiv} ${tNom}, ${pctC} % pour ${cCiv} ${cNom}`;
    const lieu = val("lieu-adresse") || val("t-adresse");
    const adressePourVille = lieu || val("t-adresse");
    const dureeDeterminee = dureeType === "determinee";
    return {
      tCiv,
      tNom,
      tOrdinal: val("t-ordinal", "Non renseign\xE9"),
      tRpps: val("t-rpps", "Non renseign\xE9"),
      tAdresse: val("t-adresse", "Non renseign\xE9"),
      cCiv,
      cNom,
      cOrdinal: val("c-ordinal", "Non renseign\xE9"),
      cRpps: val("c-rpps", "Non renseign\xE9"),
      cAdresse: val("c-adresse", "Non renseign\xE9"),
      patienteleUnite,
      patienteleBloc: blocTemps("patientele-nb", "patientele-unite", "patientele-periode"),
      collabUnite,
      collabBloc: blocTemps("collab-nb", "collab-unite", "collab-periode"),
      lieuAdresse: lieu || "Non renseign\xE9",
      moyensListe: moyensListe(),
      forfaitMode,
      forfaitPctText,
      forfaitReverseur: val("forfait-reverseur", "Non renseign\xE9"),
      forfaitDelai: val("forfait-delai", "10"),
      redevanceType,
      redevancePct: val("redevance-pct", "0"),
      redevanceMontant: val("redevance-montant", "0"),
      redevanceJour: val("redevance-jour", "10"),
      dureeType,
      dureeDeterminee,
      dureeIntro: dureeDeterminee ? "dur\xE9e d\xE9termin\xE9e" : "dur\xE9e ind\xE9termin\xE9e",
      dateDebut: formatDate($("date-debut")?.value),
      dateFin: formatDate($("date-fin")?.value),
      signatureDate: formatDateDuJour(),
      signatureLieu: extraitVilleDepuisAdresse(adressePourVille),
      signatureLigneTitulaire: `${abregeCivilite(tCiv)} ${tNom}`.trim(),
      signatureLigneCollaborateur: `${abregeCivilite(cCiv)} ${cNom}`.trim()
    };
  }
  var MOYENS_LABELS;
  var init_answers = __esm({
    "js/contract/collaboration/answers.js"() {
      init_utils();
      MOYENS_LABELS = {
        "salle-attente": "la salle d'attente",
        "salle-soins": "la salle de soins",
        secretariat: "le secr\xE9tariat",
        telephone: "le t\xE9l\xE9phone",
        internet: "l'acc\xE8s \xE0 internet",
        dossiers: "les moyens de conservation des dossiers patients y compris les prescriptions",
        documentation: "la documentation"
      };
    }
  });

  // js/contract/collaboration/constants.js
  var TEMPLATE_URL, PDF_FILENAME, EMBEDDED_TEMPLATE_MIN_LENGTH;
  var init_constants = __esm({
    "js/contract/collaboration/constants.js"() {
      TEMPLATE_URL = "./templates/contrat-collaboration-template.txt";
      PDF_FILENAME = "contrat-de-collaboration-medlex.pdf";
      EMBEDDED_TEMPLATE_MIN_LENGTH = 500;
    }
  });

  // js/contract/collaboration/template-engine.js
  function stripOptionBlock(text, startMarker, endMarker) {
    const re = new RegExp(
      `${escapeRegExp(startMarker)}[\\s\\S]*?(?=${escapeRegExp(endMarker)}|$)`,
      "u"
    );
    return text.replace(re, "");
  }
  function applyConditionals(raw, a) {
    let text = raw;
    if (a.patienteleUnite === "journees") {
      text = stripOptionBlock(text, "OPTION PATIENTELE DEMI-JOURNEES", "b)");
    } else {
      text = stripOptionBlock(text, "OPTION PATIENTELE JOURNEES", "OPTION PATIENTELE DEMI-JOURNEES");
      text = text.replace("OPTION PATIENTELE DEMI-JOURNEES\n", "");
    }
    if (a.collabUnite === "journees") {
      text = stripOptionBlock(text, "OPTION COLLAB DEMI-JOURNEES", "Le Collaborateur tient");
    } else {
      text = stripOptionBlock(text, "OPTION COLLAB JOURNEES", "OPTION COLLAB DEMI-JOURNEES");
      text = text.replace("OPTION COLLAB DEMI-JOURNEES\n", "");
    }
    if (a.forfaitMode === "tour-role") {
      text = stripOptionBlock(text, "OPTION FORFAIT EGAL", "OPTION FORFAIT PCT");
      text = stripOptionBlock(text, "OPTION FORFAIT PCT", "Il sera tenu");
      text = text.replace("OPTION FORFAIT TOUR\n", "");
    } else if (a.forfaitMode === "parts-egales") {
      text = stripOptionBlock(text, "OPTION FORFAIT TOUR", "OPTION FORFAIT EGAL");
      text = stripOptionBlock(text, "OPTION FORFAIT PCT", "Il sera tenu");
      text = text.replace("OPTION FORFAIT EGAL\n", "");
    } else {
      text = stripOptionBlock(text, "OPTION FORFAIT TOUR", "OPTION FORFAIT EGAL");
      text = stripOptionBlock(text, "OPTION FORFAIT EGAL", "OPTION FORFAIT PCT");
      text = text.replace("OPTION FORFAIT PCT\n", "");
    }
    if (a.redevanceType === "pourcentage") {
      text = stripOptionBlock(text, "OPTION REDEVANCE FORFAIT", "Elle correspond");
      text = text.replace("OPTION REDEVANCE PCT\n", "");
    } else {
      text = stripOptionBlock(text, "OPTION REDEVANCE PCT", "OPTION REDEVANCE FORFAIT");
      text = text.replace("OPTION REDEVANCE FORFAIT\n", "");
    }
    if (a.dureeDeterminee) {
      text = stripOptionBlock(text, "OPTION DUREE INDETERMINEE", "ARTICLE 15");
      text = text.replace("OPTION DUREE DETERMINEE\n", "");
      text = stripOptionBlock(text, "OPTION FIN INDETERMINEE", "ARTICLE 17");
      text = text.replace("OPTION FIN DETERMINEE\n", "");
    } else {
      text = stripOptionBlock(text, "OPTION DUREE DETERMINEE", "OPTION DUREE INDETERMINEE");
      text = text.replace("OPTION DUREE INDETERMINEE\n", "");
      text = stripOptionBlock(text, "OPTION FIN DETERMINEE", "OPTION FIN INDETERMINEE");
      text = text.replace("OPTION FIN INDETERMINEE\n", "");
    }
    return text.replace(/\n{3,}/g, "\n\n");
  }
  function applyReplacements(text, a) {
    const pairs = [
      ["R\xC9PONSES T.1 ET T.2", `${a.tCiv} ${a.tNom}`],
      ["R\xC9PONSE T.3", a.tOrdinal],
      ["R\xC9PONSE T.4", a.tRpps],
      ["R\xC9PONSE T.5", a.tAdresse],
      ["R\xC9PONSES C.1 ET C.2", `${a.cCiv} ${a.cNom}`],
      ["R\xC9PONSE C.3", a.cOrdinal],
      ["R\xC9PONSE C.4", a.cRpps],
      ["R\xC9PONSE C.5", a.cAdresse],
      ["R\xC9PONSE 2.1", a.patienteleBloc],
      ["R\xC9PONSE 3.1", a.collabBloc],
      ["R\xC9PONSE 5.1", a.lieuAdresse],
      ["R\xC9PONSE 5.2", a.moyensListe],
      ["R\xC9PONSE 6.2.PCT", a.forfaitPctText],
      ["R\xC9PONSE 6.2.REVERSEUR", a.forfaitReverseur],
      ["R\xC9PONSE 6.2.DELAI", a.forfaitDelai],
      ["R\xC9PONSE 7.PCT", a.redevancePct],
      ["R\xC9PONSE 7.MONTANT", a.redevanceMontant],
      ["R\xC9PONSE 7.JOUR", a.redevanceJour],
      ["R\xC9PONSE 14.INTRO", a.dureeIntro],
      ["R\xC9PONSE 14.DEBUT", a.dateDebut],
      ["R\xC9PONSE 14.FIN", a.dateFin],
      ["R\xC9PONSE SIGNATURE DATE", a.signatureDate],
      ["R\xC9PONSE SIGNATURE LIEU", a.signatureLieu],
      ["R\xC9PONSE SIGNATURE LIGNE TITULAIRE", a.signatureLigneTitulaire],
      ["R\xC9PONSE SIGNATURE LIGNE COLLABORATEUR", a.signatureLigneCollaborateur]
    ];
    let out = text;
    for (const [k, v] of pairs) {
      out = out.replace(new RegExp(escapeRegExp(k), "g"), String(v));
    }
    return out;
  }
  async function loadTemplate() {
    const embedded = typeof window.__MEDLEX_COLLABORATION_TEMPLATE__ === "string" ? window.__MEDLEX_COLLABORATION_TEMPLATE__ : "";
    if (embedded.length > EMBEDDED_TEMPLATE_MIN_LENGTH) {
      return embedded;
    }
    if (isFileProtocol2()) {
      throw new Error(
        "Mod\xE8le embarqu\xE9 manquant (medlex-collaboration-template-embedded.js). Rechargez la page ou ouvrez le site via GitHub Pages."
      );
    }
    const res = await fetch(TEMPLATE_URL, { cache: "no-store" });
    if (!res.ok) {
      if (embedded.length > 0) return embedded;
      throw new Error(`Template collaboration introuvable (${res.status})`);
    }
    return res.text();
  }
  function buildContractText(templateRaw, a) {
    let text = applyConditionals(templateRaw, a);
    text = applyReplacements(text, a);
    return text;
  }
  var init_template_engine = __esm({
    "js/contract/collaboration/template-engine.js"() {
      init_constants();
      init_utils();
    }
  });

  // js/contract/collaboration/render-html.js
  function collectHighlightValues(a) {
    const candidates = [
      a.tCiv,
      a.tNom,
      a.tOrdinal,
      a.tRpps,
      a.tAdresse,
      a.cCiv,
      a.cNom,
      a.cOrdinal,
      a.cRpps,
      a.cAdresse,
      a.patienteleBloc,
      a.collabBloc,
      a.lieuAdresse,
      a.moyensListe,
      a.forfaitPctText,
      a.forfaitReverseur,
      a.redevancePct,
      a.redevanceMontant,
      a.dureeIntro,
      a.dateDebut,
      a.dateFin,
      a.signatureDate,
      a.signatureLieu,
      a.signatureLigneTitulaire,
      a.signatureLigneCollaborateur
    ];
    const values = [];
    for (const v of candidates) {
      const s = String(v || "").trim();
      if (!s || s === "Non renseign\xE9") continue;
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
      out = out.replace(new RegExp(escapeRegExp(esc), "g"), `<strong>${esc}</strong>`);
    }
    return out;
  }
  function buildContractRenderedHtml(bodyText, a) {
    const highlightValues = collectHighlightValues(a);
    return bodyText.split("\n").map(
      (line) => line.trim() === "" ? "<br />" : `<p style="margin:0 0 8px;line-height:1.5">${highlightAnswerValuesInLine(line, highlightValues)}</p>`
    ).join("");
  }
  var init_render_html = __esm({
    "js/contract/collaboration/render-html.js"() {
      init_utils();
    }
  });

  // js/contract/collaboration/medlex-collaboration-contract.js
  var medlex_collaboration_contract_exports = {};
  async function downloadPdf() {
    const btn = $("download-pdf");
    const prev = btn?.textContent;
    if (btn) {
      btn.disabled = true;
      btn.textContent = "T\xE9l\xE9chargement\u2026";
    }
    try {
      const docEl = document.getElementById("contract-doc");
      if (docEl && docEl.querySelector(".ac-contract-doc__body")) {
        await downloadContractPdf({
          filename: PDF_FILENAME,
          sourceElement: docEl
        });
        return;
      }
      const templateRaw = await loadTemplate();
      const answers = collectAnswers();
      const bodyText = buildContractText(templateRaw, answers);
      const bodyHtml = buildContractRenderedHtml(bodyText, answers);
      await downloadContractPdf({
        filename: PDF_FILENAME,
        title: "Contrat de collaboration infirmier lib\xE9ral",
        subtitle: answers.tNom + " et " + answers.cNom,
        bodyHtml
      });
    } catch (e) {
      console.error(e);
      alert(
        e instanceof Error ? `Impossible de g\xE9n\xE9rer le PDF : ${e.message}` : "Impossible de g\xE9n\xE9rer le PDF."
      );
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = prev || "T\xE9l\xE9charger le PDF";
      }
    }
  }
  var init_medlex_collaboration_contract = __esm({
    "js/contract/collaboration/medlex-collaboration-contract.js"() {
      init_utils();
      init_snapshot();
      init_answers();
      init_template_engine();
      init_render_html();
      init_constants();
      init_pdf_export();
      window.MedLexCollaborationContract = {
        downloadPdf,
        loadTemplate,
        collectAnswers,
        buildContractText,
        buildContractRenderedHtml,
        collectQuestionnaireSnapshot,
        applyQuestionnaireSnapshot
      };
    }
  });

  // js/contract/constants.js
  var TEMPLATE_URL2, STORAGE_KEY_PENDING_RESTORE, PDF_FILENAME2, EMBEDDED_TEMPLATE_MIN_LENGTH2;
  var init_constants2 = __esm({
    "js/contract/constants.js"() {
      TEMPLATE_URL2 = "./templates/contrat-remplacement-template.txt";
      STORAGE_KEY_PENDING_RESTORE = "medlex-pending-restore-json";
      PDF_FILENAME2 = "contrat-de-remplacement-medlex.pdf";
      EMBEDDED_TEMPLATE_MIN_LENGTH2 = 500;
    }
  });

  // js/contract/snapshot.js
  function collectQuestionnaireSnapshot2() {
    const form = document.getElementById("questionnaire-form");
    if (!form) {
      return { version: 1, fields: {}, radios: {} };
    }
    const snap = { version: 1, fields: {}, radios: {} };
    form.querySelectorAll("input, select, textarea").forEach(function(el) {
      const t = el.type;
      if (t === "radio") {
        if (el.checked) snap.radios[el.name] = el.value;
        return;
      }
      if (t === "checkbox") {
        if (el.id) snap.fields[el.id] = el.checked;
        return;
      }
      if (t === "submit" || t === "button" || t === "file") return;
      if (el.id) snap.fields[el.id] = el.value;
    });
    return snap;
  }
  function applyQuestionnaireSnapshot2(snap) {
    if (!snap || snap.version !== 1) return;
    const form = document.getElementById("questionnaire-form");
    if (!form) return;
    if (snap.fields) {
      Object.keys(snap.fields).forEach(function(id) {
        const el = document.getElementById(id);
        if (!el) return;
        const v = snap.fields[id];
        if (el.type === "checkbox") {
          el.checked = Boolean(v);
        } else {
          el.value = v != null ? String(v) : "";
        }
      });
    }
    if (snap.radios) {
      Object.keys(snap.radios).forEach(function(name) {
        const val2 = snap.radios[name];
        form.querySelectorAll('input[type="radio"][name="' + name + '"]').forEach(function(rad) {
          rad.checked = rad.value === val2;
        });
      });
    }
    form.querySelectorAll("select").forEach(function(el) {
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
    form.querySelectorAll('input[type="radio"]:checked').forEach(function(el) {
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }
  var init_snapshot2 = __esm({
    "js/contract/snapshot.js"() {
    }
  });

  // js/contract/answers.js
  function motifTexte() {
    const m = $("motif");
    if (!m || m.value === "autre") return val("motif-autre-texte", "Non renseign\xE9");
    return m.value || "Non renseign\xE9";
  }
  function rpEstCabinetInstalle() {
    const s = $("rp-statut");
    return s && s.selectedIndex === 0;
  }
  function collectAnswers2() {
    const typeR = $("type-remplacement")?.value || "";
    let duAu2_1;
    let reponse2_2;
    if (typeR === "continue") {
      duAu2_1 = `Du ${formatDate($("date-debut")?.value)} au ${formatDate($("date-fin")?.value)}`;
      reponse2_2 = "";
    } else if (typeR === "discontinu" || typeR === "planning") {
      duAu2_1 = "";
      reponse2_2 = val("periodes-discontinues", "Non renseign\xE9");
    } else {
      duAu2_1 = "Non applicable (remplacement non conclu sur une p\xE9riode continue d\xE9termin\xE9e)";
      reponse2_2 = val("periodes-discontinues", "Non renseign\xE9");
    }
    const lieu = $("lieu")?.value || "cabinet-remplace";
    const adresseLieu = val("adresse-lieu");
    const rAdr = val("r-adresse");
    const rpAdr = val("rp-adresse");
    const facturation = $("facturation")?.value || "directe";
    const redevance = $("redevance")?.value || "Non";
    const tauxRedevance = val("taux-redevance", "0");
    const modeReglement = val("mode-reglement", "Virement bancaire");
    const tauxTiersPayant = val("taux-tiers-payant", "0");
    const modeExercice = $("mode-exercice")?.value || "seul";
    const annexesOui = checkedValue("annexes", "non") === "oui";
    const annexesDetail = val("annexes-texte");
    let question11Titre;
    let question11Corps;
    if (annexesOui) {
      question11Titre = "Oui.";
      question11Corps = annexesDetail || "Voir liste d\xE9taill\xE9e aux pr\xE9sentes annexes.";
    } else {
      question11Titre = "Non.";
      question11Corps = annexesDetail ? annexesDetail : "Aucune annexe compl\xE9mentaire n\u2019est pr\xE9vue outre les pi\xE8ces habituelles (ordre, assurance, etc.).";
    }
    const rawAdresseLieu = val("adresse-lieu");
    const rawRAdresse = val("r-adresse");
    const adressePourVille = rawAdresseLieu || rawRAdresse;
    const rCivilSig = val("r-civilite", "");
    const rpCivilSig = val("rp-civilite", "");
    const rNomSig = val("r-nom", "Non renseign\xE9");
    const rpNomSig = val("rp-nom", "Non renseign\xE9");
    return {
      typeRemplacement: typeR,
      rCiv: val("r-civilite", "M./Mme"),
      rNom: val("r-nom", "Non renseign\xE9"),
      rOrdinal: val("r-ordinal", "Non renseign\xE9"),
      rRpps: val("r-rpps", "Non renseign\xE9"),
      rAdresse: rAdr || "Non renseign\xE9",
      rpCiv: val("rp-civilite", "M./Mme"),
      rpNom: val("rp-nom", "Non renseign\xE9"),
      rpOrdinal: val("rp-ordinal", "Non renseign\xE9"),
      rpRpps: val("rp-rpps", "Non renseign\xE9"),
      rpStatut: $("rp-statut")?.selectedOptions[0]?.textContent?.trim() || "Non renseign\xE9",
      rpAdresse: rpAdr || "Non renseign\xE9",
      motif: motifTexte(),
      duAu2_1,
      reponse2_2,
      lieu,
      adresseLieu: adresseLieu || "Non renseign\xE9",
      facturation,
      facturationLabel: $("facturation")?.selectedOptions[0]?.textContent?.trim() || "Non renseign\xE9",
      redevance,
      redevanceOui: redevance === "Oui",
      tauxRedevance,
      modeReglement,
      tauxTiersPayant,
      preavisAccord: val("preavis-accord", "0"),
      preavisManquement: val("preavis-manquement", "0"),
      nonconcurrence: checkedValue("nonconcurrence", "non"),
      modeExercice,
      question11Titre,
      question11Corps,
      signatureDate: formatDateDuJour(),
      signatureLieu: extraitVilleDepuisAdresse(adressePourVille),
      signatureLigneRemplace: `${abregeCivilite(rCivilSig)} ${rNomSig}`.trim(),
      signatureLigneRemplacant: `${abregeCivilite(rpCivilSig)} ${rpNomSig}`.trim(),
      rpEstCabinetInstalle: rpEstCabinetInstalle()
    };
  }
  var init_answers2 = __esm({
    "js/contract/answers.js"() {
      init_utils();
    }
  });

  // js/contract/template-engine.js
  function reshapeArticle2Duration(text, a) {
    const tr = a.typeRemplacement;
    if (tr !== "continue" && tr !== "discontinu" && tr !== "planning") return text;
    const art2 = "Article 2 \u2013 DUR\xC9E";
    const iArt = text.indexOf(art2);
    if (iArt === -1) return text;
    const header = "Le pr\xE9sent contrat est conclu :";
    const iHeader = text.indexOf(header, iArt);
    if (iHeader === -1) return text;
    const suite = "La dur\xE9e du pr\xE9sent contrat";
    const iSuite = text.indexOf(suite, iHeader);
    if (iSuite === -1) return text;
    const slice = text.slice(iHeader, iSuite);
    if (!slice.includes("Du AU R\xC9PONSE 2.1")) return text;
    let newBlock;
    if (tr === "continue") {
      newBlock = `${header}
	\u2022	Du AU R\xC9PONSE 2.1
`;
    } else {
      newBlock = `${header}
	\u2022	R\xC9PONSE 2.2
`;
    }
    return text.slice(0, iHeader) + newBlock + text.slice(iSuite);
  }
  function applyConditionals2(raw, a) {
    let text = raw;
    if (a.modeExercice === "seul") {
      text = text.replace(/\n\[OPTION EN FONCTION DE LA QUESTION 3\.6\] :[^\n]*\n/, "\n");
    } else {
      text = text.replace("[OPTION EN FONCTION DE LA QUESTION 3.6] : ", "");
    }
    if (a.rpEstCabinetInstalle) {
      text = text.replace(/^Option 2\u00a0:[^\n]*\n/m, "");
    } else {
      text = text.replace(/^Option 1\u00a0:[^\n]*\n/m, "");
    }
    if (a.lieu === "cabinet-remplace") {
      text = text.replace(
        /\nOU OPTION 2[\u00a0\s]+RÉPONSE 6\.2[\s\S]*?(?=\nArticle 4 – OBLIGATIONS DES PARTIES)/u,
        ""
      );
    } else {
      text = text.replace(
        /OPTION 1\u00a0RÉPONSE 6\.1[\s\S]*?\nOU OPTION 2[\u00a0\s]+(?=RÉPONSE 6\.2)/u,
        ""
      );
    }
    const a5 = "Article 5 \u2013 HONORAIRES";
    const a6 = "Article 6 \u2013 OBLIGATIONS FISCALES ET SOCIALES";
    if (a.facturation === "directe") {
      text = text.replace(
        new RegExp(
          `\\nOU Option 2[\xA0\\s]*QUESTION 8\\.1[\xA0\\s]*:[^
]*\\n[\\s\\S]*?(?=\\n${escapeRegExp(a6)})`,
          "u"
        ),
        ""
      );
    } else {
      text = text.replace(
        new RegExp(
          `${escapeRegExp(a5)}\\nOption 1[\xA0\\s]*QUESTION 8\\.1[\xA0\\s]*\\([^\\)]*\\)\\n[\\s\\S]*?(?=\\nOU Option 2)`,
          "u"
        ),
        `${a5}
`
      );
      text = text.replace(/\nOU Option 2[\u00a0\s]*QUESTION 8\.1[\u00a0\s]*:[^\n]*\n/u, "\n");
    }
    if (a.nonconcurrence !== "oui") {
      text = text.replace(/OPTION si contrat supérieure à 3 mois[^\n]+\n/, "");
    }
    return text;
  }
  function applyReplacements2(text, a) {
    const pairs = [
      ["QUESTION 8.option 1-2.a", a.redevanceOui ? "oui" : "non"],
      ["QUESTION 8.option 2-2-b", a.tauxRedevance],
      ["QUESTION 8.option 2-4", a.tauxTiersPayant],
      ["QUESTION 8.option 2-3", a.modeReglement],
      ["QUESTION 8.option 1-2.b", a.tauxRedevance],
      ["QUESTION 8.option 1-3", a.modeReglement],
      ["QUESTION 8.1", a.facturationLabel],
      ["QUESTION 9.2", a.preavisManquement],
      ["QUESTION 9.1", a.preavisAccord],
      ["QUESTION 11 TITRE", a.question11Titre],
      ["QUESTION 11 CORPS", a.question11Corps],
      ["R\xC9PONSES 3.1 ET 3.2", `${a.rCiv} ${a.rNom}`],
      ["R\xC9PONSES 5.1 ET 5.2", `${a.rpCiv} ${a.rpNom}`],
      ["Du AU R\xC9PONSE 2.1", a.duAu2_1],
      ["R\xC9PONSE 2.2", a.reponse2_2],
      ["R\xC9PONSE 6.2 \xAB\xA0dans son propre cabinet\xA0\xBB", "\xAB dans son propre cabinet \xBB"],
      ["R\xC9PONSE 6.1 \xAB\xA0dans le cabinet du remplac\xE9\xA0\xBB", "\xAB dans le cabinet du Remplac\xE9 \xBB"],
      ["R\xC9PONSE 3.3", a.rOrdinal],
      ["R\xC9PONSE 3.4", a.rRpps],
      ["R\xC9PONSE 3.5", a.rAdresse],
      ["R\xC9PONSE 5.3", a.rpOrdinal],
      ["R\xC9PONSE 5.4", a.rpRpps],
      ["R\xC9PONSE 5.5", a.rpStatut],
      ["R\xC9PONSE 5.6", a.rpAdresse],
      ["R\xC9PONSE 4", a.motif],
      ["R\xC9PONSE SIGNATURE LIGNE REMPLA\xC7ANT", a.signatureLigneRemplacant],
      ["R\xC9PONSE SIGNATURE LIGNE REMPLAC\xC9", a.signatureLigneRemplace],
      ["R\xC9PONSE SIGNATURE DATE", a.signatureDate],
      ["R\xC9PONSE SIGNATURE LIEU", a.signatureLieu]
    ];
    let out = text;
    for (const [k, v] of pairs) {
      const esc = escapeRegExp(k);
      out = out.replace(new RegExp(esc, "g"), v);
    }
    if (a.redevanceOui) {
      out = out.replace(/S\u2019il y a une redevance oui\u00a0:/gu, "S\u2019il y a une redevance :");
    }
    return out;
  }
  function stripRedevanceIfNone(text, a) {
    if (a.redevanceOui) return text;
    let out = text;
    out = out.replace(
      /S\u2019il y a une redevance non\u00a0: Une redevance de[\s\S]*?ne s\u2019applique pas aux indemnit\u00e9s kilom\u00e9triques\.\n/u,
      ""
    );
    out = out.replace(
      /S\u2019il y a une redevance\u00a0: La somme vis[\s\S]*?indemnit\u00e9s kilom\u00e9triques\nCette redevance correspond exclusivement[\s\S]*?logiciel\.\n/u,
      ""
    );
    return out;
  }
  async function loadTemplate2() {
    const embedded = typeof window.__MEDLEX_CONTRACT_TEMPLATE__ === "string" ? window.__MEDLEX_CONTRACT_TEMPLATE__ : "";
    if (embedded.length > EMBEDDED_TEMPLATE_MIN_LENGTH2) {
      return embedded;
    }
    if (isFileProtocol2()) {
      throw new Error(
        "Mod\xE8le embarqu\xE9 manquant (fichier medlex-contract-template-embedded.js). Rechargez la page ou ouvrez le site via GitHub Pages."
      );
    }
    const res = await fetch(TEMPLATE_URL2, { cache: "no-store" });
    if (!res.ok) {
      if (embedded.length > 0) return embedded;
      throw new Error(`Template introuvable (${res.status})`);
    }
    return res.text();
  }
  function buildContractText2(templateRaw, a) {
    let text = applyConditionals2(templateRaw, a);
    text = reshapeArticle2Duration(text, a);
    text = applyReplacements2(text, a);
    text = stripRedevanceIfNone(text, a);
    return text;
  }
  var init_template_engine2 = __esm({
    "js/contract/template-engine.js"() {
      init_constants2();
      init_utils();
    }
  });

  // js/contract/render-html.js
  function collectHighlightValues2(a) {
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
      a.signatureLigneRemplacant
    ];
    const values = [];
    for (const v of candidates) {
      const s = String(v || "").trim();
      if (!s || s === "Non renseign\xE9") continue;
      if (/^\d+(?:[.,]\d+)?$/.test(s)) continue;
      if (!values.includes(s)) values.push(s);
    }
    values.sort((x, y) => y.length - x.length);
    return values;
  }
  function highlightAnswerValuesInLine2(line, values) {
    let out = escapeHtml(line);
    for (const v of values) {
      const esc = escapeHtml(v);
      out = out.replace(new RegExp(escapeRegExp(esc), "g"), `<strong>${esc}</strong>`);
    }
    return out;
  }
  function buildContractRenderedHtml2(bodyText, a) {
    const highlightValues = collectHighlightValues2(a);
    return bodyText.split("\n").map(
      (line) => line.trim() === "" ? "<br />" : `<p style="margin:0 0 8px;line-height:1.5">${highlightAnswerValuesInLine2(line, highlightValues)}</p>`
    ).join("");
  }
  var init_render_html2 = __esm({
    "js/contract/render-html.js"() {
      init_utils();
    }
  });

  // js/contract/preview-document.js
  function getMedLexAssetUrl(filename) {
    if (typeof window !== "undefined" && window.location && window.location.href) {
      try {
        var inParcours = /\/parcours\//.test(window.location.pathname);
        var rel = inParcours ? "../" + filename : filename;
        return new URL(rel, window.location.href).href;
      } catch {
      }
    }
    return "./" + filename;
  }
  function getHtml2PdfScriptUrl() {
    return getMedLexAssetUrl("html2pdf.bundle.min.js");
  }
  function buildHtmlPreviewDocument(bodyText, answers, opts) {
    const o = opts || {};
    const autoPdf = Boolean(o.autoDownloadPdf);
    const snap = o.formSnapshot != null && typeof o.formSnapshot === "object" ? o.formSnapshot : collectQuestionnaireSnapshot2();
    const renderFn = typeof o.buildRenderedHtml === "function" ? o.buildRenderedHtml : buildContractRenderedHtml2;
    const rendered = renderFn(bodyText, answers);
    const h2p = getHtml2PdfScriptUrl();
    const pdfFilename = o.pdfFilename || PDF_FILENAME2;
    const pendingRestoreKey = o.pendingRestoreKey || STORAGE_KEY_PENDING_RESTORE;
    const previewTitle = o.previewTitle || "Aper\xE7u contrat de remplacement";
    const pdfOptsLiteral = jsonLiteralForEmbeddedParse(html2PdfOptions({}, pdfFilename));
    const snapLiteral = jsonLiteralForEmbeddedParse(snap);
    const statusHtml = autoPdf ? '<p id="medlex-pdf-auto-status" class="medlex-no-print" style="margin:0 0 12px;font-size:14px;color:#245fda;font-weight:600">Le contrat s\u2019affiche ci-dessous. Le PDF va se t\xE9l\xE9charger automatiquement\u2026</p>' : "";
    let qPageUrlStr = o.questionnairePageUrl || "";
    if (!qPageUrlStr && typeof window !== "undefined" && window.location && window.location.href) {
      try {
        if (/\/parcours\//.test(window.location.pathname)) {
          qPageUrlStr = new URL("questionnaire.html", window.location.href).href.split("#")[0];
        } else {
          qPageUrlStr = String(window.location.href).split("#")[0];
        }
      } catch {
        qPageUrlStr = String(window.location.href).split("#")[0];
      }
    }
    const questionnairePageUrlJson = JSON.stringify(qPageUrlStr);
    return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(previewTitle)}</title>
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
      <h1 style="margin: 0 0 12px; font-size: 20px">Aper\xE7u du contrat g\xE9n\xE9r\xE9</h1>
    </div>
    <div id="medlex-print-root">${rendered}</div>
    <div class="medlex-no-print" style="margin-top: 20px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center">
      <button type="button" class="medlex-btn medlex-btn-secondary" id="medlex-btn-edit-bottom">Modifier</button>
      <button type="button" class="medlex-btn" id="medlex-btn-pdf-bottom">Imprimer</button>
    </div>
    <p id="medlex-modifier-hint" class="medlex-no-print" style="font-size:13px;color:#5b6780;margin-top:12px;line-height:1.45"></p>
  </main>
  <script src="${escapeHtml(h2p)}" async data-medlex-html2pdf="1"><\/script>
  <script>
(function () {
  var pdfOpts = JSON.parse(${pdfOptsLiteral});
  var autoPdf = ${autoPdf ? "true" : "false"};
  var qPageUrl = ${questionnairePageUrlJson};
  var snap = JSON.parse(${snapLiteral});
  function goModifier() {
    var hint = document.getElementById('medlex-modifier-hint');
    var openerWin = window.opener;
    if (openerWin && !openerWin.closed) {
      try {
        openerWin.postMessage({ type: 'medlex-restore-form', payload: snap }, '*');
      } catch (e1) {
        window.alert('Impossible de transmettre les donn\xE9es au questionnaire.');
        return;
      }
      try {
        openerWin.focus();
      } catch (eFocus) {}
      if (hint) {
        hint.textContent =
          'Les r\xE9ponses ont \xE9t\xE9 r\xE9inject\xE9es dans l\u2019onglet du questionnaire. Vous pouvez fermer cet aper\xE7u.';
      }
      return;
    }
    if (qPageUrl) {
      var json = JSON.stringify(snap);
      try {
        sessionStorage.setItem(${JSON.stringify(pendingRestoreKey)}, json);
      } catch (e3) {
        try {
          localStorage.setItem(${JSON.stringify(pendingRestoreKey)}, json);
        } catch (e4) {
          window.alert(
            'Impossible d\u2019enregistrer les donn\xE9es localement. Autorisez le stockage pour ce site ou d\xE9sactivez le mode priv\xE9 restreint.'
          );
          return;
        }
      }
      window.location.href = qPageUrl;
      return;
    }
    window.alert(
      'Ouvrez l\u2019aper\xE7u depuis le questionnaire (m\xEAme site) pour revenir au formulaire avec vos r\xE9ponses.'
    );
  }
  function runPdf() {
    var root = document.getElementById('medlex-print-root');
    var st = document.getElementById('medlex-pdf-auto-status');
    if (!root || typeof window.html2pdf !== 'function') {
      window.alert('G\xE9n\xE9ration PDF indisponible. V\xE9rifiez votre connexion ou rechargez la page.');
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
    if (st) st.textContent = 'G\xE9n\xE9ration du fichier PDF\u2026';
    var chain = window.html2pdf().set(pdfOpts).from(root).save();
    if (chain && typeof chain.then === 'function') {
      return chain.then(function () {
        if (st) st.textContent = 'T\xE9l\xE9chargement lanc\xE9. Vous pouvez fermer cet onglet ou cliquer \xE0 nouveau sur \xAB Imprimer \xBB.';
      }).catch(function (e) {
        if (st) st.textContent = '\xC9chec de la g\xE9n\xE9ration du PDF.';
        window.alert('Impossible de g\xE9n\xE9rer le PDF : ' + (e && e.message ? e.message : 'erreur inconnue'));
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
          'Impossible de charger html2pdf.js. V\xE9rifiez que le fichier html2pdf.bundle.min.js est bien dans le m\xEAme dossier que le questionnaire.'
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
  <\/script>
</body>
</html>`;
  }
  var init_preview_document = __esm({
    "js/contract/preview-document.js"() {
      init_constants2();
      init_pdf_options();
      init_utils();
      init_snapshot2();
      init_render_html2();
    }
  });

  // js/contract/medlex-contract.js
  var medlex_contract_exports = {};
  async function downloadPdf2() {
    const multi = $("multi-remplacements")?.value;
    if (multi === "plus") {
      alert(
        "Le Rempla\xE7ant ne peut pas remplacer plus de deux infirmiers concomitamment. Corrigez la section 5 avant de g\xE9n\xE9rer le PDF."
      );
      return;
    }
    const btn = $("download-pdf");
    const prev = btn?.textContent;
    if (btn) {
      btn.disabled = true;
      btn.textContent = "T\xE9l\xE9chargement\u2026";
    }
    try {
      const docEl = document.getElementById("contract-doc");
      if (docEl && docEl.querySelector(".ac-contract-doc__body")) {
        await downloadContractPdf({
          filename: PDF_FILENAME2,
          sourceElement: docEl
        });
        return;
      }
      const templateRaw = await loadTemplate2();
      const answers = collectAnswers2();
      const bodyText = buildContractText2(templateRaw, answers);
      const bodyHtml = buildContractRenderedHtml2(bodyText, answers);
      const subtitle = answers.rpNom + " et " + answers.rNom + " \xB7 " + (TYPE_LABELS[answers.typeRemplacement] || "Remplacement");
      await downloadContractPdf({
        filename: PDF_FILENAME2,
        title: "Contrat de remplacement infirmier lib\xE9ral",
        subtitle,
        bodyHtml
      });
    } catch (e) {
      console.error(e);
      alert(
        e instanceof Error ? `Impossible de g\xE9n\xE9rer le PDF : ${e.message}` : "Impossible de g\xE9n\xE9rer le PDF."
      );
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = prev || "T\xE9l\xE9charger le PDF";
      }
    }
  }
  async function openHtmlPreview(previewWindow) {
    const win = previewWindow || window.open("", "_blank");
    if (!win) {
      throw new Error("Impossible d'ouvrir l'aper\xE7u (fen\xEAtre bloqu\xE9e par le navigateur).");
    }
    window.medlexLastPreviewWindow = win;
    try {
      const templateRaw = await loadTemplate2();
      const answers = collectAnswers2();
      const bodyText = buildContractText2(templateRaw, answers);
      const snap = collectQuestionnaireSnapshot2();
      win.document.open();
      win.document.write(buildHtmlPreviewDocument(bodyText, answers, { formSnapshot: snap }));
      win.document.close();
    } catch (e) {
      try {
        win.close();
      } catch (_) {
      }
      throw e;
    }
  }
  var TYPE_LABELS;
  var init_medlex_contract = __esm({
    "js/contract/medlex-contract.js"() {
      init_utils();
      init_constants2();
      init_snapshot2();
      init_answers2();
      init_template_engine2();
      init_render_html2();
      init_preview_document();
      init_pdf_export();
      TYPE_LABELS = {
        continue: "Remplacement continu",
        discontinu: "Remplacement discontinu",
        planning: "Planning variable"
      };
      window.MedLexContract = {
        openHtmlPreview,
        downloadPdf: downloadPdf2,
        loadTemplate: loadTemplate2,
        collectAnswers: collectAnswers2,
        buildContractText: buildContractText2,
        buildContractRenderedHtml: buildContractRenderedHtml2,
        buildHtmlPreviewDocument,
        collectQuestionnaireSnapshot: collectQuestionnaireSnapshot2,
        applyQuestionnaireSnapshot: applyQuestionnaireSnapshot2
      };
    }
  });

  // js/contrat-page.js
  function loadScript(src) {
    return new Promise(function(resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = function() {
        resolve();
      };
      s.onerror = function() {
        reject(new Error("Script introuvable : " + src));
      };
      document.head.appendChild(s);
    });
  }
  function escapeHtml2(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  var TYPE_LABELS2 = {
    continue: "Remplacement continu",
    discontinu: "Remplacement discontinu",
    planning: "Planning variable"
  };
  function showError(message, questionnaireHref) {
    var doc = document.getElementById("contract-doc");
    var guided = document.getElementById("contract-guided");
    var toggle = document.querySelector(".ac-view-toggle");
    if (!doc) return;
    var href = questionnaireHref || "questionnaire.html";
    var isCollab = window.ParcoursType && window.ParcoursType.isCollaboration();
    var title = isCollab ? "Contrat de collaboration infirmier lib\xE9ral" : "Contrat de remplacement infirmier lib\xE9ral";
    if (guided) guided.innerHTML = "";
    if (toggle) toggle.classList.add("ac-hidden");
    doc.classList.remove("ac-hidden");
    doc.innerHTML = '<p class="ac-contract-doc__title">' + title + '</p><p class="ac-microcopy" style="margin-top:1rem;color:var(--ac-ink)">' + escapeHtml2(message) + '</p><p class="ac-microcopy ac-spacer-sm"><a href="' + escapeHtml2(href) + '">Revenir au questionnaire</a></p>';
  }
  function renderRemplacementContract(docEl, bodyText, answers, Contract) {
    var subtitle = escapeHtml2(answers.rpNom) + " et " + escapeHtml2(answers.rNom) + " \xB7 " + escapeHtml2(TYPE_LABELS2[answers.typeRemplacement] || "Remplacement");
    var bodyHtml = Contract.buildContractRenderedHtml(bodyText, answers);
    docEl.innerHTML = '<p class="ac-contract-doc__title">Contrat de remplacement infirmier lib\xE9ral</p><p class="ac-contract-doc__subtitle">' + subtitle + '</p><div class="ac-contract-doc__body">' + bodyHtml + "</div>";
    return { bodyText, bodyHtml };
  }
  function renderCollaborationContract(docEl, bodyText, answers, Contract) {
    var subtitle = escapeHtml2(answers.tNom) + " et " + escapeHtml2(answers.cNom);
    var bodyHtml = Contract.buildContractRenderedHtml(bodyText, answers);
    docEl.innerHTML = '<p class="ac-contract-doc__title">Contrat de collaboration infirmier lib\xE9ral</p><p class="ac-contract-doc__subtitle">' + subtitle + '</p><div class="ac-contract-doc__body">' + bodyHtml + "</div>";
    return { bodyText, bodyHtml };
  }
  function mountGuidedContractView(parcours, bodyText, bodyHtml) {
    if (!window.MedLexContractGuided) return;
    window.MedLexContractGuided.mount({
      bodyText,
      bodyHtml,
      parcours
    });
    window.MedLexContractGuided.initViewToggle();
  }
  function updatePageChrome(isCollab) {
    var docEl = document.getElementById("contract-doc");
    if (docEl) {
      docEl.setAttribute(
        "aria-label",
        isCollab ? "Aper\xE7u du contrat de collaboration" : "Aper\xE7u du contrat de remplacement"
      );
    }
  }
  var pdfExportModule = null;
  var pdfPreloadPromise = null;
  function preloadPdfEngine2() {
    if (pdfPreloadPromise) {
      return pdfPreloadPromise;
    }
    console.log("[MedLex PDF]", "contrat-page : d\xE9marrage pr\xE9chargement\u2026");
    pdfPreloadPromise = Promise.resolve().then(() => (init_pdf_export(), pdf_export_exports)).then(function(mod) {
      console.log("[MedLex PDF]", "contrat-page : module pdf-export import\xE9");
      pdfExportModule = mod;
      return mod.preloadPdfEngine();
    }).then(function() {
      console.log("[MedLex PDF]", "contrat-page : pr\xE9chargement termin\xE9", {
        pret: pdfExportModule && pdfExportModule.isPdfEngineReady()
      });
    }).catch(function(e) {
      pdfPreloadPromise = null;
      console.error("[MedLex PDF]", "contrat-page : \xE9chec pr\xE9chargement", e);
      throw e;
    });
    return pdfPreloadPromise;
  }
  function wirePdfDownload(pdfBtn, docEl, filename) {
    if (!pdfBtn || !docEl) return;
    var labelReady = "T\xE9l\xE9charger le PDF";
    pdfBtn.disabled = true;
    pdfBtn.textContent = "Pr\xE9paration du PDF\u2026";
    preloadPdfEngine2().then(function() {
      pdfBtn.disabled = false;
      pdfBtn.textContent = labelReady;
    }).catch(function() {
      pdfBtn.disabled = false;
      pdfBtn.textContent = labelReady;
    });
    pdfBtn.addEventListener("click", function() {
      var prev = pdfBtn.textContent;
      pdfBtn.disabled = true;
      pdfBtn.textContent = "T\xE9l\xE9chargement\u2026";
      console.log("[MedLex PDF]", "contrat-page : clic bouton", {
        filename,
        moduleCharge: Boolean(pdfExportModule),
        pret: pdfExportModule ? pdfExportModule.isPdfEngineReady() : false,
        contractDoc: Boolean(docEl && docEl.querySelector(".ac-contract-doc__body"))
      });
      function runDownload() {
        pdfExportModule.downloadContractPdfNow({
          filename,
          sourceElement: docEl
        });
      }
      function resetBtn() {
        pdfBtn.disabled = false;
        pdfBtn.textContent = prev || labelReady;
      }
      if (pdfExportModule && pdfExportModule.isPdfEngineReady()) {
        try {
          runDownload();
        } catch (e) {
          console.error("[MedLex PDF]", "contrat-page : erreur au clic", e);
          alert(
            e instanceof Error ? "Impossible de g\xE9n\xE9rer le PDF : " + e.message : "Impossible de g\xE9n\xE9rer le PDF."
          );
        } finally {
          resetBtn();
        }
        return;
      }
      (pdfExportModule ? pdfExportModule.ensurePdfEngineReady() : preloadPdfEngine2()).then(function() {
        if (!pdfExportModule) {
          throw new Error("Module PDF non charg\xE9.");
        }
        runDownload();
      }).catch(function(e) {
        console.error("[MedLex PDF]", "contrat-page : erreur au clic", e);
        alert(
          e instanceof Error ? "Impossible de g\xE9n\xE9rer le PDF : " + e.message : "Impossible de g\xE9n\xE9rer le PDF."
        );
      }).finally(resetBtn);
    });
  }
  async function initCollaborationContrat(docEl, pdfBtn) {
    var qHref = "questionnaire-collaboration.html";
    var snap = window.ParcoursCollaborationSnapshot && window.ParcoursCollaborationSnapshot.load();
    if (!snap) {
      showError(
        "Aucune r\xE9ponse au questionnaire n\u2019a \xE9t\xE9 trouv\xE9e. Compl\xE8te le questionnaire pour g\xE9n\xE9rer ton contrat.",
        qHref
      );
      if (pdfBtn) pdfBtn.disabled = true;
      return;
    }
    if (!window.ParcoursCollaborationSnapshot.apply(snap)) {
      showError("Impossible de restaurer les r\xE9ponses du questionnaire.", qHref);
      if (pdfBtn) pdfBtn.disabled = true;
      return;
    }
    try {
      await loadScript("../medlex-collaboration-template-embedded.js");
      await Promise.resolve().then(() => (init_medlex_collaboration_contract(), medlex_collaboration_contract_exports));
      var Contract = window.MedLexCollaborationContract;
      var templateRaw = await Contract.loadTemplate();
      var answers = Contract.collectAnswers();
      var bodyText = Contract.buildContractText(templateRaw, answers);
      var rendered = renderCollaborationContract(docEl, bodyText, answers, Contract);
      docEl.removeAttribute("aria-busy");
      mountGuidedContractView("collaboration", rendered.bodyText, rendered.bodyHtml);
      wirePdfDownload(pdfBtn, docEl, "contrat-de-collaboration-medlex.pdf");
    } catch (e) {
      console.error(e);
      showError(
        e instanceof Error ? "Erreur lors de la g\xE9n\xE9ration : " + e.message : "Erreur lors de la g\xE9n\xE9ration du contrat.",
        qHref
      );
      if (pdfBtn) pdfBtn.disabled = true;
    }
  }
  async function initRemplacementContrat(docEl, pdfBtn) {
    var qHref = "questionnaire.html";
    var snap = window.ParcoursSnapshot && window.ParcoursSnapshot.load();
    if (!snap) {
      showError(
        "Aucune r\xE9ponse au questionnaire n\u2019a \xE9t\xE9 trouv\xE9e. Compl\xE8te le questionnaire pour g\xE9n\xE9rer ton contrat.",
        qHref
      );
      if (pdfBtn) pdfBtn.disabled = true;
      return;
    }
    if (!window.ParcoursSnapshot.apply(snap)) {
      showError("Impossible de restaurer les r\xE9ponses du questionnaire.", qHref);
      if (pdfBtn) pdfBtn.disabled = true;
      return;
    }
    try {
      await loadScript("../medlex-contract-template-embedded.js");
      var mod = await Promise.resolve().then(() => (init_medlex_contract(), medlex_contract_exports));
      var Contract = mod.default || window.MedLexContract;
      var templateRaw = await Contract.loadTemplate();
      var answers = Contract.collectAnswers();
      var bodyText = Contract.buildContractText(templateRaw, answers);
      var rendered = renderRemplacementContract(docEl, bodyText, answers, Contract);
      docEl.removeAttribute("aria-busy");
      mountGuidedContractView("remplacement", rendered.bodyText, rendered.bodyHtml);
      wirePdfDownload(pdfBtn, docEl, "contrat-de-remplacement-medlex.pdf");
    } catch (e) {
      console.error(e);
      showError(
        e instanceof Error ? "Erreur lors de la g\xE9n\xE9ration : " + e.message : "Erreur lors de la g\xE9n\xE9ration du contrat.",
        qHref
      );
      if (pdfBtn) pdfBtn.disabled = true;
    }
  }
  async function initContratPage() {
    var docEl = document.getElementById("contract-doc");
    var pdfBtn = document.getElementById("download-pdf");
    if (!docEl) return;
    var isCollab = window.ParcoursType && window.ParcoursType.isCollaboration();
    updatePageChrome(isCollab);
    if (isCollab) {
      await initCollaborationContrat(docEl, pdfBtn);
    } else {
      await initRemplacementContrat(docEl, pdfBtn);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initContratPage);
  } else {
    initContratPage();
  }
})();
