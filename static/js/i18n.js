/**
 * ScuPlan - Internationalization (i18n) Module
 * This module has been disabled - all content will be in English only
 */

// Empty placeholder to maintain compatibility with existing code
const languages = [{ code: 'en', name: 'English', flag: 'us' }];

// Use a simple empty object for translations
const translations = {
    'en': {}
};

// Default language
let currentLanguage = 'en';

// Disabled functions
function initI18n() {
    console.log("Internationalization disabled - English only mode");
}

function createLanguageSelector() {
    // Do nothing
}

function populateLanguageMenu() {
    // Do nothing
}

function populateMobileLanguageMenu() {
    // Do nothing
}

function changeLanguage() {
    // Do nothing
}

function applyTranslations() {
    // Do nothing
}

function translatePageSpecificElements() {
    // Do nothing
}

function translateDivePlannerPage() {
    // Do nothing
}

function translateChecklistPage() {
    // Do nothing
}

function translateTechnicalPage() {
    // Do nothing
}

function translateSharePage() {
    // Do nothing
}

function getTranslation(key) {
    return key;
}

// Do nothing on load
document.addEventListener('DOMContentLoaded', function() {
    console.log("Internationalization disabled - English only mode");
});

// Empty export
window.i18n = {
    changeLanguage: function() {},
    getTranslation: function(key) { return key; },
    applyTranslations: function() {},
    getCurrentLanguage: function() { return 'en'; }
};
