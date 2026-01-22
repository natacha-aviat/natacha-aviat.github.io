/**
 * Composants JavaScript réutilisables
 * Gestion des formulaires de fiches et autres interactions
 */

/**
 * Initialise les formulaires d'accès aux cartes/outils
 */
function initFicheForms() {
    const accessForms = document.querySelectorAll('#access-form, [id*="access-form"]');
    
    accessForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = form.querySelector('input[type="email"]');
            const email = emailInput ? emailInput.value : '';
            
            if (!email) {
                alert('Veuillez entrer votre email.');
                return;
            }
            
            // Récupérer l'URL de redirection depuis l'attribut data-redirect ou utiliser une valeur par défaut
            const redirectUrl = form.getAttribute('data-redirect') || '#';
            
            if (redirectUrl && redirectUrl !== '#') {
                window.location.href = redirectUrl;
            } else {
                // Si pas d'URL spécifiée, afficher un message
                alert('Merci ! Vous allez recevoir un email avec le lien d\'accès.');
            }
        });
    });
}

/**
 * Initialise la navigation active basée sur l'URL
 */
function initNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a[data-nav]');
    
    navLinks.forEach(link => {
        const navKey = link.getAttribute('data-nav');
        const linkPath = link.getAttribute('href');
        
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
 * Initialise tous les composants au chargement de la page
 */
document.addEventListener('DOMContentLoaded', function() {
    initFicheForms();
    initNavigation();
});
