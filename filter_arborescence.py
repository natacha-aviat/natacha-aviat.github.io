#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour filtrer l'arborescence CSV selon des dossiers spécifiques
"""

import csv

def filter_arborescence(input_file, output_file, folders_to_keep):
    """
    Filtre le CSV pour ne garder que les lignes correspondant aux dossiers spécifiés
    """
    filtered_rows = []
    
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter=';')
        
        for row in reader:
            chemin = row['chemin_complet']
            
            # Vérifier si le chemin contient un des dossiers à garder
            for folder in folders_to_keep:
                if folder in chemin:
                    filtered_rows.append(row)
                    break  # Pas besoin de vérifier les autres dossiers
    
    # Écrire le CSV filtré
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        fieldnames = ['chemin_complet', 'nom', 'type', 'niveau', 'dossier_parent']
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=';')
        writer.writeheader()
        writer.writerows(filtered_rows)
    
    print(f"Filtrage terminé : {len(filtered_rows)} éléments conservés sur {len(filtered_rows) + sum(1 for _ in open(input_file, 'r', encoding='utf-8')) - 1}")
    print(f"Fichier CSV créé : {output_file}")

if __name__ == '__main__':
    input_file = 'MaMaMa - Arborescence 14 janvier 2026.csv'
    output_file = 'MaMAMA - Arborescence 14 janvier 2026 - Vue Contact@.csv'
    
    folders_to_keep = [
        'COLLECTE & REDISTRIBUTION',
        'COMMUNICATION',
        'EQUIPE',
        'PLAIDOYER'
    ]
    
    filter_arborescence(input_file, output_file, folders_to_keep)
