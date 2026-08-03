/**
 * CoûtsIA — logique de l’estimateur
 * ----------------------------------------------------------------------------
 * Parcours : Accueil → Projet → Création → Usage IA → Synthèse
 *
 * Organisation du fichier :
 *   1. Constantes & barèmes
 *   2. Utilitaires DOM / formatage
 *   3. État de l’application
 *   4. Analyse de la description (étape 1)
 *   5. Moteurs de calcul (création, usage, croissance)
 *   6. Textes d’explication & aides
 *   7. Rendu UI (par panneau)
 *   8. Persistance, historique, partage, PDF
 *   9. Événements & démarrage
 *
 * Les montants sont des ordres de grandeur, pas un devis.
 */
(function () {
  "use strict";

  /* ========================================================================
   * 1. Constantes & barèmes
   * ======================================================================== */

  const EUR_USD = 0.92;
  const STORAGE_KEY = "coutsia_state_v3";
  const HIST_KEY = "coutsia_hist_v3";
  const DEFAULT_TJM = 750;

  /** Libellés des curseurs étape 1 */
  const RULES_LABELS = [
    "Quelques règles simples",
    "Règles modérées",
    "Logique métier claire",
    "Règles nombreuses",
    "Beaucoup de règles complexes"
  ];
  const AI_LABELS = [
    "Jamais",
    "Ponctuellement",
    "Souvent, sur certaines tâches",
    "Très présent au quotidien",
    "C’est le cœur du moteur"
  ];
  const FINISH_HINTS = [
    "Version minimale pour tester l’idée rapidement.",
    "Version solide pour de vrais utilisateurs, avec tests et mise en production.",
    "Production + suivi / correctifs sur 12 mois (maintenance indicative)."
  ];
  /** Multiplicateur de charge selon le niveau de finition (MVP / prod / + maintenance) */
  const FINISH_MULT = [0.7, 1.0, 1.45];
  /** TJM suggéré si l’utilisateur n’a pas encore choisi manuellement */
  const DAY_RATE_DEFAULT = { nocode: 600, ai: 750, classic: 900 };

  /**
   * Modèles IA proposés.
   * in / out = USD pour 1 million de tokens (entrée / sortie).
   */
  const MODELS = {
    auto: {
      id: "auto", label: "Je ne sais pas — recommandez-moi",
      sub: "On choisit selon votre description et l’intensité IA.",
      in: 0.4, out: 1.6
    },
    "gpt-mini": {
      id: "gpt-mini", label: "GPT-4.1 mini",
      sub: "Économique · FAQ, reformulation, tâches simples · ~0,40 / 1,60 $/1M tokens",
      in: 0.40, out: 1.60, tier: "mini"
    },
    "claude-haiku": {
      id: "claude-haiku", label: "Claude Haiku",
      sub: "Économique · rapide, bon pour volume · ~0,80 / 4 $/1M tokens",
      in: 0.80, out: 4.00, tier: "mini"
    },
    "gpt-41": {
      id: "gpt-41", label: "GPT-4.1",
      sub: "Standard · raisonnement solide, usages généraux · ~2 / 8 $/1M tokens",
      in: 2.00, out: 8.00, tier: "standard"
    },
    "claude-sonnet": {
      id: "claude-sonnet", label: "Claude Sonnet",
      sub: "Standard · excellent sur textes longs et outils · ~3 / 15 $/1M tokens",
      in: 3.00, out: 15.00, tier: "standard"
    },
    "claude-opus": {
      id: "claude-opus", label: "Claude Opus",
      sub: "Premium · cas difficiles, haute exigence · ~15 / 75 $/1M tokens",
      in: 15.00, out: 75.00, tier: "premium"
    },
    "o3": {
      id: "o3", label: "o3 (raisonnement)",
      sub: "Premium · analyses complexes, décisions · tarifs élevés",
      in: 10.00, out: 40.00, tier: "premium"
    }
  };

  /** Tokens moyens par échange selon la longueur choisie */
  const LENGTH_TOKENS = {
    short:  { in: 800,  out: 400 },
    medium: { in: 2500, out: 1200 },
    long:   { in: 8000, out: 3000 }
  };

  /** Facteurs de volume mois 1 → 12 selon le scénario de croissance */
  const GROWTH = {
    pessimiste: {
      label: "Pessimiste",
      hint: "Volume presque stable : +8 % environ sur l’année.",
      monthly: [1, 1.02, 1.03, 1.04, 1.05, 1.05, 1.06, 1.06, 1.07, 1.07, 1.08, 1.08]
    },
    realiste: {
      label: "Réaliste",
      hint: "Montée en charge progressive : environ ×1,75 en fin d’année.",
      monthly: [1, 1.08, 1.15, 1.22, 1.30, 1.38, 1.45, 1.52, 1.58, 1.64, 1.70, 1.75]
    },
    optimiste: {
      label: "Optimiste",
      hint: "Forte adoption : jusqu’à ×4 le volume d’ici 12 mois.",
      monthly: [1, 1.15, 1.35, 1.55, 1.80, 2.10, 2.40, 2.70, 3.00, 3.30, 3.60, 4.00]
    }
  };

  /** Alternatives marché pour la section « build vs buy » (déduites des mots-clés) */
  const MARKET_POOL = [
    { keys: ["chat", "faq", "support", "client", "sav", "assistant"], items: [
      { name: "Intercom Fin / Zendesk AI", desc: "Support client automatisé", price: "~29–99 €/agent/mois" },
      { name: "Chatbase / CustomGPT", desc: "Chatbot sur vos documents", price: "~19–99 €/mois" },
      { name: "Crisp / Tidio", desc: "Messagerie + bot simple", price: "~25–95 €/mois" }
    ]},
    { keys: ["interne", "équipe", "rh", "document", "notion", "connaissance"], items: [
      { name: "Notion AI", desc: "Aide rédaction & recherche interne", price: "~10–20 €/user/mois" },
      { name: "Microsoft Copilot 365", desc: "IA dans la suite Office", price: "~28 €/user/mois" },
      { name: "ChatGPT Team / Claude Team", desc: "Espace équipe prêt à l’emploi", price: "~25–30 €/user/mois" }
    ]},
    { keys: ["automat", "workflow", "zapier", "make", "email", "relance"], items: [
      { name: "Make / Zapier", desc: "Automatisations + modules IA", price: "~19–99 €/mois + usage" },
      { name: "n8n Cloud", desc: "Automatisation hébergée", price: "~20–50 €/mois" },
      { name: "Power Automate", desc: "Flux Microsoft", price: "selon licence 365" }
    ]},
    { keys: ["app", "mobile", "portail", "espace client", "saas"], items: [
      { name: "Bubble + plugins IA", desc: "Appli no-code avec IA", price: "~32–129 €/mois + usage" },
      { name: "Solutions verticales SaaS", desc: "Outils métiers spécialisés", price: "souvent 50–300 €/mois" },
      { name: "Webflow + Memberstack", desc: "Site / espace membres", price: "~29–99 €/mois" }
    ]}
  ];

  /* ========================================================================
   * 2. Utilitaires DOM / formatage
   * ======================================================================== */

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function radio(name) {
    const el = $(`input[name="${name}"]:checked`);
    return el ? el.value : null;
  }

  function setRadio(name, value) {
    const el = $(`input[name="${name}"][value="${value}"]`);
    if (el) el.checked = true;
  }

  /** Affichage monétaire FR (centimes si < 1 €) */
  function fmt(n) {
    if (!isFinite(n)) return "—";
    const abs = Math.abs(n);
    if (abs > 0 && abs < 1) {
      return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (abs < 100) {
      return n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
    }
    return Math.round(n).toLocaleString("fr-FR");
  }

  const fmtRange = (lo, hi) => `${fmt(lo)} – ${fmt(hi)} €`;
  const fmtEuro = (n) => `${fmt(n)} €`;

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function unique(list) {
    const out = [];
    list.forEach((item) => { if (!out.includes(item)) out.push(item); });
    return out;
  }

  function scheduleRow(label, valueHtml) {
    return `<div class="schedule-row"><span>${label}</span><strong>${valueHtml}</strong></div>`;
  }

  /** Relit le formulaire, recalcule et redessine l’UI */
  function refresh() {
    persist();
    render();
  }

  /* ========================================================================
   * 3. État de l’application
   * ======================================================================== */

  let step = 0;
  let maxReached = 0;
  let growthKey = "realiste";
  let customPrices = false;   // true si l’utilisateur a forcé les prix tokens
  let selectedModel = "auto";
  let dayRateTouched = false; // true si le TJM a été choisi à la main

  function getDayRate() {
    const el = document.getElementById("dayRate");
    if (!el) return DEFAULT_TJM;
    const raw = String(el.value).trim();
    if (raw === "") return DEFAULT_TJM;
    const n = parseFloat(raw.replace(/\s/g, "").replace(",", "."));
    if (!Number.isFinite(n) || n < 0) return DEFAULT_TJM;
    return Math.min(5000, n); // 0 = fait soi-même
  }

  /** Snapshot de tous les champs utiles au calcul */
  function readState() {
    return {
      appDesc: ($("#appDesc") && $("#appDesc").value) || "",
      rules: +$("#rules").value,
      connections: +$("#connections").value,
      aiIntensity: +$("#aiIntensity").value,
      devMode: radio("devMode") || "ai",
      finish: +$("#finish").value,
      model: selectedModel,
      users: Math.max(1, +$("#users").value || 1),
      freq: Math.max(1, +$("#freq").value || 1),
      length: radio("length") || "medium",
      rag: radio("rag") === "yes",
      growth: growthKey,
      priceIn: +$("#priceIn").value,
      priceOut: +$("#priceOut").value,
      margin: +$("#margin").value / 100,
      dayRate: getDayRate()
    };
  }

  function persist() {
    const s = readState();
    s.step = step;
    s.maxReached = maxReached;
    s.growth = growthKey;
    s.model = selectedModel;
    s.customPrices = customPrices;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) { /* quota / mode privé */ }
  }

  /* ========================================================================
   * 4. Analyse de la description (étape 1)
   * ======================================================================== */

  /**
   * Titre court pour l’historique / PDF, dérivé de la description.
   */
  function shortTitle(desc) {
    const raw = (desc || "").trim().replace(/\s+/g, " ");
    if (raw.length < 12) return "Mon outil IA";

    let sentence = (raw.split(/(?<=[.!?…])\s+/)[0] || raw)
      .replace(/[.!?…]+$/g, "")
      .trim();

    sentence = sentence
      .replace(/^(?:bonjour[, ]*)?/i, "")
      .replace(/^(?:alors[, ]*)?/i, "")
      .replace(/^(?:en fait[, ]*)?/i, "")
      .replace(/^(?:voilà[, ]*)?/i, "")
      .replace(/^(?:idée\s*(?:d['’]|:)\s*)/i, "")
      .replace(/^(?:je|nous)\s+(?:veux|voudrais|souhaite|souhaitons|voulons|aimerais|aimerions)\s+(?:créer|faire|développer|construire|mettre en place|avoir)?\s*/i, "")
      .replace(/^(?:il\s+s['’]agit\s+d['’])\s*/i, "")
      .replace(/^(?:c['’]est\s+)/i, "")
      .trim();

    const typed = sentence.match(
      /^(?:un|une|l['’]|le|la)\s+((?:assistant|chatbot|outil|application|appli|bot|agent|portail|plateforme|service|module|système|espace|interface)[\s\S]{6,})$/i
    );
    if (typed) sentence = typed[1].trim();

    if (sentence.length > 68) {
      const cut = sentence.slice(0, 68);
      const sp = cut.lastIndexOf(" ");
      sentence = (sp > 36 ? cut.slice(0, sp) : cut).trim() + "…";
    }

    if (sentence.length < 8) return "Mon outil IA";
    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
  }

  /**
   * Lit la description libre et en déduit des signaux de complexité / usage.
   * Ces signaux modifient jours-homme, multiplicateurs et reco de modèle.
   */
  function analyzeDescription(text) {
    const raw = (text || "").trim();
    const t = raw.toLowerCase();
    const hits = [];
    let createBoost = 0;
    let extraDays = 0;
    let usageMult = 1;
    let tokenMult = 1;
    let connSignal = 0;
    let rulesSignal = 0;
    let aiSignal = 0;
    let ragSignal = false;
    let lengthHint = null;
    let profile = "general";

    if (raw.length < 40) {
      return {
        createBoost: 0, extraDays: 0, usageMult: 1, tokenMult: 1,
        connSignal: 0, rulesSignal: 0, aiSignal: 0, ragSignal: false,
        lengthHint: null, profile: "general", hits: [], thin: true,
        summary: "Description trop courte pour affiner l’estimation."
      };
    }

    // Profil d’outil
    const profiles = [
      { re: /chatbot|assistant|faq|sav|support client|service client|répond(?:re)? aux questions/, id: "chatbot", label: "assistant / support", create: 0.08, usage: 1.15, ai: 1 },
      { re: /automatis|relance|workflow|planif|cron|zapier|make\.com|n8n/, id: "auto", label: "automatisation", create: 0.1, usage: 1.25, ai: 1 },
      { re: /espace client|portail|application|appli mobile|saas|tableau de bord|dashboard/, id: "client", label: "appli / portail", create: 0.18, usage: 1.05, ai: 0 },
      { re: /interne|équipe|rh|collaborateur|connaissance|wiki|notion/, id: "interne", label: "outil interne", create: 0.06, usage: 0.95, ai: 0 }
    ];
    for (const p of profiles) {
      if (p.re.test(t)) {
        profile = p.id;
        createBoost += p.create;
        usageMult *= p.usage;
        aiSignal = Math.max(aiSignal, p.ai);
        hits.push(p.label);
        break;
      }
    }

    // Systèmes / intégrations mentionnés
    const systems = [
      [/shopify|woocommerce|prestashop|magento|e-?commerce|boutique en ligne/, "e-commerce", 1.2],
      [/salesforce|hubspot|pipedrive|crm/, "CRM", 1.3],
      [/sap|odoo|erp|pennylane|quickbooks|sage/, "ERP / compta", 1.5],
      [/stripe|paypal|paiement|encaiss/, "paiements", 1.2],
      [/gmail|outlook|smtp|e-?mails?|mailchimp|brevo|sendinblue/, "e-mail", 1],
      [/slack|teams|whatsapp|sms|twilio/, "messagerie", 1],
      [/google sheet|airtable|notion|excel|base de donn|postgres|mysql|sql/, "données", 1.1],
      [/api|webhook|zapier|make|n8n/, "API / automatisation", 1],
      [/calendly|agenda|google calendar|prise de rendez-vous/, "agenda", 0.8],
      [/linkedin|instagram|facebook|réseaux sociaux/, "réseaux sociaux", 0.8]
    ];
    systems.forEach(([re, label, weight]) => {
      if (re.test(t)) {
        connSignal += weight;
        extraDays += 1.8 * weight;
        createBoost += 0.04;
        hits.push(label);
      }
    });

    // Documents / base de connaissance
    if (/document|pdf|catalogue|base de connaissance|connaissance|fichier|fiche produit|réglement|cgv|faq longue|manuel|procédure/.test(t)) {
      ragSignal = true;
      createBoost += 0.1;
      extraDays += 3;
      tokenMult *= 1.35;
      usageMult *= 1.12;
      lengthHint = "long";
      hits.push("documents / base de connaissance");
    }

    // Logique métier
    const rulesPatterns = [
      [/tarif|prix|devis|facture|calcul|barème|remise|commission/, 1.2, "calculs / tarifs"],
      [/stock|commande|livraison|statut|suivi/, 1, "suivi commandes / stock"],
      [/règle|validation|exception|selon le profil|condition|si le client/, 1.1, "règles métier"],
      [/multi.?langue|plusieurs langues|traduction/, 1, "multilingue"],
      [/rgpd|données personnelles|consentement/, 0.8, "RGPD"],
      [/authentification|connexion|sso|compte utilisateur|rôle|permission|admin/, 1.3, "comptes & droits"],
      [/temps réel|notification|alerte|push/, 0.9, "temps réel / alertes"],
      [/mobile|ios|android|responsive/, 0.7, "mobile"]
    ];
    rulesPatterns.forEach(([re, w, label]) => {
      if (re.test(t)) {
        rulesSignal += w;
        extraDays += 2.2 * w;
        createBoost += 0.05 * w;
        hits.push(label);
      }
    });

    // Signaux IA
    if (/gpt|claude|llm|modèle|intelligence artificielle|\bia\b|générati|prompt|agent conversationnel/.test(t)) {
      aiSignal = Math.max(aiSignal, 2);
      createBoost += 0.08;
      hits.push("IA explicitement prévue");
    }
    if (/résume|rédige|reformul|analyse|classifi|extrait|recommand/.test(t)) {
      aiSignal = Math.max(aiSignal, 2);
      usageMult *= 1.1;
      hits.push("tâches génératives");
    }
    if (/cœur|au centre|principal|moteur|à chaque|systématiquement/.test(t)) {
      aiSignal = Math.max(aiSignal, 3);
      usageMult *= 1.15;
    }

    // Volume évoqué dans le texte
    const volMatch = t.match(/(\d[\d\s.]{0,6})\s*(?:clients?|utilisateurs?|commandes?|tickets?|demandes?|visiteurs?)/);
    if (volMatch) {
      const n = parseInt(volMatch[1].replace(/[\s.]/g, ""), 10);
      if (n >= 5000) { usageMult *= 1.35; hits.push("fort volume évoqué"); }
      else if (n >= 500) { usageMult *= 1.15; hits.push("volume significatif"); }
      else if (n >= 50) { usageMult *= 1.05; }
    }

    // Longueur implicite des échanges
    if (/long(?:ue)?(?:s)? (?:réponse|échange|conversation)|analyse (?:de |des )?(?:document|texte|contrat)|rapport détaillé/.test(t)) {
      lengthHint = "long";
      tokenMult *= 1.4;
    } else if (/réponse courte|oui\/non|simple faq|une phrase/.test(t)) {
      lengthHint = "short";
      tokenMult *= 0.75;
    } else if (!lengthHint) {
      lengthHint = "medium";
    }

    const wordCount = t.split(/\s+/).filter(Boolean).length;
    if (wordCount >= 40) { createBoost += 0.08; hits.push("description détaillée"); }
    else if (wordCount >= 20) { createBoost += 0.04; }

    const uniq = unique(hits);
    createBoost = Math.min(0.85, createBoost);
    extraDays = Math.min(40, extraDays);
    usageMult = Math.min(2.2, Math.max(0.7, usageMult));
    tokenMult = Math.min(2, Math.max(0.6, tokenMult));

    return {
      createBoost,
      extraDays,
      usageMult,
      tokenMult,
      connSignal: Math.min(10, Math.round(connSignal)),
      rulesSignal: Math.min(4, Math.round(rulesSignal)),
      aiSignal: Math.min(4, aiSignal),
      ragSignal,
      lengthHint,
      profile,
      hits: uniq,
      thin: false,
      summary: uniq.length
        ? `Détecté dans votre description : ${uniq.slice(0, 6).join(" · ")}.`
        : "Description prise en compte (peu de signaux techniques explicites)."
    };
  }

  /* ========================================================================
   * 5. Moteurs de calcul
   * ======================================================================== */

  /** Choisit un modèle si l’utilisateur a laissé « Je ne sais pas ». */
  function resolveModel(s, analysis) {
    if (s.model && s.model !== "auto" && MODELS[s.model]) return s.model;
    const a = analysis || analyzeDescription(s.appDesc);
    if (s.aiIntensity >= 4 || s.length === "long" || a.lengthHint === "long") return "claude-sonnet";
    if (s.aiIntensity >= 3 || s.rules >= 3 || a.rulesSignal >= 3 || a.profile === "client") return "gpt-41";
    if (s.rag || a.ragSignal || s.connections >= 4 || a.connSignal >= 3) return "claude-haiku";
    return "gpt-mini";
  }

  /**
   * Coût de création = main-d’œuvre (j·h × TJM) + outils IA de build.
   * modeOverride permet de comparer no-code / IA / classique à TJM égal.
   */
  function creationCost(s, modeOverride) {
    const mode = modeOverride || s.devMode;
    const analysis = analyzeDescription(s.appDesc);

    const baseDays = { nocode: [2, 5], ai: [1.5, 6], classic: [8, 16] }[mode];
    const rulesDays = s.rules * ({ nocode: 2.2, ai: 3.2, classic: 7 }[mode]);
    const connDays = s.connections * ({ nocode: 1.2, ai: 1.6, classic: 3.2 }[mode]);
    const aiDays = s.aiIntensity * ({ nocode: 0.8, ai: 1.1, classic: 2.2 }[mode]);

    // Proto web léger (estimateur, simulateur…) → moins de jours
    const lightWeb = /estim|co[uû]t|simulateur|calculateur|compteur|wizard|formulaire|page (html|web)|single.?page|mvp rapide/.test((s.appDesc || "").toLowerCase());
    const lightFactor = lightWeb && s.rules <= 2 && s.connections <= 3 ? 0.55 : 1;

    const modeExtra = { nocode: 0.7, ai: 1, classic: 1.35 }[mode];
    const descDaysLo = analysis.extraDays * 0.65 * modeExtra;
    const descDaysHi = analysis.extraDays * 1.25 * modeExtra;
    const descFactor = 1 + analysis.createBoost;

    let dLo = (baseDays[0] + rulesDays * 0.7 + connDays * 0.7 + aiDays * 0.6 + descDaysLo) * descFactor * lightFactor;
    let dHi = (baseDays[1] + rulesDays * 1.35 + connDays * 1.35 + aiDays * 1.2 + descDaysHi) * descFactor * lightFactor;

    // Description riche + curseurs bas : plancher de jours (sauf proto léger)
    if (!analysis.thin && analysis.hits.length >= 3 && !lightWeb) {
      const floorLo = 6 + analysis.extraDays * 0.5;
      const floorHi = 12 + analysis.extraDays * 0.9;
      const floorMode = { nocode: 0.75, ai: 1, classic: 1.4 }[mode];
      dLo = Math.max(dLo, floorLo * floorMode);
      dHi = Math.max(dHi, floorHi * floorMode);
    }

    const rate = getDayRate();
    const finishMult = FINISH_MULT[s.finish];
    dLo *= finishMult;
    dHi *= finishMult;

    const laborLo = dLo * rate;
    const laborHi = dHi * rate;

    // Durée calendaire approximative (1 personne effective)
    const calendarWeeksLo = Math.max(1, Math.ceil(dLo / 4));
    const calendarWeeksHi = Math.max(calendarWeeksLo, Math.ceil(dHi / 3.5));
    const monthsLo = Math.max(1, Math.ceil(calendarWeeksLo / 4.3));
    const monthsHi = Math.max(monthsLo, Math.ceil(calendarWeeksHi / 4.3));
    const monthsMid = Math.max(1, Math.round((monthsLo + monthsHi) / 2));

    // Outils IA de développement (indépendants du TJM)
    const tools = estimateBuildTooling(mode, dLo, dHi, s.finish, lightWeb);

    const lo = laborLo + tools.lo;
    const hi = laborHi + tools.hi;

    return {
      lo, hi, mid: (lo + hi) / 2,
      dLo, dHi, rate, mode,
      laborLo, laborHi,
      toolsLo: tools.lo, toolsHi: tools.hi, toolsNote: tools.note,
      monthsLo, monthsHi, monthsMid,
      perMonthLo: lo / monthsMid,
      perMonthHi: hi / monthsMid,
      analysis
    };
  }

  /** Abonnements / crédits pendant le build (Cursor, etc.), au prorata des jours. */
  function estimateBuildTooling(mode, dLo, dHi, finish, lightWeb) {
    let lo = 0;
    let hi = 0;
    let note = "";

    if (mode === "ai") {
      const workingDaysPerMonth = 20;
      const subLo = 20 * Math.min(1, dLo / workingDaysPerMonth);
      const subHi = 40 * Math.min(1.25, dHi / workingDaysPerMonth);
      const useLo = dLo * 0.5;
      const useHi = dHi * 3;
      lo = Math.max(2, subLo + useLo);
      hi = Math.max(lo, subHi + useHi);
      if (finish === 0 || lightWeb) {
        lo = Math.min(lo, 25);
        hi = Math.min(hi, 80);
      }
      if (dHi <= 2) hi = Math.min(hi, 35);
      note = "abonnement d’outil IA de dev au prorata + éventuels crédits";
    } else if (mode === "nocode") {
      lo = 10 * Math.min(1, dLo / 20);
      hi = Math.max(lo, 30 * Math.min(1, dHi / 20) + dHi);
      if (finish === 0) hi = Math.min(hi, 40);
      note = "options IA éventuelles des outils no-code (au prorata)";
    }

    return { lo, hi, note };
  }

  /**
   * Coût d’usage IA mensuel (mois 1, avant croissance).
   * usersOverride sert aux sensibilités ×2 / ×3.
   */
  function usageCost(s, usersOverride) {
    const analysis = analyzeDescription(s.appDesc);
    const intensityFactor = [0, 0.3, 0.65, 0.9, 1.15][s.aiIntensity] ?? 0;

    if (intensityFactor <= 0 || s.aiIntensity <= 0) {
      return {
        lo: 0, hi: 0, mid: 0, tokens: 0, modelKey: null, model: null,
        hiddenPct: 0, hiddenParts: [], sessions: 0, intensityFactor: 0, analysis
      };
    }

    const modelKey = resolveModel(s, analysis);
    const model = MODELS[modelKey];
    const baseTok = LENGTH_TOKENS[s.length] || LENGTH_TOKENS.medium;
    const tok = {
      in: Math.round(baseTok.in * analysis.tokenMult),
      out: Math.round(baseTok.out * analysis.tokenMult)
    };

    const users = usersOverride ?? s.users;
    const volumeFactor = analysis.usageMult > 1
      ? Math.sqrt(analysis.usageMult)
      : analysis.usageMult;
    const sessions = users * s.freq * intensityFactor * volumeFactor;

    const inPrice = customPrices ? s.priceIn : model.in;
    const outPrice = customPrices ? s.priceOut : model.out;
    let base =
      ((sessions * tok.in / 1e6) * inPrice + (sessions * tok.out / 1e6) * outPrice) *
      EUR_USD *
      analysis.usageMult;

    let hiddenPct = 0.12;
    const hiddenParts = ["retries / erreurs (~8 %)", "modération (~4 %)"];
    if (s.rag || analysis.ragSignal) {
      hiddenPct += 0.10;
      hiddenParts.push("stockage / recherche documents (~10 %)");
    }
    if (s.aiIntensity >= 3 || analysis.aiSignal >= 3) {
      hiddenPct += 0.05;
      hiddenParts.push("pics de charge / fallback (~5 %)");
    }
    if (!analysis.thin && analysis.hits.length >= 2) {
      hiddenParts.push("complexité lue dans la description");
    }

    const withHidden = base * (1 + hiddenPct);
    const margin = s.margin;
    return {
      lo: withHidden * (1 - margin),
      hi: withHidden * (1 + margin),
      mid: withHidden,
      base,
      hiddenPct,
      hiddenParts,
      tokens: sessions * (tok.in + tok.out),
      modelKey,
      model,
      sessions,
      intensityFactor,
      analysis
    };
  }

  /** Applique le scénario de croissance sur 12 mois à partir du coût mois 1. */
  function growthSeries(s, u) {
    const scenario = GROWTH[s.growth] || GROWTH.realiste;
    const months = scenario.monthly.map((f, i) => ({
      m: i + 1,
      factor: f,
      lo: u.lo * f,
      mid: u.mid * f,
      hi: u.hi * f
    }));
    const yearLo = months.reduce((a, x) => a + x.lo, 0);
    const yearMid = months.reduce((a, x) => a + x.mid, 0);
    const yearHi = months.reduce((a, x) => a + x.hi, 0);
    return {
      months,
      m1: months[0],
      m6: months[5],
      m12: months[11],
      yearLo, yearMid, yearHi,
      avgLo: yearLo / 12,
      avgMid: yearMid / 12,
      avgHi: yearHi / 12,
      label: scenario.label,
      hint: scenario.hint
    };
  }

  /* ========================================================================
   * 6. Textes d’explication & aides
   * ======================================================================== */

  function whyCreate(s, c) {
    const modeLabel = { nocode: "no-code", ai: "développement assisté par IA", classic: "développement classique" }[s.devMode];
    const fin = ["un MVP", "une mise en production", "production + maintenance an 1"][s.finish];
    const bits = [];
    if (s.rules >= 3) bits.push("logique métier dense");
    if (s.connections >= 5) bits.push("nombreuses connexions");
    if (s.aiIntensity >= 3) bits.push("IA très centrale");
    if (c.analysis.hits.length) bits.push(...c.analysis.hits.slice(0, 3));
    if (c.analysis.thin) bits.push("description encore légère");
    const because = bits.length ? `Parce que : ${bits.join(" · ")}. ` : "";
    return `${because}Fourchette en ${modeLabel}, pour ${fin} (≈ ${Math.round(c.dLo)}–${Math.round(c.dHi)} j·h à ${c.rate} €/j), étalée sur ~${c.monthsLo}–${c.monthsHi} mois.`;
  }

  function whyUsage(s, u) {
    if (s.aiIntensity === 0) return "Pas d’usage IA récurrent dans vos hypothèses.";
    const parts = [];
    const a = u.analysis || analyzeDescription(s.appDesc);
    if (s.aiIntensity >= 4) parts.push("l’IA est le cœur du moteur");
    else if (s.aiIntensity === 1) parts.push("l’IA n’intervient que ponctuellement (facteur réduit)");
    if (s.length === "long" || a.lengthHint === "long") parts.push("vos échanges / documents allongent chaque appel");
    if (s.users >= 200) parts.push("le volume d’utilisateurs tire la facture vers le haut");
    if (s.freq >= 20) parts.push("la fréquence d’usage est élevée");
    if (u.model && u.model.tier === "premium") parts.push("le modèle premium est nettement plus cher au token");
    if (u.model && u.model.tier === "mini") parts.push("un modèle économique garde le coût au token bas");
    if (s.rag || a.ragSignal) parts.push("la recherche dans vos documents ajoute un surcoût");
    if (a.usageMult > 1.1) parts.push("votre description implique un usage IA plus intensif");
    if (!parts.length) parts.push("volume et longueur d’échange dans la moyenne");
    const rec = s.model === "auto" && u.model ? ` Recommandation : ${u.model.label}.` : "";
    return `Pourquoi ce prix ? Parce que ${parts.join(" ; ")}.${rec}`;
  }

  function tipsFor(s, u) {
    const tips = [];
    if (s.aiIntensity > 0 && u.model && u.model.tier !== "mini") {
      tips.push({ tag: "Modèle", text: "Passer à un modèle plus petit pour les tâches simples, et garder le modèle puissant pour les cas difficiles." });
    }
    if (s.length === "long") {
      tips.push({ tag: "Longueur", text: "Limiter la longueur des réponses et découper les documents plutôt que tout envoyer d’un coup." });
    }
    tips.push({ tag: "Cache", text: "Mettre en cache les réponses aux questions fréquentes pour éviter de rappeler le modèle." });
    if (s.rag) {
      tips.push({ tag: "Documents", text: "Indexer seulement les documents utiles et rafraîchir la base moins souvent." });
    }
    if (s.connections >= 6) {
      tips.push({ tag: "Connexions", text: "Prioriser 2–3 intégrations critiques pour le MVP ; les autres peuvent attendre." });
    }
    tips.push({ tag: "Observabilité", text: "Suivre le coût par fonctionnalité dès le MVP — souvent 1–2 écrans mangent 80 % du budget tokens." });
    return tips.slice(0, 4);
  }

  function inferMarket(s) {
    const t = (s.appDesc || "").toLowerCase();
    let best = MARKET_POOL[0].items;
    let score = 0;
    MARKET_POOL.forEach((pack) => {
      const sc = pack.keys.reduce((n, k) => n + (t.includes(k) ? 1 : 0), 0);
      if (sc > score) { score = sc; best = pack.items; }
    });
    if (score === 0 && s.aiIntensity >= 3) best = MARKET_POOL[0].items;
    if (score === 0 && s.connections >= 5) best = MARKET_POOL[2].items;
    return best;
  }

  /* ========================================================================
   * 7. Rendu UI
   * ======================================================================== */

  function renderModelChoices() {
    const box = $("#modelChoices");
    box.innerHTML = Object.values(MODELS).map((m) => `
      <label class="choice">
        <input type="radio" name="model" value="${m.id}" ${selectedModel === m.id ? "checked" : ""}>
        <span>${m.label}<span class="sub">${m.sub}</span></span>
      </label>
    `).join("");
    box.querySelectorAll('input[name="model"]').forEach((inp) => {
      inp.addEventListener("change", () => {
        selectedModel = inp.value;
        customPrices = false;
        refresh();
      });
    });
  }

  function updateSliderLabels() {
    const rules = +$("#rules").value;
    const conn = +$("#connections").value;
    const ai = +$("#aiIntensity").value;
    $("#rulesLabel").textContent = RULES_LABELS[rules];
    $("#connLabel").textContent = conn === 0
      ? "Zéro connexion"
      : conn >= 10
        ? "10 connexions ou plus"
        : `${conn} connexion${conn > 1 ? "s" : ""}`;
    $("#aiLabel").textContent = AI_LABELS[ai];

    const descVal = ($("#appDesc").value || "");
    $("#descLen").textContent = descVal.length;
    const titlePrev = shortTitle(descVal);
    const analysisPrev = analyzeDescription(descVal);
    $("#descTitlePreview").textContent = descVal.trim().length >= 12
      ? `Nom retenu pour l’historique : « ${titlePrev} »`
      : "Écrivez ce que fait l’outil — un nom clair sera proposé automatiquement.";
    $("#descAnalysisHint").textContent = analysisPrev.thin
      ? analysisPrev.summary
      : `${analysisPrev.summary} Impact estimé : +${Math.round(analysisPrev.createBoost * 100)} % sur la création` +
        (analysisPrev.extraDays > 0 ? `, ≈ +${Math.round(analysisPrev.extraDays)} j·h liés au texte` : "") +
        (analysisPrev.usageMult !== 1 ? `, ×${analysisPrev.usageMult.toFixed(2)} sur l’usage IA` : "") + ".";

    const fin = +$("#finish").value;
    $$("#finishLabels span").forEach((span) => span.classList.toggle("active", +span.dataset.i === fin));
    $("#finishHint").textContent = FINISH_HINTS[fin];
    $("#marginVal").textContent = $("#margin").value + " %";
  }

  function setStep(n) {
    step = Math.max(0, Math.min(4, n));
    maxReached = Math.max(maxReached, step);
    $$(".panel").forEach((p) => p.classList.toggle("active", p.id === `panel-${step}`));
    document.body.classList.toggle("on-home", step === 0);
    const titles = ["Accueil", "Projet", "Création", "Usage IA", "Synthèse"];
    $("#stepLabel").textContent = titles[step];
    renderStepNav();
    refresh();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderStepNav() {
    const labels = ["Accueil", "1 Projet", "2 Création", "3 Usage", "4 Synthèse"];
    $("#stepNav").innerHTML = labels.map((label, i) => {
      const active = i === step;
      const done = i < step;
      const enabled = i <= maxReached || i === 0;
      return `<button type="button" class="step-dot ${active ? "active" : ""} ${done ? "done" : ""}" data-step="${i}" ${enabled ? "" : "disabled"}>${label}</button>`;
    }).join("");
    $$("#stepNav [data-step]").forEach((btn) => {
      btn.addEventListener("click", () => setStep(+btn.dataset.step));
    });
  }

  function renderRecaps(title, s, analysis) {
    const recapHtml =
      `<strong>${title}</strong> — ${RULES_LABELS[s.rules].toLowerCase()}, ` +
      `${s.connections} connexion${s.connections > 1 ? "s" : ""}, IA : ${AI_LABELS[s.aiIntensity].toLowerCase()}.` +
      (analysis.hits.length
        ? `<br><span style="font-size:0.85rem">D’après la description : ${analysis.hits.slice(0, 5).join(" · ")}</span>`
        : `<br><span style="font-size:0.85rem">Précisez davantage la description (étape 1) pour affiner le chiffrage.</span>`);
    $("#recapCreate").innerHTML = recapHtml;
    $("#recapUsage").innerHTML = recapHtml;
    $("#recapSynth").innerHTML = recapHtml;
  }

  function renderCreationPanel(s, c) {
    $("#createLo").textContent = fmt(c.lo) + " €";
    $("#createHi").textContent = fmt(c.hi) + " €";

    const laborLine = c.rate === 0
      ? scheduleRow("Main-d’œuvre (TJM 0 € — vous)", "0 €") +
        scheduleRow("Temps à prévoir", `${Math.round(c.dLo)}–${Math.round(c.dHi)} j·h`)
      : scheduleRow(
        "Main-d’œuvre (j·h × TJM)",
        `${fmt(c.laborLo)} – ${fmt(c.laborHi)} € <span style="font-weight:500;color:var(--muted)">(${Math.round(c.dLo)}–${Math.round(c.dHi)} j × ${fmt(c.rate)} €)</span>`
      );

    const toolsLine = c.toolsHi > 0
      ? scheduleRow("Outils IA de création", `${fmt(c.toolsLo)} – ${fmt(c.toolsHi)} €`) +
        `<p class="hint" style="margin:0.15rem 0 0.35rem">Inclut ${c.toolsNote} (ex. Cursor, ChatGPT, Claude) pendant ~${c.monthsLo}–${c.monthsHi} mois de build.</p>`
      : scheduleRow("Outils IA de création", "0 €");

    if (c.rate === 0 && c.toolsHi > 0) {
      $("#createDays").textContent =
        `TJM 0 €, mais outils IA de dev : ${fmt(c.toolsLo)}–${fmt(c.toolsHi)} € · ${Math.round(c.dLo)}–${Math.round(c.dHi)} j·h · ~${c.monthsLo}–${c.monthsHi} mois`;
      $("#createWhy").textContent =
        "Même sans prestataire, le développement assisté par IA implique des abonnements et crédits (Cursor, ChatGPT, Claude…). Ce poste est inclus dans le coût de création.";
    } else if (c.rate === 0) {
      $("#createDays").textContent =
        `Fait soi-même sans outils IA de dev facturés · ${Math.round(c.dLo)}–${Math.round(c.dHi)} j·h · ~${c.monthsLo}–${c.monthsHi} mois`;
      $("#createWhy").textContent =
        "TJM à 0 € et pas d’outils IA de développement facturés dans ce mode. Le temps de travail reste une charge réelle.";
    } else {
      $("#createDays").textContent =
        `${Math.round(c.dLo)}–${Math.round(c.dHi)} j·h × ${fmt(c.rate)} €/j` +
        (c.toolsHi > 0 ? ` + outils IA ${fmt(c.toolsLo)}–${fmt(c.toolsHi)} €` : "") +
        ` = ${fmt(c.lo)}–${fmt(c.hi)} € · ~${c.monthsLo}–${c.monthsHi} mois`;
      $("#createWhy").textContent = whyCreate(s, c) +
        (c.toolsHi > 0 ? " S’y ajoutent les outils IA utilisés pendant le build." : "");
    }

    $("#createSchedule").innerHTML =
      laborLine +
      toolsLine +
      scheduleRow("Budget total de création", `${fmt(c.lo)} – ${fmt(c.hi)} €`) +
      scheduleRow(`Réparti sur ~${c.monthsMid} mois`, `${fmt(c.perMonthLo)} – ${fmt(c.perMonthHi)} € / mois`);
  }

  function renderUsagePanel(s, u, g, usesAI) {
    $("#usageDisabled").style.display = usesAI ? "none" : "block";
    $("#usageFields").style.opacity = usesAI ? "1" : "0.5";
    $("#usageFields").style.pointerEvents = usesAI ? "auto" : "none";
    $("#growthHint").textContent = usesAI ? g.hint : "";

    if (!customPrices) {
      const mk = resolveModel(s, u.analysis);
      $("#priceIn").value = MODELS[mk].in;
      $("#priceOut").value = MODELS[mk].out;
    }

    const pin = +$("#priceIn").value;
    const pout = +$("#priceOut").value;
    const ex = ((2500 / 1e6) * pin + (1200 / 1e6) * pout) * EUR_USD;
    $("#priceExplain").textContent =
      `En pratique : avec ces tarifs, un échange de longueur moyenne coûte environ ${fmt(ex)} € (hors volume). ` +
      (customPrices
        ? "Vous avez personnalisé ces prix (tarif négocié ou autre fournisseur)."
        : "Ces valeurs suivent automatiquement le modèle choisi — pas besoin de les modifier.");

    if (!usesAI) {
      $("#usageLo").textContent = "0 €";
      $("#usageHi").textContent = "0 €";
      $("#usageUnit").textContent = "€ / mois";
      $("#usageSchedule").innerHTML = "";
      $("#usageWhy").textContent = whyUsage(s, u);
      $("#sensibility").innerHTML = "";
      $("#hiddenCosts").style.display = "none";
      $("#modelHint").textContent =
        "Revenez à l’étape 1 et augmentez le curseur « L’outil utilisera-t-il l’IA ? » pour activer ce calcul.";
      return;
    }

    $("#usageLo").textContent = fmtEuro(g.avgLo);
    $("#usageHi").textContent = fmtEuro(g.avgHi);
    $("#usageUnit").textContent = `€ / mois en moyenne · scénario ${g.label.toLowerCase()}`;
    $("#usageSchedule").innerHTML =
      scheduleRow("Mois 1 (démarrage)", `${fmt(g.m1.lo)} – ${fmt(g.m1.hi)} €`) +
      scheduleRow("Mois 6", `${fmt(g.m6.lo)} – ${fmt(g.m6.hi)} €`) +
      scheduleRow("Mois 12", `${fmt(g.m12.lo)} – ${fmt(g.m12.hi)} €`) +
      scheduleRow("Total sur 12 mois", `${fmt(g.yearLo)} – ${fmt(g.yearHi)} €`);

    $("#usageWhy").textContent =
      whyUsage(s, u) + ` Scénario ${g.label.toLowerCase()} : le volume évolue dans le temps, donc la facture aussi.`;

    const resolved = MODELS[resolveModel(s, u.analysis)];
    const lengthLabel = { short: "courts", medium: "moyens", long: "longs" }[s.length] || "moyens";
    $("#modelHint").textContent =
      (s.model === "auto"
        ? `Recommandé pour votre cas : ${resolved.label}. `
        : `Tarifs : ${u.model.in} / ${u.model.out} USD pour 1M tokens. `) +
      `Base mois 1 : ${s.users} utilisateurs × ${s.freq} usages × intensité IA ${Math.round(u.intensityFactor * 100)} % ≈ ${fmt(u.sessions)} appels, échanges ${lengthLabel}` +
      (s.rag ? ", avec documents. " : ". ") +
      `Puis croissance « ${g.label.toLowerCase()} » appliquée sur 12 mois.`;

    const max = Math.max(g.m12.mid, g.m1.mid, 0.01);
    $("#sensibility").innerHTML = `
      <div class="sens-row"><span>Mois 1</span><div class="sens-bar"><i style="width:${(g.m1.mid / max) * 100}%"></i></div><strong>${fmtEuro(g.m1.mid)}</strong></div>
      <div class="sens-row"><span>Mois 6</span><div class="sens-bar"><i style="width:${(g.m6.mid / max) * 100}%"></i></div><strong>${fmtEuro(g.m6.mid)}</strong></div>
      <div class="sens-row"><span>Mois 12</span><div class="sens-bar"><i style="width:100%"></i></div><strong>${fmtEuro(g.m12.mid)}</strong></div>
    `;
    $("#hiddenCosts").style.display = "block";
    $("#hiddenCosts").innerHTML =
      `<strong>Coûts cachés inclus (~${Math.round(u.hiddenPct * 100)} %)</strong> : ${u.hiddenParts.join(", ")}. Hors hébergement serveur classique.`;
  }

  function renderSynthesisKpis(c, g, usesAI) {
    $("#kpiCreate").textContent = fmtRange(c.lo, c.hi);
    $("#kpiCreateSub").textContent = c.rate === 0 && c.toolsHi > 0
      ? `Dont outils IA de dev ${fmt(c.toolsLo)}–${fmt(c.toolsHi)} € · ${Math.round(c.dLo)}–${Math.round(c.dHi)} j·h`
      : c.rate === 0
        ? `Fait soi-même · ${Math.round(c.dLo)}–${Math.round(c.dHi)} j·h à prévoir`
        : `TJM ${fmt(c.rate)} €/j` +
          (c.toolsHi > 0 ? ` + outils IA` : "") +
          ` · ~${fmt(c.perMonthLo)}–${fmt(c.perMonthHi)} €/mois sur ${c.monthsMid} mois`;
    $("#kpiOps").textContent = usesAI ? fmtRange(g.avgLo, g.avgHi) : "0 €";
    $("#kpiOpsSub").textContent = usesAI
      ? `Moyenne / mois sur 1 an · ${g.label.toLowerCase()} · total an 1 : ${fmt(g.yearLo)}–${fmt(g.yearHi)} €`
      : "Pas d’usage IA récurrent";
  }

  function renderMarket(s) {
    $("#marketList").innerHTML = inferMarket(s).map((m) => `
      <div class="market-item">
        <div><div class="name">${m.name}</div><div class="desc">${m.desc}</div></div>
        <div class="price">${m.price}</div>
      </div>
    `).join("");
  }

  function renderTips(s, u) {
    $("#tipsList").innerHTML = tipsFor(s, u).map((t) =>
      `<li><span class="tag">${t.tag}</span><span>${t.text}</span></li>`
    ).join("");
  }

  function renderCompare(s) {
    const modes = [
      { key: "nocode", title: "No-code" },
      { key: "ai", title: "Assisté IA" },
      { key: "classic", title: "Classique" }
    ];
    $("#compareGrid").innerHTML = modes.map((m) => {
      const c = creationCost(s, m.key);
      const selected = s.devMode === m.key;
      return `<div class="compare-card" style="${selected ? "border-color:var(--teal);background:var(--teal-soft)" : ""}">
        <h4>${m.title}${selected ? " ← choisi" : ""}</h4>
        <div class="val">${fmt(c.lo)} – ${fmt(c.hi)} €</div>
        <div class="sub">${Math.round(c.dLo)}–${Math.round(c.dHi)} j·h · ${fmt(c.rate)} €/j · ~${c.monthsMid} mois</div>
      </div>`;
    }).join("");
  }

  /** Graphique SVG : création étalée + cumul usage sur 12 mois */
  function drawChart(s, c, u) {
    const svg = $("#cumulChart");
    const W = 640, H = 240, pad = { t: 20, r: 20, b: 36, l: 52 };
    const factors = (GROWTH[s.growth] || GROWTH.realiste).monthly;
    const createMonths = c.monthsMid;
    const createPerMonth = c.mid / createMonths;
    const points = [];
    let cumulCreate = 0;
    let cumulOps = 0;

    for (let m = 1; m <= 12; m++) {
      if (m <= createMonths) cumulCreate += createPerMonth;
      else cumulCreate = c.mid;
      const monthUsage = s.aiIntensity > 0 ? u.mid * factors[m - 1] : 0;
      cumulOps += monthUsage;
      points.push({ m, total: cumulCreate + cumulOps, create: cumulCreate, opsOnly: cumulOps });
    }

    const maxY = Math.max(...points.map((p) => p.total), c.mid * 1.1, 1);
    const x = (m) => pad.l + ((m - 1) / 11) * (W - pad.l - pad.r);
    const y = (v) => pad.t + (1 - v / maxY) * (H - pad.t - pad.b);

    let pathTotal = "";
    let pathCreate = "";
    points.forEach((p, i) => {
      pathTotal += `${i ? "L" : "M"}${x(p.m).toFixed(1)},${y(p.total).toFixed(1)} `;
      pathCreate += `${i ? "L" : "M"}${x(p.m).toFixed(1)},${y(p.create).toFixed(1)} `;
    });

    let cross = null;
    for (const p of points) {
      if (p.opsOnly >= c.mid) { cross = p.m; break; }
    }

    const grid = [];
    for (let i = 0; i <= 4; i++) {
      const v = (maxY / 4) * i;
      const yy = y(v);
      grid.push(`<line x1="${pad.l}" y1="${yy}" x2="${W - pad.r}" y2="${yy}" stroke="#c9d4cc" stroke-width="1"/>`);
      grid.push(`<text x="${pad.l - 8}" y="${yy + 4}" text-anchor="end" font-size="11" fill="#6b7a72" font-family="Bricolage Grotesque,sans-serif">${fmt(v)}</text>`);
    }
    const xLabels = points.map((p) =>
      `<text x="${x(p.m)}" y="${H - 10}" text-anchor="middle" font-size="11" fill="#6b7a72" font-family="Bricolage Grotesque,sans-serif">M${p.m}</text>`
    ).join("");

    svg.innerHTML = `
      ${grid.join("")}
      <path d="${pathCreate}" fill="none" stroke="#c45c26" stroke-width="2" stroke-dasharray="6 4"/>
      <path d="${pathTotal}" fill="none" stroke="#1f6f5b" stroke-width="2.5" stroke-linejoin="round"/>
      ${points.map((p) => `<circle cx="${x(p.m)}" cy="${y(p.total)}" r="3.5" fill="#1f6f5b"/>`).join("")}
      ${cross ? `<line x1="${x(cross)}" y1="${pad.t}" x2="${x(cross)}" y2="${H - pad.b}" stroke="#a85b00" stroke-width="1.5" stroke-dasharray="3 3"/>` : ""}
      ${xLabels}
    `;

    if (s.aiIntensity === 0) {
      $("#crossHint").textContent = "Sans usage IA, le cumul suit surtout l’étalement de la création.";
    } else if (cross) {
      $("#crossHint").textContent = `Vers le mois ${cross}, le cumul d’usage dépasse le coût total de création.`;
    } else {
      $("#crossHint").textContent = "Sur 12 mois, l’usage reste sous le coût de création (avec ces hypothèses).";
    }
  }

  /** Point d’entrée du rendu : calcule une fois, puis met à jour chaque panneau. */
  function render() {
    updateSliderLabels();
    const s = readState();
    const title = shortTitle(s.appDesc);
    const c = creationCost(s);
    const u = usageCost(s);
    const g = growthSeries(s, u);
    const usesAI = s.aiIntensity > 0;
    const analysis = c.analysis;

    renderRecaps(title, s, analysis);
    renderCreationPanel(s, c);
    renderUsagePanel(s, u, g, usesAI);
    renderSynthesisKpis(c, g, usesAI);
    drawChart(s, c, u);
    renderMarket(s);
    renderTips(s, u);
    renderCompare(s);
  }

  /* ========================================================================
   * 8. Persistance, historique, partage, PDF
   * ======================================================================== */

  function encodeState(s) {
    try { return btoa(unescape(encodeURIComponent(JSON.stringify(s)))); }
    catch (e) { return ""; }
  }

  function decodeState(str) {
    try { return JSON.parse(decodeURIComponent(escape(atob(str)))); }
    catch (e) { return null; }
  }

  function applyState(s) {
    if (!s) return;
    if (s.appDesc != null) $("#appDesc").value = s.appDesc;
    if (s.rules != null) $("#rules").value = s.rules;
    if (s.connections != null) $("#connections").value = s.connections;
    if (s.aiIntensity != null) $("#aiIntensity").value = s.aiIntensity;
    if (s.devMode) setRadio("devMode", s.devMode);
    if (s.length) setRadio("length", s.length);
    if (s.rag != null) setRadio("rag", s.rag ? "yes" : "no");
    if (s.finish != null) $("#finish").value = s.finish;
    if (s.model) selectedModel = s.model;
    if (s.users) $("#users").value = s.users;
    if (s.freq) $("#freq").value = s.freq;
    if (s.growth && GROWTH[s.growth]) growthKey = s.growth;
    if (s.priceIn != null) $("#priceIn").value = s.priceIn;
    if (s.priceOut != null) $("#priceOut").value = s.priceOut;
    if (s.customPrices) customPrices = true;
    if (s.margin != null) $("#margin").value = Math.round(s.margin * 100);
    if (s.dayRate != null && s.dayRate !== "") {
      const el = document.getElementById("dayRate");
      if (el) el.value = s.dayRate;
      dayRateTouched = true;
    }
    if (s.step != null) step = s.step;
    if (s.maxReached != null) maxReached = s.maxReached;
    $$("#growthTabs button").forEach((b) => b.classList.toggle("active", b.dataset.g === growthKey));
    renderModelChoices();
  }

  function saveHistory() {
    const s = readState();
    const c = creationCost(s);
    const u = usageCost(s);
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleString("fr-FR"),
      name: shortTitle(s.appDesc),
      create: [c.lo, c.hi],
      ops: [u.lo, u.hi],
      state: Object.assign({}, s, { model: selectedModel, customPrices, growth: growthKey })
    };
    const hist = JSON.parse(localStorage.getItem(HIST_KEY) || "[]");
    hist.unshift(entry);
    localStorage.setItem(HIST_KEY, JSON.stringify(hist.slice(0, 12)));
    renderHistory();
  }

  function renderHistory() {
    const hist = JSON.parse(localStorage.getItem(HIST_KEY) || "[]");
    const box = $("#historyList");
    if (!hist.length) {
      box.innerHTML = `<p class="hint">Aucune version sauvegardée pour l’instant.</p>`;
      return;
    }
    box.innerHTML = hist.map((h) => `
      <div class="history-item">
        <div><strong>${h.name}</strong><br><span style="color:var(--muted);font-size:0.8rem">${h.date} · création ${fmt(h.create[0])}–${fmt(h.create[1])} € · ops ${fmt(h.ops[0])}–${fmt(h.ops[1])} €</span></div>
        <button type="button" class="btn-secondary" data-load="${h.id}">Charger</button>
        <button type="button" class="btn-ghost" data-del="${h.id}">Suppr.</button>
      </div>
    `).join("");
    box.querySelectorAll("[data-load]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = hist.find((x) => x.id === +btn.dataset.load);
        if (item) {
          applyState(item.state);
          setStep(4);
        }
      });
    });
    box.querySelectorAll("[data-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = hist.filter((x) => x.id !== +btn.dataset.del);
        localStorage.setItem(HIST_KEY, JSON.stringify(next));
        renderHistory();
      });
    });
  }

  function buildPrintReport() {
    const s = readState();
    const title = shortTitle(s.appDesc);
    const c = creationCost(s);
    const u = usageCost(s);
    const g = growthSeries(s, u);
    const usesAI = s.aiIntensity > 0;
    const model = MODELS[resolveModel(s, u.analysis)];
    const lengthLabel = { short: "Court", medium: "Moyen", long: "Long" }[s.length] || "Moyen";
    const modeLabel = { nocode: "No-code / low-code", ai: "Développement assisté par IA", classic: "Développement classique" }[s.devMode];
    const finishLabel = ["MVP", "Production", "Production + maintenance an 1"][s.finish];
    const market = inferMarket(s);
    const tips = tipsFor(s, u);
    const date = new Date().toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
    const chartHtml = $("#cumulChart") ? $("#cumulChart").outerHTML : "";

    $("#printReport").innerHTML = `
      <header class="pr-header">
        <div>
          <div class="pr-brand">Coûts<span>IA</span></div>
          <div class="pr-title">${escapeHtml(title)}</div>
        </div>
        <div class="pr-meta">
          Estimation générée le ${escapeHtml(date)}<br>
          Document à usage indicatif
        </div>
      </header>

      ${s.appDesc.trim() ? `<p class="pr-desc">${escapeHtml(s.appDesc.trim())}</p>` : ""}

      <div class="pr-kpis">
        <div class="pr-kpi once">
          <div class="lbl">Coût de création</div>
          <div class="val">${fmtRange(c.lo, c.hi)}</div>
          <div class="sub">Total · ~${fmt(c.perMonthLo)}–${fmt(c.perMonthHi)} €/mois sur ${c.monthsMid} mois</div>
        </div>
        <div class="pr-kpi ops">
          <div class="lbl">Coût d’exploitation IA</div>
          <div class="val">${usesAI ? fmtRange(g.avgLo, g.avgHi) : "0 €"}</div>
          <div class="sub">${usesAI ? `Moyenne / mois · scénario ${g.label.toLowerCase()} · an 1 : ${fmt(g.yearLo)}–${fmt(g.yearHi)} €` : "Pas d’usage IA récurrent"}</div>
        </div>
      </div>

      <div class="pr-box warn">
        <strong>À prévoir en plus — non chiffré ici.</strong>
        Hébergement, nom de domaine, stockage, base de données, e-mails transactionnels, monitoring, etc.
        Ces coûts annexes d’exploitation ne sont pas évalués dans cette estimation.
      </div>

      <section class="pr-section">
        <h2>1 · Hypothèses projet</h2>
        <div class="pr-grid">
          <div class="pr-row"><span class="k">Logique métier</span><span class="v">${escapeHtml(RULES_LABELS[s.rules])}</span></div>
          <div class="pr-row"><span class="k">Connexions</span><span class="v">${s.connections >= 10 ? "10 ou plus" : s.connections}</span></div>
          <div class="pr-row"><span class="k">Rôle de l’IA</span><span class="v">${escapeHtml(AI_LABELS[s.aiIntensity])}</span></div>
          <div class="pr-row"><span class="k">Documents (RAG)</span><span class="v">${s.rag || c.analysis.ragSignal ? "Oui" : "Non"}</span></div>
        </div>
        ${c.analysis.hits.length ? `<p class="pr-note">Signaux lus dans la description : ${escapeHtml(c.analysis.hits.join(" · "))}</p>` : ""}
      </section>

      <section class="pr-section">
        <h2>2 · Hypothèses de création</h2>
        <div class="pr-grid">
          <div class="pr-row"><span class="k">Mode de développement</span><span class="v">${escapeHtml(modeLabel)}</span></div>
          <div class="pr-row"><span class="k">Niveau de finition</span><span class="v">${escapeHtml(finishLabel)}</span></div>
          <div class="pr-row"><span class="k">Charge estimée</span><span class="v">${Math.round(c.dLo)}–${Math.round(c.dHi)} jours-homme</span></div>
          <div class="pr-row"><span class="k">Durée calendaire</span><span class="v">${c.monthsLo}–${c.monthsHi} mois</span></div>
          <div class="pr-row"><span class="k">Taux journalier</span><span class="v">${c.rate === 0 ? "0 € / jour (fait soi-même)" : `${fmt(c.rate)} € / jour`}</span></div>
          <div class="pr-row"><span class="k">Main-d’œuvre</span><span class="v">${fmt(c.laborLo)} – ${fmt(c.laborHi)} €</span></div>
          <div class="pr-row"><span class="k">Outils IA de création</span><span class="v">${c.toolsHi > 0 ? `${fmt(c.toolsLo)} – ${fmt(c.toolsHi)} €` : "0 €"}</span></div>
          <div class="pr-row"><span class="k">Budget total</span><span class="v">${fmtRange(c.lo, c.hi)}</span></div>
        </div>
        <p class="pr-note">${c.toolsHi > 0
          ? `Dont ${escapeHtml(c.toolsNote)} pendant le build — même avec un TJM à 0 €.`
          : escapeHtml(whyCreate(s, c))}</p>
      </section>

      <section class="pr-section">
        <h2>3 · Hypothèses d’usage IA</h2>
        ${usesAI ? `
          <div class="pr-grid">
            <div class="pr-row"><span class="k">Modèle</span><span class="v">${escapeHtml(model.label)}${s.model === "auto" ? " (recommandé)" : ""}</span></div>
            <div class="pr-row"><span class="k">Utilisateurs au démarrage</span><span class="v">${s.users} / mois</span></div>
            <div class="pr-row"><span class="k">Usages par personne</span><span class="v">${s.freq} / mois</span></div>
            <div class="pr-row"><span class="k">Longueur des échanges</span><span class="v">${lengthLabel}</span></div>
            <div class="pr-row"><span class="k">Scénario de croissance</span><span class="v">${escapeHtml(g.label)} — ${escapeHtml(g.hint)}</span></div>
            <div class="pr-row"><span class="k">Appels estimés (mois 1)</span><span class="v">≈ ${fmt(u.sessions)}</span></div>
          </div>
          <div class="pr-grid" style="margin-top:0.35rem">
            <div class="pr-row"><span class="k">Coût mois 1</span><span class="v">${fmt(g.m1.lo)} – ${fmt(g.m1.hi)} €</span></div>
            <div class="pr-row"><span class="k">Coût mois 6</span><span class="v">${fmt(g.m6.lo)} – ${fmt(g.m6.hi)} €</span></div>
            <div class="pr-row"><span class="k">Coût mois 12</span><span class="v">${fmt(g.m12.lo)} – ${fmt(g.m12.hi)} €</span></div>
            <div class="pr-row"><span class="k">Total année 1</span><span class="v">${fmt(g.yearLo)} – ${fmt(g.yearHi)} €</span></div>
          </div>
          <p class="pr-note">${escapeHtml(whyUsage(s, u))}</p>
        ` : `
          <p class="pr-note">L’IA n’est pas utilisée de façon récurrente dans ces hypothèses — coût d’usage ≈ 0 €.</p>
        `}
      </section>

      <section class="pr-section">
        <h2>4 · Synthèse sur 12 mois</h2>
        <div class="pr-chart">${chartHtml}</div>
        <p class="pr-note">${escapeHtml($("#crossHint") ? $("#crossHint").textContent : "")}</p>
      </section>

      <section class="pr-section">
        <h2>Alternatives du marché (build vs buy)</h2>
        <div class="pr-grid">
          ${market.map((m) => `
            <div class="pr-row">
              <span class="k">${escapeHtml(m.name)}</span>
              <span class="v">${escapeHtml(m.desc)} — ${escapeHtml(m.price)}</span>
            </div>
          `).join("")}
        </div>
      </section>

      <section class="pr-section">
        <h2>Pistes pour réduire la facture</h2>
        <ul class="pr-tips">
          ${tips.map((t) => `<li><strong>${escapeHtml(t.tag)} :</strong> ${escapeHtml(t.text)}</li>`).join("")}
        </ul>
      </section>

      <footer class="pr-footer">
        Ordres de grandeur indicatifs — ce document n’est pas un devis.
        Les prix des modèles IA évoluent rapidement. · CoûtsIA · natacha-aviat.github.io
      </footer>
    `;
  }

  function exportPdf() {
    buildPrintReport();
    requestAnimationFrame(() => {
      setTimeout(() => window.print(), 50);
    });
  }

  /* ========================================================================
   * 9. Événements & démarrage
   * ======================================================================== */

  document.addEventListener("input", (e) => {
    if (!e.target) return;
    if (e.target.id === "priceIn" || e.target.id === "priceOut") customPrices = true;
    if (e.target.id === "dayRate") dayRateTouched = true;
    refresh();
  });

  document.addEventListener("change", (e) => {
    if (!e.target) return;
    if (e.target.name === "model") {
      selectedModel = e.target.value;
      customPrices = false;
    }
    if (e.target.id === "dayRate") dayRateTouched = true;
    // TJM suggéré selon le mode, seulement si pas encore choisi à la main
    if (e.target.name === "devMode" && !dayRateTouched) {
      const el = document.getElementById("dayRate");
      if (el) el.value = DAY_RATE_DEFAULT[e.target.value] || DEFAULT_TJM;
    }
    refresh();
  });

  $$("[data-tjm]").forEach((btn) => {
    btn.addEventListener("click", () => {
      dayRateTouched = true;
      const el = document.getElementById("dayRate");
      if (el) el.value = btn.dataset.tjm;
      refresh();
      const panel = $("#creationResult");
      if (panel) {
        panel.style.outline = "2px solid var(--teal)";
        setTimeout(() => { panel.style.outline = ""; }, 500);
      }
    });
  });

  $$("#growthTabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      growthKey = btn.dataset.g;
      $$("#growthTabs button").forEach((b) => b.classList.toggle("active", b === btn));
      refresh();
    });
  });

  $("#btnStart").addEventListener("click", () => setStep(1));
  $$("[data-next]").forEach((btn) => btn.addEventListener("click", () => { persist(); setStep(step + 1); }));
  $$("[data-prev]").forEach((btn) => btn.addEventListener("click", () => setStep(step - 1)));
  $$("[data-goto]").forEach((btn) => btn.addEventListener("click", () => setStep(+btn.dataset.goto)));

  $("#btnPdf").addEventListener("click", exportPdf);
  window.addEventListener("beforeprint", buildPrintReport);

  $("#btnShare").addEventListener("click", () => {
    const s = Object.assign({}, readState(), {
      model: selectedModel, customPrices, growth: growthKey, step, maxReached
    });
    const hash = encodeState(s);
    $("#shareUrl").value = `${location.origin}${location.pathname}#${hash}`;
    $("#shareBox").classList.add("show");
    history.replaceState(null, "", `#${hash}`);
  });

  $("#btnCopy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText($("#shareUrl").value);
      $("#btnCopy").textContent = "Copié !";
      setTimeout(() => { $("#btnCopy").textContent = "Copier"; }, 1500);
    } catch (e) {
      $("#shareUrl").select();
    }
  });

  $("#btnSave").addEventListener("click", () => {
    saveHistory();
    $("#historyList").scrollIntoView({ behavior: "smooth", block: "nearest" });
    $("#btnSave").textContent = "Version sauvée";
    setTimeout(() => { $("#btnSave").textContent = "Sauver cette version"; }, 1600);
  });

  // Démarrage : lien partagé (#…) prioritaire, sinon dernière session locale
  renderModelChoices();

  let boot = null;
  if (location.hash.length > 1) boot = decodeState(location.hash.slice(1));
  if (!boot) {
    try { boot = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); }
    catch (e) { boot = null; }
  }
  if (boot) {
    applyState(boot);
    if (boot.step != null) step = boot.step;
    if (boot.maxReached != null) maxReached = boot.maxReached;
  }

  renderStepNav();
  renderHistory();
  setStep(step || 0);
})();
