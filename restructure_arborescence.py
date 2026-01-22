#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour restructurer l'arborescence CSV au format colonnes multiples
"""

import csv

def restructure_csv(input_file, output_file):
    """
    Restructure le CSV pour avoir chaque niveau de dossier dans une colonne séparée
    """
    rows = []
    max_depth = 0
    
    # Première passe : lire tous les chemins et déterminer la profondeur maximale
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            chemin = row['chemin_complet']
            # Enlever le préfixe "./" si présent
            if chemin.startswith('./'):
                chemin = chemin[2:]
            
            # Séparer les parties du chemin
            parts = chemin.split('/')
            max_depth = max(max_depth, len(parts))
            rows.append(parts)
    
    # Deuxième passe : créer le CSV avec le bon nombre de colonnes
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        # Créer les noms de colonnes
        fieldnames = [f'Dossier {i+1}' if i < max_depth - 1 else 'Fichier/Dossier' for i in range(max_depth)]
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=';')
        writer.writeheader()
        
        for parts in rows:
            # Créer un dictionnaire avec les colonnes
            row_dict = {}
            for i in range(max_depth):
                if i < len(parts):
                    row_dict[fieldnames[i]] = parts[i]
                else:
                    row_dict[fieldnames[i]] = ''
            writer.writerow(row_dict)
    
    print(f"Restructuration terminée : {len(rows)} éléments")
    print(f"Profondeur maximale : {max_depth} niveaux")
    print(f"Fichier CSV créé : {output_file}")

if __name__ == '__main__':
    # Traiter le fichier principal
    input_file = 'MaMaMa - Arborescence 14 janvier 2026.csv'
    output_file = 'MaMaMa - Arborescence 14 janvier 2026.csv'
    restructure_csv(input_file, output_file)
    
    # Traiter le fichier filtré
    input_file = 'MaMAMA - Arborescence 14 janvier 2026 - Vue Contact@.csv'
    output_file = 'MaMAMA - Arborescence 14 janvier 2026 - Vue Contact@.csv'
    restructure_csv(input_file, output_file)
