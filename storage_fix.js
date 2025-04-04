/**
 * Initialize offline storage functionality
 */
function initOfflineStorage() {
    console.log('Initializing offline storage module');
    
    // Check for localStorage support
    if (typeof(Storage) === "undefined") {
        console.error("localStorage is not supported by your browser. Offline functionality will not work.");
        return;
    }
    
    // Initialize storage if not already done
    if (!localStorage.getItem('scuplan_data')) {
        localStorage.setItem('scuplan_data', JSON.stringify({
            plans: [],
            checklists: []
        }));
    }
    
    // Add event listener for offline storage button
    const offlineStorageBtn = document.getElementById('offlineStorageButton');
    if (offlineStorageBtn) {
        offlineStorageBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showOfflineStorageModal();
        });
    }
    
    // Also add for footer saved plans link
    const footerSavedPlansLink = document.getElementById('footerSavedPlans');
    if (footerSavedPlansLink) {
        footerSavedPlansLink.addEventListener('click', function(e) {
            e.preventDefault();
            showOfflineStorageModal();
        });
    }
}
