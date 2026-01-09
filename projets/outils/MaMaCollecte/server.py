#!/usr/bin/env python3
"""
Serveur Python pour MaMaCollecte
Permet de sauvegarder les inscriptions directement dans inscriptions.js
"""

from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
import json
import os
from datetime import datetime

# Obtenir le répertoire du script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, static_folder=SCRIPT_DIR, static_url_path='')
CORS(app)  # Permet les requêtes depuis le navigateur

# Chemin du fichier inscriptions.js
INSCRIPTIONS_FILE = os.path.join(SCRIPT_DIR, 'inscriptions.js')

def escape_js_string(value):
    """Échappe une chaîne pour JavaScript"""
    if value is None:
        return '""'
    s = str(value)
    # Échapper les guillemets et les retours à la ligne
    s = s.replace('\\', '\\\\')
    s = s.replace('"', '\\"')
    s = s.replace('\n', '\\n')
    s = s.replace('\r', '\\r')
    return f'"{s}"'

def generate_js_content(inscriptions):
    """Génère le contenu JavaScript du fichier inscriptions.js"""
    if not inscriptions:
        return '// Inscriptions pour MaMaCollecte\n// Aucune inscription pour le moment\nconst INSCRIPTIONS = [];\n'
    
    js_content = '// Inscriptions pour MaMaCollecte\n'
    js_content += f'// Généré le {datetime.now().strftime("%d/%m/%Y %H:%M:%S")}\n'
    js_content += 'const INSCRIPTIONS = [\n'
    
    for i, reg in enumerate(inscriptions):
        js_content += '    {\n'
        js_content += f'        id: {escape_js_string(reg.get("id", ""))},\n'
        js_content += f'        phone: {escape_js_string(reg.get("phone", ""))},\n'
        js_content += f'        email: {escape_js_string(reg.get("email", ""))},\n'
        js_content += f'        dateKey: {escape_js_string(reg.get("dateKey", ""))},\n'
        js_content += f'        dateStr: {escape_js_string(reg.get("dateStr", ""))},\n'
        js_content += f'        slotId: {escape_js_string(reg.get("slotId", ""))},\n'
        js_content += f'        slotTime: {escape_js_string(reg.get("slotTime", ""))},\n'
        js_content += f'        location: {escape_js_string(reg.get("location", ""))},\n'
        js_content += f'        locationName: {escape_js_string(reg.get("locationName", ""))},\n'
        js_content += f'        slotKey: {escape_js_string(reg.get("slotKey", ""))},\n'
        js_content += f'        timestamp: {escape_js_string(reg.get("timestamp", ""))}\n'
        js_content += '    }'
        if i < len(inscriptions) - 1:
            js_content += ','
        js_content += '\n'
    
    js_content += '];\n'
    return js_content

@app.route('/')
def index():
    """Redirige vers MaMaCollecte.html"""
    try:
        filepath = os.path.join(SCRIPT_DIR, 'MaMaCollecte.html')
        if not os.path.exists(filepath):
            return f"Fichier MaMaCollecte.html non trouvé dans {SCRIPT_DIR}", 404
        return send_file(filepath)
    except Exception as e:
        return f"Erreur: {e}", 500

@app.route('/<path:filename>')
def serve_file(filename):
    """Sert les fichiers statiques"""
    try:
        # Sécurité: empêcher l'accès aux fichiers sensibles
        if filename.startswith('.') or filename.startswith('__') or '..' in filename:
            return "Accès refusé", 403
        
        # Vérifier que le fichier existe
        filepath = os.path.join(SCRIPT_DIR, filename)
        if not os.path.exists(filepath):
            return f"Fichier {filename} non trouvé", 404
        
        # Vérifier que le fichier est dans le bon répertoire (sécurité)
        if not os.path.abspath(filepath).startswith(os.path.abspath(SCRIPT_DIR)):
            return "Accès refusé", 403
        
        return send_file(filepath)
    except Exception as e:
        print(f"Erreur lors du service du fichier {filename}: {e}")
        import traceback
        traceback.print_exc()
        return f"Erreur: {e}", 500

def load_inscriptions_from_js():
    """Charge les inscriptions depuis le fichier JS"""
    inscriptions = []
    if os.path.exists(INSCRIPTIONS_FILE):
        try:
            with open(INSCRIPTIONS_FILE, 'r', encoding='utf-8') as f:
                content = f.read()
                # Extraire le contenu du tableau INSCRIPTIONS
                if 'const INSCRIPTIONS = [' in content:
                    # Trouver le début et la fin du tableau
                    start = content.find('const INSCRIPTIONS = [') + len('const INSCRIPTIONS = [')
                    end = content.rfind('];')
                    
                    if end > start:
                        array_content = content[start:end].strip()
                        
                        # Parser les objets JavaScript
                        import re
                        # Extraire chaque objet { ... }
                        # Pattern pour trouver les objets (en gérant les chaînes avec guillemets)
                        pattern = r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}'
                        matches = re.finditer(pattern, array_content)
                        
                        for match in matches:
                            obj_str = match.group(0).strip()
                            # Nettoyer et convertir en JSON
                            try:
                                # Remplacer les clés JS (sans guillemets) par des clés JSON (avec guillemets)
                                # Format: id: "value" -> "id": "value"
                                obj_str = re.sub(r'(\w+):\s*"([^"]*)"', r'"\1": "\2"', obj_str)
                                # Parser le JSON
                                obj = json.loads(obj_str)
                                inscriptions.append(obj)
                            except Exception as e:
                                # Si le parsing échoue, essayer une méthode plus simple
                                try:
                                    # Extraire les valeurs manuellement
                                    obj = {}
                                    for line in obj_str.split('\n'):
                                        line = line.strip()
                                        if ':' in line and not line.startswith('{') and not line.startswith('}'):
                                            key_match = re.search(r'(\w+):\s*"([^"]*)"', line)
                                            if key_match:
                                                obj[key_match.group(1)] = key_match.group(2)
                                    if obj:
                                        inscriptions.append(obj)
                                except:
                                    print(f"Impossible de parser l'objet: {obj_str[:50]}...")
                                    continue
        except Exception as e:
            print(f"Erreur lors du chargement: {e}")
            import traceback
            traceback.print_exc()
    print(f"📖 {len(inscriptions)} inscription(s) chargée(s) depuis {INSCRIPTIONS_FILE}")
    return inscriptions

@app.route('/api/inscriptions', methods=['GET'])
def get_inscriptions():
    """Récupère toutes les inscriptions"""
    try:
        inscriptions = load_inscriptions_from_js()
        return jsonify(inscriptions)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/inscriptions', methods=['POST'])
def save_inscriptions():
    """Sauvegarde toutes les inscriptions dans inscriptions.js"""
    try:
        data = request.json
        inscriptions = data.get('inscriptions', [])
        
        print(f'💾 Sauvegarde de {len(inscriptions)} inscription(s) dans {INSCRIPTIONS_FILE}')
        
        # Générer le contenu JS
        js_content = generate_js_content(inscriptions)
        
        # Écrire dans le fichier
        with open(INSCRIPTIONS_FILE, 'w', encoding='utf-8') as f:
            f.write(js_content)
        
        print(f'✅ Fichier {INSCRIPTIONS_FILE} mis à jour avec succès')
        
        return jsonify({
            'success': True,
            'message': f'{len(inscriptions)} inscription(s) sauvegardée(s)',
            'count': len(inscriptions)
        })
    except Exception as e:
        print(f'❌ Erreur lors de la sauvegarde: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/inscriptions/add', methods=['POST'])
def add_inscription():
    """Ajoute une nouvelle inscription"""
    try:
        new_inscription = request.json
        
        # Charger les inscriptions existantes
        inscriptions = load_inscriptions_from_js()
        
        # Vérifier si l'inscription existe déjà (par ID)
        if not any(reg.get('id') == new_inscription.get('id') for reg in inscriptions):
            inscriptions.append(new_inscription)
        else:
            # Mettre à jour l'inscription existante
            for i, reg in enumerate(inscriptions):
                if reg.get('id') == new_inscription.get('id'):
                    inscriptions[i] = new_inscription
                    break
        
        # Générer le contenu JS
        js_content = generate_js_content(inscriptions)
        
        # Écrire dans le fichier
        with open(INSCRIPTIONS_FILE, 'w', encoding='utf-8') as f:
            f.write(js_content)
        
        return jsonify({
            'success': True,
            'message': 'Inscription sauvegardée',
            'inscription': new_inscription
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print('🚀 Serveur MaMaCollecte démarré sur http://localhost:5000')
    print(f'📁 Répertoire de travail: {SCRIPT_DIR}')
    print(f'📄 Fichier HTML: {os.path.join(SCRIPT_DIR, "MaMaCollecte.html")}')
    print(f'💾 Fichier inscriptions: {INSCRIPTIONS_FILE}')
    print('📁 Ouvrez http://localhost:5000 dans votre navigateur')
    print('📝 Les inscriptions seront sauvegardées dans inscriptions.js')
    print('-' * 50)
    app.run(debug=True, port=5000, host='127.0.0.1')
