/**
 * ScuPlan i18n Manager
 * Handles multi-language support with offline capability
 */

class I18nManager {
    constructor() {
        this.currentLang = 'en';
        this.translations = {};
        this.supportedLanguages = ['en', 'tr'];
        this.init();
    }
    
    async init() {
        // Load saved preference
        const savedLang = localStorage.getItem('scuplan_lang') || this.detectBrowserLanguage();
        await this.setLanguage(savedLang);
        
        // Setup language switcher
        this.setupLanguageSwitcher();
        
        // Make globally available
        window.i18n = this;
    }
    
    detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0];
        return this.supportedLanguages.includes(langCode) ? langCode : 'en';
    }
    
    async loadLanguage(lang) {
        if (this.translations[lang]) {
            return this.translations[lang];
        }
        
        try {
            const response = await fetch(`/static/js/i18n/${lang}.json`);
            this.translations[lang] = await response.json();
            
            // Cache in localStorage for offline use
            localStorage.setItem(`scuplan_i18n_${lang}`, JSON.stringify(this.translations[lang]));
            
            return this.translations[lang];
        } catch (error) {
            // Try to load from localStorage (offline mode)
            const cached = localStorage.getItem(`scuplan_i18n_${lang}`);
            if (cached) {
                this.translations[lang] = JSON.parse(cached);
                return this.translations[lang];
            }
            
            console.error('Failed to load language:', error);
            // Fallback to English
            if (lang !== 'en') {
                return this.loadLanguage('en');
            }
            return {};
        }
    }
    
    async setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            lang = 'en';
        }
        
        this.currentLang = lang;
        await this.loadLanguage(lang);
        
        // Update UI
        this.translatePage();
        this.updateLanguageSwitcher();
        
        // Save preference
        localStorage.setItem('scuplan_lang', lang);
        
        // Update HTML lang attribute
        document.documentElement.lang = lang;
        
        // Emit event for other components
        window.dispatchEvent(new CustomEvent('languagechange', { detail: lang }));
        
        // Show toast notification
        if (window.showToast) {
            const message = lang === 'tr' ? 'Dil Türkçe olarak değiştirildi' : 'Language changed to English';
            window.showToast(message);
        }
    }
    
    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];
        
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return key; // Return key if translation not found
            }
        }
        
        // Simple parameter replacement
        if (typeof value === 'string') {
            Object.keys(params).forEach(param => {
                value = value.replace(`{${param}}`, params[param]);
            });
        }
        
        return value || key;
    }
    
    translatePage() {
        // Translate elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.placeholder) {
                    element.placeholder = translation;
                }
            } else {
                element.textContent = translation;
            }
        });
        
        // Translate elements with data-i18n-html attribute (for HTML content)
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const translation = this.t(key);
            element.innerHTML = translation;
        });
        
        // Translate placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });
        
        // Translate titles
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });
    }
    
    setupLanguageSwitcher() {
        const switcherHTML = `
            <select id="language-selector" class="bg-blue-700 text-white rounded px-2 py-1 text-sm border-0">
                <option value="en">🇬🇧 English</option>
                <option value="tr">🇹🇷 Türkçe</option>
            </select>
        `;
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.injectSwitcher(switcherHTML));
        } else {
            this.injectSwitcher(switcherHTML);
        }
    }
    
    injectSwitcher(html) {
        const unitToggle = document.getElementById('unit-toggle');
        if (unitToggle && !document.getElementById('language-selector')) {
            unitToggle.insertAdjacentHTML('beforebegin', html);
            
            const selector = document.getElementById('language-selector');
            selector.value = this.currentLang;
            
            selector.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
    }
    
    updateLanguageSwitcher() {
        const selector = document.getElementById('language-selector');
        if (selector) {
            selector.value = this.currentLang;
        }
    }
    
    getCurrentLanguage() {
        return this.currentLang;
    }
    
    getSupportedLanguages() {
        return this.supportedLanguages;
    }
}

// Initialize i18n when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new I18nManager());
} else {
    new I18nManager();
}