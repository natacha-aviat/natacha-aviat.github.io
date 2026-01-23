/**
 * ============================================================================
 * COMPOSANTS JAVASCRIPT RÉUTILISABLES
 * ============================================================================
 * Ce fichier contient toutes les fonctions réutilisables pour :
 * - Navigation active
 * - Filtres de la page cartes-disponibles.html
 * - Scroll vers ancres
 */

/**
 * Initialise la navigation active basée sur l'URL
 */
function initNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a[data-nav]');
    
    navLinks.forEach(link => {
        const navKey = link.getAttribute('data-nav');
        
        // Déterminer si le lien est actif
        let isActive = false;
        
        if (currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath.endsWith('/pro/')) {
            isActive = navKey === 'index';
        } else if (currentPath.includes('cartes-disponibles.html') || currentPath.includes('fiches/')) {
            isActive = navKey === 'cartes';
        } else if (currentPath.includes('services.html')) {
            isActive = navKey === 'services';
        }
        
        if (isActive) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * Initialise les filtres de la page cartes-disponibles.html
 */
function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn[data-filter]');
    const techButtons = document.querySelectorAll('.filter-btn[data-tech]');
    const dataButtons = document.querySelectorAll('.filter-btn[data-data]');
    const sectorButtons = document.querySelectorAll('.filter-btn[data-sector]');
    const projectItems = document.querySelectorAll('.project-item');
    
    // Si pas de filtres sur cette page, ne rien faire
    if (filterButtons.length === 0 && techButtons.length === 0 && dataButtons.length === 0) {
        return;
    }
    
    let currentFilter = 'all';
    let currentTech = 'all';
    let currentData = 'all';
    let currentSector = 'all';
    
    /**
     * Fonction de filtrage des projets
     */
    function filterProjects() {
        projectItems.forEach(item => {
            const itemType = item.getAttribute('data-type');
            const itemSector = item.getAttribute('data-sector');
            const itemTechs = item.getAttribute('data-tech') || '';
            const itemData = item.getAttribute('data-data') || '';
            
            const typeMatch = currentFilter === 'all' || itemType === currentFilter;
            const sectorMatch = currentSector === 'all' || itemSector === currentSector || itemSector === 'all';
            const techMatch = currentTech === 'all' || itemTechs === 'all' || itemTechs.includes(currentTech);
            const dataMatch = currentData === 'all' || itemData === 'all' || itemData.includes(currentData);
            
            if (typeMatch && sectorMatch && techMatch && dataMatch) {
                item.style.display = 'block';
                item.classList.add('fade-in');
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    /**
     * Active un bouton de filtre et met à jour l'état
     */
    function activateFilter(buttons, attribute, value) {
        buttons.forEach(btn => btn.classList.remove('active'));
        const targetButton = Array.from(buttons).find(btn => btn.getAttribute(attribute) === value);
        if (targetButton) {
            targetButton.classList.add('active');
        }
    }
    
    // Gestion des filtres par type
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            activateFilter(filterButtons, 'data-filter', this.getAttribute('data-filter'));
            currentFilter = this.getAttribute('data-filter');
            filterProjects();
        });
    });
    
    // Gestion des filtres par technologie
    techButtons.forEach(button => {
        button.addEventListener('click', function() {
            activateFilter(techButtons, 'data-tech', this.getAttribute('data-tech'));
            currentTech = this.getAttribute('data-tech');
            filterProjects();
        });
    });
    
    // Gestion des filtres par source de données
    dataButtons.forEach(button => {
        button.addEventListener('click', function() {
            activateFilter(dataButtons, 'data-data', this.getAttribute('data-data'));
            currentData = this.getAttribute('data-data');
            filterProjects();
        });
    });
    
    // Gestion des filtres par secteur
    sectorButtons.forEach(button => {
        button.addEventListener('click', function() {
            activateFilter(sectorButtons, 'data-sector', this.getAttribute('data-sector'));
            currentSector = this.getAttribute('data-sector');
            filterProjects();
        });
    });
    
    // Gestion des paramètres URL pour les liens depuis services.html
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type');
    const techParam = urlParams.get('tech');
    const dataParam = urlParams.get('data');
    
    if (typeParam) {
        const targetButton = Array.from(filterButtons).find(btn => {
            const filter = btn.getAttribute('data-filter');
            return (typeParam === 'cartes' && filter === 'cartes') ||
                   (typeParam === 'analyses' && filter === 'analyses') ||
                   (typeParam === 'outils' && filter === 'outils');
        });
        
        if (targetButton) {
            activateFilter(filterButtons, 'data-filter', targetButton.getAttribute('data-filter'));
            currentFilter = targetButton.getAttribute('data-filter');
        }
    }
    
    if (techParam) {
        const targetTechButton = Array.from(techButtons).find(btn => {
            return btn.getAttribute('data-tech') === techParam;
        });
        
        if (targetTechButton) {
            activateFilter(techButtons, 'data-tech', techParam);
            currentTech = techParam;
        }
    }
    
    if (dataParam) {
        const targetDataButton = Array.from(dataButtons).find(btn => {
            return btn.getAttribute('data-data') === dataParam;
        });
        
        if (targetDataButton) {
            activateFilter(dataButtons, 'data-data', dataParam);
            currentData = dataParam;
        }
    }
    
    // Appliquer les filtres après avoir traité les paramètres URL
    if (typeParam || techParam || dataParam) {
        filterProjects();
    }
}

/**
 * Gère le scroll vers une ancre dans l'URL
 */
function initHashScroll() {
    const hash = window.location.hash;
    if (hash) {
        const targetElement = document.querySelector(hash);
        if (targetElement) {
            setTimeout(() => {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }
}

/**
 * Génère le lien de changement de langue vers la page équivalente
 * Utilise les mappings centralisés depuis seo-config.js
 */
function getLanguageSwitchUrl(targetLang) {
    const currentPath = window.location.pathname;
    const isEn = currentPath.includes('/en/');
    const isFiche = currentPath.includes('/fiches/');
    const fileName = currentPath.split('/').pop();
    
    // Utiliser les mappings centralisés (définis dans seo-config.js ou ici en fallback)
    const pageMapping = typeof PAGE_MAPPING !== 'undefined' ? PAGE_MAPPING : {
        'index.html': { fr: 'index.html', en: 'en/index.html' },
        'cartes-disponibles.html': { fr: 'cartes-disponibles.html', en: 'en/maps-available.html' },
        'maps-available.html': { fr: 'cartes-disponibles.html', en: 'en/maps-available.html' },
        'services.html': { fr: 'services.html', en: 'en/services.html' },
        'cgv.html': { fr: 'cgv.html', en: 'en/terms.html' },
        'terms.html': { fr: 'cgv.html', en: 'en/terms.html' }
    };
    
    const ficheMapping = typeof FICHE_MAPPING !== 'undefined' ? FICHE_MAPPING : {
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
    
    let targetPage = '';
    
    if (isFiche) {
        // C'est une fiche
        const mapping = ficheMapping[fileName];
        if (mapping) {
            targetPage = targetLang === 'en' ? mapping.en : mapping.fr;
            // Ajouter le bon préfixe selon la profondeur
            if (isEn && targetLang === 'fr') {
                // De /en/fiches/ vers /fiches/ : deux niveaux en arrière
                return '../../' + targetPage;
            } else if (!isEn && targetLang === 'en') {
                // De /fiches/ vers /en/fiches/ : un niveau en arrière puis en/
                return '../' + targetPage;
            } else {
                return targetPage;
            }
        }
    } else {
        // C'est une page principale
        const mapping = pageMapping[fileName];
        if (mapping) {
            targetPage = targetLang === 'en' ? mapping.en : mapping.fr;
            if (isEn && targetLang === 'fr') {
                // De /en/ vers / : un niveau en arrière
                return '../' + targetPage;
            } else if (!isEn && targetLang === 'en') {
                // De / vers /en/ : pas de préfixe, juste le chemin
                return targetPage;
            } else {
                return targetPage;
            }
        }
    }
    
    // Fallback : page d'accueil
    if (targetLang === 'en') {
        return isEn ? 'index.html' : 'en/index.html';
    } else {
        return isEn ? '../index.html' : 'index.html';
    }
}

/**
 * Initialise les liens de changement de langue
 */
function initLanguageSwitcher() {
    const langLinks = document.querySelectorAll('.lang-link');
    const footerLangLinks = document.querySelectorAll('.footer-lang-link');
    
    const currentPath = window.location.pathname;
    const isEn = currentPath.includes('/en/');
    const targetLang = isEn ? 'fr' : 'en';
    
    langLinks.forEach(link => {
        const newUrl = getLanguageSwitchUrl(targetLang);
        link.setAttribute('href', newUrl);
    });
    
    footerLangLinks.forEach(link => {
        const newUrl = getLanguageSwitchUrl(targetLang);
        link.setAttribute('href', newUrl);
    });
}
