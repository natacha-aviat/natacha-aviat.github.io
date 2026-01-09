# Serveur Python pour MaMaCollecte

Ce serveur Python permet de sauvegarder automatiquement les inscriptions dans le fichier `inscriptions.js`.

## Installation

1. Installer les dépendances :
```bash
pip install -r requirements.txt
```

## Utilisation

1. Lancer le serveur :
```bash
python server.py
```

2. Ouvrir dans le navigateur :
```
http://localhost:5000
```

Le serveur va :
- Servir les fichiers HTML, JS, CSS
- Sauvegarder automatiquement les inscriptions dans `inscriptions.js`
- Charger les inscriptions existantes depuis `inscriptions.js`

## API

- `GET /api/inscriptions` : Récupère toutes les inscriptions
- `POST /api/inscriptions` : Sauvegarde toutes les inscriptions
- `POST /api/inscriptions/add` : Ajoute une nouvelle inscription

## Avantages

- ✅ Sauvegarde automatique dans le fichier
- ✅ Pas besoin de télécharger/remplacer manuellement
- ✅ Fonctionne sur tous les navigateurs
- ✅ Les inscriptions sont persistantes même après redémarrage
