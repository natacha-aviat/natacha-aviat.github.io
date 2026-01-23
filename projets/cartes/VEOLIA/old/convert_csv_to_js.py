import csv
import json
import re

def clean_value(val):
    # Nettoie les guillemets et remplace tous les sauts de ligne par un espace
    if val is None:
        return ""
    return re.sub(r'[\r\n]+', ' ', str(val).strip().replace('"', ''))

def convert_csv_to_js():
    print("Lecture du fichier CSV...")
    # Fichier source VEOLIA
    with open('VEOLIA/donnees_VEOLIA_prelevement.csv', 'r', encoding='utf-8-sig') as csvfile:
        # Utiliser la virgule comme délimiteur et laisser DictReader détecter les en-têtes
        reader = csv.DictReader(csvfile, delimiter=',', quotechar='"')
        print("En-têtes du CSV:", reader.fieldnames)
        
        etablissements = {"etablissements": []}
        row_count = 0
        
        for row in reader:
            row_count += 1
            if row_count <= 2:  # Afficher les 2 premières lignes pour debug
                print(f"Ligne {row_count}:", row)
            
            # Vérifier si les coordonnées sont valides
            # NB : dans donnees_VEOLIA.csv, coordonnees_x = longitude, coordonnees_y = latitude
            try:
                lon = float(clean_value(row.get('coordonnees_x', '')))
                lat = float(clean_value(row.get('coordonnees_y', '')))
            except (ValueError, TypeError):
                print(
                    f"Coordonnées invalides pour la ligne {row_count}:",
                    row.get('coordonnees_x', ''),
                    row.get('coordonnees_y', ''),
                )
                continue

            etablissement = {
                "identifiant": clean_value(row.get('identifiant', '')),
                "nom_etablissement": clean_value(row.get('nom_etablissement', '')),
                "numero_siret": clean_value(row.get('numero_siret', '')),
                "adresse": clean_value(row.get('adresse', '')),
                "code_postal": clean_value(row.get('code_postal', '')),
                "commune": clean_value(row.get('commune', '')),
                "departement": clean_value(row.get('departement', '')),
                "region": clean_value(row.get('region', '')),
                "code_ape": clean_value(row.get('code_ape', '')),
                "libelle_ape": clean_value(row.get('libelle_ape', '')),
                "libelle_eprtr": clean_value(row.get('libelle_eprtr', '')),
                "prelevements_eaux_souterraines": clean_value(row.get('prelevements_eaux_souterraines', '')),
                "prelevements_eaux_surface": clean_value(row.get('prelevements_eaux_surface', '')),
                "prelevements_reseau_distribution": clean_value(row.get('prelevements_reseau_distribution', '')),
                "somme_prelevements_m3": clean_value(row.get('somme_prelevements_(m3)', '')),
                "somme_rejet_raccorde_m3_par_an": clean_value(row.get('Somme_de_rejet_raccorde_m3_par_an', '')),
                "somme_rejet_isole_m3_par_an": clean_value(row.get('Somme_de_rejet_isole_m3_par_an', '')),
                "somme_rejets_m3": clean_value(row.get('Somme_des_rejets_(m3)', '')),
                "latitude": str(lat),
                "longitude": str(lon),
            }
            
            # Vérifier si l'établissement a des données valides
            if etablissement["identifiant"] or etablissement["nom_etablissement"]:
                etablissements["etablissements"].append(etablissement)
            else:
                print(f"Ligne {row_count} ignorée car pas de données valides")
        
        print(f"Nombre total de lignes lues: {row_count}")
        print(f"Nombre d'établissements valides: {len(etablissements['etablissements'])}")
        
        with open('VEOLIA/donnees_VEOLIA_prelevement.js', 'w', encoding='utf-8') as jsfile:
            jsfile.write('const etablissements = {\n')
            jsfile.write('    "etablissements": [\n')
            for i, etab in enumerate(etablissements["etablissements"]):
                jsfile.write('        {\n')
                for key, value in etab.items():
                    jsfile.write(f'            "{key}": "{value}"')
                    if key != list(etab.keys())[-1]:
                        jsfile.write(',\n')
                    else:
                        jsfile.write('\n')
                jsfile.write('        }')
                if i < len(etablissements["etablissements"]) - 1:
                    jsfile.write(',\n')
                else:
                    jsfile.write('\n')
            jsfile.write('    ]\n')
            jsfile.write('};')
    print("Conversion terminée ! Le fichier donnees_VEOLIA.js a été créé.")

if __name__ == "__main__":
    convert_csv_to_js() 