# MedLex

Maquette cliquable pour infirmières libérales (IDEL). **Site statique** : aucun serveur, liens relatifs, GitHub Pages compatible.

## Arborescence

```
MedLex/
├── index.html                      # Landing
├── css/
│   ├── medlex.css                  # Couleurs, typo, tokens
│   ├── modules.css                 # Composants (boutons, champs, barre…)
│   ├── site.css                    # Mise en page landing
│   └── parcours.css                # Mise en page du tunnel
├── js/
│   ├── shell.js                    # Barre du bas (toutes les pages)
│   ├── questionnaire-runner.js     # Défilement commun des questionnaires
│   ├── nav.js                      # Menu mobile landing
│   ├── pages/                      # email, aperçu, choix du contrat
│   ├── questionnaires/             # Règles propres à chaque parcours
│   ├── snapshots/                  # Réponses conservées dans le navigateur
│   └── contract/                   # Génération des contrats et PDF
│       └── embedded/               # Modèles chargés par la page contrat
├── vendor/                         # jsPDF, html2pdf
├── fonts/                          # Inter, pour le PDF
├── templates/                      # Textes sources des contrats
├── images/
├── parcours/                       # Pages du tunnel
├── old/                            # Archives
├── prototype-nextjs/               # Prototype Next.js optionnel
└── questionnaire-remplacement.html # Ancienne adresse → parcours/
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

Inter, navy `#18334E` (actions et liens), cherry `#A3125A` (accents), duck `#073D3D` (titres), dorian `#465C71` (texte), cream `#F2F2F0` (fond). Détail : `palette.txt`. Mobile-first, tutoiement (Me Violaine au vouvoiement).

## Notes maintenance

| Élément | Détail |
|---------|--------|
| `index.html` | Charge `./css/site.css`, `./js/nav.js` et `./js/shell.js` (barre du bas) |
| `parcours/*.html` | Charge `../css/parcours.css` et `../js/shell.js` |
| `js/parcours-type.js` | Catalogue des parcours : questionnaire, libellés, snapshot, modèle. Point d’entrée pour en ajouter un |
| `images/violaine_avocate.png` | Référencée par `index.html` — à placer dans `images/` si absente |
