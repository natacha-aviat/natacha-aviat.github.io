/**
 * ============================================================================
 * CONFIGURATION SEO ET IA - CENTRALISÉE
 * ============================================================================
 * Ce fichier contient toutes les configurations SEO et IA pour éviter la duplication
 * et assurer la cohérence sur tout le site.
 */

const SEO_CONFIG = {
    // Configuration de base du site
    site: {
        baseUrl: 'https://natacha-aviat.github.io/pro',
        author: 'Natacha Aviat',
        defaultImage: 'https://natacha-aviat.github.io/pro/images/Natacha_Aviat.jpeg',
        defaultLocale: {
            fr: 'fr_FR',
            en: 'en_US'
        }
    },
    
    // Meta tags communs pour toutes les pages
    common: {
        fr: {
            keywords: 'cartographie interactive, analyse de données, visualisation de données, carte interactive, consultant data, data visualization, insights actionnables, cartographie France, open data, Leaflet, Python, décisions data-driven',
            aiPurpose: 'Service de cartographie interactive et analyse de données pour managers techniques, associations, entreprises engagées et institutions publiques. Fournit des insights actionnables pour les équipes.',
            aiServices: 'Cartographie interactive, Analyse de données, Visualisation de données, Développement d\'outils web, Insights actionnables pour équipes',
            aiTargetAudience: 'Managers techniques (chimie, BTP, environnement, dépollution), associations, entreprises engagées, institutions publiques',
            aiPricing: 'Cartes sur étagère: 0-600€, Adaptation: 600-1500€, Sur-mesure: 1500€+'
        },
        en: {
            keywords: 'interactive mapping, data analysis, data visualization, interactive map, data consultant, data visualization, actionable insights, mapping France, open data, Leaflet, Python, data-driven decisions',
            aiPurpose: 'Interactive mapping and data analysis service for technical managers, associations, engaged companies and public institutions. Provides actionable insights for teams.',
            aiServices: 'Interactive mapping, Data analysis, Data visualization, Web tools development, Actionable insights for teams',
            aiTargetAudience: 'Technical managers (chemistry, construction, environment, decontamination), associations, engaged companies, public institutions',
            aiPricing: 'Off-the-shelf maps: 0-600€, Adaptation: 600-1500€, Custom: 1500€+'
        }
    },
    
    // Configuration par type de page
    pages: {
        index: {
            fr: {
                title: 'Cartographie Interactive et Analyse de Données | Natacha Aviat',
                description: 'Cartographie interactive et analyse de données pour managers techniques. Obtenez des insights actionnables pour vos équipes. Visualisez vos données sur une carte pour prendre des décisions éclairées. Services pour associations, entreprises engagées et institutions publiques.',
                ogType: 'website'
            },
            en: {
                title: 'Interactive Mapping and Data Analysis | Natacha Aviat',
                description: 'Interactive mapping and data analysis for technical managers. Get actionable insights for your teams. Visualize your data on a map to make informed decisions. Services for associations, engaged companies and public institutions.',
                ogType: 'website'
            }
        },
        services: {
            fr: {
                title: 'Services de Cartographie Interactive | Natacha Aviat',
                description: 'Trois niveaux d\'adaptation à vos besoins : carte sur étagère, adaptation d\'une carte existante, ou développement sur-mesure. Obtenez des insights actionnables pour vos équipes.',
                ogType: 'website',
                aiServiceType: 'Cartographie interactive, Analyse de données, Visualisation de données, Insights actionnables pour équipes',
                aiPricingRange: '0-600€ (étagère), 600-1500€ (adaptation), 1500€+ (sur-mesure)'
            },
            en: {
                title: 'Interactive Mapping Services | Natacha Aviat',
                description: 'Three levels of adaptation to your needs: off-the-shelf map, adaptation of an existing map, or custom development. Get actionable insights for your teams.',
                ogType: 'website',
                aiServiceType: 'Interactive mapping, Data analysis, Data visualization, Actionable insights for teams',
                aiPricingRange: '0-600€ (off-the-shelf), 600-1500€ (adaptation), 1500€+ (custom)'
            }
        },
        cartes: {
            fr: {
                title: 'Cartes Interactives Disponibles | Natacha Aviat',
                description: 'Explorez mes cartes interactives et outils opérationnels. Cartes de pollution, lycées, outils d\'optimisation. Obtenez des insights actionnables pour vos équipes.',
                ogType: 'website',
                aiPageType: 'Portfolio de cartes interactives',
                aiProductCount: '7',
                aiProductTypes: 'Cartes interactives, Outils web opérationnels',
                aiPricingRange: 'Gratuit à 600€'
            },
            en: {
                title: 'Available Interactive Maps | Natacha Aviat',
                description: 'Explore my interactive maps and operational tools. Pollution maps, high schools, optimization tools. Get actionable insights for your teams.',
                ogType: 'website',
                aiPageType: 'Interactive maps portfolio',
                aiProductCount: '7',
                aiProductTypes: 'Interactive maps, Operational web tools',
                aiPricingRange: 'Free to 600€'
            }
        },
        cgv: {
            fr: {
                title: 'Conditions Générales de Vente | Natacha Aviat',
                description: 'Conditions générales de vente pour les services de cartographie interactive et d\'analyse de données.',
                ogType: 'website',
                aiPageType: 'Document légal',
                aiKeyPoints: 'Propriété intellectuelle, Conditions de vente, Droit de rétractation'
            },
            en: {
                title: 'Terms and Conditions | Natacha Aviat',
                description: 'Terms and conditions for interactive mapping and data analysis services.',
                ogType: 'website',
                aiPageType: 'Legal document',
                aiKeyPoints: 'Intellectual property, Sales conditions, Right of withdrawal'
            }
        }
    },
    
    // Configuration des fiches produits
    fiches: {
        'fiche-rejets': {
            fr: {
                title: 'Carte des Rejets d\'Eau Industriels en France | 600€ - Natacha Aviat',
                description: 'Carte interactive des rejets d\'eau industriels en France avec marqueurs camembert. Visualisez les volumes de rejets raccordés et isolés par établissement. La taille du camembert indique l\'amplitude du débit. Données Géorisques. Prix : 600€.',
                keywords: 'carte rejets eau industriels, pollution eau France, établissements industriels, Géorisques, carte interactive pollution, visualisation camembert, débit rejets',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/image_carte_pollution_rejets.png',
                price: 600,
                aiProductType: 'Carte interactive',
                aiPrice: '600 EUR',
                aiDataSource: 'Géorisques - IREP',
                aiTechnologies: 'Leaflet, JavaScript',
                aiUseCase: 'Visualisation des rejets d\'eau industriels en France par établissement avec marqueurs camembert indiquant la proportion et l\'amplitude du débit'
            },
            en: {
                title: 'Industrial Water Discharges Map in France | 600€ - Natacha Aviat',
                description: 'Interactive map of industrial water discharges in France with pie chart markers. Visualize connected and isolated discharge volumes by establishment. Pie chart size indicates flow amplitude. Géorisques data. Price: 600€.',
                keywords: 'industrial water discharges map, water pollution France, industrial establishments, Géorisques, interactive pollution map, pie chart visualization, discharge flow',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/image_carte_pollution_rejets.png',
                price: 600,
                aiProductType: 'Interactive map',
                aiPrice: '600 EUR',
                aiDataSource: 'Géorisques - IREP',
                aiTechnologies: 'Leaflet, JavaScript',
                aiUseCase: 'Visualization of industrial water discharges in France by establishment with pie chart markers indicating proportion and flow amplitude'
            }
        },
        'fiche-prelevements': {
            fr: {
                title: 'Carte des Prélèvements d\'Eau Industriels en France | 600€ - Natacha Aviat',
                description: 'Carte interactive des prélèvements d\'eau industriels en France avec marqueurs camembert. Visualisez les volumes par source : eaux souterraines, surface, réseau. La taille du camembert indique l\'amplitude du débit. Données Géorisques. Prix : 600€.',
                keywords: 'carte prélèvements eau industriels, consommation eau France, établissements industriels, Géorisques, carte interactive eau, visualisation camembert, débit prélèvements',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/image_carte_pollution_prelevements.png',
                price: 600,
                aiProductType: 'Carte interactive',
                aiPrice: '600 EUR',
                aiDataSource: 'Géorisques',
                aiTechnologies: 'Leaflet, JavaScript',
                aiUseCase: 'Visualisation des prélèvements d\'eau industriels en France par source avec marqueurs camembert indiquant la proportion et l\'amplitude du débit'
            },
            en: {
                title: 'Industrial Water Withdrawals Map in France | 600€ - Natacha Aviat',
                description: 'Interactive map of industrial water withdrawals in France with pie chart markers. Visualize volumes by source: groundwater, surface, network. Pie chart size indicates flow amplitude. Géorisques data. Price: 600€.',
                keywords: 'industrial water withdrawals map, water consumption France, industrial establishments, Géorisques, interactive water map, pie chart visualization, withdrawal flow',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/image_carte_pollution_prelevements.png',
                price: 600,
                aiProductType: 'Interactive map',
                aiPrice: '600 EUR',
                aiDataSource: 'Géorisques',
                aiTechnologies: 'Leaflet, JavaScript',
                aiUseCase: 'Visualization of industrial water withdrawals in France by source with pie chart markers indicating proportion and flow amplitude'
            }
        },
        'fiche-lycees': {
            fr: {
                title: 'Valeur Ajoutée des Lycées Français | Gratuit - Natacha Aviat',
                description: 'Carte interactive de la valeur ajoutée des lycées français. Visualisez la performance des établissements en tenant compte de leur contexte socio-économique. Gratuit.',
                keywords: 'carte lycées français, valeur ajoutée éducation, performance lycées, carte interactive éducation',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/image_lycees.png',
                price: 0,
                aiProductType: 'Carte interactive',
                aiPrice: 'Gratuit',
                aiDataSource: 'Ministère de l\'Éducation Nationale',
                aiTechnologies: 'Leaflet, JavaScript',
                aiUseCase: 'Visualisation de la valeur ajoutée des lycées français pour comprendre la performance réelle des établissements'
            },
            en: {
                title: 'French High Schools Value Added | Free - Natacha Aviat',
                description: 'Interactive map of French high schools value added. Visualize school performance taking into account their socio-economic context. Free.',
                keywords: 'French high schools map, education value added, school performance, interactive education map',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/image_lycees.png',
                price: 0,
                aiProductType: 'Interactive map',
                aiPrice: 'Free',
                aiDataSource: 'Ministry of National Education',
                aiTechnologies: 'Leaflet, JavaScript',
                aiUseCase: 'Visualization of French high schools value added to understand real school performance'
            }
        },
        'fiche-nyc-art': {
            fr: {
                title: 'Œuvres d\'Art des Stations de Métro de NYC | Gratuit - Natacha Aviat',
                description: 'Carte interactive des œuvres d\'art des stations de métro de New York. Explorez plus de 300 œuvres d\'art dans le métro new-yorkais. Gratuit.',
                keywords: 'carte art métro NYC, œuvres d\'art stations métro, art public New York, carte interactive art',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/art_NYC.png',
                price: 0,
                aiProductType: 'Carte interactive',
                aiPrice: 'Gratuit',
                aiDataSource: 'MTA Arts & Design',
                aiTechnologies: 'Leaflet, JavaScript',
                aiUseCase: 'Exploration des œuvres d\'art dans le métro de New York'
            },
            en: {
                title: 'NYC Metro Art Station Works | Free - Natacha Aviat',
                description: 'Interactive map of art works in New York subway stations. Explore over 300 art works in the New York subway. Free.',
                keywords: 'NYC subway art map, subway station art works, public art New York, interactive art map',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/art_NYC.png',
                price: 0,
                aiProductType: 'Interactive map',
                aiPrice: 'Free',
                aiDataSource: 'MTA Arts & Design',
                aiTechnologies: 'Leaflet, JavaScript',
                aiUseCase: 'Exploration of art works in the New York subway'
            }
        },
        'fiche-optimisation-tournees': {
            fr: {
                title: 'Outil d\'Optimisation de Tournées Logistiques | Gratuit - Natacha Aviat',
                description: 'Outil web d\'optimisation de tournées logistiques. Planifiez vos tournées de collecte de manière optimale. Gratuit.',
                keywords: 'optimisation tournées, logistique, planification tournées, outil web logistique',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/MaMaExpress.png',
                price: 0,
                aiProductType: 'Outil web',
                aiPrice: 'Gratuit',
                aiDataSource: 'Données client',
                aiTechnologies: 'JavaScript, Leaflet',
                aiUseCase: 'Optimisation de tournées de collecte logistique'
            },
            en: {
                title: 'Logistics Route Optimization Tool | Free - Natacha Aviat',
                description: 'Web tool for logistics route optimization. Plan your collection routes optimally. Free.',
                keywords: 'route optimization, logistics, route planning, logistics web tool',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/MaMaExpress.png',
                price: 0,
                aiProductType: 'Web tool',
                aiPrice: 'Free',
                aiDataSource: 'Client data',
                aiTechnologies: 'JavaScript, Leaflet',
                aiUseCase: 'Optimization of logistics collection routes'
            }
        },
        'fiche-inventaire': {
            fr: {
                title: 'Outil d\'Inventaire avec Scanner de Code-Barres | Gratuit - Natacha Aviat',
                description: 'Outil web d\'inventaire avec scanner de code-barres intégré. Gérez vos inventaires efficacement. Gratuit.',
                keywords: 'inventaire, scanner code-barres, gestion inventaire, outil web inventaire',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/MaMaFoodScan.png',
                price: 0,
                aiProductType: 'Outil web',
                aiPrice: 'Gratuit',
                aiDataSource: 'Données client',
                aiTechnologies: 'JavaScript, QuaggaJS',
                aiUseCase: 'Gestion d\'inventaire avec scanner de code-barres'
            },
            en: {
                title: 'Barcode Scanner Inventory Tool | Free - Natacha Aviat',
                description: 'Web inventory tool with integrated barcode scanner. Manage your inventories efficiently. Free.',
                keywords: 'inventory, barcode scanner, inventory management, inventory web tool',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/MaMaFoodScan.png',
                price: 0,
                aiProductType: 'Web tool',
                aiPrice: 'Free',
                aiDataSource: 'Client data',
                aiTechnologies: 'JavaScript, QuaggaJS',
                aiUseCase: 'Inventory management with barcode scanner'
            }
        }
    }
};

/**
 * Mapping des pages pour le changement de langue
 */
const PAGE_MAPPING = {
    'index.html': { fr: 'index.html', en: 'en/index.html' },
    'cartes-disponibles.html': { fr: 'cartes-disponibles.html', en: 'en/maps-available.html' },
    'maps-available.html': { fr: 'cartes-disponibles.html', en: 'en/maps-available.html' },
    'services.html': { fr: 'services.html', en: 'en/services.html' },
    'cgv.html': { fr: 'cgv.html', en: 'en/terms.html' },
    'terms.html': { fr: 'cgv.html', en: 'en/terms.html' }
};

/**
 * Mapping des fiches pour le changement de langue
 */
const FICHE_MAPPING = {
    'fiche-lycees.html': { fr: 'fiches/fiche-lycees.html', en: 'en/fiches/sheet-high-schools.html' },
    'sheet-high-schools.html': { fr: 'fiches/fiche-lycees.html', en: 'en/fiches/sheet-high-schools.html' },
    'fiche-rejets.html': { fr: 'fiches/fiche-rejets.html', en: 'en/fiches/sheet-discharges.html' },
    'sheet-discharges.html': { fr: 'fiches/fiche-rejets.html', en: 'en/fiches/sheet-discharges.html' },
    'fiche-prelevements.html': { fr: 'fiches/fiche-prelevements.html', en: 'en/fiches/sheet-withdrawals.html' },
    'sheet-withdrawals.html': { fr: 'fiches/fiche-prelevements.html', en: 'en/fiches/sheet-withdrawals.html' },
    'fiche-optimisation-tournees.html': { fr: 'fiches/fiche-optimisation-tournees.html', en: 'en/fiches/sheet-route-optimization.html' },
    'sheet-route-optimization.html': { fr: 'fiches/fiche-optimisation-tournees.html', en: 'en/fiches/sheet-route-optimization.html' },
    'fiche-inventaire.html': { fr: 'fiches/fiche-inventaire.html', en: 'en/fiches/sheet-inventory.html' },
    'sheet-inventory.html': { fr: 'fiches/fiche-inventaire.html', en: 'en/fiches/sheet-inventory.html' },
    'fiche-nyc-art.html': { fr: 'fiches/fiche-nyc-art.html', en: 'en/fiches/sheet-nyc-art.html' },
    'sheet-nyc-art.html': { fr: 'fiches/fiche-nyc-art.html', en: 'en/fiches/sheet-nyc-art.html' }
};

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SEO_CONFIG, PAGE_MAPPING, FICHE_MAPPING };
}
