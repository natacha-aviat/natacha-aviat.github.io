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
            const sectorMatch = currentSector === 'all' || itemSector === currentSector;
            const techMatch = currentTech === 'all' || itemTechs.includes(currentTech);
            const dataMatch = currentData === 'all' || itemData.includes(currentData);
            
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
