const CONTACT_FORM_FALLBACK = `
<section class="section" id="contact">
    <div class="container">
        <div class="contact-section">
            <h2 class="text-center mb-2">Hâte de connaître votre projet</h2>
            <form id="contact-form" class="grid grid-3 contact-form-grid">
                <div class="card contact-form-card">
                    <p class="contact-form-label">Votre moyen de contact préféré</p>
                    <div class="form-group contact-form-group">
                        <input type="text" id="contact-info" name="contact-info" placeholder="Email, LinkedIn, téléphone..." required>
                    </div>
                </div>
                <div class="card contact-form-card-message">
                    <div class="form-group contact-form-group">
                        <textarea id="project-summary" name="project-summary" rows="6" placeholder="Votre projet en quelques lignes" required></textarea>
                    </div>
                </div>
                <div class="card contact-form-card-submit">
                    <button type="submit" class="btn btn-primary">Envoyer</button>
                </div>
            </form>
        </div>
    </div>
</section>
`;

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
                    target.innerHTML = CONTACT_FORM_FALLBACK;
                } else if (path.includes('header.html')) {
                    target.outerHTML = getHeaderFallback();
                } else if (path.includes('footer.html')) {
                    target.outerHTML = getFooterFallback();
                } else if (path.includes('fiche-back-link.html')) {
                    target.innerHTML = '<div class="fiche-back-link"><a href="../cartes-disponibles.html"><span>←</span><span>Retour aux cartes</span></a></div>';
                } else {
                    target.innerHTML = '';
                }
            });
    });

    return Promise.all(requests);
}

// Détecter le chemin relatif selon la profondeur pour les fallbacks
function getHeaderFallback() {
    const isFiche = window.location.pathname.includes('/fiches/');
    const indexPath = isFiche ? '../index.html' : 'index.html';
    const cartesPath = isFiche ? '../cartes-disponibles.html' : 'cartes-disponibles.html';
    const servicesPath = isFiche ? '../services.html' : 'services.html';
    const cgvPath = isFiche ? '../cgv.html' : 'cgv.html';
    const contactPath = isFiche ? '../index.html#contact' : 'index.html#contact';
    
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
        </nav>
    </div>
</header>
`;
}

function getFooterFallback() {
    const isFiche = window.location.pathname.includes('/fiches/');
    const cgvPath = isFiche ? '../cgv.html' : 'cgv.html';
    const contactPath = isFiche ? '../index.html#contact' : 'index.html#contact';
    
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
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2025 Natacha Aviat - Tous droits réservés</p>
        </div>
    </div>
</footer>
`;
}


/**
 * ============================================================================
 * FORMULAIRES
 * ============================================================================
 */

/**
 * Initialise le formulaire de contact
 */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) {
        return;
    }

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        if (!data['contact-info'] || !data['project-summary']) {
            showMessage('Veuillez remplir les deux champs.', 'error');
            return;
        }

        showMessage('Merci pour votre message ! Je vous répondrai sous 48h (hors week-end).', 'success');
        contactForm.reset();
    });
}

/**
 * Initialisation principale au chargement de la page
 */
document.addEventListener('DOMContentLoaded', function() {
    // Charger tous les partials HTML (header, footer, contact-form, etc.)
    loadIncludes().then(() => {
        // Initialiser le formulaire de contact
        initContactForm();
        
        // Initialiser la navigation active
        if (typeof initNavigation === 'function') {
            initNavigation();
        }
        
        // Initialiser les filtres (si sur la page cartes-disponibles.html)
        if (typeof initFilters === 'function') {
            initFilters();
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
