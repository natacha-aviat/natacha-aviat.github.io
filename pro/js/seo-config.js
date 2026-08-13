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
            keywords: 'UX UI designer data, product design data, visualisation de données, outils digitaux, interface utilisateur, UX produit, data product designer, Natacha Aviat',
            aiPurpose: 'UX/UI design × Data : concevoir des interfaces et outils où les données deviennent utilisables.',
            aiServices: 'Cadrage UX data, Conception UX/UI, Prototypage et livraison d\'outils digitaux',
            aiTargetAudience: 'Équipes produit, managers, associations, organisations data-driven',
            aiPricing: 'Sur devis selon cadrage, conception et livraison'
        },
        en: {
            keywords: 'UX UI designer data, data product design, data visualization, digital tools, user interface, product UX, data product designer, Natacha Aviat',
            aiPurpose: 'UX/UI design × Data: design interfaces and tools where data becomes usable.',
            aiServices: 'UX data framing, UX/UI design, Prototyping and delivery of digital tools',
            aiTargetAudience: 'Product teams, managers, associations, data-driven organizations',
            aiPricing: 'Custom quote based on framing, design and delivery'
        }
    },
    
    // Configuration par type de page
    pages: {
        index: {
            fr: {
                title: 'UX/UI Designer × Data | Natacha Aviat',
                description: 'UX/UI designer spécialisée data : je conçois des interfaces et des outils où les données deviennent utilisables.',
                ogType: 'website'
            },
            en: {
                title: 'UX/UI Designer × Data | Natacha Aviat',
                description: 'UX/UI designer specialized in data: I design interfaces and tools where data becomes usable.',
                ogType: 'website'
            }
        },
        services: {
            fr: {
                title: 'Services UX/UI × Data | Natacha Aviat',
                description: 'Trois temps : cadrer les usages et les données, concevoir l\'UX/UI, livrer un prototype ou un outil utilisable.',
                ogType: 'website',
                aiServiceType: 'Cadrage UX data, Conception UX/UI, Prototypage et livraison d\'outils digitaux',
                aiPricingRange: 'Sur devis'
            },
            en: {
                title: 'UX/UI × Data Services | Natacha Aviat',
                description: 'Three steps: frame uses and data, design the UX/UI, ship a usable prototype or tool.',
                ogType: 'website',
                aiServiceType: 'UX data framing, UX/UI design, Prototyping and delivery of digital tools',
                aiPricingRange: 'Custom quote'
            }
        },
        cartes: {
            fr: {
                title: 'Projets UX/UI × Data | Natacha Aviat',
                description: 'Portfolio UX/UI × Data : outils digitaux, visualisations, parcours guidés et cartes interactives.',
                ogType: 'website',
                aiPageType: 'Portfolio UX/UI × Data',
                aiProductCount: '12',
                aiProductTypes: 'Outils digitaux, Visualisations, Parcours guidés, Cartes interactives',
                aiPricingRange: 'Gratuit à sur devis'
            },
            en: {
                title: 'UX/UI × Data Projects | Natacha Aviat',
                description: 'UX/UI × Data portfolio: digital tools, visualizations, guided journeys and interactive maps.',
                ogType: 'website',
                aiPageType: 'UX/UI × Data portfolio',
                aiProductCount: '12',
                aiProductTypes: 'Digital tools, Visualizations, Guided journeys, Interactive maps',
                aiPricingRange: 'Free to custom quote'
            }
        },
        cgv: {
            fr: {
                title: 'Conditions Générales de Vente | Natacha Aviat',
                description: 'Conditions générales de vente pour les services UX/UI × Data.',
                ogType: 'website',
                aiPageType: 'Document légal',
                aiKeyPoints: 'Propriété intellectuelle, Conditions de vente, Droit de rétractation'
            },
            en: {
                title: 'Terms and Conditions | Natacha Aviat',
                description: 'Terms and conditions for UX/UI × Data services.',
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
        'fiche-emily-paris': {
            fr: {
                title: 'Emily in Paris — Musées et lieux beauté | Sur mesure - Natacha Aviat',
                description: 'Carte interactive personnalisée des musées et lieux beauté à Paris, créée pour Emily Lutzker, New-Yorkaise de passage.',
                keywords: 'carte Paris musées, lieux beauté Paris, carte interactive Paris, Emily in Paris, guide Paris personnalisé',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/Emily_in_Paris.png',
                aiProductType: 'Carte interactive sur mesure',
                aiPrice: 'Sur mesure',
                aiDataSource: 'Curation personnalisée',
                aiTechnologies: 'Leaflet, JavaScript',
                aiUseCase: 'Guide personnalisé des musées et lieux beauté à Paris pour une visiteuse américaine'
            },
            en: {
                title: 'Emily in Paris — Museums & Beauty Spots | Custom - Natacha Aviat',
                description: 'Custom interactive map of museums and beauty spots in Paris, created for Emily Lutzker, a New Yorker visiting the city.',
                keywords: 'Paris museums map, Paris beauty spots, interactive Paris map, Emily in Paris, personalized Paris guide',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/Emily_in_Paris.png',
                aiProductType: 'Custom interactive map',
                aiPrice: 'Custom quote',
                aiDataSource: 'Personal curation',
                aiTechnologies: 'Leaflet, JavaScript',
                aiUseCase: 'Personalized guide to museums and beauty spots in Paris for an American visitor'
            }
        },
        'fiche-pharmamama': {
            fr: {
                title: 'PharmaMaMa — Dons de parapharmacie pour pharmacies solidaires | Natacha Aviat',
                description: 'Application web pour connecter les pharmacies à l\'association MaMaMa : scan des dons, bordereaux, réception et CERFA. En ligne sur pharmamama.vercel.app',
                keywords: 'PharmaMaMa, pharmacie solidaire, dons parapharmacie, CERFA, MaMaMa, défiscalisation',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/PharmaMaMa.png',
                aiProductType: 'Outil web opérationnel',
                aiPrice: 'En ligne',
                aiDataSource: 'Données pharmacie et association',
                aiTechnologies: 'Application web',
                aiUseCase: 'Lutte contre le gaspillage en parapharmacie et redistribution aux familles en précarité'
            },
            en: {
                title: 'PharmaMaMa — Pharmacy donations for solidarity | Natacha Aviat',
                description: 'Web application connecting pharmacies to the MaMaMa association: donation scanning, delivery slips, reception and CERFA. Live at pharmamama.vercel.app',
                keywords: 'PharmaMaMa, solidarity pharmacy, parapharmacy donations, CERFA, MaMaMa, tax deduction',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/PharmaMaMa.png',
                aiProductType: 'Operational web tool',
                aiPrice: 'Live',
                aiDataSource: 'Pharmacy and association data',
                aiTechnologies: 'Web application',
                aiUseCase: 'Reducing parapharmacy waste and redistributing to families in need via pharmacies'
            }
        },
        'fiche-medlex': {
            fr: {
                title: 'MedLex (Au Clair) — Contrats juridiques pour infirmières libérales | Natacha Aviat',
                description: 'Application web de génération de contrats pour infirmières libérales : questionnaire guidé, aperçu clause par clause, PDF validé par Me Violaine.',
                keywords: 'MedLex, Au Clair, contrat infirmière libérale, remplacement infirmier, droit de la santé',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/MedLex.png',
                aiProductType: 'Outil web juridique',
                aiPrice: 'En ligne',
                aiDataSource: 'Modèles juridiques validés par avocate',
                aiTechnologies: 'JavaScript, Application web',
                aiUseCase: 'Accompagnement des infirmières libérales dans leurs contrats professionnels'
            },
            en: {
                title: 'MedLex (Au Clair) — Legal contracts for freelance nurses | Natacha Aviat',
                description: 'Web application for generating contracts for freelance nurses: guided questionnaire, clause preview, PDF validated by a health law attorney.',
                keywords: 'MedLex, Au Clair, freelance nurse contract, nurse replacement, health law',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/MedLex.png',
                aiProductType: 'Legal web tool',
                aiPrice: 'Live',
                aiDataSource: 'Attorney-validated legal templates',
                aiTechnologies: 'JavaScript, Web application',
                aiUseCase: 'Supporting freelance nurses in drafting and understanding professional contracts'
            }
        },
        'fiche-textes-a-la-pelle': {
            fr: {
                title: 'Textes à la pelle — Concours d\'écriture | Gratuit - Natacha Aviat',
                description: 'Liste interactive des concours d\'écriture et appels à textes francophones, synchronisée depuis textes-a-la-pelle.fr.',
                keywords: 'concours écriture, appels à textes, Textes à la pelle, concours francophones',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/Textes_a_la_pelle.png',
                price: 0,
                aiProductType: 'Outil web',
                aiPrice: 'Gratuit',
                aiDataSource: 'textes-a-la-pelle.fr',
                aiTechnologies: 'JavaScript',
                aiUseCase: 'Trouver et filtrer les concours d\'écriture francophones'
            },
            en: {
                title: 'Textes à la pelle — Writing contests | Free - Natacha Aviat',
                description: 'Interactive list of French writing contests and calls for submissions, synced from textes-a-la-pelle.fr.',
                keywords: 'writing contest, call for submissions, Textes à la pelle, French writing',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/Textes_a_la_pelle.png',
                price: 0,
                aiProductType: 'Web tool',
                aiPrice: 'Free',
                aiDataSource: 'textes-a-la-pelle.fr',
                aiTechnologies: 'JavaScript',
                aiUseCase: 'Find and filter French writing contests and calls for submissions'
            }
        },
        'fiche-coutsia': {
            fr: {
                title: 'CoûtsIA — Estimateur de coûts d\'outils IA | Gratuit - Natacha Aviat',
                description: 'Estimez le coût de création et d\'exploitation d\'un outil IA pour votre PME. Fourchettes réalistes, scénarios et export PDF.',
                keywords: 'CoûtsIA, estimation coûts IA, coût outil IA, budget IA PME',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/CoutsIA.svg',
                price: 0,
                aiProductType: 'Outil web',
                aiPrice: 'Gratuit',
                aiTechnologies: 'JavaScript, HTML',
                aiUseCase: 'Estimer le coût de création et d\'exploitation d\'un outil IA avant d\'investir'
            },
            en: {
                title: 'CoûtsIA — AI tool cost estimator | Free - Natacha Aviat',
                description: 'Estimate the build and running costs of an AI tool for your SME. Realistic ranges, scenarios and PDF export.',
                keywords: 'CoûtsIA, AI cost estimate, AI tool budget, SME AI pricing',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/CoutsIA.svg',
                price: 0,
                aiProductType: 'Web tool',
                aiPrice: 'Free',
                aiTechnologies: 'JavaScript, HTML',
                aiUseCase: 'Estimate build and running costs of an AI tool before investing'
            }
        },
        'fiche-bandcamp-discovery': {
            fr: {
                title: 'Bandcamp Advanced Discovery — Digging pour DJ HoldTight | Sur mesure - Natacha Aviat',
                description: 'Outil de découverte Bandcamp avancé pour le DJ HoldTight : digging par genres, villes, nouveautés et tendances.',
                keywords: 'Bandcamp Advanced Discovery, digging Bandcamp, outil DJ, HoldTight, découverte musicale',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/Bandcamp_Advanced_Discovery.png',
                aiProductType: 'Outil web sur mesure',
                aiPrice: 'Sur mesure',
                aiTechnologies: 'JavaScript, UX/UI',
                aiUseCase: 'Accélérer le digging Bandcamp pour un DJ'
            },
            en: {
                title: 'Bandcamp Advanced Discovery — Digging for DJ HoldTight | Custom - Natacha Aviat',
                description: 'Advanced Bandcamp discovery tool for DJ HoldTight: dig by genres, cities, new releases and trends.',
                keywords: 'Bandcamp Advanced Discovery, Bandcamp digging, DJ tool, HoldTight, music discovery',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/Bandcamp_Advanced_Discovery.png',
                aiProductType: 'Custom web tool',
                aiPrice: 'Custom quote',
                aiTechnologies: 'JavaScript, UX/UI',
                aiUseCase: 'Speed up Bandcamp digging for a DJ'
            }
        },
        'fiche-myfairstory': {
            fr: {
                title: 'MyFairStory — Score d\'équilibre de genre dans les histoires | Natacha Aviat',
                description: 'Un score visuel inspiré du test de Bechdel pour voir en un coup d\'œil si femmes et hommes sont représentés de manière équivalente.',
                keywords: 'MyFairStory, test de Bechdel, représentation des femmes, équilibre de genre, visualisation',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/MyFairStory.png',
                aiProductType: 'Concept de visualisation',
                aiPrice: 'Concept',
                aiTechnologies: 'UX/UI, Data viz, Design de score',
                aiUseCase: 'Visualiser l\'équilibre de représentation des genres dans un récit'
            },
            en: {
                title: 'MyFairStory — Gender-balance score for stories | Natacha Aviat',
                description: 'A Bechdel-inspired visual score to see at a glance whether women and men are represented equally in a story.',
                keywords: 'MyFairStory, Bechdel test, gender representation, data visualization',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/MyFairStory.png',
                aiProductType: 'Visualization concept',
                aiPrice: 'Concept',
                aiTechnologies: 'UX/UI, Data viz, Score design',
                aiUseCase: 'Visualize gender representation balance in a story'
            }
        },
        'fiche-sans-chef': {
            fr: {
                title: 'Équipe sans chef — Organisation collective sans hiérarchie | Natacha Aviat',
                description: 'Design d\'une équipe sans chef : triage lundi, rôles tournants, coaching peer-to-peer, NPS client. Un cas réel qui a convaincu l\'équipe et les clients.',
                keywords: 'équipe sans chef, organisation sans hiérarchie, self-management, rôles tournants',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/SansChef.svg',
                aiProductType: 'Design organisationnel',
                aiPrice: 'Cas réel',
                aiTechnologies: 'UX organisationnel, rituels, self-management',
                aiUseCase: 'Faire fonctionner une équipe sans chef via des mécanismes collectifs'
            },
            en: {
                title: 'Boss-less team — Collective organization without hierarchy | Natacha Aviat',
                description: 'Design of a boss-less team: Monday triage, rotating roles, peer coaching, client NPS. A real case that convinced the team and clients.',
                keywords: 'boss-less team, self-management, flat organization, rotating roles',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/SansChef.svg',
                aiProductType: 'Organizational design',
                aiPrice: 'Real case',
                aiTechnologies: 'Organizational UX, rituals, self-management',
                aiUseCase: 'Run a team without a boss via collective mechanisms'
            }
        },
        'fiche-assopilot': {
            fr: {
                title: 'AssoPilot — Financement des associations | Natacha Aviat',
                description: 'SaaS pour associations : veille des appels à projets, candidatures assistées, suivi des financements et fléchage des dépenses.',
                keywords: 'AssoPilot, association, appels à projets, financement, ESS',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/AssoPilot.svg',
                aiProductType: 'SaaS / outil web',
                aiPrice: 'En développement',
                aiTechnologies: 'Next.js, Supabase, TypeScript, Tailwind',
                aiUseCase: 'Piloter le cycle de financement d\'une association'
            },
            en: {
                title: 'AssoPilot — Funding for nonprofits | Natacha Aviat',
                description: 'SaaS for associations: funding-call watch, AI-assisted applications, grant tracking and expense allocation.',
                keywords: 'AssoPilot, nonprofit, funding calls, grants',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/AssoPilot.svg',
                aiProductType: 'SaaS / web tool',
                aiPrice: 'In development',
                aiTechnologies: 'Next.js, Supabase, TypeScript, Tailwind',
                aiUseCase: 'Run an association funding cycle'
            }
        },
        'fiche-mamacollecte': {
            fr: {
                title: 'MaMaCollecte — Inscriptions aux collectes | Natacha Aviat',
                description: 'Outil pour MaMaMa : inscription des bénévoles aux créneaux de collecte en supermarché, par lieu et capacité.',
                keywords: 'MaMaCollecte, MaMaMa, collecte, bénévoles, créneaux',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/MaMaCollecte.svg',
                aiProductType: 'Outil web opérationnel',
                aiPrice: 'En développement',
                aiTechnologies: 'JavaScript, HTML, CSS, API',
                aiUseCase: 'Inscrire des bénévoles aux créneaux de collecte'
            },
            en: {
                title: 'MaMaCollecte — Collection slot sign-up | Natacha Aviat',
                description: 'Tool for MaMaMa: volunteer sign-up for supermarket collection slots, by location and capacity.',
                keywords: 'MaMaCollecte, MaMaMa, food drive, volunteers, slots',
                ogType: 'product',
                ogImage: 'https://natacha-aviat.github.io/pro/images/MaMaCollecte.svg',
                aiProductType: 'Operational web tool',
                aiPrice: 'In development',
                aiTechnologies: 'JavaScript, HTML, CSS, API',
                aiUseCase: 'Sign volunteers up for collection slots'
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
    'projets.html': { fr: 'projets.html', en: 'en/projects.html' },
    'projects.html': { fr: 'projets.html', en: 'en/projects.html' },
    'cartes-disponibles.html': { fr: 'projets.html', en: 'en/projects.html' },
    'maps-available.html': { fr: 'projets.html', en: 'en/projects.html' },
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
    'sheet-nyc-art.html': { fr: 'fiches/fiche-nyc-art.html', en: 'en/fiches/sheet-nyc-art.html' },
    'fiche-emily-paris.html': { fr: 'fiches/fiche-emily-paris.html', en: 'en/fiches/sheet-emily-paris.html' },
    'sheet-emily-paris.html': { fr: 'fiches/fiche-emily-paris.html', en: 'en/fiches/sheet-emily-paris.html' },
    'fiche-pharmamama.html': { fr: 'fiches/fiche-pharmamama.html', en: 'en/fiches/sheet-pharmamama.html' },
    'sheet-pharmamama.html': { fr: 'fiches/fiche-pharmamama.html', en: 'en/fiches/sheet-pharmamama.html' },
    'fiche-medlex.html': { fr: 'fiches/fiche-medlex.html', en: 'en/fiches/sheet-medlex.html' },
    'sheet-medlex.html': { fr: 'fiches/fiche-medlex.html', en: 'en/fiches/sheet-medlex.html' },
    'fiche-textes-a-la-pelle.html': { fr: 'fiches/fiche-textes-a-la-pelle.html', en: 'en/fiches/sheet-textes-a-la-pelle.html' },
    'sheet-textes-a-la-pelle.html': { fr: 'fiches/fiche-textes-a-la-pelle.html', en: 'en/fiches/sheet-textes-a-la-pelle.html' },
    'fiche-coutsia.html': { fr: 'fiches/fiche-coutsia.html', en: 'en/fiches/sheet-coutsia.html' },
    'sheet-coutsia.html': { fr: 'fiches/fiche-coutsia.html', en: 'en/fiches/sheet-coutsia.html' },
    'fiche-bandcamp-discovery.html': { fr: 'fiches/fiche-bandcamp-discovery.html', en: 'en/fiches/sheet-bandcamp-discovery.html' },
    'sheet-bandcamp-discovery.html': { fr: 'fiches/fiche-bandcamp-discovery.html', en: 'en/fiches/sheet-bandcamp-discovery.html' },
    'fiche-myfairstory.html': { fr: 'fiches/fiche-myfairstory.html', en: 'en/fiches/sheet-myfairstory.html' },
    'sheet-myfairstory.html': { fr: 'fiches/fiche-myfairstory.html', en: 'en/fiches/sheet-myfairstory.html' },
    'fiche-sans-chef.html': { fr: 'fiches/fiche-sans-chef.html', en: 'en/fiches/sheet-boss-less-team.html' },
    'sheet-boss-less-team.html': { fr: 'fiches/fiche-sans-chef.html', en: 'en/fiches/sheet-boss-less-team.html' },
    'fiche-assopilot.html': { fr: 'fiches/fiche-assopilot.html', en: 'en/fiches/sheet-assopilot.html' },
    'sheet-assopilot.html': { fr: 'fiches/fiche-assopilot.html', en: 'en/fiches/sheet-assopilot.html' },
    'fiche-mamacollecte.html': { fr: 'fiches/fiche-mamacollecte.html', en: 'en/fiches/sheet-mamacollecte.html' },
    'sheet-mamacollecte.html': { fr: 'fiches/fiche-mamacollecte.html', en: 'en/fiches/sheet-mamacollecte.html' }
};

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SEO_CONFIG, PAGE_MAPPING, FICHE_MAPPING };
}
