# Au Clair — maquette contrat IDEL

## Site statique (GitHub Pages, sans serveur)

Structure principale pour la démo :

```
MedLex/
  index.html          ← landing (ex index-6)
  css/site.css        ← styles landing
  css/parcours.css    ← styles tunnel (classes ac-*)
  js/nav.js           ← menu mobile landing
  js/questionnaire.js ← questionnaire en 5 étapes
  parcours/
    email.html
    verification-email.html
    lien-expire.html
    questionnaire.html
    apercu.html
    invitation.html
    invitation-attente.html
    paiement.html
    paiement-rembourse.html
    signature.html
    signature-terminee.html
    tableau-de-bord.html
```

Ouvrir `MedLex/index.html` dans le navigateur ou publier le dossier `MedLex/` sur GitHub Pages (`…/MedLex/`).

Tous les liens sont **relatifs** — aucun serveur requis. La barre **« Maquette — simuler »** en bas permet d’avancer les cas limites (lien expiré, validation tiers, remboursement, etc.).

## Prototype Next.js (optionnel)

Next.js (App Router) + React dans `au-clair/`. **Aucune** auth, paiement ou email réels — état en mémoire (`useReducer`).

```bash
cd MedLex/au-clair
npm install
npm run dev
```

Le dossier `tunnel/` est un ancien export Next.js statique ; préférer `parcours/*.html` pour la maquette légère.

## Charte

Identique à `index-6.html` : Inter, teal `#0FA3A3`, encre `#16314D`, mobile-first.
