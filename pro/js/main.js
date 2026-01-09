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
});

// Gestion du formulaire de contact
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Récupérer les données du formulaire
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Validation basique
            if (!data.nom || !data.prenom || !data.email || !data.message) {
                showMessage('Veuillez remplir tous les champs obligatoires.', 'error');
                return;
            }
            
            // Validation email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                showMessage('Veuillez entrer une adresse email valide.', 'error');
                return;
            }
            
            // Simuler l'envoi (à remplacer par un vrai envoi)
            showMessage('Merci pour votre message ! Je vous répondrai sous 48h (hors week-end).', 'success');
            contactForm.reset();
            
            // Ici, vous pourriez ajouter un appel à une API ou un service d'envoi d'email
            // Par exemple : sendEmail(data);
        });
    }
});

// Fonction pour afficher les messages
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
