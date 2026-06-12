#!/usr/bin/env bash
# Regénère js/contrat.bundle.js (page contrat sans modules ES — compatible file:// et GitHub Pages).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
npx --yes esbuild js/contrat-page.js \
  --bundle \
  --format=iife \
  --outfile=js/contrat.bundle.js \
  --platform=browser
echo "OK → js/contrat.bundle.js"
