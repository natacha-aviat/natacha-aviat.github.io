# Serveur Python pour MaMaCollecte

Ce serveur Python permet de sauvegarder automatiquement les inscriptions dans le fichier `inscriptions.js`.

## ⚠️ Important

**Pour que les inscriptions soient sauvegardées, vous DEVEZ utiliser le serveur Python.**

Si vous ouvrez directement le fichier HTML (`file://`), les inscriptions ne seront **pas sauvegardées** dans `inscriptions.js`.

## Installation

1. Installer les dépendances :
```bash
cd MaMaCollecte
pip install -r requirements.txt
```

## Utilisation

### Méthode recommandée (avec serveur Python)

1. **Ouvrir un terminal** dans le dossier `MaMaCollecte`

2. **Lancer le serveur** :
```bash
python server.py
```

Vous devriez voir :
```
🚀 Serveur MaMaCollecte démarré sur http://localhost:5000
📁 Répertoire de travail: /chemin/vers/MaMaCollecte
📄 Fichier HTML: /chemin/vers/MaMaCollecte/MaMaCollecte.html
💾 Fichier inscriptions: /chemin/vers/MaMaCollecte/inscriptions.js
📁 Ouvrez http://localhost:5000 dans votre navigateur
📝 Les inscriptions seront sauvegardées dans inscriptions.js
```

3. **Ouvrir dans le navigateur** :
```
http://localhost:5000
```

### Méthode alternative (sans serveur - lecture seule)

Vous pouvez ouvrir directement `MaMaCollecte.html` dans votre navigateur, mais :
- ❌ Les inscriptions ne seront **pas sauvegardées**
- ✅ Vous pouvez consulter les inscriptions existantes
- ✅ Vous pouvez tester l'interface

## Fonctionnalités du serveur

Le serveur va :
- ✅ Servir les fichiers HTML, JS, CSS
- ✅ Sauvegarder automatiquement les inscriptions dans `inscriptions.js`
- ✅ Charger les inscriptions existantes depuis `inscriptions.js`
- ✅ Servir les fichiers CSS depuis la racine du projet

## API

- `GET /api/inscriptions` : Récupère toutes les inscriptions
- `POST /api/inscriptions` : Sauvegarde toutes les inscriptions

## Avantages

- ✅ Sauvegarde automatique dans le fichier
- ✅ Pas besoin de télécharger/remplacer manuellement
- ✅ Fonctionne sur tous les navigateurs
- ✅ Les inscriptions sont persistantes même après redémarrage
- ✅ Messages clairs dans la console du navigateur