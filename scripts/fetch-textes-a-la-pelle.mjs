#!/usr/bin/env node

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_URL = "https://textes-a-la-pelle.fr/";
const OUTPUT = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "textes-a-la-pelle.json");

function decodeHtml(value) {
  return value
    .replace(/&ensp;|&#8239;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\u202f/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseRelativeDate(text, referenceDate = new Date()) {
  const match = text.match(/il y a (\d+) (heure|jour|mois)/);
  if (!match) {
    return null;
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const dayMs = 24 * 60 * 60 * 1000;
  let offsetMs = 0;

  if (unit === "heure") {
    offsetMs = amount * 60 * 60 * 1000;
  } else if (unit === "jour") {
    offsetMs = amount * dayMs;
  } else {
    offsetMs = amount * 30 * dayMs;
  }

  return new Date(referenceDate.getTime() - offsetMs).toISOString();
}

function parseDeadlineDate(text) {
  const match = text.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))).toISOString();
}

const FEE_FILTER_LABELS = {
  fee_free: "gratuit (0 €)",
  fee_variable: "variable (0 € – X €)",
  fee_1_10: "1 € à 10 €",
  fee_11_20: "11 € à 20 €",
  fee_21_plus: "21 € et plus",
};

function classifyFee(feeText) {
  const rangeMatch = feeText.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (rangeMatch) {
    const min = Number(rangeMatch[1]);
    const max = Number(rangeMatch[2]);
    if (max === 0) {
      return "fee_free";
    }
    if (min === 0) {
      return "fee_variable";
    }
    if (max <= 10) {
      return "fee_1_10";
    }
    if (max <= 20) {
      return "fee_11_20";
    }
    return "fee_21_plus";
  }

  const singleMatch = feeText.match(/(\d+)/);
  if (!singleMatch) {
    return "unknown";
  }

  const amount = Number(singleMatch[1]);
  if (amount === 0) {
    return "fee_free";
  }
  if (amount <= 10) {
    return "fee_1_10";
  }
  if (amount <= 20) {
    return "fee_11_20";
  }
  return "fee_21_plus";
}

function buildFeeFilterOptions(announcements) {
  const counts = new Map();

  for (const item of announcements) {
    const category = item.feeCategory;
    if (!category || category === "unknown") {
      continue;
    }
    counts.set(category, (counts.get(category) || 0) + 1);
  }

  return Object.keys(FEE_FILTER_LABELS)
    .filter((value) => counts.has(value))
    .map((value) => ({
      value,
      label: `${FEE_FILTER_LABELS[value]} (${counts.get(value)})`,
    }));
}

const AUDIENCE_FILTER_LABELS = {
  audience_all: "Tous",
  audience_under_18: "Moins de 18 ans",
  audience_minors_and_up: "Mineurs (à partir de X ans)",
  audience_mixed_age: "Jeunes et adultes",
  audience_18_plus: "18 ans et plus",
  audience_young_adult: "Jeunes adultes (âge maximum)",
  audience_geographic: "Résidents (critère géographique)",
  audience_professional: "Auteurs / professionnels",
  audience_specific: "Public spécifique",
  audience_unknown: "Non précisé",
};

function classifyAudience(audienceText) {
  if (!audienceText || !audienceText.trim()) {
    return "audience_unknown";
  }

  const text = audienceText.trim();
  const normalized = text.toLowerCase();

  if (/résident|resident|francophonie|département|belgique|morbinhan|alsace|champagne|hauts-de-france|nouvelle.aquitaine|ile-de-france|france métropolitaine|métropolitaine/i.test(text)) {
    return "audience_geographic";
  }

  if (/professionnel|artiste|écrivain|auteur|publié|jamais publié|débutants ou confirmés|imaginaire|bédéistes|illustrateurs|étudiant/i.test(text)) {
    return "audience_professional";
  }

  if (/femmes|identifient en tant que/i.test(text)) {
    return "audience_specific";
  }

  if (/^tous\b/i.test(normalized) || /^tous,/i.test(normalized) || normalized.includes("tout public") || normalized.includes("pour tout public")) {
    return "audience_all";
  }

  const rangeMatch = text.match(/(\d+)\s*[-–]\s*(\d+)\s*ans/i);
  if (rangeMatch) {
    const min = Number(rangeMatch[1]);
    const max = Number(rangeMatch[2]);
    if (max <= 17) {
      return "audience_under_18";
    }
    if (min >= 18) {
      return "audience_18_plus";
    }
    return "audience_mixed_age";
  }

  const maxMatch = text.match(/(\d+)\s*ans\s*maximum/i);
  if (maxMatch) {
    const max = Number(maxMatch[1]);
    if (max < 18) {
      return "audience_under_18";
    }
    return "audience_young_adult";
  }

  const minMatch = text.match(/(\d+)\s*ans\s*minim/i);
  if (minMatch) {
    const min = Number(minMatch[1]);
    if (min >= 18) {
      return "audience_18_plus";
    }
    return "audience_minors_and_up";
  }

  return "audience_other";
}

function buildAudienceFilterOptions(announcements) {
  const counts = new Map();

  for (const item of announcements) {
    const category = item.audienceCategory;
    if (!category || category === "audience_other") {
      continue;
    }
    counts.set(category, (counts.get(category) || 0) + 1);
  }

  return Object.keys(AUDIENCE_FILTER_LABELS)
    .filter((value) => counts.has(value))
    .map((value) => ({
      value,
      label: `${AUDIENCE_FILTER_LABELS[value]} (${counts.get(value)})`,
    }));
}

function parseFilterOptions(html) {
  const selectMatch = html.match(/id="filter-selector"[^>]*>([\s\S]*?)<\/select>/);
  if (!selectMatch) {
    return [];
  }

  const selectHtml = selectMatch[1];
  const options = [];
  let currentGroup = "";

  const tokens = selectHtml.split(/(<optgroup[^>]*>|<\/optgroup>)/);
  for (const token of tokens) {
    const groupMatch = token.match(/<optgroup[^>]*label="([^"]*)"/);
    if (groupMatch) {
      currentGroup = decodeHtml(groupMatch[1]);
      continue;
    }
    if (token === "</optgroup>") {
      currentGroup = "";
      continue;
    }

    for (const optionMatch of token.matchAll(/<option[^>]*value="([^"]*)"[^>]*>([\s\S]*?)<\/option>/g)) {
      options.push({
        group: currentGroup,
        value: optionMatch[1],
        label: decodeHtml(optionMatch[2]),
      });
    }
  }

  return options;
}

function parseAnnouncements(html, referenceDate) {
  const articles = [...html.matchAll(/<article[^>]*data-id="(\d+)"[^>]*>([\s\S]*?)<\/article>/g)];

  return articles.map(([, id, body]) => {
    const fields = {};
    for (const paragraph of body.matchAll(/<p class="mv0">([\s\S]*?)<\/p>/g)) {
      const paragraphHtml = paragraph[1];
      const labelMatch = paragraphHtml.match(/<span class="o-80">([^<]+)<\/span>&ensp;([\s\S]*)/);
      if (!labelMatch) {
        continue;
      }
      const label = decodeHtml(labelMatch[1]).replace(/[\s:\u202f]+$/g, "");
      fields[label] = decodeHtml(labelMatch[2]);
    }

    const publisherMatch = body.match(/<h2 class="publisher[^"]*"[^>]*>([\s\S]*?)<\/h2>/);
    const titleMatch = body.match(/<h3 class="[^"]*"[^>]*>([\s\S]*?)<\/h3>/);
    const linkMatch = body.match(/<a class="dib navy" href="([^"]+)"/);
    const imageMatch = body.match(/data-src="([^"]+)"/);

    const tags = [...body.matchAll(/href="\/\?filter=([^&"]+)/g)].map((match) =>
      decodeURIComponent(match[1]),
    );

    const added = fields["Ajouté"] || "";
    const deadline = fields["Envois jusqu'au"] || "";
    const fee = fields["Frais d'inscription"] || "";
    const audience = fields.Public || "";

    return {
      id,
      publisher: decodeHtml(publisherMatch?.[1] || ""),
      title: decodeHtml(titleMatch?.[1] || ""),
      url: linkMatch?.[1] || "",
      image: imageMatch?.[1] || "",
      tags,
      added,
      addedAt: parseRelativeDate(added, referenceDate),
      deadline,
      deadlineAt: parseDeadlineDate(deadline),
      audience,
      audienceCategory: classifyAudience(audience),
      fee,
      feeCategory: classifyFee(fee),
      theme: fields["Thème"] || "",
      length: fields.Longueur || "",
      reward: fields.Gratification || "",
    };
  });
}

const response = await fetch(SOURCE_URL, {
  headers: { "User-Agent": "natacha-aviat.github.io-data-sync/1.0" },
});

if (!response.ok) {
  throw new Error(`HTTP ${response.status} en récupérant ${SOURCE_URL}`);
}

const html = await response.text();
if (!html.includes('data-id="')) {
  throw new Error("Réponse HTML invalide");
}

const payload = {
  updatedAt: new Date().toISOString(),
  source: SOURCE_URL,
  filterOptions: parseFilterOptions(html),
  announcements: parseAnnouncements(html, new Date()),
};
payload.feeFilterOptions = buildFeeFilterOptions(payload.announcements);
payload.audienceFilterOptions = buildAudienceFilterOptions(payload.announcements);

writeFileSync(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Écrit ${payload.announcements.length} annonces dans ${OUTPUT}`);
