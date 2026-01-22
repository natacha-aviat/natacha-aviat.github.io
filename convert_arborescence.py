#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour convertir l'arborescence en CSV lisible
"""

import csv
import re

def parse_arborescence(input_file, output_file):
    """
    Parse le fichier d'arborescence et le convertit en CSV
    """
    # Première passe : collecter tous les chemins de dossiers
    folder_paths = set()
    with open(input_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.rstrip('\n\r')
            if line.startswith('./'):
                folder_path = line.rstrip(':').strip()
                folder_paths.add(folder_path)
    
    # Deuxième passe : parser le fichier et créer les entrées
    rows = []
    current_path = None
    
    with open(input_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.rstrip('\n\r')
            
            # Ligne vide - on l'ignore
            if not line.strip():
                continue
            
            # Ligne qui commence par ./ indique un nouveau dossier
            if line.startswith('./'):
                # Enlever le : à la fin si présent
                current_path = line.rstrip(':').strip()
                # Ajouter le dossier racine
                folder_name = current_path.split('/')[-1] if '/' in current_path else current_path
                rows.append({
                    'chemin_complet': current_path,
                    'nom': folder_name,
                    'type': 'Dossier',
                    'niveau': current_path.count('/'),
                    'dossier_parent': '/'.join(current_path.split('/')[:-1]) if '/' in current_path else ''
                })
            elif current_path:
                # C'est le contenu d'un dossier
                # Peut contenir plusieurs éléments séparés par des tabulations
                items = re.split(r'\t+', line)
                
                for item in items:
                    item = item.strip()
                    if not item:
                        continue
                    
                    full_path = f"{current_path}/{item}" if current_path else item
                    
                    # Déterminer le type : si le chemin apparaît dans folder_paths, c'est un dossier
                    if full_path in folder_paths:
                        item_type = 'Dossier'
                    else:
                        # Vérifier s'il y a une extension de fichier connue
                        extensions_connues = ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt', 
                                            '.jpg', '.jpeg', '.png', '.gif', '.gsheet', '.gdoc', '.gslides', 
                                            '.gdraw', '.mp3', '.mp4', '.mov', '.zip', '.ods', '.xlsm', 
                                            '.docm', '.mxf', '.cr2', '.png', '.pdf']
                        has_extension = any(item.lower().endswith(ext.lower()) for ext in extensions_connues)
                        item_type = 'Fichier' if has_extension else 'Fichier (probable, sans extension)'
                    
                    rows.append({
                        'chemin_complet': full_path,
                        'nom': item,
                        'type': item_type,
                        'niveau': full_path.count('/'),
                        'dossier_parent': current_path
                    })
    
    # Écrire le CSV
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        fieldnames = ['chemin_complet', 'nom', 'type', 'niveau', 'dossier_parent']
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=';')
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"Conversion terminée : {len(rows)} éléments convertis")
    print(f"Fichier CSV créé : {output_file}")

if __name__ == '__main__':
    input_file = 'MaMaMa - Arborescence 14 janvier 2026'
    output_file = 'MaMaMa - Arborescence 14 janvier 2026.csv'
    parse_arborescence(input_file, output_file)
