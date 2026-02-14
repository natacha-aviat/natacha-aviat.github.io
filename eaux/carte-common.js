/**
 * Script commun aux cartes Rejets et Prélèvements.
 * Fournit : code APE (sections/divisions), utilitaires numériques et regex.
 * Utilisé par carte_rejets.html et carte_prelevements.html.
 */

(function (global) {
    'use strict';

    // ==================== CODE APE (NAF) ====================
    // Mapping division (2 premiers chiffres) → section lettre (A–U).
    // Référence : nomenclature NAF rév. 2.

    /**
     * Retourne la section APE (lettre A–U) à partir d'un code APE.
     * @param {string} codeAPE - Code APE (ex. "1010Z", "35.11")
     * @returns {string|null} - Section ou null si invalide
     */
    function getSectionFromCode(codeAPE) {
        if (!codeAPE || codeAPE.length < 2) return null;
        const div = parseInt(codeAPE.substring(0, 2), 10);
        if (isNaN(div)) return null;

        if (div >= 1 && div <= 3) return 'A';
        if (div >= 5 && div <= 9) return 'B';
        if (div >= 10 && div <= 33) return 'C';
        if (div === 35) return 'D';
        if (div >= 36 && div <= 39) return 'E';
        if (div >= 41 && div <= 43) return 'F';
        if (div >= 45 && div <= 47) return 'G';
        if (div >= 49 && div <= 53) return 'H';
        if (div >= 55 && div <= 56) return 'I';
        if (div >= 58 && div <= 63) return 'J';
        if (div >= 64 && div <= 66) return 'K';
        if (div === 68) return 'L';
        if (div >= 69 && div <= 75) return 'M';
        if (div >= 77 && div <= 82) return 'N';
        if (div === 84) return 'O';
        if (div === 85) return 'P';
        if (div >= 86 && div <= 88) return 'Q';
        if (div >= 90 && div <= 93) return 'R';
        if (div >= 94 && div <= 96) return 'S';
        if (div >= 97 && div <= 98) return 'T';
        if (div === 99) return 'U';
        return null;
    }

    /**
     * Retourne la division (2 premiers chiffres) pour le filtrage section C.
     * @param {string} codeAPE - Code APE
     * @returns {string|null} - Ex. "10", "24" ou null
     */
    function getDivisionFromCode(codeAPE) {
        if (!codeAPE || codeAPE.length < 2) return null;
        const div = parseInt(codeAPE.substring(0, 2), 10);
        return isNaN(div) ? null : String(div);
    }

    /**
     * Retourne le groupe 3 chiffres (101–109) pour la division 10, sinon null.
     * Utilisé pour la ventilation "Industrie alimentaire" dans les filtres.
     * @param {string} codeAPE - Code APE
     * @returns {string|null} - "101" à "109" ou null
     */
    function getGroup10FromCode(codeAPE) {
        if (!codeAPE || codeAPE.length < 3 || codeAPE.substring(0, 2) !== '10') return null;
        const g = parseInt(codeAPE.substring(0, 3), 10);
        if (g >= 101 && g <= 109) return String(g);
        return null;
    }

    // ==================== UTILITAIRES ====================

    /**
     * Parse une valeur (chaîne ou nombre) en nombre ; gère espaces et séparateurs.
     * @param {*} val - Valeur à convertir
     * @returns {number} - Nombre >= 0 ou 0 si invalide
     */
    function cleanNumber(val) {
        if (val === null || val === undefined || val === '') return 0;
        const str = String(val).trim();
        if (str === '' || str === ' ' || str === '\u00A0') return 0;
        const cleaned = str.replace(/\s/g, '').replace(/\u00A0/g, '').replace(/\u202f/g, '');
        if (cleaned === '') return 0;
        const num = parseFloat(cleaned);
        return isNaN(num) || num < 0 ? 0 : num;
    }

    /**
     * Échappe une chaîne pour l'utiliser dans une RegExp (recherche littérale).
     * @param {string} value - Chaîne à échapper
     * @returns {string} - Chaîne échappée
     */
    function escapeRegExp(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Exposer en global pour les scripts inline des cartes
    global.CarteCommon = {
        getSectionFromCode: getSectionFromCode,
        getDivisionFromCode: getDivisionFromCode,
        getGroup10FromCode: getGroup10FromCode,
        cleanNumber: cleanNumber,
        escapeRegExp: escapeRegExp
    };
})(typeof window !== 'undefined' ? window : this);
