function getContactFormFallback() {
    // Détecter la langue depuis l'URL, le chemin ou l'attribut lang du HTML
    const path = window.location.pathname;
    const htmlLang = document.documentElement.getAttribute('lang');
    const isEn = path.includes('/en/') || htmlLang === 'en';
    if (isEn) {
        return `
<section class="section" id="contact">
    <div class="container">
        <div class="contact-section">
            <h2 class="text-center mb-2">Eager to learn about your project</h2>
            <div class="text-center">
                <a href="mailto:natacha.aviat+map@gmail.com?subject=Contact request&body=Hello,%0D%0A%0D%0AI would like to discuss my project.%0D%0A%0D%0AMy project in a few lines:%0D%0A%0D%0AThank you!" class="btn btn-primary btn-large" style="background-color: #3498DB; color: #FFFFFF; border: 2px solid #3498DB;">Contact me</a>
            </div>
        </div>
    </div>
</section>
`;
    } else {
        return `
<section class="section" id="contact">
    <div class="container">
        <div class="contact-section">
            <h2 class="text-center mb-2">Hâte de connaître votre projet</h2>
            <div class="text-center">
                <a href="mailto:natacha.aviat+map@gmail.com?subject=Demande de contact&body=Bonjour,%0D%0A%0D%0AJe souhaite discuter de mon projet.%0D%0A%0D%0AMon projet en quelques lignes :%0D%0A%0D%0AMerci !" class="btn btn-primary btn-large" style="background-color: #3498DB; color: #FFFFFF; border: 2px solid #3498DB;">Contactez-moi</a>
            </div>
        </div>
    </div>
</section>
`;
    }
}

/**
 * ============================================================================
 * GESTION DES PARTIALS HTML
 * ============================================================================
 * Charge dynamiquement les fichiers HTML partiels (header, footer, etc.)
 * avec fallback en cas d'échec (pour fonctionnement local sans serveur)
 */

/**
 * Charge les partials HTML (header, footer, contact-form)
 */
function loadIncludes() {
    const includeTargets = document.querySelectorAll('[data-include]');
    const requests = Array.from(includeTargets).map((target) => {
        const path = target.getAttribute('data-include');
        if (!path) {
            return Promise.resolve();
        }
        return fetch(path)
            .then((response) => response.text())
            .then((html) => {
                // Pour header et footer, utiliser outerHTML pour remplacer complètement
                if (path.includes('header.html') || path.includes('footer.html')) {
                    target.outerHTML = html;
                } else {
                    target.innerHTML = html;
                }
            })
            .catch(() => {
                // Fallback pour les partials
                if (path.endsWith('partials/contact-form.html')) {
                    target.innerHTML = getContactFormFallback();
                } else if (path.includes('header.html')) {
                    target.outerHTML = getHeaderFallback();
                } else if (path.includes('footer.html')) {
                    target.outerHTML = getFooterFallback();
                } else if (path.includes('fiche-back-link.html')) {
                    const isEn = window.location.pathname.includes('/en/');
                    if (isEn) {
                        target.innerHTML = '<div class="fiche-back-link"><a href="../maps-available.html"><span>←</span><span>Back to maps</span></a></div>';
                    } else {
                        target.innerHTML = '<div class="fiche-back-link"><a href="../cartes-disponibles.html"><span>←</span><span>Retour aux cartes</span></a></div>';
                    }
                } else {
                    target.innerHTML = '';
                }
            });
    });

    return Promise.all(requests);
}

/**
 * Utilise getLanguageSwitchUrl pour obtenir les chemins de langue
 * (réutilise la logique centralisée)
 */
function getLanguagePaths() {
    const isFiche = window.location.pathname.includes('/fiches/');
    const isEn = window.location.pathname.includes('/en/');
    const currentPath = window.location.pathname;
    const fileName = currentPath.split('/').pop();
    
    // Utiliser la fonction centralisée si disponible, sinon fallback
    let enPath, frPath;
    if (typeof getLanguageSwitchUrl === 'function') {
        enPath = getLanguageSwitchUrl('en');
        frPath = getLanguageSwitchUrl('fr');
    } else {
        // Fallback si la fonction n'est pas encore chargée
        const pageMapping = {
            'index.html': { fr: 'index.html', en: 'en/index.html' },
            'cartes-disponibles.html': { fr: 'cartes-disponibles.html', en: 'en/maps-available.html' },
            'maps-available.html': { fr: 'cartes-disponibles.html', en: 'en/maps-available.html' },
            'services.html': { fr: 'services.html', en: 'en/services.html' },
            'cgv.html': { fr: 'cgv.html', en: 'en/terms.html' },
            'terms.html': { fr: 'cgv.html', en: 'en/terms.html' }
        };
        const mapping = pageMapping[fileName] || { fr: 'index.html', en: 'en/index.html' };
        enPath = isEn ? mapping.en : (isFiche ? '../' + mapping.en : mapping.en);
        frPath = isEn ? (isFiche ? '../../' + mapping.fr : '../' + mapping.fr) : (isFiche ? '../' + mapping.fr : mapping.fr);
    }
    
    const indexPath = isFiche ? '../index.html' : (isEn ? '../index.html' : 'index.html');
    const cartesPath = isFiche ? '../cartes-disponibles.html' : (isEn ? 'maps-available.html' : 'cartes-disponibles.html');
    const servicesPath = isFiche ? '../services.html' : (isEn ? 'services.html' : 'services.html');
    
    return { indexPath, cartesPath, servicesPath, enPath, frPath };
}

// Détecter le chemin relatif selon la profondeur pour les fallbacks
function getHeaderFallback() {
    const isEn = window.location.pathname.includes('/en/');
    const { indexPath, cartesPath, servicesPath, enPath, frPath } = getLanguagePaths();
    
    if (isEn) {
        return `
<header>
    <div class="container">
        <a href="${indexPath}" class="logo">Natacha Aviat</a>
        <nav>
            <ul>
                <li><a href="${indexPath}" data-nav="index">Home</a></li>
                <li><a href="${cartesPath}" data-nav="cartes">Maps</a></li>
                <li><a href="${servicesPath}" data-nav="services">Services</a></li>
            </ul>
            <div class="language-switcher" title="Switch to French version">
                <a href="${frPath}" class="lang-link" title="Switch to French version">FR</a>
                <span class="lang-separator">|</span>
                <span class="lang-current">EN</span>
            </div>
        </nav>
    </div>
</header>
`;
    } else {
        return `
<header>
    <div class="container">
        <a href="${indexPath}" class="logo">Natacha Aviat</a>
        <nav>
            <ul>
                <li><a href="${indexPath}" data-nav="index">Accueil</a></li>
                <li><a href="${cartesPath}" data-nav="cartes">Cartes</a></li>
                <li><a href="${servicesPath}" data-nav="services">Services</a></li>
            </ul>
            <div class="language-switcher" title="Switch to English version">
                <span class="lang-current">FR</span>
                <span class="lang-separator">|</span>
                <a href="${enPath}" class="lang-link" title="Switch to English version">EN</a>
            </div>
        </nav>
    </div>
</header>
`;
    }
}

function getFooterFallback() {
    const isFiche = window.location.pathname.includes('/fiches/');
    const isEn = window.location.pathname.includes('/en/');
    const { enPath, frPath } = getLanguagePaths();
    
    const cgvPath = isFiche ? '../cgv.html' : (isEn ? 'terms.html' : 'cgv.html');
    const contactPath = isFiche ? '../index.html#contact' : (isEn ? 'index.html#contact' : 'index.html#contact');
    
    if (isEn) {
        return `
<footer>
    <div class="container">
        <div class="footer-content-wrapper">
            <p class="footer-brand">
                <strong>Natacha Aviat</strong> - Interactive mapping and data analysis
            </p>
            <div class="footer-links">
                <a href="${cgvPath}">Terms</a>
                <a href="${contactPath}">Contact</a>
                <span class="footer-lang-separator">|</span>
                <a href="${frPath}" class="footer-lang-link" title="Version française">🇫🇷 Français</a>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2025 Natacha Aviat - All rights reserved</p>
        </div>
    </div>
</footer>
`;
    } else {
        return `
<footer>
    <div class="container">
        <div class="footer-content-wrapper">
            <p class="footer-brand">
                <strong>Natacha Aviat</strong> - Cartographie interactive et analyse de données
            </p>
            <div class="footer-links">
                <a href="${cgvPath}">CGV</a>
                <a href="${contactPath}">Contact</a>
                <span class="footer-lang-separator">|</span>
                <a href="${enPath}" class="footer-lang-link" title="English version">🇬🇧 English</a>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2025 Natacha Aviat - Tous droits réservés</p>
        </div>
    </div>
</footer>
`;
    }
}


/**
 * ============================================================================
 * CONTACT
 * ============================================================================
 * Le contact se fait maintenant via un simple bouton mailto
 * Plus besoin d'initialiser un formulaire
 */

/**
 * Initialisation principale au chargement de la page
 */
document.addEventListener('DOMContentLoaded', function() {
    // Charger tous les partials HTML (header, footer, contact-form, etc.)
    loadIncludes().then(() => {
        // Initialiser la navigation active
        if (typeof initNavigation === 'function') {
            initNavigation();
        }
        
        // Initialiser les filtres (si sur la page cartes-disponibles.html)
        if (typeof initFilters === 'function') {
            initFilters();
        }
        
        // Initialiser les liens de changement de langue
        if (typeof initLanguageSwitcher === 'function') {
            initLanguageSwitcher();
        }
    });
    
    // Gérer le scroll vers une ancre dans l'URL
    if (typeof initHashScroll === 'function') {
        initHashScroll();
    }
});

/**
 * ============================================================================
 * UTILITAIRES
 * ============================================================================
 */

/**
 * Affiche un message de succès ou d'erreur
 */
function showMessage(message, type) {
    // Supprimer les messages existants
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Créer le nouveau message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    // Insérer le message au début du formulaire ou dans un conteneur dédié
    const form = document.getElementById('contact-form');
    if (form) {
        form.insertBefore(messageDiv, form.firstChild);
        
        // Faire défiler vers le message
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Supprimer le message après 5 secondes pour les messages de succès
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.remove();
            }, 5000);
        }
    }
}
