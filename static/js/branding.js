/**
 * Branding Management System for ScuPlan
 * White label configuration system that allows easy customization
 * without touching code.
 *
 * Features:
 * - Load default config from branding.json
 * - Merge with Flask-injected config (window.__SCUPLAN_CONFIG__)
 * - Update DOM elements (logo, brand name, footer, crypto addresses)
 * - Update CSS custom properties for theme colors
 * - Works with existing ThemeManager
 * - Expose API for runtime access
 */

class BrandingManager {
    constructor() {
        this.config = null;
        this.defaultConfig = null;
        this.initialized = false;
    }

    /**
     * Initialize branding system
     * Loads config and applies branding
     */
    async initialize() {
        if (this.initialized) {
            console.warn('BrandingManager already initialized');
            return;
        }

        console.log('Initializing BrandingManager...');

        try {
            // Load default config from branding.json
            await this.loadDefaultConfig();

            // Merge with Flask-injected config if available
            this.mergeServerConfig();

            // Apply branding to the page
            this.applyBranding();

            this.initialized = true;
            console.log('BrandingManager initialized successfully');

            // Trigger custom event
            window.dispatchEvent(new CustomEvent('brandingLoaded', {
                detail: { config: this.config }
            }));
        } catch (error) {
            const errorMessage = error.message || error.toString() || 'Unknown error';
            console.error('Error initializing BrandingManager:', errorMessage, error);
            // Fall back to basic defaults if config load fails
            this.useFallbackConfig();
            // Still try to merge server config even if fetch failed
            this.mergeServerConfig();
            this.applyBranding();
        }
    }

    /**
     * Load default configuration from branding.json
     */
    async loadDefaultConfig() {
        try {
            const response = await fetch('/config/branding.json');
            if (!response.ok) {
                console.warn(`Branding config not found (${response.status}), using defaults`);
                this.useFallbackConfig();
                return;
            }
            this.defaultConfig = await response.json();
            this.config = JSON.parse(JSON.stringify(this.defaultConfig)); // Deep copy
            console.log('Default branding config loaded:', this.config);
        } catch (error) {
            console.warn('Error loading branding.json, using defaults:', error.message);
            this.useFallbackConfig();
        }
    }

    /**
     * Merge server-injected configuration
     * Server can inject window.__SCUPLAN_CONFIG__ for per-client customization
     */
    mergeServerConfig() {
        if (window.__SCUPLAN_CONFIG__) {
            console.log('Merging server-injected config:', window.__SCUPLAN_CONFIG__);
            this.config = this.deepMerge(this.config, window.__SCUPLAN_CONFIG__);
            console.log('Merged config:', this.config);
        }
    }

    /**
     * Deep merge two objects
     */
    deepMerge(target, source) {
        const output = Object.assign({}, target);
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = this.deepMerge(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }

    /**
     * Check if value is an object
     */
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    /**
     * Use fallback configuration if loading fails
     */
    useFallbackConfig() {
        console.warn('Using fallback branding config');
        this.config = {
            brandName: 'ScuPlan',
            logo: '',
            tagline: 'Advanced Dive Planning',
            copyright: 'Teyfik ÖZ',
            colors: {
                primary: '#0b6bff',
                secondary: '#00a6c7',
                primaryHover: '#0952cc',
                secondaryHover: '#008fa8'
            },
            crypto: {
                xrp: 'rPu9SuQBv9ZWXGBaUgaHJ1PauSj98arjbV',
                usdt: 'TJoUFBDEFXMPgdZ2yj8yBXCo7TURfiZ3hQ'
            },
            contact: {
                email: '',
                website: ''
            }
        };
    }

    /**
     * Apply branding to the page
     */
    applyBranding() {
        console.log('Applying branding...');

        // Update theme colors first (CSS custom properties)
        this.updateThemeColors();

        // Update DOM elements
        this.updateBrandName();
        this.updateLogo();
        this.updateFooter();
        this.updateCryptoAddresses();
        this.updateMetaTags();

        console.log('Branding applied successfully');
    }

    /**
     * Update CSS custom properties for theme colors
     */
    updateThemeColors() {
        if (!this.config.colors) return;

        const root = document.documentElement;
        const colors = this.config.colors;

        // Update CSS custom properties
        if (colors.primary) {
            root.style.setProperty('--color-primary', colors.primary);
        }
        if (colors.secondary) {
            root.style.setProperty('--color-secondary', colors.secondary);
        }
        if (colors.primaryHover) {
            root.style.setProperty('--color-primary-hover', colors.primaryHover);
        }
        if (colors.secondaryHover) {
            root.style.setProperty('--color-secondary-hover', colors.secondaryHover);
        }

        console.log('Theme colors updated:', colors);
    }

    /**
     * Update brand name in navigation and throughout the page
     */
    updateBrandName() {
        const brandName = this.config.brandName || 'ScuPlan';

        // Update all elements with brand name
        // Navbar brand
        const navbarBrand = document.querySelector('.navbar-brand h1, .navbar-brand');
        if (navbarBrand) {
            const icon = navbarBrand.querySelector('i');
            if (icon) {
                navbarBrand.innerHTML = icon.outerHTML + ' ' + brandName;
            } else {
                // For text-only brand
                const textNode = Array.from(navbarBrand.childNodes).find(
                    node => node.nodeType === Node.TEXT_NODE
                );
                if (textNode) {
                    textNode.textContent = brandName;
                }
            }
        }

        // Page title
        const titleElements = document.querySelectorAll('h1');
        titleElements.forEach(el => {
            if (el.textContent.includes('ScuPlan')) {
                el.textContent = el.textContent.replace(/ScuPlan/g, brandName);
            }
        });

        // Update document title if needed
        if (document.title.includes('ScuPlan')) {
            document.title = document.title.replace(/ScuPlan/g, brandName);
        }

        console.log('Brand name updated to:', brandName);
    }

    /**
     * Update logo throughout the page
     */
    updateLogo() {
        if (!this.config.logo) return;

        // Find logo images
        const logoImages = document.querySelectorAll('img.logo, .navbar-brand img, [data-branding="logo"]');
        logoImages.forEach(img => {
            img.src = this.config.logo;
            img.alt = `${this.config.brandName} Logo`;
        });

        // Update favicon if logo is provided
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon && this.config.logo) {
            favicon.href = this.config.logo;
        }

        console.log('Logo updated');
    }

    /**
     * Update footer with copyright and contact info
     */
    updateFooter() {
        // Update copyright
        const copyrightYear = new Date().getFullYear();
        const copyrightText = `© ${copyrightYear} ${this.config.brandName}${this.config.copyright ? ' by ' + this.config.copyright : ''}. All rights reserved.`;

        const copyrightElements = document.querySelectorAll('footer p, #currentYear, [data-branding="copyright"]');
        copyrightElements.forEach(el => {
            if (el.id === 'currentYear') {
                el.textContent = copyrightYear;
            } else if (el.textContent.includes('©') || el.textContent.includes('ScuPlan')) {
                el.innerHTML = copyrightText;
            }
        });

        // Update contact info if available
        if (this.config.contact) {
            if (this.config.contact.email) {
                const emailLinks = document.querySelectorAll('a[href^="mailto:"], [data-branding="email"]');
                emailLinks.forEach(link => {
                    link.href = `mailto:${this.config.contact.email}`;
                    if (link.textContent.includes('@')) {
                        link.textContent = this.config.contact.email;
                    }
                });
            }

            if (this.config.contact.website) {
                const websiteLinks = document.querySelectorAll('[data-branding="website"]');
                websiteLinks.forEach(link => {
                    link.href = this.config.contact.website;
                });
            }
        }

        console.log('Footer updated');
    }

    /**
     * Update crypto donation addresses
     */
    updateCryptoAddresses() {
        if (!this.config.crypto) return;

        // Update XRP address
        if (this.config.crypto.xrp) {
            const xrpElements = document.querySelectorAll('#xrpAddress, [data-crypto="XRP"], [data-branding="xrp"]');
            xrpElements.forEach(el => {
                el.textContent = this.config.crypto.xrp;
                if (el.dataset && el.dataset.address) {
                    el.dataset.address = this.config.crypto.xrp;
                }
            });

            // Update XRP links
            const xrpLinks = document.querySelectorAll('a[href*="xaman.app"]');
            xrpLinks.forEach(link => {
                link.href = `https://xaman.app/detect/request:${this.config.crypto.xrp}`;
            });
        }

        // Update USDT address
        if (this.config.crypto.usdt) {
            const usdtElements = document.querySelectorAll('#usdtAddress, [data-crypto="USDT"], [data-branding="usdt"]');
            usdtElements.forEach(el => {
                el.textContent = this.config.crypto.usdt;
                if (el.dataset && el.dataset.address) {
                    el.dataset.address = this.config.crypto.usdt;
                }
            });
        }

        console.log('Crypto addresses updated');
    }

    /**
     * Update meta tags for SEO and social sharing
     */
    updateMetaTags() {
        if (!this.config.meta) return;

        const meta = this.config.meta;

        // Update title
        if (meta.title) {
            document.title = meta.title;
            this.updateMetaTag('og:title', meta.title);
            this.updateMetaTag('twitter:title', meta.title);
        }

        // Update description
        if (meta.description) {
            this.updateMetaTag('description', meta.description);
            this.updateMetaTag('og:description', meta.description);
            this.updateMetaTag('twitter:description', meta.description);
        }

        // Update keywords
        if (meta.keywords) {
            this.updateMetaTag('keywords', meta.keywords);
        }

        console.log('Meta tags updated');
    }

    /**
     * Update a specific meta tag
     */
    updateMetaTag(name, content) {
        let meta = document.querySelector(`meta[name="${name}"]`) ||
                   document.querySelector(`meta[property="${name}"]`);

        if (meta) {
            meta.content = content;
        } else {
            meta = document.createElement('meta');
            meta.name = name;
            meta.content = content;
            document.head.appendChild(meta);
        }
    }

    /**
     * Get configuration value by key path
     * Example: branding.get('colors.primary')
     */
    get(keyPath) {
        if (!this.config) {
            console.warn('Branding not initialized yet');
            return null;
        }

        const keys = keyPath.split('.');
        let value = this.config;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return null;
            }
        }

        return value;
    }

    /**
     * Update configuration at runtime
     * This allows dynamic branding changes
     */
    update(keyPath, newValue) {
        if (!this.config) {
            console.warn('Branding not initialized yet');
            return false;
        }

        const keys = keyPath.split('.');
        const lastKey = keys.pop();
        let target = this.config;

        for (const key of keys) {
            if (!(key in target)) {
                target[key] = {};
            }
            target = target[key];
        }

        target[lastKey] = newValue;

        // Re-apply branding
        this.applyBranding();

        console.log(`Updated ${keyPath} to:`, newValue);
        return true;
    }

    /**
     * Get full configuration object
     */
    getConfig() {
        return this.config ? JSON.parse(JSON.stringify(this.config)) : null;
    }

    /**
     * Reset to default configuration
     */
    reset() {
        if (this.defaultConfig) {
            this.config = JSON.parse(JSON.stringify(this.defaultConfig));
            this.applyBranding();
            console.log('Branding reset to defaults');
        }
    }
}

// Create global instance
window.BrandingManager = BrandingManager;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        window.branding = new BrandingManager();
        await window.branding.initialize();
    });
} else {
    // DOM already loaded
    window.branding = new BrandingManager();
    window.branding.initialize();
}

console.log('Branding script loaded');