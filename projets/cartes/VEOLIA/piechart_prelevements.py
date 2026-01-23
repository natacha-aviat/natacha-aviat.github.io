import pandas as pd
import io
import matplotlib.pyplot as plt
import branca
import folium
import re

# Fonction pour nettoyer les valeurs numériques (enlever espaces et convertir)
def clean_number(val):
    if pd.isna(val) or val == '' or val == ' ':
        return 0
    # Enlever tous les espaces et convertir en float
    cleaned = str(val).replace(' ', '').replace('\xa0', '')
    try:
        return float(cleaned)
    except:
        return 0

# Lecture des données
print("Lecture du fichier CSV...")
data = pd.read_csv('donnees_VEOLIA_prelevement.csv', encoding='utf-8-sig')

# Nettoyage des données de prélèvements
data['prelevements_eaux_souterraines_clean'] = data['prelevements_eaux_souterraines'].apply(clean_number)
data['prelevements_eaux_surface_clean'] = data['prelevements_eaux_surface'].apply(clean_number)
data['prelevements_reseau_distribution_clean'] = data['prelevements_reseau_distribution'].apply(clean_number)

# Couleurs pour chaque type de prélèvement
prelevementColors = {
    'Souterraines': '#FFFFFF',  # Blanc
    'Surfaces': '#D1495B',       # Rouge
    'Distribution': '#7BB661',   # Vert
}

# Création des piecharts pour chaque établissement
print("Création des piecharts...")
fig = plt.figure(figsize=(0.5, 0.5))
fig.patch.set_alpha(0)
ax = fig.add_subplot(111)
plots = []

for idx, row in data.iterrows():
    # Récupérer les valeurs des 3 types de prélèvements
    souterraines = row['prelevements_eaux_souterraines_clean']
    surface = row['prelevements_eaux_surface_clean']
    distribution = row['prelevements_reseau_distribution_clean']
    
    # Créer les données pour le piechart
    sizes = [souterraines, surface, distribution]
    colors = [prelevementColors['Souterraines'], 
              prelevementColors['Surfaces'], 
              prelevementColors['Distribution']]
    
    # Filtrer les valeurs nulles ou zéro pour ne garder que les données significatives
    filtered_sizes = []
    filtered_colors = []
    labels = ['Souterraines', 'Surfaces', 'Distribution']
    filtered_labels = []
    
    for i, size in enumerate(sizes):
        if size > 0:
            filtered_sizes.append(size)
            filtered_colors.append(colors[i])
            filtered_labels.append(labels[i])
    
    # Si aucune donnée, créer un piechart vide (tout blanc)
    if len(filtered_sizes) == 0:
        filtered_sizes = [1]
        filtered_colors = ['#CCCCCC']  # Gris pour "pas de données"
    
    # Créer le piechart
    ax.pie(filtered_sizes, colors=filtered_colors, startangle=90)
    buff = io.StringIO()
    plt.savefig(buff, format="SVG")
    buff.seek(0)
    svg = buff.read()
    svg = svg.replace("\n", "")
    plots.append(svg)
    plt.cla()

plt.clf()
plt.close()

print(f"✅ {len(plots)} piecharts créés")

# Création de la légende
legend_html = """
{% macro html(this, kwargs) %}
<div style="
    position: fixed;
    bottom: 50px;
    left: 50px;
    width: 250px;
    height: 120px;
    z-index:9999;
    font-size:14px;
    ">
    <p><a style="color:#FFFFFF;font-size:150%;margin-left:20px;">◼</a>&emsp;Eaux souterraines</p>
    <p><a style="color:#D1495B;font-size:150%;margin-left:20px;">◼</a>&emsp;Eaux de surface</p>
    <p><a style="color:#7BB661;font-size:150%;margin-left:20px;">◼</a>&emsp;Réseau de distribution</p>
</div>
<div style="
    position: fixed;
    bottom: 50px;
    left: 50px;
    width: 250px;
    height: 120px;
    z-index:9998;
    font-size:14px;
    background-color: #ffffff;
    filter: blur(8px);
    -webkit-filter: blur(8px);
    opacity: 0.7;
    ">
</div>
{% endmacro %}
"""

legend = branca.element.MacroElement()
legend._template = branca.element.Template(legend_html)

# Création de la carte centrée sur la France
print("Création de la carte...")
m = folium.Map(location=[46.603354, 1.888334], zoom_start=6)

# Ajout des marqueurs avec piecharts
for idx, row in data.iterrows():
    # Vérifier que les coordonnées sont valides
    try:
        lat = float(row['coordonnees_y'])
        lon = float(row['coordonnees_x'])
        
        # Créer le marqueur avec le piechart comme icône
        icon = folium.DivIcon(html=plots[idx], icon_size=(36, 36), icon_anchor=(18, 18))
        marker = folium.Marker([lat, lon], icon=icon)
        
        # Créer le popup avec les informations
        souterraines = row['prelevements_eaux_souterraines_clean']
        surface = row['prelevements_eaux_surface_clean']
        distribution = row['prelevements_reseau_distribution_clean']
        
        popup_content = f"""
        <div style="font-family: Arial, sans-serif; padding: 10px;">
            <h4>{row['nom_etablissement']}</h4>
            <p><strong>Adresse:</strong> {row['adresse']}, {row['code_postal']} {row['commune']}</p>
            <p><strong>Prélèvements eaux souterraines:</strong> {souterraines:,.0f} m³</p>
            <p><strong>Prélèvements eaux de surface:</strong> {surface:,.0f} m³</p>
            <p><strong>Prélèvements réseau distribution:</strong> {distribution:,.0f} m³</p>
            <p><strong>Total:</strong> {souterraines + surface + distribution:,.0f} m³</p>
        </div>
        """
        
        popup = folium.Popup(popup_content, max_width=300)
        marker.add_child(popup)
        m.add_child(marker)
        
    except (ValueError, KeyError) as e:
        print(f"⚠️  Coordonnées invalides pour {row.get('nom_etablissement', 'inconnu')}: {e}")
        continue

m.get_root().add_child(legend)

# Sauvegarder la carte
output_file = 'carte_VEOLIA_prelevement_piechart.html'
m.save(output_file)
print(f"✅ Carte sauvegardée dans : {output_file}")

