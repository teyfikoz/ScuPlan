
/**
 * SPA Initialization Script
 * Handles routing and page loading for ScuPlan SPA
 */

(function() {
    'use strict';
    
    // Initialize router
    const router = new SimpleRouter();
    
    // Route handlers
    router.addRoute('/', async () => {
        const response = await fetch('/pages/dive-planner.html');
        const html = await response.text();
        document.getElementById('app').innerHTML = html;
        
        // Initialize dive planner
        if (typeof initDivePlanner === 'function') {
            initDivePlanner();
        }
    });
    
    router.addRoute('/checklist', async () => {
        const response = await fetch('/pages/checklist.html');
        const html = await response.text();
        document.getElementById('app').innerHTML = html;
        
        if (typeof initChecklists === 'function') {
            initChecklists();
        }
    });
    
    router.addRoute('/technical', async () => {
        const response = await fetch('/pages/technical.html');
        const html = await response.text();
        document.getElementById('app').innerHTML = html;
        
        if (typeof initTechnicalCalculations === 'function') {
            initTechnicalCalculations();
        }
    });
    
    router.addRoute('/routes', async () => {
        const response = await fetch('/pages/dive-routes.html');
        const html = await response.text();
        document.getElementById('app').innerHTML = html;
        
        if (typeof initDiveRoutes === 'function') {
            initDiveRoutes();
        }
    });
    
    router.addRoute('/education', async () => {
        const response = await fetch('/pages/education.html');
        const html = await response.text();
        document.getElementById('app').innerHTML = html;
        
        if (typeof initDiveEducation === 'function') {
            initDiveEducation();
        }
    });
    
    router.addRoute('/saved', async () => {
        const response = await fetch('/pages/saved-plans.html');
        const html = await response.text();
        document.getElementById('app').innerHTML = html;
        
        if (typeof loadSavedPlans === 'function') {
            loadSavedPlans();
        }
    });
    
    // Store router globally
    window.router = router;
    
    console.log('✅ SPA Router initialized');
})();
