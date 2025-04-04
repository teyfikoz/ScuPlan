/**
 * ScuPlan - Internationalization (i18n) Module
 * Provides translation functionality for the application
 */

// Available languages
const languages = [
    { code: 'en', name: 'English', flag: 'us' },
    { code: 'tr', name: 'Türkçe', flag: 'tr' },
    { code: 'es', name: 'Español', flag: 'es' },
    { code: 'fr', name: 'Français', flag: 'fr' },
    { code: 'de', name: 'Deutsch', flag: 'de' }
];

// Translation strings
const translations = {
    // English (default)
    'en': {
        // Navigation
        'nav_dive_planner': 'Dive Planner',
        'nav_checklists': 'Checklists',
        'nav_technical': 'Technical Diving',
        'nav_saved_plans': 'Saved Plans',
        
        // Dive Planner
        'dive_plan_title': 'Dive Plan Calculator',
        'dive_plan_subtitle': 'Enter dive parameters below to calculate a safe dive plan',
        'dive_depth': 'Dive Depth',
        'dive_time': 'Bottom Time',
        'dive_details': 'Dive Details',
        'dive_date': 'Dive Date',
        'dive_location': 'Dive Location',
        'dive_type': 'Dive Type',
        'dive_recreational': 'Recreational',
        'dive_technical': 'Technical',
        'calculate_plan': 'Calculate Plan',
        'reset_form': 'Reset Form',
        
        // Tanks
        'tank_section': 'Tank Information',
        'tank_size': 'Tank Size',
        'tank_pressure': 'Pressure',
        'tank_gas': 'Gas Type',
        'tank_o2': 'O₂ %',
        'tank_he': 'He %',
        'add_tank': 'Add Tank',
        'remove_tank': 'Remove',
        'air': 'Air',
        'nitrox': 'Nitrox',
        'trimix': 'Trimix',
        
        // Buddies
        'buddy_section': 'Buddy Information',
        'buddy_name': 'Name',
        'buddy_cert': 'Certification',
        'buddy_level': 'Skill Level',
        'buddy_specialty': 'Specialty',
        'add_buddy': 'Add Buddy',
        'remove_buddy': 'Remove',
        
        // Results
        'results_title': 'Dive Plan Results',
        'results_summary': 'Dive Summary',
        'results_profile': 'Dive Profile',
        'results_deco': 'Decompression Schedule',
        'results_gas': 'Gas Consumption',
        'results_buddies': 'Buddy Information',
        'results_share': 'Share this plan',
        'results_save': 'Save Plan',
        'results_print': 'Print',
        
        // Technical Diving
        'tech_mod_title': 'Maximum Operating Depth (MOD)',
        'tech_mod_desc': 'Calculate the maximum depth at which a gas mix can be safely used',
        'tech_end_title': 'Equivalent Narcotic Depth (END)',
        'tech_end_desc': 'Calculate the narcotic effect of a gas mix at a specific depth',
        'tech_best_mix_title': 'Best Mix Calculator',
        'tech_best_mix_desc': 'Find the optimal gas mix for a planned dive depth',
        'tech_cns_title': 'CNS Toxicity Calculator',
        'tech_cns_desc': 'Calculate oxygen exposure and CNS loading',
        'tech_gas_title': 'Gas Consumption',
        'tech_gas_desc': 'Calculate gas requirements for different segments of your dive',
        
        // Notifications
        'success': 'Success',
        'error': 'Error',
        'warning': 'Warning',
        'plan_saved': 'Dive plan saved successfully',
        'checklist_saved': 'Checklist saved successfully',
        'copied': 'Copied to clipboard',
        
        // Offline
        'offline_mode': 'You\'re offline. Some features may be limited.',
        'stored_offline': 'Saved for offline use',
        'remove_offline': 'Remove from offline storage',
        
        // Donations
        'donation_title': 'Support ScuPlan',
        'donation_text': 'If you find ScuPlan helpful, please consider supporting the project with a crypto donation. Your contribution helps keep this tool free and continuously improving!',
        
        // PWA
        'install_pwa': 'Add ScuPlan to your home screen',
        'install_button': 'Install',
        'later_button': 'Maybe Later'
    },
    
    // Turkish
    'tr': {
        // Navigation
        'nav_dive_planner': 'Dalış Planlayıcı',
        'nav_checklists': 'Kontrol Listeleri',
        'nav_technical': 'Teknik Dalış',
        'nav_saved_plans': 'Kayıtlı Planlar',
        
        // Dive Planner
        'dive_plan_title': 'Dalış Planı Hesaplayıcı',
        'dive_plan_subtitle': 'Güvenli bir dalış planı hesaplamak için aşağıdaki dalış parametrelerini girin',
        'dive_depth': 'Dalış Derinliği',
        'dive_time': 'Dip Süresi',
        'dive_details': 'Dalış Detayları',
        'dive_date': 'Dalış Tarihi',
        'dive_location': 'Dalış Konumu',
        'dive_type': 'Dalış Tipi',
        'dive_recreational': 'Rekreasyonel',
        'dive_technical': 'Teknik',
        'calculate_plan': 'Planı Hesapla',
        'reset_form': 'Formu Sıfırla',
        
        // Tanks
        'tank_section': 'Tüp Bilgileri',
        'tank_size': 'Tüp Boyutu',
        'tank_pressure': 'Basınç',
        'tank_gas': 'Gaz Tipi',
        'tank_o2': 'O₂ %',
        'tank_he': 'He %',
        'add_tank': 'Tüp Ekle',
        'remove_tank': 'Kaldır',
        'air': 'Hava',
        'nitrox': 'Nitroks',
        'trimix': 'Trimiks',
        
        // Buddies
        'buddy_section': 'Buddy Bilgileri',
        'buddy_name': 'İsim',
        'buddy_cert': 'Sertifika',
        'buddy_level': 'Yetenek Seviyesi',
        'buddy_specialty': 'Uzmanlık',
        'add_buddy': 'Buddy Ekle',
        'remove_buddy': 'Kaldır',
        
        // Results
        'results_title': 'Dalış Planı Sonuçları',
        'results_summary': 'Dalış Özeti',
        'results_profile': 'Dalış Profili',
        'results_deco': 'Dekompresyon Programı',
        'results_gas': 'Gaz Tüketimi',
        'results_buddies': 'Buddy Bilgileri',
        'results_share': 'Bu planı paylaş',
        'results_save': 'Planı Kaydet',
        'results_print': 'Yazdır',
        
        // Technical Diving
        'tech_mod_title': 'Maksimum Operasyon Derinliği (MOD)',
        'tech_mod_desc': 'Bir gaz karışımının güvenle kullanılabileceği maksimum derinliği hesaplayın',
        'tech_end_title': 'Eşdeğer Narkotik Derinlik (END)',
        'tech_end_desc': 'Belirli bir derinlikte gaz karışımının narkotik etkisini hesaplayın',
        'tech_best_mix_title': 'En İyi Karışım Hesaplayıcı',
        'tech_best_mix_desc': 'Planlanan dalış derinliği için optimal gaz karışımını bulun',
        'tech_cns_title': 'CNS Toksisite Hesaplayıcı',
        'tech_cns_desc': 'Oksijen maruziyeti ve CNS yüklemesini hesaplayın',
        'tech_gas_title': 'Gaz Tüketimi',
        'tech_gas_desc': 'Dalışınızın farklı bölümleri için gaz gereksinimlerini hesaplayın',
        
        // Notifications
        'success': 'Başarılı',
        'error': 'Hata',
        'warning': 'Uyarı',
        'plan_saved': 'Dalış planı başarıyla kaydedildi',
        'checklist_saved': 'Kontrol listesi başarıyla kaydedildi',
        'copied': 'Panoya kopyalandı',
        
        // Offline
        'offline_mode': 'Çevrimdışısınız. Bazı özellikler sınırlı olabilir.',
        'stored_offline': 'Çevrimdışı kullanım için kaydedildi',
        'remove_offline': 'Çevrimdışı depolamadan kaldır',
        
        // Donations
        'donation_title': 'ScuPlan\'ı Destekle',
        'donation_text': 'ScuPlan\'ı faydalı buluyorsanız, lütfen kripto bağışıyla projeyi desteklemeyi düşünün. Katkınız, bu aracın ücretsiz ve sürekli gelişmesine yardımcı olur!',
        
        // PWA
        'install_pwa': 'ScuPlan\'ı ana ekranınıza ekleyin',
        'install_button': 'Yükle',
        'later_button': 'Belki Daha Sonra'
    },
    
    // Spanish (abbreviated for example)
    'es': {
        'nav_dive_planner': 'Planificador de Buceo',
        'nav_checklists': 'Listas de Control',
        'nav_technical': 'Buceo Técnico',
        'dive_depth': 'Profundidad',
        'dive_time': 'Tiempo de Fondo',
        'add_tank': 'Añadir Tanque',
        'calculate_plan': 'Calcular Plan',
        'results_title': 'Resultados del Plan de Buceo',
        'offline_mode': 'Estás desconectado. Algunas funciones pueden estar limitadas.'
    },
    
    // French (abbreviated for example)
    'fr': {
        'nav_dive_planner': 'Planificateur de Plongée',
        'nav_checklists': 'Listes de Contrôle',
        'nav_technical': 'Plongée Technique',
        'add_tank': 'Ajouter Bouteille',
        'calculate_plan': 'Calculer Plan'
    },
    
    // German (abbreviated for example)
    'de': {
        'nav_dive_planner': 'Tauchplaner',
        'nav_checklists': 'Checklisten',
        'nav_technical': 'Technisches Tauchen',
        'add_tank': 'Tank Hinzufügen',
        'calculate_plan': 'Plan Berechnen'
    }
};

// Default language
let currentLanguage = 'en';

/**
 * Initialize the internationalization module
 */
function initI18n() {
    // Check if a language preference is stored
    const storedLanguage = localStorage.getItem('preferredLanguage');
    
    // Set stored language or detect from browser
    if (storedLanguage && translations[storedLanguage]) {
        currentLanguage = storedLanguage;
    } else {
        // Try to detect browser language
        const browserLang = navigator.language.split('-')[0];
        if (translations[browserLang]) {
            currentLanguage = browserLang;
        }
    }
    
    // Create language selector in navigation
    createLanguageSelector();
    
    // Apply translations
    applyTranslations();
    
    console.log(`I18n initialized with language: ${currentLanguage}`);
}

/**
 * Create language selector in the UI
 */
function createLanguageSelector() {
    // Create dropdown in navbar if it doesn't exist
    if (!document.getElementById('languageSelector')) {
        const navbarNav = document.querySelector('.navbar-nav');
        if (navbarNav) {
            // Create language dropdown
            const langItem = document.createElement('li');
            langItem.className = 'nav-item dropdown';
            langItem.innerHTML = `
                <a class="nav-link dropdown-toggle" href="#" id="languageDropdown" role="button" 
                   data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-globe me-1"></i>
                    <span class="d-none d-sm-inline-block">${languages.find(l => l.code === currentLanguage)?.name || 'Language'}</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="languageDropdown" id="languageMenu">
                    <!-- Filled by JavaScript -->
                </ul>
            `;
            
            navbarNav.appendChild(langItem);
            
            // Fill language options
            populateLanguageMenu();
        }
    }
    
    // Also populate mobile language selector
    populateMobileLanguageMenu();
}

/**
 * Populate language dropdown menu
 */
function populateLanguageMenu() {
    const languageMenu = document.getElementById('languageMenu');
    if (languageMenu) {
        languageMenu.innerHTML = '';
        
        languages.forEach(lang => {
            const langItem = document.createElement('li');
            const langLink = document.createElement('a');
            langLink.className = 'dropdown-item' + (currentLanguage === lang.code ? ' active' : '');
            langLink.href = '#';
            langLink.setAttribute('data-lang', lang.code);
            langLink.innerHTML = `<i class="fas fa-flag-${lang.flag} me-2"></i> ${lang.name}`;
            
            langLink.addEventListener('click', function(e) {
                e.preventDefault();
                changeLanguage(lang.code);
            });
            
            langItem.appendChild(langLink);
            languageMenu.appendChild(langItem);
        });
    }
}

/**
 * Populate mobile language menu
 */
function populateMobileLanguageMenu() {
    const mobileMenu = document.getElementById('languageMenuMobile');
    if (mobileMenu) {
        mobileMenu.innerHTML = '';
        
        languages.forEach(lang => {
            const langItem = document.createElement('li');
            const langLink = document.createElement('a');
            langLink.className = 'dropdown-item' + (currentLanguage === lang.code ? ' active' : '');
            langLink.href = '#';
            langLink.setAttribute('data-lang', lang.code);
            langLink.innerHTML = `<i class="fas fa-flag-${lang.flag} me-2"></i> ${lang.name}`;
            
            langLink.addEventListener('click', function(e) {
                e.preventDefault();
                changeLanguage(lang.code);
            });
            
            langItem.appendChild(langLink);
            mobileMenu.appendChild(langItem);
        });
    }
}

/**
 * Change the current language
 * @param {string} langCode - Language code to change to
 */
function changeLanguage(langCode) {
    if (translations[langCode]) {
        currentLanguage = langCode;
        localStorage.setItem('preferredLanguage', langCode);
        
        // Update language selector UI
        populateLanguageMenu();
        populateMobileLanguageMenu();
        
        // Apply translations
        applyTranslations();
        
        // Trigger custom event for other components to respond to language change
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: langCode } }));
        
        console.log(`Language changed to: ${langCode}`);
    }
}

/**
 * Apply translations to the page
 */
function applyTranslations() {
    // Get translations for current language
    const currentTranslations = translations[currentLanguage] || translations['en'];
    
    // Find all elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (currentTranslations[key]) {
            element.textContent = currentTranslations[key];
        }
    });
    
    // Translate placeholders
    const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    placeholders.forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (currentTranslations[key]) {
            element.setAttribute('placeholder', currentTranslations[key]);
        }
    });
    
    // Translate specific elements based on the page
    translatePageSpecificElements();
}

/**
 * Translate specific elements based on the current page
 */
function translatePageSpecificElements() {
    // Get translations for current language
    const currentTranslations = translations[currentLanguage] || translations['en'];
    
    // Check which page we're on
    const path = window.location.pathname;
    
    // Translate nav items (common to all pages)
    const navItems = {
        '[href="/"]': 'nav_dive_planner',
        '[href="/checklist"]': 'nav_checklists',
        '[href="/technical"]': 'nav_technical'
    };
    
    for (const selector in navItems) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            const iconEl = el.querySelector('i');
            const iconHTML = iconEl ? iconEl.outerHTML + ' ' : '';
            if (currentTranslations[navItems[selector]]) {
                el.innerHTML = iconHTML + currentTranslations[navItems[selector]];
            }
        });
    }
    
    // Translate offlineStorageButton
    const offlineBtn = document.getElementById('offlineStorageButton');
    if (offlineBtn && currentTranslations['nav_saved_plans']) {
        const iconEl = offlineBtn.querySelector('i');
        const iconHTML = iconEl ? iconEl.outerHTML + ' ' : '';
        offlineBtn.innerHTML = iconHTML + currentTranslations['nav_saved_plans'];
    }
    
    // Donation section translation
    const donationTitle = document.querySelector('.donation-title');
    if (donationTitle && currentTranslations['donation_title']) {
        const iconEl = donationTitle.querySelector('i');
        const iconHTML = iconEl ? iconEl.outerHTML + ' ' : '';
        donationTitle.innerHTML = iconHTML + currentTranslations['donation_title'];
    }
    
    const donationText = document.querySelector('.donation-section p');
    if (donationText && currentTranslations['donation_text']) {
        donationText.textContent = currentTranslations['donation_text'];
    }
    
    // Page-specific translations
    if (path === '/' || path === '') {
        // Dive Planner page
        translateDivePlannerPage(currentTranslations);
    } else if (path.includes('/checklist')) {
        // Checklist page
        translateChecklistPage(currentTranslations);
    } else if (path.includes('/technical')) {
        // Technical diving page
        translateTechnicalPage(currentTranslations);
    } else if (path.includes('/share')) {
        // Share page
        translateSharePage(currentTranslations);
    }
}

/**
 * Translate the Dive Planner page
 * @param {Object} translations - Current language translations
 */
function translateDivePlannerPage(translations) {
    // Translate main titles
    const mainTitle = document.querySelector('.section-title h2');
    if (mainTitle && translations['dive_plan_title']) {
        mainTitle.textContent = translations['dive_plan_title'];
    }
    
    const subtitle = document.querySelector('.section-title p');
    if (subtitle && translations['dive_plan_subtitle']) {
        subtitle.textContent = translations['dive_plan_subtitle'];
    }
    
    // Translate form labels
    const labelMapping = {
        '#depthLabel': 'dive_depth',
        '#bottomTimeLabel': 'dive_time',
        '#diveDetailsLabel': 'dive_details',
        '#diveDateLabel': 'dive_date',
        '#diveLocationLabel': 'dive_location',
        '#diveTypeLabel': 'dive_type',
        '#tanksLabel': 'tank_section',
        '#buddiesLabel': 'buddy_section'
    };
    
    for (const selector in labelMapping) {
        const element = document.querySelector(selector);
        if (element && translations[labelMapping[selector]]) {
            element.textContent = translations[labelMapping[selector]];
        }
    }
    
    // Translate buttons
    const calculateBtn = document.querySelector('#calculateButton');
    if (calculateBtn && translations['calculate_plan']) {
        calculateBtn.textContent = translations['calculate_plan'];
    }
    
    const resetBtn = document.querySelector('#resetButton');
    if (resetBtn && translations['reset_form']) {
        resetBtn.textContent = translations['reset_form'];
    }
    
    const addTankBtn = document.querySelector('#addTankButton');
    if (addTankBtn && translations['add_tank']) {
        addTankBtn.textContent = translations['add_tank'];
    }
    
    const addBuddyBtn = document.querySelector('#addBuddyButton');
    if (addBuddyBtn && translations['add_buddy']) {
        addBuddyBtn.textContent = translations['add_buddy'];
    }
    
    // Translate dive type options
    const recreationalOption = document.querySelector('#diveTypeRecreational');
    if (recreationalOption && translations['dive_recreational']) {
        recreationalOption.nextSibling.textContent = ' ' + translations['dive_recreational'];
    }
    
    const technicalOption = document.querySelector('#diveTypeTechnical');
    if (technicalOption && translations['dive_technical']) {
        technicalOption.nextSibling.textContent = ' ' + translations['dive_technical'];
    }
    
    // Translate results section if visible
    const resultsTitle = document.querySelector('#resultsSection .section-title h2');
    if (resultsTitle && translations['results_title']) {
        resultsTitle.textContent = translations['results_title'];
    }
}

/**
 * Translate the Checklist page
 * @param {Object} translations - Current language translations
 */
function translateChecklistPage(translations) {
    // Basic implementation - would be expanded for the actual page
    const pageTitle = document.querySelector('h1');
    if (pageTitle && translations['nav_checklists']) {
        pageTitle.textContent = translations['nav_checklists'];
    }
}

/**
 * Translate the Technical Diving page
 * @param {Object} translations - Current language translations
 */
function translateTechnicalPage(translations) {
    // Translate calculator titles and descriptions
    const calculators = [
        { titleSelector: '#modCalculator .card-title', descSelector: '#modCalculator .card-text', titleKey: 'tech_mod_title', descKey: 'tech_mod_desc' },
        { titleSelector: '#endCalculator .card-title', descSelector: '#endCalculator .card-text', titleKey: 'tech_end_title', descKey: 'tech_end_desc' },
        { titleSelector: '#bestMixCalculator .card-title', descSelector: '#bestMixCalculator .card-text', titleKey: 'tech_best_mix_title', descKey: 'tech_best_mix_desc' },
        { titleSelector: '#cnsCalculator .card-title', descSelector: '#cnsCalculator .card-text', titleKey: 'tech_cns_title', descKey: 'tech_cns_desc' },
        { titleSelector: '#gasConsumptionCalculator .card-title', descSelector: '#gasConsumptionCalculator .card-text', titleKey: 'tech_gas_title', descKey: 'tech_gas_desc' }
    ];
    
    calculators.forEach(calc => {
        const titleEl = document.querySelector(calc.titleSelector);
        const descEl = document.querySelector(calc.descSelector);
        
        if (titleEl && translations[calc.titleKey]) {
            titleEl.textContent = translations[calc.titleKey];
        }
        
        if (descEl && translations[calc.descKey]) {
            descEl.textContent = translations[calc.descKey];
        }
    });
}

/**
 * Translate the Share page
 * @param {Object} translations - Current language translations
 */
function translateSharePage(translations) {
    // Share page is less interactive, mainly just needs to 
    // translate section headers and button labels
    const pageTitle = document.querySelector('h1');
    if (pageTitle && translations['results_share']) {
        pageTitle.textContent = translations['results_share'];
    }
}

/**
 * Get a translation string
 * @param {string} key - Translation key
 * @returns {string} - Translated string or key if not found
 */
function getTranslation(key) {
    const currentTranslations = translations[currentLanguage] || translations['en'];
    return currentTranslations[key] || key;
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initI18n);

// Event listener for dynamic content
document.addEventListener('contentLoaded', function() {
    // Apply translations to dynamically loaded content
    applyTranslations();
});

// Export functions for use in other modules
window.i18n = {
    changeLanguage,
    getTranslation,
    applyTranslations,
    getCurrentLanguage: () => currentLanguage
};
