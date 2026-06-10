# Prototype Next.js — tunnel contrat IDEL

Version **React / Next.js** du parcours Au Clair (optionnelle). La **maquette officielle** est le site statique à la racine de `MedLex/` (`index.html` + `parcours/*.html`). Voir `../README.md`.

## Site statique (référence)

```
MedLex/
  index.html
  css/site.css, css/parcours.css
  js/nav.js, js/questionnaire.js
  parcours/*.html
```

## Lancer ce prototype

État en mémoire (`useReducer`), pas d'auth ni paiement réels.

```bash
cd MedLex/prototype-nextjs
npm install
npm run dev
```

Styles source : `src/app/globals.css` (classes `ac-*`, alignées sur `../css/parcours.css`).

Questionnaire : **13 étapes**, aligné sur `../parcours/questionnaire.html` (mêmes champs que l’ancien `questionnaire-remplacement.html`).

