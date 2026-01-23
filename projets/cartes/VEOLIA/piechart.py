import ast
import pandas
import io
import matplotlib.pyplot as plt
import branca
import folium

data = pandas.read_csv(
    "https://raw.githubusercontent.com/python-visualization/folium-example-data/main/consonants_vowels.csv",
    # To ensure that tuples are read as tuples
    converters={"coordinates": ast.literal_eval},
)

pie_charts_data = zip(data.consonants, data.vowels)

fig = plt.figure(figsize=(0.5, 0.5))
fig.patch.set_alpha(0)
ax = fig.add_subplot(111)
plots = []
for sizes in pie_charts_data:
    ax.pie(sizes, colors=("#e6194b", "#19e6b4"))
    buff = io.StringIO()
    plt.savefig(buff, format="SVG")
    buff.seek(0)
    svg = buff.read()
    svg = svg.replace("\n", "")
    plots.append(svg)
    plt.cla()
plt.clf()
plt.close()

legend_html = """
{% macro html(this, kwargs) %}
<div style="
    position: fixed;
    bottom: 50px;
    left: 50px;
    width: 250px;
    height: 80px;
    z-index:9999;
    font-size:14px;
    ">
    <p><a style="color:#e6194b;font-size:150%;margin-left:20px;">◼</a>&emsp;Consonants</p>
    <p><a style="color:#19e6b4;font-size:150%;margin-left:20px;">◼</a>&emsp;Vowels</p>
</div>
<div style="
    position: fixed;
    bottom: 50px;
    left: 50px;
    width: 150px;
    height: 80px;
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

m = folium.Map(location=(0, 0), zoom_start=2)

for i, coord in enumerate(data.coordinates):
    marker = folium.Marker(coord)
    icon = folium.DivIcon(html=plots[i])
    marker.add_child(icon)
    popup = folium.Popup(
        "Consonants: {}<br>\nVowels: {}".format(data.consonants[i], data.vowels[i])
    )
    marker.add_child(popup)
    m.add_child(marker)
m.get_root().add_child(legend)

# Sauvegarder la carte dans un fichier HTML
m.save('carte_piechart.html')
print("✅ Carte sauvegardée dans : carte_piechart.html")