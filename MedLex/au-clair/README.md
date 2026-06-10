# Au Clair — prototype Next.js (optionnel)

La **maquette officielle** est le site statique à la racine de `MedLex/` (`index.html` + `parcours/*.html`). Voir `../README.md`.

## Site statique

```
MedLex/
  index.html
  css/site.css, css/parcours.css
  js/nav.js, js/questionnaire.js
  parcours/*.html
  tunnel/          ← redirections (npm run sync:redirects)
```

## Next.js (développement)

État en mémoire (`useReducer`), pas d'auth ni paiement réels.

```bash
cd MedLex/au-clair
npm install
npm run dev
```

Styles source : `src/app/globals.css` (classes `ac-*`, alignées sur `../css/parcours.css`).

## Redirections tunnel/

Pour régénérer les fichiers légers dans `MedLex/tunnel/` (anciennes URLs) :

```bash
npm run sync:redirects
```

Ne plus utiliser l'export Next.js complet dans `tunnel/` — préférer `parcours/*.html`.
