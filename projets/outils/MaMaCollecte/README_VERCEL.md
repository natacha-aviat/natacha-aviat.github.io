# Déploiement MaMaCollecte sur Vercel

Ce guide explique comment déployer MaMaCollecte sur Vercel avec sauvegarde automatique des inscriptions dans le repository GitHub.

## 📋 Prérequis

1. Un compte Vercel (gratuit) : https://vercel.com
2. Un token GitHub avec les permissions `repo` (pour écrire dans le repository)

## 🔧 Configuration

### 1. Créer un token GitHub

1. Allez sur https://github.com/settings/tokens
2. Cliquez sur "Generate new token" → "Generate new token (classic)"
3. Donnez un nom (ex: "MaMaCollecte Vercel")
4. Sélectionnez la permission `repo` (accès complet aux repositories)
5. Cliquez sur "Generate token"
6. **Copiez le token** (vous ne pourrez plus le voir après)

### 2. Déployer sur Vercel

#### Option A : Via l'interface Vercel

1. Allez sur https://vercel.com/new
2. Importez votre repository GitHub `natacha-aviat.github.io`
3. **IMPORTANT** : Ne configurez PAS de Root Directory (laissez vide)
   - Vercel servira les fichiers depuis la racine du repository
   - Le fichier `vercel.json` gère les routes
4. Cliquez sur "Environment Variables" et ajoutez :
   - `GITHUB_TOKEN` : votre token GitHub
   - `GITHUB_OWNER` : `natacha-aviat` (optionnel, par défaut)
   - `GITHUB_REPO` : `natacha-aviat.github.io` (optionnel, par défaut)
5. Cliquez sur "Deploy"

**Note** : Après le déploiement, votre application sera accessible à :
- `https://[votre-projet].vercel.app/projets/outils/MaMaCollecte/MaMaCollecte.html`

#### Option B : Via Vercel CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Aller dans le dossier MaMaCollecte
cd projets/outils/MaMaCollecte

# Déployer
vercel

# Configurer les variables d'environnement
vercel env add GITHUB_TOKEN
# (collez votre token quand demandé)

# Redéployer avec les variables
vercel --prod
```

## 🎯 Structure des fichiers

```
MaMaCollecte/
├── api/
│   └── inscriptions.js    # API route Vercel
├── MaMaCollecte.html      # Application principale
├── creneaux_disponibles.js
├── inscriptions.js        # Fichier de données (mis à jour automatiquement)
├── vercel.json           # Configuration Vercel
└── README_VERCEL.md      # Ce fichier
```

## 🔐 Variables d'environnement

Dans Vercel, configurez ces variables d'environnement :

- `GITHUB_TOKEN` (requis) : Token GitHub avec permission `repo`
- `GITHUB_OWNER` (optionnel) : Propriétaire du repo (défaut: `natacha-aviat`)
- `GITHUB_REPO` (optionnel) : Nom du repository (défaut: `natacha-aviat.github.io`)

## ✨ Fonctionnement

1. **Chargement** : L'application charge les inscriptions depuis `/api/inscriptions` (GET)
2. **Sauvegarde** : Quand une inscription est créée/modifiée, elle est envoyée à `/api/inscriptions` (POST)
3. **Écriture GitHub** : L'API route utilise l'API GitHub pour écrire directement dans `inscriptions.js`
4. **Persistance** : Les données sont sauvegardées dans le repository GitHub

## 📝 Notes importantes

- Les inscriptions sont sauvegardées **automatiquement** dans le fichier `inscriptions.js` du repository
- Vous pouvez voir les modifications dans l'historique Git du repository
- Le fichier est mis à jour en temps réel sur GitHub
- Pas besoin de télécharger/remplacer manuellement le fichier

## 🐛 Dépannage

### Erreur "GITHUB_TOKEN non configuré"
- Vérifiez que la variable d'environnement `GITHUB_TOKEN` est bien configurée dans Vercel
- Redéployez après avoir ajouté la variable

### Erreur 401 (Unauthorized)
- Vérifiez que votre token GitHub a bien la permission `repo`
- Régénérez un nouveau token si nécessaire

### Erreur 404 (Not Found)
- Vérifiez que `GITHUB_OWNER` et `GITHUB_REPO` sont corrects
- Vérifiez que le chemin du fichier est correct dans `api/inscriptions.js`

## 🔄 Mise à jour

Pour mettre à jour l'application :

1. Faites vos modifications dans le code
2. Poussez sur GitHub
3. Vercel redéploiera automatiquement (si connecté à GitHub)
4. Ou redéployez manuellement : `vercel --prod`
