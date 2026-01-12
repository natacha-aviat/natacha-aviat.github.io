#!/usr/bin/env python3
"""
Serveur Python pour MaMaCollecte
Permet de sauvegarder les inscriptions directement dans inscriptions.js
"""

from flask import Flask, request, jsonify, send_from_directory, send_file, redirect
from flask_cors import CORS
import json
import os
from datetime import datetime

# Obtenir le répertoire du script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# Obtenir le répertoire racine du projet (3 niveaux au-dessus)
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '../../../'))

# Ne pas utiliser static_folder pour éviter les conflits avec nos routes personnalisées
app = Flask(__name__)
CORS(app)  # Permet les requêtes depuis le navigateur

# Middleware pour logger toutes les requêtes (debug)
@app.before_request
def log_request_info():
    print(f"🌐 Requête: {request.method} {request.path}")
    print(f"   Remote: {request.remote_addr}")

# Chemin du fichier inscriptions.js
INSCRIPTIONS_FILE = os.path.join(SCRIPT_DIR, 'inscriptions.js')

def escape_js_string(value):
    """Échappe une chaîne pour JavaScript de manière sécurisée"""
    if value is None:
        return '""'
    s = str(value)
    # Échapper dans l'ordre : d'abord les backslashes, puis les autres
    s = s.replace('\\', '\\\\')  # Backslash en premier
    s = s.replace('"', '\\"')   # Guillemets doubles
    s = s.replace("'", "\\'")   # Guillemets simples
    s = s.replace('\n', '\\n')  # Retours à la ligne
    s = s.replace('\r', '\\r')  # Retours chariot
    s = s.replace('\t', '\\t')  # Tabulations
    return f'"{s}"'

def format_date_fr(date_key):
    """Formate une date YYYY-MM-DD en format français"""
    try:
        date_obj = datetime.strptime(date_key, "%Y-%m-%d")
        jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]
        mois = ["janvier", "février", "mars", "avril", "mai", "juin", 
               "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
        jour_semaine = jours[date_obj.weekday()]
        return f"{jour_semaine} {date_obj.day} {mois[date_obj.month-1]} {date_obj.year}"
    except:
        return date_key

def generate_js_content(inscriptions):
    """Génère le contenu JavaScript du fichier inscriptions.js"""
    if not inscriptions:
        return '// Inscriptions pour MaMaCollecte\n// Aucune inscription pour le moment\nconst INSCRIPTIONS = [];\n'
    
    js_content = '// Inscriptions pour MaMaCollecte\n'
    js_content += f'// Généré le {datetime.now().strftime("%d/%m/%Y %H:%M:%S")}\n'
    js_content += 'const INSCRIPTIONS = [\n'
    
    for i, reg in enumerate(inscriptions):
        # S'assurer que dateStr et locationName sont présents
        date_str = reg.get("dateStr", "")
        if not date_str and reg.get("dateKey"):
            date_str = format_date_fr(reg.get("dateKey"))
        
        location_name = reg.get("locationName", "")
        if not location_name:
            location_name = reg.get("location", "")
        
        js_content += '    {\n'
        js_content += f'        id: {escape_js_string(reg.get("id", ""))},\n'
        js_content += f'        phone: {escape_js_string(reg.get("phone", ""))},\n'
        js_content += f'        email: {escape_js_string(reg.get("email", ""))},\n'
        js_content += f'        dateKey: {escape_js_string(reg.get("dateKey", ""))},\n'
        js_content += f'        dateStr: {escape_js_string(date_str)},\n'
        js_content += f'        slotId: {escape_js_string(reg.get("slotId", ""))},\n'
        js_content += f'        slotTime: {escape_js_string(reg.get("slotTime", ""))},\n'
        js_content += f'        location: {escape_js_string(reg.get("location", ""))},\n'
        js_content += f'        locationName: {escape_js_string(location_name)},\n'
        js_content += f'        slotKey: {escape_js_string(reg.get("slotKey", ""))},\n'
        js_content += f'        timestamp: {escape_js_string(reg.get("timestamp", ""))}\n'
        js_content += '    }'
        if i < len(inscriptions) - 1:
            js_content += ','
        js_content += '\n'
    
    js_content += '];\n'
    return js_content

@app.route('/', methods=['GET'])
def index():
    """Sert MaMaCollecte.html"""
    try:
        filepath = os.path.join(SCRIPT_DIR, 'MaMaCollecte.html')
        abs_filepath = os.path.abspath(filepath)
        print(f"📄 Route / appelée - Servir MaMaCollecte.html")
        print(f"   Chemin: {abs_filepath}")
        
        if not os.path.exists(filepath):
            print(f"❌ Fichier MaMaCollecte.html non trouvé dans {SCRIPT_DIR}")
            return f"Fichier MaMaCollecte.html non trouvé dans {SCRIPT_DIR}", 404
        
        if not os.path.isfile(filepath):
            print(f"❌ {filepath} n'est pas un fichier")
            return "Erreur: chemin invalide", 500
        
        print(f"✓ Servir MaMaCollecte.html depuis {abs_filepath}")
        return send_file(filepath)
    except Exception as e:
        print(f"❌ Erreur lors du service de MaMaCollecte.html: {e}")
        import traceback
        traceback.print_exc()
        return f"Erreur: {e}", 500

@app.route('/<path:filename>')
def serve_file_route(filename):
    """Sert les fichiers statiques"""
    try:
        # Cette route ne devrait jamais être appelée pour '/' (géré par la route /)
        # Mais au cas où, rediriger vers la route index
        if not filename or filename == '' or filename == '/':
            print(f"⚠️  Route serve_file_route appelée avec filename vide: '{filename}' - redirection vers /")
            from flask import redirect
            return redirect('/')
        
        print(f"📄 Demande de fichier: {filename}")
        
        # Sécurité: empêcher l'accès aux fichiers sensibles
        if filename.startswith('.') or filename.startswith('__'):
            print(f"⚠️  Tentative d'accès à un fichier sensible: {filename}")
            return "Accès refusé", 403
        
        # Déterminer le chemin du fichier
        filepath = None
        abs_filepath = None
        abs_script_dir = os.path.abspath(SCRIPT_DIR)
        abs_project_root = os.path.abspath(PROJECT_ROOT)
        
        if '..' in filename:
            # Construire le chemin normalisé depuis SCRIPT_DIR
            normalized_path = os.path.normpath(os.path.join(SCRIPT_DIR, filename))
            abs_normalized = os.path.abspath(normalized_path)
            # Vérifier que le chemin normalisé est dans PROJECT_ROOT (sécurité)
            if not abs_normalized.startswith(abs_project_root):
                print(f"⚠️  Tentative d'accès hors du projet (../): {filename} -> {abs_normalized}")
                print(f"   PROJECT_ROOT: {abs_project_root}")
                return "Accès refusé", 403
            filepath = normalized_path
        # Si c'est un fichier assets (CSS, JS, images), chercher dans PROJECT_ROOT
        elif filename.startswith('assets/'):
            filepath = os.path.join(PROJECT_ROOT, filename)
        else:
            # Sinon, chercher dans SCRIPT_DIR (fichiers locaux)
            filepath = os.path.join(SCRIPT_DIR, filename)
        
        abs_filepath = os.path.abspath(filepath)
        print(f"   Chemin résolu: {abs_filepath}")
        
        # Vérifier que le fichier existe
        if not os.path.exists(filepath):
            print(f"⚠️  Fichier non trouvé: {filepath}")
            return f"Fichier {filename} non trouvé", 404
        
        # Vérification de sécurité : s'assurer que le fichier est dans PROJECT_ROOT ou SCRIPT_DIR
        # Pour les fichiers locaux, permettre l'accès s'ils sont dans SCRIPT_DIR
        # Pour les fichiers assets, ils doivent être dans PROJECT_ROOT
        if filename.startswith('assets/'):
            if not abs_filepath.startswith(abs_project_root):
                print(f"⚠️  Fichier assets hors du projet: {abs_filepath}")
                print(f"   PROJECT_ROOT: {abs_project_root}")
                return "Accès refusé", 403
        else:
            # Pour les fichiers locaux, vérifier qu'ils sont dans SCRIPT_DIR
            if not abs_filepath.startswith(abs_script_dir):
                print(f"⚠️  Fichier local hors du répertoire: {abs_filepath}")
                print(f"   SCRIPT_DIR: {abs_script_dir}")
                return "Accès refusé", 403
        
        # Vérifier que c'est un fichier (pas un répertoire)
        if not os.path.isfile(filepath):
            print(f"⚠️  Chemin n'est pas un fichier: {filepath}")
            return "Accès refusé", 403
        
        print(f"✓ Servir le fichier: {filepath}")
        return send_file(filepath)
    except Exception as e:
        print(f"❌ Erreur lors du service du fichier {filename}: {e}")
        import traceback
        traceback.print_exc()
        return f"Erreur: {e}", 500

def load_inscriptions_from_js():
    """Charge les inscriptions depuis le fichier JS"""
    import re
    inscriptions = []
    
    if not os.path.exists(INSCRIPTIONS_FILE):
        print(f"📖 Fichier {INSCRIPTIONS_FILE} n'existe pas encore - aucune inscription chargée")
        return inscriptions
    
    try:
        with open(INSCRIPTIONS_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extraire le contenu du tableau INSCRIPTIONS
        if 'const INSCRIPTIONS = [' not in content:
            print(f"📖 Format de fichier invalide - aucune inscription chargée")
            return inscriptions
        
        # Trouver le début et la fin du tableau
        start = content.find('const INSCRIPTIONS = [') + len('const INSCRIPTIONS = [')
        end = content.rfind('];')
        
        if end <= start:
            print(f"📖 Tableau INSCRIPTIONS vide ou invalide")
            return inscriptions
        
        array_content = content[start:end].strip()
        
        if not array_content:
            print(f"📖 Aucune inscription dans le fichier")
            return inscriptions
        
        # Parser les objets JavaScript
        brace_count = 0
        current_obj = ""
        in_string = False
        escape_next = False
        
        for char in array_content:
            if escape_next:
                current_obj += char
                escape_next = False
                continue
            
            if char == '\\':
                escape_next = True
                current_obj += char
                continue
            
            if char == '"' and not escape_next:
                in_string = not in_string
                current_obj += char
                continue
            
            if not in_string:
                if char == '{':
                    if brace_count == 0:
                        current_obj = ""
                    brace_count += 1
                    current_obj += char
                elif char == '}':
                    current_obj += char
                    brace_count -= 1
                    if brace_count == 0:
                        # Objet complet trouvé
                        try:
                            # Convertir en JSON
                            obj_str = current_obj.strip()
                            # Remplacer les clés JS par des clés JSON
                            obj_str = re.sub(r'(\w+):\s*"', r'"\1": "', obj_str)
                            # Parser le JSON
                            obj = json.loads(obj_str)
                            inscriptions.append(obj)
                        except json.JSONDecodeError as e:
                            print(f"⚠️  Erreur lors du parsing d'un objet: {e}")
                            # Essayer une extraction manuelle comme fallback
                            try:
                                obj = {}
                                for line in current_obj.split('\n'):
                                    line = line.strip().rstrip(',').strip()
                                    if ':' in line and not line.startswith('{') and not line.startswith('}'):
                                        match = re.search(r'(\w+):\s*"([^"]*)"', line)
                                        if match:
                                            obj[match.group(1)] = match.group(2)
                                if obj:
                                    inscriptions.append(obj)
                                    print(f"✓ Objet récupéré via extraction manuelle")
                            except Exception as e2:
                                print(f"⚠️  Impossible de récupérer l'objet: {e2}")
                        current_obj = ""
                else:
                    current_obj += char
            else:
                current_obj += char
        
    except FileNotFoundError:
        print(f"📖 Fichier {INSCRIPTIONS_FILE} non trouvé")
    except Exception as e:
        print(f"❌ Erreur lors du chargement: {e}")
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
        if not request.is_json:
            return jsonify({'error': 'Content-Type doit être application/json'}), 400
        
        data = request.json
        if not data:
            return jsonify({'error': 'Données JSON manquantes'}), 400
        
        inscriptions = data.get('inscriptions', [])
        
        if not isinstance(inscriptions, list):
            return jsonify({'error': 'Le champ "inscriptions" doit être un tableau'}), 400
        
        print(f'💾 Sauvegarde de {len(inscriptions)} inscription(s) dans {INSCRIPTIONS_FILE}')
        
        # Générer le contenu JS
        js_content = generate_js_content(inscriptions)
        
        # Écrire dans le fichier avec gestion d'erreur
        try:
            with open(INSCRIPTIONS_FILE, 'w', encoding='utf-8') as f:
                f.write(js_content)
            print(f'✅ Fichier {INSCRIPTIONS_FILE} mis à jour avec succès')
        except IOError as e:
            print(f'❌ Erreur d\'écriture dans le fichier: {e}')
            return jsonify({'error': f'Impossible d\'écrire dans le fichier: {e}'}), 500
        
        return jsonify({
            'success': True,
            'message': f'{len(inscriptions)} inscription(s) sauvegardée(s)',
            'count': len(inscriptions)
        })
    except Exception as e:
        print(f'❌ Erreur lors de la sauvegarde: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print('🚀 Serveur MaMaCollecte démarré sur http://localhost:5000')
    print(f'📁 Répertoire de travail: {SCRIPT_DIR}')
    print(f'📁 Répertoire racine du projet: {PROJECT_ROOT}')
    print(f'📄 Fichier HTML: {os.path.join(SCRIPT_DIR, "MaMaCollecte.html")}')
    print(f'💾 Fichier inscriptions: {INSCRIPTIONS_FILE}')
    print('')
    print('📁 Ouvrez http://localhost:5000 dans votre navigateur')
    print('📝 Les inscriptions seront sauvegardées dans inscriptions.js')
    print('-' * 50)
    print('')
    
    # Vérifier que les fichiers essentiels existent
    html_file = os.path.join(SCRIPT_DIR, 'MaMaCollecte.html')
    if not os.path.exists(html_file):
        print(f'⚠️  ATTENTION: {html_file} n\'existe pas!')
    else:
        print(f'✓ Fichier HTML trouvé: {html_file}')
    
    if not os.path.exists(INSCRIPTIONS_FILE):
        print(f'ℹ️  Fichier inscriptions.js n\'existe pas encore (sera créé automatiquement)')
    else:
        print(f'✓ Fichier inscriptions.js trouvé: {INSCRIPTIONS_FILE}')
    
    print('')
    app.run(debug=True, port=5000, host='127.0.0.1')
