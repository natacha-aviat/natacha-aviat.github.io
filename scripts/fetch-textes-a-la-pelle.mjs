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
      audience: fields.Public || "",
      fee: fields["Frais d'inscription"] || "",
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

writeFileSync(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Écrit ${payload.announcements.length} annonces dans ${OUTPUT}`);
