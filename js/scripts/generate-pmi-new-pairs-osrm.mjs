#!/usr/bin/env node
/**
 * Durées trajet PMI ↔ nouvelles PMI (via OSRM, comme le catalogue CSV d’origine).
 * Usage : node scripts/generate-pmi-new-pairs-osrm.mjs [id…] > /tmp/pmi-new-lines.txt 2>/tmp/osrm.log
 * Exemple : node scripts/generate-pmi-new-pairs-osrm.mjs 201 202 203 204
 */

import fs from 'fs';
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PMI_ADDR_FILE = join(ROOT, 'pmi_addresses.js');

const NEW_IDS = process.argv.slice(2).map(Number).filter((n) => !Number.isNaN(n));
const DEPOT_ID = 197;
/** Dernier id du catalogue CSV d’origine (avant ajouts manuels) */
const CATALOG_MAX_ID = 196;

const MAMAMA_COORDS = { lat: 48.90355834151138, lng: 2.378094237324154 };

const CONCURRENCY = 6;

function loadPmiAddresses() {
  const code = fs.readFileSync(PMI_ADDR_FILE, 'utf8');
  const fn = new Function(`${code}; return PMI_ADDRESSES;`);
  return fn();
}

function fetchOsrmDrivingMinutes(lng1, lat1, lng2, lat2) {
  const url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=false`;
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            const j = JSON.parse(data);
            if (!j.routes?.[0]) reject(new Error('OSRM sans route'));
            else resolve(j.routes[0].duration / 60);
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

async function symmDuration(coordsById, a, b) {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const p1 = coordsById[lo];
  const p2 = coordsById[hi];
  return fetchOsrmDrivingMinutes(p1.lng, p1.lat, p2.lng, p2.lat);
}

async function main() {
  const PMI_ADDRESSES = loadPmiAddresses();
  const coordsById = {};
  for (const p of PMI_ADDRESSES) coordsById[p.id] = { lat: p.lat, lng: p.lng };
  coordsById[DEPOT_ID] = MAMAMA_COORDS;

  if (NEW_IDS.length === 0) {
    console.error('Usage: node scripts/generate-pmi-new-pairs-osrm.mjs <id> [id…]');
    process.exit(1);
  }

  for (const id of NEW_IDS) {
    if (!coordsById[id]) {
      console.error(`Id ${id} manquant`);
      process.exit(1);
    }
  }

  /** Socle : catalogue 0–196, dépôt 197, puis PMI déjà ajoutées manuellement */
  const previouslyAdded = PMI_ADDRESSES.map((p) => p.id).filter(
    (id) => id > CATALOG_MAX_ID && !NEW_IDS.includes(id) && id !== DEPOT_ID
  );
  const oldSide = [
    ...Array.from({ length: CATALOG_MAX_ID + 1 }, (_, i) => i),
    DEPOT_ID,
    ...previouslyAdded.sort((a, b) => a - b),
  ];
  /** @type {{ pairs: () => Promise<[string,string]>, label: string }[]} */
  const work = [];

  for (let i = 0; i < NEW_IDS.length; i++) {
    const nid = NEW_IDS[i];
    for (const other of oldSide) {
      work.push({
        label: `${nid}↔${other}`,
        pairs: async () => {
          const mins = await symmDuration(coordsById, nid, other);
          return [`  "${nid}|${other}": ${mins},`, `  "${other}|${nid}": ${mins},`];
        },
      });
    }
    for (let j = i + 1; j < NEW_IDS.length; j++) {
      const m = NEW_IDS[j];
      work.push({
        label: `${nid}↔${m}`,
        pairs: async () => {
          const mins = await symmDuration(coordsById, nid, m);
          return [`  "${nid}|${m}": ${mins},`, `  "${m}|${nid}": ${mins},`];
        },
      });
    }
  }

  for (let offset = 0; offset < work.length; offset += CONCURRENCY) {
    const batch = work.slice(offset, offset + CONCURRENCY);
    const results = await Promise.all(batch.map((w, k) => w.pairs()));
    batch.forEach((w, k) =>
      console.error(`OK (${offset + k + 1}/${work.length}) ${w.label}`)
    );
    for (const pairLines of results) {
      console.log(pairLines[0]);
      console.log(pairLines[1]);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
