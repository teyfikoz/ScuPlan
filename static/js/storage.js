/**
 * ScuPlan - Storage Module
 * Handles offline storage functionality
 */

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
}

/**
 * Save the current dive plan offline
 */
function saveCurrentPlanOffline() {
    // Check if we have a current plan
    if (!app.currentPlan) {
        showAlert('No dive plan to save. Please calculate a plan first.', 'warning');
        return;
    }
    
    // Get existing data
    const storageData = JSON.parse(localStorage.getItem('scuplan_data') || '{"plans":[],"checklists":[]}');
    
    // Create a unique ID for the plan
    const planId = 'plan_' + Date.now();
    
    // Create a plan object for storage
    const planToSave = {
        id: planId,
        savedAt: new Date().toISOString(),
        planData: app.currentPlan
    };
    
    // Add to storage
    storageData.plans.push(planToSave);
    
    // Save back to storage
    localStorage.setItem('scuplan_data', JSON.stringify(storageData));
    
    showAlert('Dive plan saved for offline use', 'success');
}

/**
 * Show offline storage modal with saved plans
 */
function showOfflineStorageModal() {
    const storageData = JSON.parse(localStorage.getItem('scuplan_data') || '{"plans":[],"checklists":[]}');
    const savedPlans = storageData.plans;
    
    // Create the modal if it doesn't exist
    if (!document.getElementById('offlineStorageModal')) {
        const modalHtml = `
            <div class="modal fade" id="offlineStorageModal" tabindex="-1" aria-labelledby="offlineStorageModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="offlineStorageModalLabel">Saved Dive Plans</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div id="savedPlansContainer"></div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-danger" id="clearStorageBtn">Clear All Saved Data</button>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);
        
        // Add event listener for the clear button
        document.getElementById('clearStorageBtn').addEventListener('click', function() {
            if (confirm('Are you sure you want to clear all saved dive plans and checklists? This cannot be undone.')) {
                localStorage.setItem('scuplan_data', JSON.stringify({
                    plans: [],
                    checklists: []
                }));
                showOfflineStorageModal(); // Refresh the modal
                showAlert('All saved data has been cleared', 'success');
            }
        });
    }
    
    // Update the modal content
    const container = document.getElementById('savedPlansContainer');
    
    if (savedPlans.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                You haven't saved any dive plans for offline use yet.
            </div>
        `;
    } else {
        container.innerHTML = '';
        
        savedPlans.forEach(plan => {
            const planDate = new Date(plan.savedAt).toLocaleString();
            const planData = plan.planData;
            
            const planCard = document.createElement('div');
            planCard.className = 'card mb-3';
            planCard.innerHTML = `
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span>
                        ${planData.location ? planData.location : 'Unnamed dive'} 
                        (${planData.depth}m, ${planData.bottomTime}min)
                    </span>
                    <div>
                        <button type="button" class="btn btn-sm btn-outline-primary load-plan-btn" data-plan-id="${plan.id}">
                            <i class="fas fa-edit me-1"></i>Load
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger delete-plan-btn" data-plan-id="${plan.id}">
                            <i class="fas fa-trash me-1"></i>Delete
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="small text-muted">Saved on: ${planDate}</div>
                    <div class="small text-muted">Dive type: ${capitalizeFirstLetter(planData.diveType)}</div>
                    <div class="mt-2">
                        <div class="row">
                            <div class="col-4">
                                <div class="small">Depth</div>
                                <div class="fw-bold">${planData.depth}m</div>
                            </div>
                            <div class="col-4">
                                <div class="small">Bottom Time</div>
                                <div class="fw-bold">${planData.bottomTime}min</div>
                            </div>
                            <div class="col-4">
                                <div class="small">Total Time</div>
                                <div class="fw-bold">${planData.totalDiveTime}min</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(planCard);
        });
        
        // Add event listeners for the buttons
        document.querySelectorAll('.load-plan-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const planId = this.getAttribute('data-plan-id');
                loadOfflinePlan(planId);
                
                // Close the modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('offlineStorageModal'));
                if (modal) modal.hide();
            });
        });
        
        document.querySelectorAll('.delete-plan-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const planId = this.getAttribute('data-plan-id');
                deleteOfflinePlan(planId);
            });
        });
    }
    
    // Show the modal
    const modalEl = document.getElementById('offlineStorageModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
    
    // Handle modal hidden event to clean up URL fragment
    modalEl.addEventListener('hidden.bs.modal', function() {
        // Remove the # from URL without refreshing page
        if (window.history && window.history.replaceState) {
            const url = window.location.href.split('#')[0];
            window.history.replaceState('', document.title, url);
        }
    }, { once: true });
}

/**
 * Load an offline plan by ID
 * @param {string} planId - ID of the plan to load
 */
function loadOfflinePlan(planId) {
    const storageData = JSON.parse(localStorage.getItem('scuplan_data') || '{"plans":[],"checklists":[]}');
    const plan = storageData.plans.find(p => p.id === planId);
    
    if (!plan) {
        showAlert('Failed to load plan: Plan not found', 'danger');
        return;
    }
    
    try {
        // Load the plan data into the app
        app.currentPlan = plan.planData;
        
        // Update the form with the plan data
        document.getElementById('diveDepth').value = plan.planData.depth;
        document.getElementById('bottomTime').value = plan.planData.bottomTime;
        document.getElementById('diveLocation').value = plan.planData.location || '';
        document.getElementById('diveType').value = plan.planData.diveType || 'recreational';
        
        // Load tanks and buddies
        app.tanks = plan.planData.tanks || [];
        app.buddies = plan.planData.buddies || [];
        
        // Update displays
        updateTanksDisplay();
        updateBuddiesDisplay();
        
        // Display results
        displayDivePlanResults(plan.planData);
        
        showAlert('Dive plan loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading plan:', error);
        showAlert('Failed to load plan: ' + error.message, 'danger');
    }
}

/**
 * Delete an offline plan by ID
 * @param {string} planId - ID of the plan to delete
 */
function deleteOfflinePlan(planId) {
    if (confirm('Are you sure you want to delete this saved plan?')) {
        const storageData = JSON.parse(localStorage.getItem('scuplan_data') || '{"plans":[],"checklists":[]}');
        
        // Filter out the plan with the given ID
        storageData.plans = storageData.plans.filter(p => p.id !== planId);
        
        // Save back to storage
        localStorage.setItem('scuplan_data', JSON.stringify(storageData));
        
        // Refresh the modal
        showOfflineStorageModal();
        
        showAlert('Dive plan deleted', 'success');
    }
}

/**
 * Helper function to capitalize first letter
 */
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}
