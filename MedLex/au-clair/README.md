# Au Clair — maquette tunnel contrat IDEL

Next.js (App Router) + React. **Aucune** auth, paiement ou email réels — état en mémoire (`useReducer`).

## Lancer en local

```bash
cd MedLex/au-clair
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Parcours (8 écrans)

| Écran | Route |
|-------|--------|
| Accueil | `/` ou `index-6.html` → `./tunnel/parcours/email/` |
| Email | `/parcours/email` |
| Vérification lien magique | `/parcours/verification-email` |
| Questionnaire | `/parcours/questionnaire` |
| Aperçu bénéfices | `/parcours/apercu` |
| Invitation tiers | `/parcours/invitation` |
| Paiement | `/parcours/paiement` |
| Signature | `/parcours/signature` |
| Tableau de bord | `/parcours/tableau-de-bord` |

**Cas limite :** `/parcours/lien-expire` (lien magique expiré).

Barre **« Maquette — simuler »** en bas des écrans concernés pour avancer les états (validation tiers, paiement, remboursement, etc.).

## Charte

Identique à `index-6.html` : Inter, teal `#0FA3A3`, encre `#16314D`, mobile-first.
