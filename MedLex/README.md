# Au Clair — MedLex

Maquette cliquable pour infirmières libérales (IDEL). **Site statique** : aucun serveur, liens relatifs, GitHub Pages compatible.

## Arborescence

```
MedLex/
├── index.html                 # Landing principale (ex index-6)
├── css/
│   ├── site.css               # Styles landing (index.html)
│   └── parcours.css           # Styles tunnel (classes ac-*)
├── js/
│   ├── nav.js                 # Menu mobile landing
│   └── questionnaire.js       # Questionnaire 5 étapes
├── images/                    # Assets (ex. violaine_avocate.png)
├── parcours/                  # ★ Tunnel maquette (entrée : email.html)
│   ├── email.html
│   ├── verification-email.html
│   ├── lien-expire.html
│   ├── questionnaire.html
│   ├── apercu.html
│   ├── invitation.html
│   ├── invitation-attente.html
│   ├── paiement.html
│   ├── paiement-rembourse.html
│   ├── contrat.html
│   ├── signature.html
│   ├── signature-terminee.html
│   └── tableau-de-bord.html
├── old/                       # Archives landings atelier (index-1…5, index-0)
├── prototype-nextjs/          # Prototype Next.js optionnel (npm run dev)
├── questionnaire-remplacement.html  # Legacy → redirige vers parcours/
└── specs.md                   # Spec MedLex historique (partiellement obsolète)
```

## Parcours utilisateur

```
index.html
  └─► parcours/email.html
        └─► verification-email.html ──► questionnaire.html ──► apercu.html
              └─► lien-expire.html          └─► invitation.html ──► invitation-attente.html
                                                    └─► paiement.html ──► contrat.html ──► signature.html
                                                          └─► paiement-rembourse.html
                                                                └─► signature-terminee.html
                                                                      └─► tableau-de-bord.html
```

Barre **« Maquette — simuler »** (bas d’écran) : cas limites sans logique métier.

## Lancer en local

Ouvrir `MedLex/index.html` dans le navigateur, ou :

```bash
cd MedLex && python3 -m http.server 8080
# → http://localhost:8080/index.html
```

Publication : dossier `MedLex/` sur GitHub Pages → `https://<user>.github.io/MedLex/`

## Charte

Inter, teal `#0FA3A3`, encre `#16314D`, mobile-first, tutoiement (Me Violaine au vouvoiement).

## Notes maintenance

| Élément | Détail |
|---------|--------|
| `index.html` | Charge `./css/site.css` + `./js/nav.js` |
| `parcours/*.html` | Charge `../css/parcours.css` ; logo → `../index.html` |
| `prototype-nextjs/` | Prototype React optionnel (questionnaire 13 étapes aligné) ; la maquette officielle est `parcours/*.html` |
| `images/violaine_avocate.png` | Référencée par `index.html` — à placer dans `images/` si absente |
