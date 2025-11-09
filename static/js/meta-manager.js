/**
 * Meta Manager for ScuPlan SPA
 * Handles dynamic SEO meta tag updates based on routes
 */

class MetaManager {
    constructor() {
        this.seoData = null;
        this.baseUrl = window.location.origin;
        this.currentLanguage = 'en';
    }

    /**
     * Initialize the meta manager and load SEO data
     */
    async init() {
        try {
            const response = await fetch('/static/data/seo.json');
            this.seoData = await response.json();
            console.log('Meta Manager: SEO data loaded successfully');
        } catch (error) {
            console.error('Meta Manager: Failed to load SEO data', error);
            this.seoData = this.getFallbackData();
        }
    }

    /**
     * Get fallback SEO data in case JSON fails to load
     */
    getFallbackData() {
        return {
            '/': {
                title: 'ScuPlan - Advanced Dive Planning & Safety Tools',
                description: 'Professional dive planning application with decompression calculations and safety tools',
                keywords: 'dive planner, scuba diving, decompression'
            }
        };
    }

    /**
     * Update meta tags for a specific route
     * @param {string} route - The route path (e.g., '/', '/checklist')
     */
    updateMeta(route) {
        // Normalize route - remove hash if present
        const normalizedRoute = route.replace(/^#/, '');
        
        console.log(`Meta Manager: Updating meta tags for route: ${normalizedRoute}`);
        
        // Get SEO data for this route
        const metaData = this.seoData[normalizedRoute] || this.seoData['/'];
        
        if (!metaData) {
            console.warn(`Meta Manager: No SEO data found for route: ${normalizedRoute}`);
            return;
        }

        // Update document title
        if (metaData.title) {
            document.title = metaData.title;
        }

        // Update or create standard meta tags
        this.updateMetaTag('description', metaData.description);
        this.updateMetaTag('keywords', metaData.keywords);

        // Update Open Graph tags
        this.updateMetaProperty('og:title', metaData['og:title'] || metaData.title);
        this.updateMetaProperty('og:description', metaData['og:description'] || metaData.description);
        this.updateMetaProperty('og:type', metaData['og:type'] || 'website');
        this.updateMetaProperty('og:url', `${this.baseUrl}/#${normalizedRoute}`);
        this.updateMetaProperty('og:image', metaData['og:image'] || `${this.baseUrl}/generated-icon.png`);
        this.updateMetaProperty('og:site_name', 'ScuPlan');

        // Update Twitter Card tags
        this.updateMetaProperty('twitter:card', metaData['twitter:card'] || 'summary');
        this.updateMetaProperty('twitter:title', metaData['twitter:title'] || metaData.title);
        this.updateMetaProperty('twitter:description', metaData['twitter:description'] || metaData.description);
        this.updateMetaProperty('twitter:image', metaData['twitter:image'] || `${this.baseUrl}/generated-icon.png`);

        // Update canonical link
        this.updateCanonical(normalizedRoute);

        // Update JSON-LD breadcrumb
        this.updateBreadcrumbSchema(normalizedRoute, metaData.title);

        console.log(`Meta Manager: Meta tags updated successfully for ${normalizedRoute}`);
    }

    /**
     * Update or create a meta tag by name
     * @param {string} name - Meta tag name
     * @param {string} content - Meta tag content
     */
    updateMetaTag(name, content) {
        if (!content) return;

        let meta = document.querySelector(`meta[name="${name}"]`);
        
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', name);
            document.head.appendChild(meta);
        }
        
        meta.setAttribute('content', content);
    }

    /**
     * Update or create a meta tag by property (for Open Graph and Twitter)
     * @param {string} property - Meta property name
     * @param {string} content - Meta tag content
     */
    updateMetaProperty(property, content) {
        if (!content) return;

        let meta = document.querySelector(`meta[property="${property}"]`);
        
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('property', property);
            document.head.appendChild(meta);
        }
        
        meta.setAttribute('content', content);
    }

    /**
     * Update canonical link
     * @param {string} route - The route path
     */
    updateCanonical(route) {
        let canonical = document.querySelector('link[rel="canonical"]');
        
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        
        canonical.setAttribute('href', `${this.baseUrl}/#${route}`);
    }

    /**
     * Update JSON-LD breadcrumb structured data
     * @param {string} route - The route path
     * @param {string} title - The page title
     */
    updateBreadcrumbSchema(route, title) {
        // Remove existing breadcrumb schema if present
        const existingSchema = document.querySelector('script[data-schema="breadcrumb"]');
        if (existingSchema) {
            existingSchema.remove();
        }

        // Don't add breadcrumb for home page
        if (route === '/' || route === '') return;

        // Create breadcrumb structure
        const breadcrumbList = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": `${this.baseUrl}/`
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": title || this.getRouteName(route),
                    "item": `${this.baseUrl}/#${route}`
                }
            ]
        };

        // Create and append script tag
        const script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('data-schema', 'breadcrumb');
        script.textContent = JSON.stringify(breadcrumbList);
        document.head.appendChild(script);
    }

    /**
     * Get human-readable route name
     * @param {string} route - The route path
     */
    getRouteName(route) {
        const names = {
            '/checklist': 'Dive Checklists',
            '/technical': 'Technical Diving',
            '/routes': 'Dive Routes',
            '/education': 'Dive Education',
            '/saved': 'Saved Plans'
        };
        return names[route] || route.replace('/', '').replace(/-/g, ' ');
    }

    /**
     * Add static JSON-LD structured data (Organization and WebApplication)
     * This should be called once on page load
     */
    addStaticStructuredData() {
        // Organization schema
        const organizationSchema = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "ScuPlan",
            "description": "Professional dive planning and safety tools for scuba divers",
            "url": this.baseUrl,
            "logo": `${this.baseUrl}/generated-icon.png`,
            "sameAs": []
        };

        // WebApplication schema
        const webAppSchema = {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "ScuPlan",
            "description": "Advanced dive planning application with decompression calculations, technical diving tools, and offline support",
            "url": this.baseUrl,
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Any",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            },
            "featureList": [
                "Decompression calculations",
                "Technical diving calculators",
                "MOD and EAD calculators",
                "Gas mix analyzer",
                "Dive checklists",
                "World dive sites database",
                "Offline support",
                "Dive education resources"
            ],
            "screenshot": `${this.baseUrl}/generated-icon.png`
        };

        // Add Organization schema
        const orgScript = document.createElement('script');
        orgScript.setAttribute('type', 'application/ld+json');
        orgScript.setAttribute('data-schema', 'organization');
        orgScript.textContent = JSON.stringify(organizationSchema);
        document.head.appendChild(orgScript);

        // Add WebApplication schema
        const appScript = document.createElement('script');
        appScript.setAttribute('type', 'application/ld+json');
        appScript.setAttribute('data-schema', 'webapplication');
        appScript.textContent = JSON.stringify(webAppSchema);
        document.head.appendChild(appScript);

        console.log('Meta Manager: Static structured data added');
    }

    /**
     * Set language for multilingual support
     * @param {string} lang - Language code (e.g., 'en', 'tr')
     */
    setLanguage(lang) {
        this.currentLanguage = lang;
        document.documentElement.setAttribute('lang', lang);
        console.log(`Meta Manager: Language set to ${lang}`);
    }

    /**
     * Hook into router navigation
     * Call this method when route changes
     * @param {string} route - The new route
     */
    onRouteChange(route) {
        this.updateMeta(route);
        
        // Scroll to top on route change
        window.scrollTo(0, 0);
    }
}

// Create and export singleton instance
const metaManager = new MetaManager();

// Make available globally for router integration
window.MetaManager = metaManager;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = metaManager;
}
