# SaveEat - Static Version for GitHub Pages

Cette version statique de SaveEat fonctionne parfaitement avec GitHub Pages. Elle utilise le localStorage du navigateur pour sauvegarder les recettes.

## 🚀 Déploiement sur GitHub Pages

### 1. Préparer les fichiers
1. Copie tous les fichiers du dossier `static-version/` à la racine de ton repository GitHub
2. Renomme `static-version/index.html` en `index.html` à la racine

### 2. Activer GitHub Pages
1. Va dans **Settings** de ton repository
2. Scroll jusqu'à **Pages** dans le menu de gauche
3. Sous **Source**, sélectionne **Deploy from a branch**
4. Choisis **main** branch et **/ (root)**
5. Clique **Save**

### 3. Accéder à ton site
Ton site sera disponible à : `https://natacha-aviat.github.io/SaveEat/`

## 📱 Configuration iPhone Shortcut

1. **Shortcuts** → **Nouveau raccourci**
2. **Ouvrir des URLs** → `https://natacha-aviat.github.io/SaveEat/?url=[URL]`
3. **Ajouter au menu Partager**

## ✨ Fonctionnalités

### ✅ **Fonctionnalités disponibles**
- ✅ Ajout manuel de recettes
- ✅ Réception via URL (iPhone Shortcut)
- ✅ Gestion des recettes (éditer, supprimer)
- ✅ Recherche et filtres
- ✅ Statuts (To Cook, Validated, Rejected)
- ✅ Impression des ingrédients
- ✅ Export/Import des données
- ✅ Sauvegarde locale (localStorage)

### ❌ **Fonctionnalités non disponibles (limitations GitHub Pages)**
- ❌ Extraction automatique depuis les URLs
- ❌ Génération de PDF
- ❌ Envoi d'emails

## 🔧 Alternatives pour les fonctionnalités manquantes

### **Extraction de recettes**
- **Option 1** : Ajout manuel (disponible)
- **Option 2** : Utiliser un service comme Zapier + Airtable
- **Option 3** : Déployer sur Heroku/Railway avec la version Python

### **Génération de PDF**
- **Option 1** : Utiliser l'impression du navigateur
- **Option 2** : Service externe comme PDFShift
- **Option 3** : Déployer sur Heroku/Railway

## 📁 Structure des fichiers

```
SaveEat/
├── index.html          # Page principale
├── style.css           # Styles
├── script.js           # Logique JavaScript
└── README.md           # Documentation
```

## 💾 Sauvegarde des données

Les recettes sont sauvegardées dans le localStorage du navigateur. Pour sauvegarder tes données :

1. Clique sur **Export Recipes**
2. Sauvegarde le fichier JSON
3. Pour restaurer : **Import Recipes** → sélectionne le fichier

## 🎯 Prochaines étapes

Si tu veux les fonctionnalités complètes (extraction automatique, PDF, email) :

1. **Déployer sur Heroku** (gratuit) avec la version Python
2. **Utiliser Railway** (gratuit) avec la version Python
3. **Combiner** : GitHub Pages + services externes (Zapier, etc.)

Veux-tu que je t'aide à déployer la version Python sur Heroku ou Railway ?
