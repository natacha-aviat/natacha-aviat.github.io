/**
 * MaMaExpress — logique applicative (carte, itinéraire, PMI).
 * Prérequis : js/pmi_addresses.js et js/pmi_durees.js chargés avant ce fichier.
 */
'use strict';

// -----------------------------------------------------------------------------
// CONSTANTES
// -----------------------------------------------------------------------------
const MAMAMA_COORDS = {
    lat: 48.90355834151138,
    lng: 2.378094237324154
};
const PARIS_CENTER = [48.8566, 2.3522];
const DEFAULT_ZOOM = 11;
const DETAILED_ZOOM = 13;
const EARTH_RADIUS_KM = 6371;
const AVERAGE_SPEED_KMH = 30;
const BASE_TIME_MINUTES = 2;
const MAX_OPTIMIZATION_ITERATIONS = 10;
const MAX_OPTIMIZATION_WAYPOINTS = 30;

// -----------------------------------------------------------------------------
// VARIABLES GLOBALES
// -----------------------------------------------------------------------------
let allPmis = [];
let filteredPmis = [];
let dureesMap = new Map();
let selectedPmiIndices = new Set();
let currentMap = null;
let isMapInitializing = false;
let customAddresses = [];
/** Adresse personnalisée incluse dans l'itinéraire (false = conservée mais hors tournée, coords préservées) */
function isCustomAddressInRoute(addr) {
    return addr && addr.includedInRoute !== false;
}
/** Contraintes de passage : 'start' = à visiter au début, 'end' = à la fin, null = ordre libre */
let addressConstraint = {};
/** Indices allPmis : ordre de sélection (la plus ancienne en tête du tableau = en haut de la liste) */
let pmiSelectionOrder = [];
/** Indices allPmis dé-sélectionnés : la plus récente en index 0 (en haut du bloc « dé-sélectionnées ») */
let pmiDeselectedOrder = [];

function removeFromPmiSelectionOrder(idx) {
    const i = pmiSelectionOrder.indexOf(idx);
    if (i !== -1) pmiSelectionOrder.splice(i, 1);
}

function removeFromPmiDeselectedOrder(idx) {
    const i = pmiDeselectedOrder.indexOf(idx);
    if (i !== -1) pmiDeselectedOrder.splice(i, 1);
}

function recordPmiSelected(idx) {
    removeFromPmiDeselectedOrder(idx);
    if (!pmiSelectionOrder.includes(idx)) {
        pmiSelectionOrder.push(idx);
    }
}

function recordPmiDeselected(idx) {
    removeFromPmiSelectionOrder(idx);
    removeFromPmiDeselectedOrder(idx);
    pmiDeselectedOrder.unshift(idx);
}

function sortFilteredPmisByInteractionOrder(pmis) {
    return [...pmis].sort((a, b) => {
        const ia = allPmis.indexOf(a);
        const ib = allPmis.indexOf(b);
        const aSel = selectedPmiIndices.has(ia);
        const bSel = selectedPmiIndices.has(ib);
        if (aSel !== bSel) return aSel ? -1 : 1;
        if (aSel && bSel) {
            return pmiSelectionOrder.indexOf(ia) - pmiSelectionOrder.indexOf(ib);
        }
        const aDes = pmiDeselectedOrder.indexOf(ia);
        const bDes = pmiDeselectedOrder.indexOf(ib);
        const aHasDes = aDes !== -1;
        const bHasDes = bDes !== -1;
        if (aHasDes !== bHasDes) return aHasDes ? -1 : 1;
        if (aHasDes && bHasDes) return aDes - bDes;
        return ia - ib;
    });
}

// -----------------------------------------------------------------------------
// FONCTIONS UTILITAIRES
// -----------------------------------------------------------------------------

/** @param {string} id */
function byId(id) {
    return document.getElementById(id);
}
function getAddressCoordinates(address) {
    if (address === MAMAMA_ADDRESS) {
        return { lat: MAMAMA_COORDS.lat, lng: MAMAMA_COORDS.lng };
    }
    
    const custom = customAddresses.find(addr => addr.address === address);
    if (custom) return { lat: custom.lat, lng: custom.lng };
    
    const pmi = allPmis.find(p => p.address === address);
    if (pmi) return { lat: pmi.lat, lng: pmi.lng };
    
    return null;
}

function calculateDistance(lat1, lng1, lat2, lng2) {
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
}

function formatDuration(minutes) {
    const heures = Math.floor(minutes / 60);
    const minutesRestantes = Math.round(minutes % 60);
    return minutesRestantes > 0
        ? `${heures}h${minutesRestantes.toString().padStart(2, '0')}`
        : `${heures}h`;
}

function escapeHtml(text) {
    if (text == null) return '';
    const el = document.createElement('div');
    el.textContent = text;
    return el.innerHTML;
}

/** Attribut HTML entre guillemets doubles (data-address, etc.). */
function escapeHtmlAttr(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;');
}

/** Libellé affiché pour un point de l’itinéraire. */
function waypointLabel(wp) {
    return wp.nom ? `${wp.nom} - ${wp.address}` : wp.address;
}

function locationFromPmi(pmi) {
    return {
        nom: pmi.nom,
        address: pmi.address,
        lat: pmi.lat,
        lng: pmi.lng,
        telephone: pmi.telephone || ''
    };
}

function locationFromCustom(customAddr) {
    return {
        nom: customAddr.nom || 'Adresse personnalisée',
        address: customAddr.address,
        lat: customAddr.lat,
        lng: customAddr.lng,
        telephone: customAddr.telephone || ''
    };
}

// -----------------------------------------------------------------------------
// GESTION DES DONNÉES PMI
// -----------------------------------------------------------------------------
function initializeFromJS() {
    if (typeof PMI_ADDRESSES === 'undefined') {
        byId('pmiList').innerHTML =
            '<p class="pmi-list-message pmi-list-message--error">❌ Erreur : fichier pmi_addresses.js non chargé</p>';
        return;
    }

    if (typeof PMI_DUREES === 'undefined') {
        byId('pmiList').innerHTML =
            '<p class="pmi-list-message pmi-list-message--error">❌ Erreur : fichier pmi_durees.js non chargé</p>';
        return;
    }
    
    if (typeof MAMAMA_ADDRESS === 'undefined') {
        MAMAMA_ADDRESS = "rue Louis Girard, Aubervilliers";
    }
    
    allPmis = PMI_ADDRESSES.map(pmi => ({
        nom: pmi.nom,
        address: pmi.address,
        lat: pmi.lat,
        lng: pmi.lng,
        telephone: pmi.telephone != null ? pmi.telephone : ''
    }));
    
    filteredPmis = [...allPmis];
    displayPmis();
    
    dureesMap.clear();
    Object.entries(PMI_DUREES).forEach(([key, value]) => {
        dureesMap.set(key, value);
    });
    
    setTimeout(calculateRoutes, 200);
}

function displayPmis() {
    const pmiListDiv = byId('pmiList');
    /* selectedPmiIndices est la source de vérité (pas une relecture des cases du DOM). */
    pmiListDiv.innerHTML = '';
    
    if (filteredPmis.length === 0) {
        pmiListDiv.innerHTML =
            '<p class="pmi-list-message pmi-list-message--muted">Aucune PMI trouvée</p>';
        updateSelectedCount();
        return;
    }

    const sortedPmis = sortFilteredPmisByInteractionOrder(filteredPmis);
    sortedPmis.forEach((pmi, index) => {
        const pmiIndex = allPmis.indexOf(pmi);
        const isChecked = selectedPmiIndices.has(pmiIndex);
        const constraint = addressConstraint[pmi.address] || null;
        
        const checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'pmi-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `pmi-${index}`;
        checkbox.dataset.index = pmiIndex;
        checkbox.className = 'pmi-checkbox';
        checkbox.checked = isChecked;
        
        const labelWrap = document.createElement('div');
        labelWrap.className = 'pmi-label-wrap';
        const label = document.createElement('label');
        label.htmlFor = `pmi-${index}`;
        label.innerHTML = `<strong>${escapeHtml(pmi.nom)}</strong><br><span class="pmi-address">${escapeHtml(pmi.address)}</span>`;
        labelWrap.appendChild(label);

        const addrAttr = escapeHtmlAttr(pmi.address);
        const tagsDiv = document.createElement('div');
        tagsDiv.className = 'constraint-tags';
        const startTag = document.createElement('label');
        startTag.className = 'constraint-tag' + (constraint === 'start' ? ' active-start' : '');
        startTag.innerHTML = '<input type="checkbox" class="constraint-start" data-address="' + addrAttr + '"> Début';
        const endTag = document.createElement('label');
        endTag.className = 'constraint-tag' + (constraint === 'end' ? ' active-end' : '');
        endTag.innerHTML = '<input type="checkbox" class="constraint-end" data-address="' + addrAttr + '"> Fin';
        if (constraint === 'start') startTag.querySelector('input').checked = true;
        if (constraint === 'end') endTag.querySelector('input').checked = true;
        tagsDiv.appendChild(startTag);
        tagsDiv.appendChild(endTag);
        
        checkboxDiv.appendChild(checkbox);
        checkboxDiv.appendChild(labelWrap);
        checkboxDiv.appendChild(tagsDiv);
        pmiListDiv.appendChild(checkboxDiv);
    });
    
    updateSelectedCount();
}

function handlePmiToggle(checkbox) {
    const idx = parseInt(checkbox.dataset.index, 10);
    if (checkbox.checked) {
        selectedPmiIndices.add(idx);
        recordPmiSelected(idx);
    } else {
        selectedPmiIndices.delete(idx);
        recordPmiDeselected(idx);
    }
    updateSelectedCount();
    displayPmis();
}

function filterPmis(searchTerm) {
    if (allPmis.length === 0) return;
    
    const term = (searchTerm || '').toLowerCase().trim();
    filteredPmis = term === '' 
        ? [...allPmis]
        : allPmis.filter(pmi => 
            pmi.nom?.toLowerCase().includes(term) || 
            pmi.address?.toLowerCase().includes(term)
        );
    
    displayPmis();
}

function updateSelectedCount() {
    setTimeout(calculateRoutes, 100);
}

// -----------------------------------------------------------------------------
// CALCUL DES DURÉES
// -----------------------------------------------------------------------------
function getAddressId(address) {
    if (!address || typeof PMI_ADDRESS_TO_ID === 'undefined') return null;
    
    if (PMI_ADDRESS_TO_ID[address] !== undefined) {
        return PMI_ADDRESS_TO_ID[address];
    }
    
    if (typeof PMI_ADDRESSES !== 'undefined') {
        const pmi = PMI_ADDRESSES.find(p => p.address === address);
        if (pmi) return pmi.id;
    }
    
    if (address === MAMAMA_ADDRESS && typeof MAMAMA_ID !== 'undefined') {
        return MAMAMA_ID;
    }
    
    return null;
}

function getDuree(adresse1, adresse2) {
    const id1 = getAddressId(adresse1);
    const id2 = getAddressId(adresse2);
    
    if (id1 !== null && id2 !== null) {
        const key = `${id1}|${id2}`;
        return dureesMap.get(key) ?? Infinity;
    }
    
    // Si l'une des adresses est personnalisée, calculer la durée estimée
    const custom1 = customAddresses.find(addr => addr.address === adresse1);
    const custom2 = customAddresses.find(addr => addr.address === adresse2);
    
    if (custom1 || custom2) {
        return calculateEstimatedDuration(adresse1, adresse2);
    }
    
    return Infinity;
}

function calculateEstimatedDuration(adresse1, adresse2) {
    const coords1 = getAddressCoordinates(adresse1);
    const coords2 = getAddressCoordinates(adresse2);
    
    if (!coords1 || !coords2) return Infinity;
    
    const distance = calculateDistance(coords1.lat, coords1.lng, coords2.lat, coords2.lng);
    const dureeMinutes = (distance / AVERAGE_SPEED_KMH) * 60 + BASE_TIME_MINUTES;
    
    return Math.round(dureeMinutes);
}

// -----------------------------------------------------------------------------
// OPTIMISATION DE LA TOURNÉE
// -----------------------------------------------------------------------------
/** Plus proche voisin sur un sous-ensemble d'indices à partir d'un point de départ. Retourne la liste ordonnée des indices visités (sans le départ). */
function nearestNeighborSegment(startIndex, indexSet, dureesMatrix) {
    const available = new Set(indexSet);
    const order = [];
    let current = startIndex;
    while (available.size > 0) {
        let minDuree = Infinity;
        let nextPoint = -1;
        for (const i of available) {
            const d = dureesMatrix[current][i];
            if (d < minDuree) {
                minDuree = d;
                nextPoint = i;
            }
        }
        if (nextPoint === -1 || minDuree === Infinity) {
            nextPoint = available.values().next().value;
            if (nextPoint === undefined) break;
        }
        available.delete(nextPoint);
        order.push(nextPoint);
        current = nextPoint;
    }
    return order;
}

async function calculateOptimalOrder(waypoints, atStartIndices, atEndIndices) {
    if (dureesMap.size === 0) {
        throw new Error('Les durées de trajet n\'ont pas été chargées. Veuillez recharger la page.');
    }
    
    const n = waypoints.length;
    const dureesMatrix = waypoints.map((_, i) => 
        waypoints.map((_, j) => 
            i === j ? 0 : getDuree(waypoints[i].address, waypoints[j].address)
        )
    );

    const hasStart = Array.isArray(atStartIndices) && atStartIndices.length > 0;
    const hasEnd = Array.isArray(atEndIndices) && atEndIndices.length > 0;

    if (hasStart || hasEnd) {
        const atStartSet = new Set(hasStart ? atStartIndices : []);
        const atEndSet = new Set(hasEnd ? atEndIndices : []);
        const middleSet = [];
        for (let i = 1; i < n; i++) {
            if (!atStartSet.has(i) && !atEndSet.has(i)) middleSet.push(i);
        }

        let orderStart = nearestNeighborSegment(0, atStartSet, dureesMatrix);
        const lastAfterStart = orderStart.length > 0 ? orderStart[orderStart.length - 1] : 0;
        let orderMiddle = nearestNeighborSegment(lastAfterStart, middleSet, dureesMatrix);
        const lastAfterMiddle = orderMiddle.length > 0 ? orderMiddle[orderMiddle.length - 1] : lastAfterStart;
        let orderEnd = nearestNeighborSegment(lastAfterMiddle, atEndSet, dureesMatrix);

        if (orderStart.length <= MAX_OPTIMIZATION_WAYPOINTS) {
            const startOrder = [0, ...orderStart];
            optimize2Opt(startOrder, dureesMatrix);
            orderStart = startOrder.slice(1);
        }
        if (orderMiddle.length <= MAX_OPTIMIZATION_WAYPOINTS && orderMiddle.length >= 2) {
            const midOrder = [lastAfterStart, ...orderMiddle];
            optimize2Opt(midOrder, dureesMatrix);
            orderMiddle = midOrder.slice(1);
        }
        if (orderEnd.length <= MAX_OPTIMIZATION_WAYPOINTS && orderEnd.length >= 2) {
            const endOrder = [lastAfterMiddle, ...orderEnd];
            optimize2Opt(endOrder, dureesMatrix);
            orderEnd = endOrder.slice(1);
        }

        const order = [0, ...orderStart, ...orderMiddle, ...orderEnd];
        return order;
    }

    // Sans contrainte : algorithme du plus proche voisin sur tous les points
    const visited = new Set([0]);
    const order = [0];
    
    while (visited.size < waypoints.length) {
        const currentPoint = order[order.length - 1];
        let minDuree = Infinity;
        let nextPoint = -1;
        
        for (let i = 0; i < n; i++) {
            if (!visited.has(i)) {
                const duree = dureesMatrix[currentPoint][i];
                if (duree < minDuree) {
                    minDuree = duree;
                    nextPoint = i;
                }
            }
        }
        
        if (nextPoint === -1 || minDuree === Infinity) {
            for (let i = 0; i < n; i++) {
                if (!visited.has(i)) {
                    nextPoint = i;
                    break;
                }
            }
            if (nextPoint === -1) break;
        }
        
        visited.add(nextPoint);
        order.push(nextPoint);
    }
    
    if (order.length <= MAX_OPTIMIZATION_WAYPOINTS) {
        optimize2Opt(order, dureesMatrix);
    }
    
    return order;
}

function optimize2Opt(order, dureesMatrix) {
    let amelioration = true;
    let iterations = 0;
    
    while (amelioration && iterations < MAX_OPTIMIZATION_ITERATIONS) {
        amelioration = false;
        iterations++;
        const n = order.length;
        
        for (let i = 0; i < n - 2 && !amelioration; i++) {
            for (let j = i + 2; j < n - 1; j++) {
                const d_i_i1 = dureesMatrix[order[i]][order[i + 1]];
                const d_j_j1 = dureesMatrix[order[j]][order[j + 1]];
                const d_i_j = dureesMatrix[order[i]][order[j]];
                const d_i1_j1 = dureesMatrix[order[i + 1]][order[j + 1]];
                
                if (d_i_i1 === Infinity || d_j_j1 === Infinity || 
                    d_i_j === Infinity || d_i1_j1 === Infinity) {
                    continue;
                }
                
                const gain = d_i_i1 + d_j_j1 - d_i_j - d_i1_j1;
                
                if (gain > 0) {
                    // Inverser la section entre i+1 et j
                    for (let k = 0; k < Math.floor((j - i) / 2); k++) {
                        [order[i + 1 + k], order[j - k]] = [order[j - k], order[i + 1 + k]];
                    }
                    amelioration = true;
                    break;
                }
            }
        }
    }
}

// -----------------------------------------------------------------------------
// CALCUL ET AFFICHAGE DES ROUTES
// -----------------------------------------------------------------------------

/** Durée totale parcours + retour au dépôt (minutes). */
function computeTotalRouteDuration(waypoints) {
    if (waypoints.length < 2) return 0;
    let total = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
        const duree = getDuree(waypoints[i].address, waypoints[i + 1].address);
        if (duree !== Infinity) total += duree;
    }
    const retour = getDuree(waypoints[waypoints.length - 1].address, waypoints[0].address);
    if (retour !== Infinity) total += retour;
    return total;
}

async function calculateRoutes() {
    byId('results').style.display = 'block';

    const selectedPmis = Array.from(selectedPmiIndices).map(index => allPmis[index]);
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
        const locations = [{
            nom: 'MaMaMa (Départ)',
            address: MAMAMA_ADDRESS,
            lat: MAMAMA_COORDS.lat,
            lng: MAMAMA_COORDS.lng
        }];
        
        selectedPmis.forEach(pmi => locations.push(locationFromPmi(pmi)));

        customAddresses.forEach(customAddr => {
            if (!isCustomAddressInRoute(customAddr)) return;
            locations.push(locationFromCustom(customAddr));
        });

        if (selectedPmis.length === 0 && !customAddresses.some(isCustomAddressInRoute)) {
            displayRoute(locations);
            return;
        }

        const atStartIndices = [];
        const atEndIndices = [];
        for (let i = 1; i < locations.length; i++) {
            const c = addressConstraint[locations[i].address];
            if (c === 'start') atStartIndices.push(i);
            else if (c === 'end') atEndIndices.push(i);
        }

        const optimalOrder = await calculateOptimalOrder(locations, atStartIndices, atEndIndices);
        const orderedWaypoints = optimalOrder.map(index => locations[index]);
        
        displayRoute(orderedWaypoints);
        
    } catch (error) {
        alert(`Erreur lors du calcul: ${error.message}`);
    }
}

/**
 * Case « inclure dans la tournée » dans la liste d'itinéraire (à droite).
 * Cochée = dans la sélection ; décochée = retirer (PMI ou adresse perso).
 */
function handleRouteStopIncludeToggle(checkbox) {
    const addr = checkbox.dataset.address;
    if (!addr) return;

    const pmiIdx = allPmis.findIndex(p => p.address === addr);
    if (pmiIdx !== -1) {
        if (checkbox.checked) {
            selectedPmiIndices.add(pmiIdx);
            recordPmiSelected(pmiIdx);
        } else {
            selectedPmiIndices.delete(pmiIdx);
            recordPmiDeselected(pmiIdx);
            delete addressConstraint[addr];
        }
        displayPmis();
        calculateRoutes();
        return;
    }

    const custom = customAddresses.find(a => a.address === addr);
    if (custom) {
        custom.includedInRoute = checkbox.checked;
        if (!checkbox.checked) delete addressConstraint[addr];
        updateCustomAddressesList();
        calculateRoutes();
    }
}

function displayRoute(waypoints) {
    const routesDiv = byId('routes');
    routesDiv.innerHTML = '';

    const topSection = byId('topSection');
    const routesListContainer = byId('routesListContainer');
    
    // Ajuster la hauteur selon le nombre de waypoints
    if (waypoints.length === 1) {
        topSection.style.alignItems = 'flex-start';
        if (routesListContainer) {
            routesListContainer.style.height = 'auto';
            routesListContainer.style.minHeight = 'auto';
        }
    } else {
        topSection.style.alignItems = 'stretch';
        if (routesListContainer) {
            routesListContainer.style.height = '100%';
            routesListContainer.style.minHeight = '600px';
        }
    }

    const routeDiv = document.createElement('div');
    routeDiv.className = 'route';

    const dureeTotale = computeTotalRouteDuration(waypoints);

    // Générer le HTML (écran)
    let html = '<div class="route-screen-only">';
    if (dureeTotale > 0) {
        const minutesArrondies = Math.round(dureeTotale);
        html += `<p><strong>Durée totale estimée : ${minutesArrondies} minutes (${formatDuration(dureeTotale)})</strong></p>`;
        html += `<p style="margin-top: 10px; padding: 12px; background-color: #f5f5f5; border-left: 3px solid #666; color: #555; font-size: 0.9em; line-height: 1.5;">
            <strong>Note :</strong> Les durées indiquées sont des estimations basées sur des conditions de circulation normales. Elles ne prennent pas en compte les bouchons, les accidents, les conditions météorologiques ou d'autres événements pouvant affecter le trafic. Les temps de trajet réels peuvent varier.
        </p>`;
    }
    
    if (waypoints.length === 1) {
        html += `<p style="color: #666; font-style: italic;">Sélectionnez des PMI pour voir l'itinéraire optimisé.</p>`;
    } else {
        html += '<ol class="route-itinerary-list" start="0">';
        html += `<li class="route-stop-li route-stop-li--fixed"><span class="route-stop-check-slot" aria-hidden="true"></span><span class="route-stop-body"><strong>${escapeHtml(waypoints[0].address)}</strong> (Départ)</span></li>`;
        for (let i = 1; i < waypoints.length; i++) {
            const wp = waypoints[i];
            const displayName = waypointLabel(wp);
            const addrAttr = escapeHtmlAttr(wp.address);
            const cbId = `route-stop-include-${i}`;
            html += `<li class="route-stop-li">`;
            html += `<input type="checkbox" id="${cbId}" class="route-stop-include" data-address="${addrAttr}" checked `;
            html += `title="Décocher pour retirer cette adresse de l'itinéraire" aria-label="Inclure cet arrêt dans la tournée">`;
            html += `<label for="${cbId}" class="route-stop-body">${escapeHtml(displayName)}</label>`;
            html += `</li>`;
        }
        html += `<li class="route-stop-li route-stop-li--fixed"><span class="route-stop-check-slot" aria-hidden="true"></span><span class="route-stop-body"><strong>${escapeHtml(waypoints[0].address)}</strong> (Retour)</span></li>`;
        html += '</ol>';
    }
    html += '</div>';

    // Tableau réservé à l'impression (une ligne par arrêt livraison, sans départ ni retour)
    if (waypoints.length > 1) {
        html += '<div class="routes-print-table-wrap">';
        if (dureeTotale > 0) {
            const minutesArrondies = Math.round(dureeTotale);
            html += `<p class="routes-print-duration"><strong>Durée totale estimée : ${minutesArrondies} minutes (${formatDuration(dureeTotale)})</strong></p>`;
        }
        html += '<table class="routes-print-table">';
        html += '<thead><tr>';
        html += '<th scope="col">Adresse</th>';
        html += '<th scope="col">Nombre de colis</th>';
        html += '<th scope="col">Numéros des colis</th>';
        html += '<th scope="col">Téléphone</th>';
        html += '</tr></thead><tbody>';
        for (let i = 1; i < waypoints.length; i++) {
            const wp = waypoints[i];
            const displayName = waypointLabel(wp);
            const tel = (wp.telephone || '').trim();
            html += '<tr>';
            html += `<td>${escapeHtml(displayName)}</td>`;
            html += '<td class="routes-print-empty">&nbsp;</td>';
            html += '<td class="routes-print-empty">&nbsp;</td>';
            if (tel) {
                html += `<td>${escapeHtml(tel)}</td>`;
            } else {
                html += '<td class="routes-print-empty">&nbsp;</td>';
            }
            html += '</tr>';
        }
        html += '</tbody></table></div>';
    }

    routeDiv.innerHTML = html;
    routesDiv.appendChild(routeDiv);
    
    const googleMapsButtonDiv = byId('googleMapsButton');
    googleMapsButtonDiv.innerHTML = '';
    if (waypoints.length > 1) {
        const { url: googleMapsUrl, limited } = buildGoogleMapsUrl(waypoints);
        const mapsLink = document.createElement('a');
        mapsLink.href = googleMapsUrl;
        mapsLink.target = '_blank';
        mapsLink.className = 'google-maps-btn';
        mapsLink.textContent = limited 
            ? 'Voir l\'itinéraire (9 premières adresses)'
            : 'Voir l\'itinéraire sur Google Maps';
        googleMapsButtonDiv.appendChild(mapsLink);
    }
    
    displayMap(waypoints);
}

function buildGoogleMapsUrl(waypoints) {
    if (waypoints.length === 0) return { url: '', limited: false };
    
    const origin = encodeURIComponent(waypoints[0].address);
    const destination = encodeURIComponent(waypoints[0].address);
    const maxWaypoints = 9;
    const waypointsList = [];
    const limited = waypoints.length > 10;
    
    for (let i = 1; i < waypoints.length && waypointsList.length < maxWaypoints; i++) {
        waypointsList.push(encodeURIComponent(waypoints[i].address));
    }
    
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    if (waypointsList.length > 0) {
        url += `&waypoints=${waypointsList.join('|')}`;
    }
    
    return { url, limited };
}

// -----------------------------------------------------------------------------
// AFFICHAGE DE LA CARTE
// -----------------------------------------------------------------------------
function displayMap(waypoints) {
    if (isMapInitializing) return;
    isMapInitializing = true;
    
    try {
        const mapContainer = byId('mapContainer');
        if (!mapContainer) {
            isMapInitializing = false;
            return;
        }
        
        // Nettoyer la carte précédente
        if (currentMap) {
            try {
                currentMap.remove();
            } catch (e) {}
            currentMap = null;
        }
        
        if (mapContainer._leaflet_id) {
            delete mapContainer._leaflet_id;
        }
        mapContainer.innerHTML = '';
        
        // Vérifier les waypoints
        if (waypoints.length === 0) {
            mapContainer.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">Sélectionnez des PMI pour voir la carte</p>';
            isMapInitializing = false;
            return;
        }
    
        const hasCoordinates = waypoints.some(wp => wp.lat && wp.lng);
        if (!hasCoordinates) {
            mapContainer.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">Coordonnées non disponibles</p>';
            isMapInitializing = false;
            return;
        }
    
        setTimeout(() => {
            const container = byId('mapContainer');
            if (!container || container.offsetParent === null) {
                isMapInitializing = false;
                return;
            }
            
            if (container._leaflet_id) {
                delete container._leaflet_id;
                container.innerHTML = '';
            }
            
            // Initialiser la carte
            const initialCenter = waypoints[0]?.lat && waypoints[0]?.lng
                ? [waypoints[0].lat, waypoints[0].lng]
                : PARIS_CENTER;
            const initialZoom = waypoints[0]?.lat && waypoints[0]?.lng
                ? DETAILED_ZOOM
                : DEFAULT_ZOOM;
            
            const map = L.map('mapContainer', {
                center: initialCenter,
                zoom: initialZoom
            });
            currentMap = map;
            
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
                attribution: '© CARTO © OpenStreetMap contributors',
                subdomains: 'abcd',
                maxZoom: 19
            }).addTo(map);
            
            map.whenReady(() => {
                const markers = [];
                const latlngs = [];
                
                // Marqueur de départ
                if (waypoints[0]?.lat && waypoints[0]?.lng) {
                    const startMarker = L.marker([waypoints[0].lat, waypoints[0].lng], {
                        icon: L.divIcon({
                            className: 'custom-marker-start',
                            html: '<div style="background-color: #FFC107; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                            iconSize: [20, 20],
                            iconAnchor: [10, 10]
                        })
                    }).addTo(map);
                    startMarker.bindPopup(
                        `<strong>MaMaMa (Départ/Arrivée)</strong><br>${escapeHtml(waypoints[0].address)}`
                    );
                    markers.push(startMarker);
                    latlngs.push([waypoints[0].lat, waypoints[0].lng]);
                }
                
                // Marqueurs des autres points
                for (let i = 1; i < waypoints.length; i++) {
                    const waypoint = waypoints[i];
                    if (waypoint.lat && waypoint.lng) {
                        const marker = L.marker([waypoint.lat, waypoint.lng], {
                            icon: L.divIcon({
                                className: 'custom-marker',
                                html: `<div style="background-color: #FF6B6B; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div><div style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%); background: white; padding: 2px 6px; border-radius: 3px; font-size: 11px; font-weight: bold; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">${i}</div>`,
                                iconSize: [30, 30],
                                iconAnchor: [15, 15]
                            })
                        }).addTo(map);
                        
                        const popupText = waypoint.nom
                            ? `<strong>${i}. ${escapeHtml(waypoint.nom)}</strong><br>${escapeHtml(waypoint.address)}`
                            : `<strong>${i}. ${escapeHtml(waypoint.address)}</strong>`;
                        marker.bindPopup(popupText);
                        markers.push(marker);
                        latlngs.push([waypoint.lat, waypoint.lng]);
                    }
                }
                
                // Ligne de trajet
                if (latlngs.length > 1) {
                    L.polyline(latlngs, {
                        color: '#FF6B6B',
                        weight: 4,
                        opacity: 0.7
                    }).addTo(map);
                    
                    // Ligne de retour
                    if (waypoints[0]?.lat && waypoints[0]?.lng && 
                        waypoints[waypoints.length - 1]?.lat && waypoints[waypoints.length - 1]?.lng) {
                        L.polyline([
                            [waypoints[waypoints.length - 1].lat, waypoints[waypoints.length - 1].lng],
                            [waypoints[0].lat, waypoints[0].lng]
                        ], {
                            color: '#9E9E9E',
                            weight: 3,
                            opacity: 0.5,
                            dashArray: '10, 5'
                        }).addTo(map);
                    }
                }
                
                // Ajuster la vue
                if (markers.length > 0) {
                    const group = new L.featureGroup(markers);
                    try {
                        const bounds = group.getBounds();
                        setTimeout(() => {
                            if (!currentMap) {
                                isMapInitializing = false;
                                return;
                            }
                            
                            const container = currentMap.getContainer();
                            if (!container || !container.parentNode) {
                                isMapInitializing = false;
                                return;
                            }
                            
                            try {
                                if (bounds?.isValid?.()) {
                                    currentMap.fitBounds(bounds.pad(0.1));
                                } else if (markers[0]?.getLatLng) {
                                    currentMap.setView(markers[0].getLatLng(), DETAILED_ZOOM);
                                }
                            } catch (e) {
                                // Erreur silencieuse
                            }
                            isMapInitializing = false;
                        }, 150);
                    } catch (e) {
                        isMapInitializing = false;
                    }
                } else {
                    isMapInitializing = false;
                }
            });
        }, 50);
    } catch (error) {
        const mapContainer = byId('mapContainer');
        if (mapContainer) {
            mapContainer.innerHTML = `<p style="padding: 20px; text-align: center; color: red;">Erreur d'affichage: ${error.message}</p>`;
        }
        isMapInitializing = false;
    }
}

// -----------------------------------------------------------------------------
// GÉOCODAGE DES ADRESSES PERSONNALISÉES
// -----------------------------------------------------------------------------
async function geocodeAddress(address) {
    const statusDiv = byId('customAddressStatus');
    statusDiv.innerHTML = '<span style="color: #666;">⏳ Géocodage en cours...</span>';
    
    try {
        const encodedAddress = encodeURIComponent(address);
        
        // Essayer Photon d'abord (support CORS natif)
        try {
            const photonUrl = `https://photon.komoot.io/api/?q=${encodedAddress}&limit=1&lang=fr`;
            const response = await fetch(photonUrl, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache',
                headers: { 'Accept': 'application/json' }
            });
            
            if (response.ok) {
                const photonData = await response.json();
                if (photonData?.features?.length > 0) {
                    const feature = photonData.features[0];
                    const coords = feature.geometry.coordinates;
                    const props = feature.properties;
                    
                    return {
                        address: address,
                        lat: coords[1],
                        lng: coords[0],
                        nom: props.name || props.street || 'Adresse personnalisée'
                    };
                }
            }
        } catch (photonError) {
            // Erreur silencieuse avec Photon
        }
        
        // Fallback: utiliser des proxies CORS pour Nominatim
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`;
        const proxyServices = [
            `https://api.allorigins.win/raw?url=${encodeURIComponent(nominatimUrl)}`,
            `https://corsproxy.io/?${encodeURIComponent(nominatimUrl)}`
        ];
        
        for (const proxyUrl of proxyServices) {
            try {
                const response = await fetch(proxyUrl, {
                    method: 'GET',
                    mode: 'cors',
                    cache: 'no-cache',
                    headers: { 'Accept': 'application/json' }
                });
                
                if (!response.ok) continue;
                
                const responseText = await response.text();
                let data;
                
                try {
                    data = JSON.parse(responseText);
                    // Gérer les wrappers de proxy
                    if (data.contents) data = JSON.parse(data.contents);
                    else if (data.data) data = JSON.parse(data.data);
                } catch (parseError) {
                    continue;
                }
                
                if (Array.isArray(data) && data.length > 0) {
                    const result = data[0];
                    const lat = parseFloat(result.lat);
                    const lng = parseFloat(result.lon);
                    
                    if (!isNaN(lat) && !isNaN(lng)) {
                        return {
                            address: address,
                            lat: lat,
                            lng: lng,
                            nom: result.display_name?.split(',')[0].trim() || 'Adresse personnalisée'
                        };
                    }
                }
            } catch (proxyError) {
                // Erreur silencieuse avec proxy
                continue;
            }
        }
        
        throw new Error('Adresse non trouvée. Veuillez être plus précis (ex: "10 rue de la Paix, 75002 Paris")');
        
    } catch (error) {
        if (error.message.includes('Failed to fetch') || 
            error.message.includes('NetworkError') || 
            error.message.includes('fetch') ||
            error.message.includes('CORS')) {
            throw new Error('Impossible de se connecter au service de géocodage. Vérifiez votre connexion internet et réessayez.');
        }
        throw error;
    }
}

function updateCustomAddressesList() {
    const listContainer = byId('customAddressesList');
    const itemsContainer = byId('customAddressesItems');
    
    if (customAddresses.length === 0) {
        listContainer.style.display = 'none';
        return;
    }
    
    listContainer.style.display = 'block';
    itemsContainer.innerHTML = '';
    
    customAddresses.forEach((addr, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'custom-address-item' + (isCustomAddressInRoute(addr) ? '' : ' custom-address-item--inactive');
        
        const includeWrap = document.createElement('div');
        includeWrap.className = 'custom-address-include-wrap';
        const includeId = `custom-include-${index}`;
        const includeCb = document.createElement('input');
        includeCb.type = 'checkbox';
        includeCb.id = includeId;
        includeCb.className = 'custom-address-include';
        includeCb.dataset.address = addr.address;
        includeCb.checked = isCustomAddressInRoute(addr);
        includeCb.title = 'Inclure ou retirer cette adresse de l\'itinéraire (les coordonnées restent enregistrées)';
        includeCb.setAttribute('aria-label', 'Inclure ou retirer cette adresse de l\'itinéraire');
        includeWrap.appendChild(includeCb);
        
        const addressText = document.createElement('span');
        addressText.textContent = `${addr.nom || 'Adresse personnalisée'} - ${addr.address}`;
        
        const tagsDiv = document.createElement('div');
        tagsDiv.className = 'constraint-tags';
        const constraint = addressConstraint[addr.address] || null;
        const startTag = document.createElement('label');
        startTag.className = 'constraint-tag' + (constraint === 'start' ? ' active-start' : '');
        const startInput = document.createElement('input');
        startInput.type = 'checkbox';
        startInput.className = 'constraint-start';
        startInput.dataset.address = addr.address;
        if (constraint === 'start') startInput.checked = true;
        startTag.appendChild(startInput);
        startTag.appendChild(document.createTextNode(' Début'));
        const endTag = document.createElement('label');
        endTag.className = 'constraint-tag' + (constraint === 'end' ? ' active-end' : '');
        const endInput = document.createElement('input');
        endInput.type = 'checkbox';
        endInput.className = 'constraint-end';
        endInput.dataset.address = addr.address;
        if (constraint === 'end') endInput.checked = true;
        endTag.appendChild(endInput);
        endTag.appendChild(document.createTextNode(' Fin'));
        tagsDiv.appendChild(startTag);
        tagsDiv.appendChild(endTag);
        
        const catalogMailto =
            'mailto:digital@asso-mamama.fr' +
            '?subject=' + encodeURIComponent('Ajout d\'une adresse dans le catalogue') +
            '&body=' + encodeURIComponent(addr.address);
        const catalogLink = document.createElement('a');
        catalogLink.className = 'custom-address-catalog-link';
        catalogLink.href = catalogMailto;
        catalogLink.textContent = 'Ajouter à la liste standard';
        
        itemDiv.appendChild(includeWrap);
        itemDiv.appendChild(addressText);
        itemDiv.appendChild(tagsDiv);
        itemDiv.appendChild(catalogLink);
        itemsContainer.appendChild(itemDiv);
    });
}

async function handleCustomAddress() {
    const addressInput = byId('customAddress');
    const address = addressInput.value.trim();
    const statusDiv = byId('customAddressStatus');
    
    if (!address) {
        statusDiv.innerHTML = '<span style="color: #d32f2f;">⚠️ Veuillez entrer une adresse</span>';
        return;
    }
    
    // Vérifier si l'adresse n'est pas déjà dans la liste
    const isAlreadyInList = allPmis.some(pmi => 
        pmi.address.toLowerCase() === address.toLowerCase()
    ) || customAddresses.some(addr => 
        addr.address.toLowerCase() === address.toLowerCase()
    );
    
    if (isAlreadyInList) {
        statusDiv.innerHTML = '<span style="color: #d32f2f;">⚠️ Cette adresse est déjà dans la liste</span>';
        return;
    }
    
    const calculateButton = byId('calculateCustomAddress');
    calculateButton.disabled = true;
    calculateButton.textContent = 'Calcul en cours...';
    
    try {
        const geocodedAddress = await geocodeAddress(address);
        geocodedAddress.includedInRoute = true;
        customAddresses.push(geocodedAddress);
        
        statusDiv.innerHTML = `<span style="color: #2e7d32;">✅ Adresse ajoutée : ${geocodedAddress.nom}</span>`;
        addressInput.value = '';
        updateCustomAddressesList();
        await calculateRoutes();
        
    } catch (error) {
        statusDiv.innerHTML = `<span style="color: #d32f2f;">❌ Erreur : ${error.message}</span>`;
    } finally {
        calculateButton.disabled = false;
        calculateButton.textContent = 'Calculer';
    }
}

// -----------------------------------------------------------------------------
// GESTION DES ÉVÉNEMENTS
// -----------------------------------------------------------------------------
function selectAllVisible() {
    const sorted = sortFilteredPmisByInteractionOrder(filteredPmis);
    sorted.forEach(pmi => {
        const idx = allPmis.indexOf(pmi);
        selectedPmiIndices.add(idx);
        recordPmiSelected(idx);
    });
    displayPmis();
}

function deselectAllVisible() {
    const visibleSet = new Set(filteredPmis.map(pmi => allPmis.indexOf(pmi)));
    const ordered = pmiSelectionOrder.filter(idx => visibleSet.has(idx));
    for (let i = ordered.length - 1; i >= 0; i--) {
        const idx = ordered[i];
        selectedPmiIndices.delete(idx);
        recordPmiDeselected(idx);
    }
    displayPmis();
}

/** Sélectionne la PMI de la ligne si une contrainte Début/Fin est cochée. */
function ensurePmiSelectedForConstraint(row) {
    const pmiCheckbox = row?.querySelector('.pmi-checkbox');
    if (!pmiCheckbox || pmiCheckbox.checked) return;
    pmiCheckbox.checked = true;
    const idx = parseInt(pmiCheckbox.dataset.index, 10);
    selectedPmiIndices.add(idx);
    recordPmiSelected(idx);
}

/**
 * @param {HTMLInputElement} input
 * @param {'start'|'end'} role
 */
function handlePmiListConstraintChange(input, role) {
    const addr = input.dataset.address;
    const row = input.closest('.pmi-item');
    if (input.checked) {
        addressConstraint[addr] = role;
        const otherSel = role === 'start' ? '.constraint-end' : '.constraint-start';
        const other = row?.querySelector(otherSel);
        if (other) other.checked = false;
        ensurePmiSelectedForConstraint(row);
    } else {
        addressConstraint[addr] = null;
    }
    updateSelectedCount();
    displayPmis();
}

/**
 * @param {HTMLInputElement} input
 * @param {'start'|'end'} role
 */
function handleCustomAddressConstraintChange(input, role) {
    const addr = input.dataset.address;
    const row = input.closest('.custom-address-item');
    if (input.checked) {
        addressConstraint[addr] = role;
        const otherSel = role === 'start' ? '.constraint-end' : '.constraint-start';
        const other = row?.querySelector(otherSel);
        if (other) other.checked = false;
    } else {
        addressConstraint[addr] = null;
    }
    calculateRoutes();
}

function updateRoutesPrintHeading() {
    const el = byId('routesPrintHeading');
    if (!el) return;
    const dateStr = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    el.textContent = 'Itinéraire Optimisé du ' + dateStr;
}

function attachEventListeners() {
    const printItineraryBtn = byId('printItineraryBtn');
    if (printItineraryBtn) {
        printItineraryBtn.addEventListener('click', () => window.print());
    }

    window.addEventListener('beforeprint', updateRoutesPrintHeading);

    const routesContainer = byId('routes');
    if (routesContainer) {
        routesContainer.addEventListener('change', (e) => {
            const t = e.target;
            if (t?.classList.contains('route-stop-include')) {
                handleRouteStopIncludeToggle(t);
            }
        });
    }

    const pmiListDiv = byId('pmiList');
    if (pmiListDiv) {
        pmiListDiv.addEventListener('change', (e) => {
            const t = e.target;
            if (t?.classList.contains('pmi-checkbox')) {
                handlePmiToggle(t);
            } else if (t?.classList.contains('constraint-start')) {
                handlePmiListConstraintChange(t, 'start');
            } else if (t?.classList.contains('constraint-end')) {
                handlePmiListConstraintChange(t, 'end');
            }
        });
    }

    const searchPmi = byId('searchPmi');
    const selectAll = byId('selectAll');
    const deselectAll = byId('deselectAll');
    const calculateCustomAddress = byId('calculateCustomAddress');
    const customAddressInput = byId('customAddress');
    
    if (searchPmi) {
        searchPmi.addEventListener('input', (e) => filterPmis(e.target.value));
    }
    
    if (selectAll) selectAll.addEventListener('click', selectAllVisible);
    if (deselectAll) deselectAll.addEventListener('click', deselectAllVisible);
    if (calculateCustomAddress) {
        calculateCustomAddress.addEventListener('click', handleCustomAddress);
    }
    if (customAddressInput) {
        customAddressInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleCustomAddress();
        });
    }
    const customItemsContainer = byId('customAddressesItems');
    if (customItemsContainer) {
        customItemsContainer.addEventListener('change', (e) => {
            const t = e.target;
            if (t?.classList.contains('constraint-start')) {
                handleCustomAddressConstraintChange(t, 'start');
            } else if (t?.classList.contains('constraint-end')) {
                handleCustomAddressConstraintChange(t, 'end');
            } else if (t?.classList.contains('custom-address-include')) {
                const addr = t.dataset.address;
                const entry = customAddresses.find(a => a.address === addr);
                if (entry) {
                    entry.includedInRoute = t.checked;
                    const row = t.closest('.custom-address-item');
                    if (row) row.classList.toggle('custom-address-item--inactive', !t.checked);
                    calculateRoutes();
                }
            }
        });
    }
    
    if (typeof PMI_ADDRESSES !== 'undefined' && typeof PMI_DUREES !== 'undefined') {
        initializeFromJS();
    } else {
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (typeof PMI_ADDRESSES !== 'undefined' && typeof PMI_DUREES !== 'undefined') {
                    initializeFromJS();
                } else {
                    byId('pmiList').innerHTML =
                        '<p class="pmi-list-message pmi-list-message--error">❌ Erreur : les fichiers de données JavaScript ne sont pas chargés.</p>';
                }
            }, 100);
        });
    }
}

attachEventListeners();
