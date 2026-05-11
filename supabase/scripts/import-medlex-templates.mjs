#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const medlexDir = path.join(repoRoot, 'MedLex');

const SUPABASE_URL = process.env.SUPABASE_URL;
/** Clé qui bypass RLS (dashboard : « Secret » / legacy JWT `service_role`). */
const ADMIN_API_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SECRET_SERVICE_ROLE_KEY;
const anonLike =
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!ADMIN_API_KEY && anonLike) {
  console.error(
    [
      'Tu as défini une clé publishable (`anon`).',
      "Pour cet import (UPSERT avec RLS sur `document_templates`), il faut la clé **secrète**",
      '(Settings → API : « Secret API key », ou ancien JWT avec rôle `service_role`).',
      'La publishable suffit uniquement après avoir ajouté des policies INSERT très ouvertes,',
      "ce qui n'est en général pas souhaitable pour ces templates.",
    ].join('\n')
  );
  process.exit(1);
}

if (!SUPABASE_URL || !ADMIN_API_KEY) {
  console.error(
    [
      'Variables requises manquantes.',
      'Définis :',
      '- SUPABASE_URL (ex: https://<project-ref>.supabase.co, voir le dashboard)',
      '- Une clé **secrète** (backend uniquement), par ex. une de ces variables :',
      '  SUPABASE_SERVICE_ROLE_KEY, SUPABASE_SECRET_KEY, SUPABASE_SECRET_SERVICE_ROLE_KEY',
      '(Supabase → Project Settings → API ; la même valeur que legacy « service_role ».)',
    ].join('\n')
  );
  process.exit(1);
}

const DEFAULT_PARCOURS = 'remplacement_infirmiers';

const templates = [
  {
    slug: 'questionnaire_v1_contrat_remplacement',
    title: 'Questionnaire V1 contrat de remplacement',
    version: 'v1',
    parcours_slug: DEFAULT_PARCOURS,
    template_kind: 'questionnaire',
    file: path.join(medlexDir, 'questionnaire V1 contrat de remplacement.md'),
  },
  {
    slug: 'contrat_remplacement_infirmiers_v1',
    title: 'Contrat de remplacement Infirmiers V1',
    version: 'v1',
    parcours_slug: DEFAULT_PARCOURS,
    template_kind: 'contrat',
    file: path.join(medlexDir, 'Contrat de remplacement Infirmiers V1.md'),
  },
];

async function readTemplates() {
  const result = [];
  for (const tpl of templates) {
    const content = await fs.readFile(tpl.file, 'utf8');
    result.push({
      slug: tpl.slug,
      title: tpl.title,
      version: tpl.version,
      parcours_slug: tpl.parcours_slug,
      template_kind: tpl.template_kind,
      content_markdown: content,
    });
  }
  return result;
}

async function upsertTemplates(rows) {
  const url = new URL('/rest/v1/document_templates', SUPABASE_URL);
  url.searchParams.set('on_conflict', 'slug');

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: ADMIN_API_KEY,
      Authorization: `Bearer ${ADMIN_API_KEY}`,
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(rows),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur import Supabase (${response.status}): ${errorText}`);
  }

  return response.json();
}

async function main() {
  const rows = await readTemplates();
  const inserted = await upsertTemplates(rows);
  console.log(`Import terminé. ${inserted.length} template(s) upserté(s).`);
  for (const row of inserted) {
    console.log(`- ${row.slug} (${row.version})`);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
