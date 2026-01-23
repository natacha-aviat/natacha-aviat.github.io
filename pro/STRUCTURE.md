# Structure du Projet - Site Professionnel Natacha Aviat

## Vue d'ensemble

Ce document décrit l'organisation du code pour faciliter la maintenance et la compréhension.

## Structure des fichiers

```
pro/
├── index.html                    # Page d'accueil
├── services.html                 # Page des services
├── cartes-disponibles.html       # Page portfolio des cartes
├── cgv.html                      # Conditions générales de vente
│
├── fiches/                       # Fiches détaillées des cartes/outils
│   ├── fiche-lycees.html
│   ├── fiche-rejets.html
│   ├── fiche-prelevements.html
│   ├── fiche-optimisation-tournees.html
│   ├── fiche-inventaire.html
│   ├── fiche-nyc-art.html
│   └── fiche-pollution.html
│
├── partials/                     # Composants HTML réutilisables
│   ├── header.html               # En-tête avec navigation
│   ├── footer.html               # Pied de page
│   ├── contact-form.html         # Formulaire de contact
│   └── fiche-back-link.html      # Lien retour aux cartes
│
├── css/
│   ├── style.css                 # Styles principaux (variables, layout)
│   └── components.css             # Styles des composants réutilisables
│
├── js/
│   ├── main.js                   # Code principal (partials, formulaires, utils)
│   └── components.js             # Composants réutilisables (navigation, filtres)
│
├── robots.txt                    # Instructions pour les robots
├── sitemap.xml                   # Plan du site
├── ai.txt                        # Instructions pour les IA
│
└── Documentation/
    ├── README.md                 # Documentation générale
    ├── REFACTORING.md            # Historique des refactorisations
    ├── SEO_OPTIMIZATION.md       # Optimisations SEO
    ├── AI_OPTIMIZATION.md        # Optimisations pour l'indexation IA
    └── STRUCTURE.md              # Ce fichier
```

## Organisation du JavaScript

### `js/main.js`
**Responsabilités** :
- Chargement des partials HTML (`loadIncludes()`)
- Fallbacks pour les partials (fonctionnement local)
- Gestion du formulaire de contact (`initContactForm()`)
- Affichage des messages (`showMessage()`)
- Initialisation principale au chargement de la page

**Structure** :
```javascript
// 1. Constantes (fallbacks)
// 2. Gestion des partials HTML
// 3. Formulaires
// 4. Utilitaires
// 5. Initialisation principale
```

### `js/components.js`
**Responsabilités** :
- Navigation active (`initNavigation()`)
- Filtres de la page cartes (`initFilters()`)
- Scroll vers ancres (`initHashScroll()`)

**Fonctions exportées** :
- `initNavigation()` - Active le lien de navigation correspondant à la page courante
- `initFilters()` - Gère les filtres (type, technologie, données, secteur) sur la page cartes
- `initHashScroll()` - Scroll automatique vers une ancre dans l'URL

## Organisation du CSS

### `css/style.css`
**Contient** :
- Variables CSS (couleurs, espacements, typographie)
- Styles de base (reset, body, typographie)
- Layout (container, grid, sections)
- Composants de base (buttons, cards, badges)
- Styles spécifiques aux pages (hero, testimonials, etc.)

### `css/components.css`
**Contient** :
- Styles des composants réutilisables
- Classes utilitaires pour les fiches
- Styles des formulaires
- Styles du footer et header

## Partials HTML

### `partials/header.html`
En-tête avec logo et navigation. Utilisé sur toutes les pages via `data-include`.

### `partials/footer.html`
Pied de page avec copyright et liens (CGV, Contact). Utilisé sur toutes les pages.

### `partials/contact-form.html`
Formulaire de contact en 3 colonnes. Utilisé sur :
- `index.html`
- `services.html`
- `cartes-disponibles.html`

### `partials/fiche-back-link.html`
Lien "Retour aux cartes". Utilisé sur toutes les fiches.

## Fiches produits

Chaque fiche (`fiches/fiche-*.html`) contient :
- Header et footer via partials
- Image de la carte/outil
- Description détaillée
- Section Avant/Après
- Technologies utilisées
- Source des données
- Prix
- Lien mailto pour demander l'accès

## Principes de développement

### 1. DRY (Don't Repeat Yourself)
- Partials HTML pour les éléments répétés
- Fonctions JavaScript réutilisables
- Classes CSS réutilisables

### 2. Séparation des responsabilités
- `main.js` : logique principale et initialisation
- `components.js` : composants réutilisables
- `style.css` : styles de base
- `components.css` : styles des composants

### 3. Fallbacks
- Fallbacks HTML pour les partials (fonctionnement local)
- Gestion d'erreurs dans le chargement des partials

### 4. Accessibilité
- Attributs `alt` sur toutes les images
- Structure sémantique HTML5
- Navigation au clavier

### 5. SEO
- Meta tags sur toutes les pages
- Schema.org JSON-LD
- Sitemap.xml
- Robots.txt

## Ajout d'une nouvelle carte/outil

1. **Créer la fiche** : `fiches/fiche-nouvelle-carte.html`
   - Copier la structure d'une fiche existante
   - Adapter le contenu
   - Mettre à jour le lien mailto avec le bon sujet

2. **Ajouter à la page cartes** : `cartes-disponibles.html`
   - Ajouter une nouvelle card avec les bons attributs `data-*`
   - Lier vers la fiche

3. **Mettre à jour le sitemap** : `sitemap.xml`
   - Ajouter l'URL de la nouvelle fiche

## Maintenance

### Fichiers à mettre à jour régulièrement
- `sitemap.xml` : dates de modification
- `ai.txt` : nouvelles cartes/outils
- `README.md` : nouvelles fonctionnalités

### Fichiers à ne pas modifier directement
- `partials/*.html` : modifier via les fichiers sources
- Fallbacks dans `main.js` : synchroniser avec les partials

## Notes importantes

- Les liens mailto utilisent `natacha.aviat+map@gmail.com`
- Les partials sont chargés dynamiquement via `data-include`
- Le code fonctionne sans serveur grâce aux fallbacks
- Tous les chemins relatifs sont gérés automatiquement selon la profondeur
