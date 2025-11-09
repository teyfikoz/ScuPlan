/**
 * AdSense Manager for ScuPlan SPA
 * Handles Google AdSense integration with route-aware ad refresh
 * Compliant with Google AdSense TOS
 */

class AdSenseManager {
    constructor() {
        this.config = null;
        this.scriptLoaded = false;
        this.adSlots = new Map();
        this.isOnline = navigator.onLine;
        this.initialized = false;
        
        // Listen to online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('[AdSense] Back online');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('[AdSense] Gone offline');
        });
    }
    
    /**
     * Initialize AdSense Manager
     */
    async init() {
        try {
            // Load configuration
            const response = await fetch('/config/adsense.json');
            this.config = await response.json();
            
            // Check if ads are enabled
            if (!this.config.enabled) {
                console.log('[AdSense] Ads are disabled in configuration');
                return;
            }
            
            // Check white label override
            if (this.config.whiteLabel.override && this.config.whiteLabel.customClientId) {
                this.config.clientId = this.config.whiteLabel.customClientId;
                console.log('[AdSense] Using white label client ID');
            }
            
            // Check offline mode
            if (!this.isOnline && this.config.offlineMode.skipAds) {
                console.log('[AdSense] Offline mode - skipping ad initialization');
                return;
            }
            
            // Load AdSense script
            await this.loadAdSenseScript();
            
            this.initialized = true;
            console.log('[AdSense] Manager initialized successfully');
            
        } catch (error) {
            console.error('[AdSense] Initialization error:', error);
        }
    }
    
    /**
     * Load Google AdSense script
     */
    loadAdSenseScript() {
        return new Promise((resolve, reject) => {
            if (this.scriptLoaded) {
                resolve();
                return;
            }
            
            // Check if script already exists
            const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
            if (existingScript) {
                this.scriptLoaded = true;
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.config.clientId}`;
            script.crossOrigin = 'anonymous';
            script.async = true;
            
            script.onload = () => {
                this.scriptLoaded = true;
                console.log('[AdSense] Script loaded successfully');
                resolve();
            };
            
            script.onerror = (error) => {
                console.error('[AdSense] Script loading failed:', error);
                reject(error);
            };
            
            document.head.appendChild(script);
        });
    }
    
    /**
     * Create ad placeholder element
     * @param {string} adUnitKey - Key from config.adUnits
     * @param {string} containerId - ID for the container div
     * @returns {HTMLElement} - Ad container element
     */
    createAdElement(adUnitKey, containerId) {
        if (!this.config || !this.config.adUnits[adUnitKey]) {
            console.warn(`[AdSense] Ad unit not found: ${adUnitKey}`);
            return null;
        }
        
        const adUnit = this.config.adUnits[adUnitKey];
        
        // Create container with fixed height to prevent CLS
        const container = document.createElement('div');
        container.id = containerId;
        container.className = 'adsense-container';
        container.style.cssText = `
            min-height: 90px;
            margin: 20px 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.02);
            border-radius: 8px;
        `;
        
        // Create ins element for AdSense
        const ins = document.createElement('ins');
        ins.className = 'adsbygoogle';
        ins.style.cssText = 'display:block;';
        ins.setAttribute('data-ad-client', this.config.clientId);
        ins.setAttribute('data-ad-slot', adUnit.slot);
        ins.setAttribute('data-ad-format', adUnit.format);
        
        if (adUnit.responsive) {
            ins.setAttribute('data-full-width-responsive', 'true');
        }
        
        container.appendChild(ins);
        
        return container;
    }
    
    /**
     * Insert ad into DOM at specific location
     * @param {string} adUnitKey - Key from config.adUnits
     * @param {string} targetSelector - CSS selector for insertion point
     * @param {string} position - 'before', 'after', or 'append'
     */
    insertAd(adUnitKey, targetSelector, position = 'after') {
        if (!this.initialized || !this.isOnline) {
            return;
        }
        
        const target = document.querySelector(targetSelector);
        if (!target) {
            console.warn(`[AdSense] Target element not found: ${targetSelector}`);
            return;
        }
        
        const containerId = `ad-${adUnitKey}-${Date.now()}`;
        const adElement = this.createAdElement(adUnitKey, containerId);
        
        if (!adElement) {
            return;
        }
        
        // Insert based on position
        switch (position) {
            case 'before':
                target.parentNode.insertBefore(adElement, target);
                break;
            case 'after':
                target.parentNode.insertBefore(adElement, target.nextSibling);
                break;
            case 'append':
                target.appendChild(adElement);
                break;
            default:
                console.warn(`[AdSense] Invalid position: ${position}`);
                return;
        }
        
        // Store ad slot reference
        this.adSlots.set(containerId, {
            adUnitKey,
            targetSelector,
            position,
            element: adElement
        });
        
        // Push ad
        this.pushAd(containerId);
    }
    
    /**
     * Push ad to AdSense for rendering
     * @param {string} containerId - Container ID
     */
    pushAd(containerId) {
        if (!this.scriptLoaded) {
            console.warn('[AdSense] Script not loaded yet');
            return;
        }
        
        try {
            const container = document.getElementById(containerId);
            if (!container) {
                console.warn(`[AdSense] Container not found: ${containerId}`);
                return;
            }
            
            const ins = container.querySelector('.adsbygoogle');
            if (!ins) {
                console.warn(`[AdSense] Ins element not found in container: ${containerId}`);
                return;
            }
            
            // Push ad to AdSense
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            console.log(`[AdSense] Ad pushed: ${containerId}`);
            
        } catch (error) {
            console.error('[AdSense] Error pushing ad:', error);
        }
    }
    
    /**
     * Refresh ads on route change (compliant with Google TOS)
     * Removes old ads and inserts new ones based on page context
     */
    refreshAdsOnRouteChange(pageName) {
        if (!this.initialized || !this.isOnline) {
            return;
        }
        
        console.log(`[AdSense] Refreshing ads for page: ${pageName}`);
        
        // Clear existing ads
        this.clearAllAds();
        
        // Wait for DOM to be ready, then insert new ads
        setTimeout(() => {
            this.insertAdsForPage(pageName);
        }, 300);
    }
    
    /**
     * Clear all existing ads from DOM
     */
    clearAllAds() {
        this.adSlots.forEach((adData, containerId) => {
            const element = document.getElementById(containerId);
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        
        this.adSlots.clear();
        console.log('[AdSense] All ads cleared');
    }
    
    /**
     * Insert ads based on current page
     * @param {string} pageName - Current page name
     */
    insertAdsForPage(pageName) {
        if (!this.initialized || !this.isOnline) {
            return;
        }
        
        console.log(`[AdSense] Inserting ads for page: ${pageName}`);
        
        // Common top leaderboard for all pages
        const pageContent = document.querySelector('.page-view, #route-view .container');
        if (pageContent) {
            const topAd = this.createAdElement('topLeaderboard', `ad-top-${Date.now()}`);
            if (topAd) {
                pageContent.insertBefore(topAd, pageContent.firstChild);
                this.pushAd(topAd.id);
            }
        }
        
        // Page-specific ads
        switch (pageName) {
            case 'dive-planner':
                this.insertDivePlannerAds();
                break;
            case 'checklist':
                this.insertChecklistAds();
                break;
            case 'technical':
                this.insertTechnicalAds();
                break;
            case 'dive-routes':
                this.insertDiveRoutesAds();
                break;
            case 'education':
                this.insertEducationAds();
                break;
            case 'saved-plans':
                this.insertSavedPlansAds();
                break;
        }
        
        // Common footer ad
        const footer = document.querySelector('footer');
        if (footer) {
            const footerAd = this.createAdElement('footer', `ad-footer-${Date.now()}`);
            if (footerAd) {
                footer.parentNode.insertBefore(footerAd, footer);
                this.pushAd(footerAd.id);
            }
        }
    }
    
    /**
     * Insert ads for Dive Planner page
     */
    insertDivePlannerAds() {
        // Look for results section or main content area
        const resultsSection = document.querySelector('#dive-results, .results-section, .dive-calculator');
        if (resultsSection) {
            const inContentAd = this.createAdElement('inContentDivePlanner', `ad-dive-content-${Date.now()}`);
            if (inContentAd) {
                resultsSection.parentNode.insertBefore(inContentAd, resultsSection.nextSibling);
                this.pushAd(inContentAd.id);
            }
        }
    }
    
    /**
     * Insert ads for Checklist page
     */
    insertChecklistAds() {
        // Look for checklist sections
        const checklistSections = document.querySelectorAll('.checklist-section, .checklist-category');
        if (checklistSections.length > 0) {
            // Insert after first section
            const firstSection = checklistSections[0];
            const inContentAd = this.createAdElement('inContentChecklist', `ad-checklist-content-${Date.now()}`);
            if (inContentAd) {
                firstSection.parentNode.insertBefore(inContentAd, firstSection.nextSibling);
                this.pushAd(inContentAd.id);
            }
        }
    }
    
    /**
     * Insert ads for Technical page
     */
    insertTechnicalAds() {
        const technicalContent = document.querySelector('.technical-content, .calculator-section');
        if (technicalContent) {
            const inContentAd = this.createAdElement('inContentDivePlanner', `ad-technical-content-${Date.now()}`);
            if (inContentAd) {
                technicalContent.parentNode.insertBefore(inContentAd, technicalContent.nextSibling);
                this.pushAd(inContentAd.id);
            }
        }
    }
    
    /**
     * Insert ads for Dive Routes page
     */
    insertDiveRoutesAds() {
        const routesContent = document.querySelector('.dive-routes-content, .map-container');
        if (routesContent) {
            const inContentAd = this.createAdElement('inContentDivePlanner', `ad-routes-content-${Date.now()}`);
            if (inContentAd) {
                routesContent.parentNode.insertBefore(inContentAd, routesContent.nextSibling);
                this.pushAd(inContentAd.id);
            }
        }
    }
    
    /**
     * Insert ads for Education page
     */
    insertEducationAds() {
        const educationContent = document.querySelector('.education-content, .course-section');
        if (educationContent) {
            const inContentAd = this.createAdElement('inContentDivePlanner', `ad-education-content-${Date.now()}`);
            if (inContentAd) {
                educationContent.parentNode.insertBefore(inContentAd, educationContent.nextSibling);
                this.pushAd(inContentAd.id);
            }
        }
    }
    
    /**
     * Insert ads for Saved Plans page
     */
    insertSavedPlansAds() {
        const savedContent = document.querySelector('.saved-plans-content, .plans-list');
        if (savedContent) {
            const inContentAd = this.createAdElement('inContentDivePlanner', `ad-saved-content-${Date.now()}`);
            if (inContentAd) {
                savedContent.parentNode.insertBefore(inContentAd, savedContent.nextSibling);
                this.pushAd(inContentAd.id);
            }
        }
    }
}

// Create singleton instance
window.AdSenseManager = new AdSenseManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdSenseManager;
}
