# Structure du Code - Site Professionnel Natacha Aviat

## Vue d'ensemble

Ce document décrit l'architecture et l'organisation du code du site professionnel pour faciliter la maintenance et les évolutions futures.

## Structure des fichiers

```
pro/
├── index.html                 # Page d'accueil (FR)
├── services.html              # Page services (FR)
├── cartes-disponibles.html    # Page portfolio (FR)
├── cgv.html                   # Conditions générales (FR)
├── en/                        # Version anglaise
│   ├── index.html
│   ├── services.html
│   ├── maps-available.html
│   ├── terms.html
│   └── fiches/                # Fiches produits (EN)
├── fiches/                    # Fiches produits (FR)
├── partials/                  # Composants réutilisables (FR)
│   ├── header.html
│   ├── footer.html
│   ├── contact-form.html
│   └── fiche-back-link.html
├── en/partials/               # Composants réutilisables (EN)
├── css/
│   ├── style.css              # Styles principaux
│   └── components.css         # Styles des composants
├── js/
│   ├── main.js                # Script principal (partials, initialisation)
│   ├── components.js          # Composants interactifs (navigation, filtres, langue)
│   └── seo-config.js          # Configuration SEO/IA centralisée
├── robots.txt
├── sitemap.xml
└── ai.txt
```

## Architecture JavaScript

### 1. `js/seo-config.js` - Configuration centralisée

**Rôle** : Centralise toutes les configurations SEO et IA pour éviter la duplication.

**Contenu** :
- `SEO_CONFIG` : Configuration complète des meta tags SEO et IA pour toutes les pages
- `PAGE_MAPPING` : Mapping des pages équivalentes FR/EN
- `FICHE_MAPPING` : Mapping des fiches équivalentes FR/EN

**Avantages** :
- ✅ Évite la duplication de code
- ✅ Facilite les mises à jour (un seul endroit à modifier)
- ✅ Assure la cohérence sur tout le site

### 2. `js/main.js` - Script principal

**Rôle** : Gère le chargement des partials HTML et l'initialisation générale.

**Fonctions principales** :
- `loadIncludes()` : Charge dynamiquement les partials HTML (header, footer, contact-form)
- `getHeaderFallback()` : Génère le header en fallback si le partial ne charge pas
- `getFooterFallback()` : Génère le footer en fallback si le partial ne charge pas
- `getContactFormFallback()` : Génère le formulaire de contact en fallback
- `getLanguagePaths()` : Utilise la logique centralisée pour obtenir les chemins de langue
- `showMessage()` : Affiche des messages de succès/erreur

**Initialisation** :
```javascript
document.addEventListener('DOMContentLoaded', function() {
    loadIncludes().then(() => {
        // Initialise navigation, filtres, langue
    });
});
```

### 3. `js/components.js` - Composants interactifs

**Rôle** : Contient toutes les fonctions réutilisables pour l'interactivité.

**Fonctions principales** :
- `initNavigation()` : Active la navigation selon l'URL actuelle
- `initFilters()` : Gère les filtres de la page cartes-disponibles.html
- `initHashScroll()` : Gère le scroll vers les ancres dans l'URL
- `getLanguageSwitchUrl(targetLang)` : Génère le lien de changement de langue vers la page équivalente
- `initLanguageSwitcher()` : Initialise les liens de changement de langue dans le header et footer

**Logique de filtrage** :
- Filtres par type (cartes, outils)
- Filtres par technologie (Leaflet, JavaScript, etc.)
- Filtres par source de données (public, privé)
- Support des paramètres URL pour les liens depuis services.html

## Système de partials HTML

### Principe

Les partials sont chargés dynamiquement via l'attribut `data-include` :

```html
<header data-include="partials/header.html"></header>
```

### Fallback

Si le chargement échoue (fichier local sans serveur), des fonctions JavaScript génèrent le HTML en fallback.

### Partials disponibles

1. **header.html** : En-tête avec navigation et sélecteur de langue
2. **footer.html** : Pied de page avec liens et sélecteur de langue
3. **contact-form.html** : Formulaire de contact (mailto)
4. **fiche-back-link.html** : Lien de retour vers les cartes

## Système de changement de langue

### Mapping centralisé

Les mappings sont définis dans `seo-config.js` :
- `PAGE_MAPPING` : Pages principales (index, services, cartes, CGV)
- `FICHE_MAPPING` : Fiches produits

### Fonctionnement

1. `getLanguageSwitchUrl(targetLang)` détecte la page actuelle
2. Trouve la page équivalente dans le mapping
3. Génère le chemin relatif correct selon la profondeur (pages principales vs fiches)

### Exemple

Depuis `/fiches/fiche-rejets.html` vers EN :
- Détecte : `fiche-rejets.html` dans `/fiches/`
- Mapping : `en/fiches/sheet-discharges.html`
- Chemin : `../en/fiches/sheet-discharges.html`

## SEO et Indexation IA

### Configuration centralisée

Toutes les configurations SEO et IA sont dans `seo-config.js` :
- Meta tags communs (keywords, AI:Purpose, etc.)
- Configuration par type de page (index, services, cartes, CGV)
- Configuration par fiche produit

### Meta tags standardisés

**Toutes les pages** :
- `title` : Titre unique et descriptif
- `description` : Description optimisée (150-160 caractères)
- `keywords` : Mots-clés pertinents
- `canonical` : URL canonique
- `og:*` : Open Graph pour le partage social
- `twitter:*` : Twitter Cards
- `hreflang` : Liens vers les versions linguistiques

**Pages spécifiques** :
- **Index** : Schema.org `ProfessionalService` + FAQ
- **Services** : Schema.org `Service` avec offres
- **Cartes** : Schema.org `ItemList`
- **Fiches** : Schema.org `Product` ou `SoftwareApplication`

**Meta tags IA** :
- `AI:Purpose` : Objectif du service
- `AI:Services` : Types de services
- `AI:TargetAudience` : Public cible
- `AI:Pricing` : Grille tarifaire
- `AI:ProductType` : Type de produit (fiches)
- `AI:Price` : Prix spécifique (fiches)
- `AI:Technologies` : Technologies utilisées (fiches)
- `AI:DataSource` : Sources de données (fiches)
- `AI:UseCase` : Cas d'usage (fiches)

## CSS

### Organisation

- **style.css** : Styles principaux (variables, layout, typographie, composants de base)
- **components.css** : Styles spécifiques aux composants (cartes, filtres, fiches)

### Variables CSS

Les couleurs et espacements sont définis via des variables CSS pour faciliter la maintenance.

## Bonnes pratiques

### 1. Éviter la duplication

✅ **Bon** : Utiliser `seo-config.js` pour les configurations
❌ **Mauvais** : Dupliquer les meta tags dans chaque fichier HTML

### 2. Fallbacks robustes

Toutes les fonctionnalités critiques ont des fallbacks JavaScript pour fonctionner même sans serveur local.

### 3. Séparation des responsabilités

- `main.js` : Chargement et initialisation
- `components.js` : Interactivité
- `seo-config.js` : Configuration

### 4. Documentation

- Commentaires clairs dans le code
- Ce fichier pour la structure globale
- `SEO_OPTIMIZATION.md` pour le SEO
- `AI_OPTIMIZATION.md` pour l'indexation IA

## Maintenance

### Ajouter une nouvelle page

1. Créer le fichier HTML (FR et EN si nécessaire)
2. Ajouter la configuration dans `seo-config.js` si besoin de meta tags spécifiques
3. Ajouter le mapping dans `PAGE_MAPPING` ou `FICHE_MAPPING` si changement de langue nécessaire
4. Mettre à jour `sitemap.xml`

### Ajouter une nouvelle fiche produit

1. Créer `fiche-*.html` (FR) et `sheet-*.html` (EN)
2. Ajouter la configuration dans `SEO_CONFIG.fiches`
3. Ajouter le mapping dans `FICHE_MAPPING`
4. Mettre à jour `cartes-disponibles.html` et `maps-available.html`
5. Mettre à jour `sitemap.xml`

### Modifier les meta tags communs

Modifier `SEO_CONFIG.common` dans `seo-config.js` (s'applique à toutes les pages).

## Prochaines améliorations possibles

1. **Génération automatique des meta tags** : Script pour générer les meta tags HTML à partir de `seo-config.js`
2. **Validation SEO** : Script de validation des meta tags sur toutes les pages
3. **Tests automatisés** : Tests pour vérifier les liens de langue, les fallbacks, etc.
