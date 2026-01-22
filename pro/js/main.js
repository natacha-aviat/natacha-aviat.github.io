const CONTACT_FORM_FALLBACK = `
<section class="section" id="contact">
    <div class="container">
        <div class="contact-section">
            <h2 class="text-center mb-2">Hâte de connaître votre projet</h2>
            <form id="contact-form" class="grid grid-3 contact-form-grid">
                <div class="card contact-form-card">
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
                target.innerHTML = html;
            })
            .catch(() => {
                // Fallback pour le formulaire de contact
                if (path.endsWith('partials/contact-form.html')) {
                    target.innerHTML = CONTACT_FORM_FALLBACK;
                } else {
                    target.innerHTML = '';
                }
            });
    });

    return Promise.all(requests);
}

/**
 * Charge automatiquement header et footer si présents dans le DOM
 */
function loadHeaderFooter() {
    // Détecter le chemin relatif selon la profondeur
    const isFiche = window.location.pathname.includes('/fiches/');
    const headerPath = isFiche ? '../partials/header.html' : 'partials/header.html';
    const footerPath = isFiche ? '../partials/footer.html' : 'partials/footer.html';
    
    // Charger le header
    const headerElement = document.querySelector('header[data-include]');
    if (headerElement && !headerElement.hasAttribute('data-loaded')) {
        const includePath = headerElement.getAttribute('data-include');
        const pathToLoad = includePath || headerPath;
        fetch(pathToLoad)
            .then(response => response.text())
            .then(html => {
                headerElement.outerHTML = html;
            })
            .catch(() => {
                // Si échec, garder le header existant
            });
    }
    
    // Charger le footer
    const footerElement = document.querySelector('footer[data-include]');
    if (footerElement && !footerElement.hasAttribute('data-loaded')) {
        const includePath = footerElement.getAttribute('data-include');
        const pathToLoad = includePath || footerPath;
        fetch(pathToLoad)
            .then(response => response.text())
            .then(html => {
                footerElement.outerHTML = html;
            })
            .catch(() => {
                // Si échec, garder le footer existant
            });
    }
}

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

// Filtres pour la page réalisations
document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn[data-filter]');
    const sectorButtons = document.querySelectorAll('.filter-btn[data-sector]');
    const projectItems = document.querySelectorAll('.project-item');
    
    let currentFilter = 'all';
    let currentSector = 'all';
    
    // Gestion des filtres par type
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Mettre à jour l'état actif
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            currentFilter = this.getAttribute('data-filter');
            filterProjects();
        });
    });
    
    // Gestion des filtres par secteur
    sectorButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Mettre à jour l'état actif
            sectorButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            currentSector = this.getAttribute('data-sector');
            filterProjects();
        });
    });
    
    // Fonction de filtrage
    function filterProjects() {
        projectItems.forEach(item => {
            const itemType = item.getAttribute('data-type');
            const itemSector = item.getAttribute('data-sector');
            
            const typeMatch = currentFilter === 'all' || itemType === currentFilter;
            const sectorMatch = currentSector === 'all' || itemSector === currentSector;
            
            if (typeMatch && sectorMatch) {
                item.style.display = 'block';
                item.classList.add('fade-in');
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    // Gestion des paramètres URL pour les liens depuis services.html
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type');
    
    if (typeParam) {
        // Trouver et activer le bon filtre
        const targetButton = Array.from(filterButtons).find(btn => {
            const filter = btn.getAttribute('data-filter');
            return (typeParam === 'cartes' && filter === 'cartes') ||
                   (typeParam === 'analyses' && filter === 'analyses') ||
                   (typeParam === 'outils' && filter === 'outils');
        });
        
        if (targetButton) {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            targetButton.classList.add('active');
            currentFilter = targetButton.getAttribute('data-filter');
            filterProjects();
        }
    }
    
    // Scroll vers l'ancre si présente dans l'URL
    const hash = window.location.hash;
    if (hash) {
        const targetElement = document.querySelector(hash);
        if (targetElement) {
            setTimeout(() => {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }
    
    // Charger tous les partials
    loadHeaderFooter();
    loadIncludes().then(() => {
        initContactForm();
        // Initialiser les composants si le fichier est chargé
        if (typeof initFicheForms === 'function') {
            initFicheForms();
        }
        if (typeof initNavigation === 'function') {
            initNavigation();
        }
    });
});

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
