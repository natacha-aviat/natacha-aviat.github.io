# Site Professionnel - Natacha Aviat

Site web professionnel pour les services de cartographie interactive et d'analyse de données.

## Structure du site

```
pro/
├── index.html          # Page d'accueil
├── services.html       # Page des services détaillés
├── realisations.html    # Portfolio avec filtres
├── a-propos.html       # Présentation et crédibilité
├── contact.html        # Formulaire de contact
├── css/
│   └── style.css       # Styles CSS sobre et professionnel
├── js/
│   └── main.js         # JavaScript pour les interactions
└── README.md           # Ce fichier
```

## Pages

### 1. Accueil (index.html)
- Hero section avec phrase d'accroche
- Section "Vos problèmes, mes solutions"
- Présentation des 3 services en bref
- Pour qui je travaille
- Aperçu des réalisations
- Pourquoi me faire confiance
- CTA final

### 2. Services (services.html)
- Détail des 3 services :
  - Cartographie interactive
  - Analyse de données
  - Outils sur mesure
- Processus en 4 étapes
- Questions fréquentes

### 3. Réalisations (realisations.html)
- Filtres par type (cartes, analyses, outils)
- Filtres par secteur (associations, entreprises, public)
- Projets détaillés avec contexte, problème résolu, solution
- Liens vers les projets existants

### 4. À propos (a-propos.html)
- Mon parcours
- Mon expertise (technique + métier)
- Mes valeurs
- Ce qui me différencie
- Quelques mots personnels

### 6. Contact (contact.html)
- Formulaire de contact complet
- Autres moyens de contact
- Ce qui se passe après le contact
- Questions fréquentes

## Fonctionnalités JavaScript

### Filtres sur la page Réalisations
- Filtrage par type de projet
- Filtrage par secteur
- Combinaison des deux filtres
- Gestion des paramètres URL pour les liens depuis services.html

### Formulaire de contact
- Validation des champs
- Validation de l'email
- Messages de confirmation/erreur
- (À compléter avec un vrai service d'envoi d'email)

## Design

### Palette de couleurs
- Primaire : #2C3E50 (bleu foncé)
- Secondaire : #34495E (gris bleu)
- Accent : #3498DB (bleu)
- Texte : #333333
- Fond clair : #F8F9FA

### Typographie
- Police système : -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, etc.
- Taille de base : 16px
- Line-height : 1.6

### Responsive
- Breakpoint principal : 768px
- Grilles adaptatives avec `auto-fit` et `minmax`
- Navigation mobile-friendly

## Personnalisation

### Modifier les couleurs
Éditer les variables CSS dans `css/style.css` :
```css
:root {
    --primary-color: #2C3E50;
    --accent-color: #3498DB;
    /* ... */
}
```

### Ajouter un projet
Dans `realisations.html`, ajouter une nouvelle carte avec les attributs `data-type` et `data-sector` :
```html
<div class="card project-item" data-type="cartes" data-sector="public">
    <!-- Contenu du projet -->
</div>
```

### Configurer le formulaire de contact
Dans `js/main.js`, modifier la fonction de soumission du formulaire pour intégrer un vrai service d'envoi d'email (par exemple avec Formspree, EmailJS, ou un backend personnalisé).

## SEO

- Meta descriptions sur chaque page
- Titres H1 uniques
- Structure sémantique HTML5
- Attributs alt sur les images (à ajouter si images ajoutées)
- URLs propres et descriptives

## Prochaines étapes

1. **Intégrer un vrai service d'envoi d'email** pour le formulaire de contact
2. **Ajouter des images** pour les projets (captures d'écran)
3. **Optimiser les performances** (minification CSS/JS, compression images)
4. **Ajouter Google Analytics** si nécessaire
5. **Tester sur différents navigateurs** et appareils
6. **Ajouter des témoignages clients** si disponibles

## Notes

- Les liens vers les projets existants pointent vers `../projets/` (structure du portfolio existant)
- Le design est sobre et professionnel, orienté crédibilité et conversion
- Le contenu suit la stratégie définie dans `STRATEGIE_SITE_PRO.md`
- Tous les textes sont en français, orientés besoins clients
