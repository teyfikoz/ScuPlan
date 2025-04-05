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
    // Check for existing modal and remove it
    let existingModal = document.getElementById('offlineStorageModal');
    if (existingModal) {
        try {
            // Safe cleanup of Bootstrap modal (simplified for mobile Safari compatibility)
            document.body.removeChild(existingModal.parentNode);
        } catch (e) {
            console.log("Modal cleanup error:", e);
        }
    }

    // Get saved plans data
    const storageData = JSON.parse(localStorage.getItem('scuplan_data') || '{"plans":[],"checklists":[]}');
    const savedPlans = storageData.plans;
    
    // Create container for the modal
    const modalContainer = document.createElement('div');
    
    // Create the modal HTML
    modalContainer.innerHTML = `
        <div class="modal fade" id="offlineStorageModal" tabindex="-1" aria-labelledby="offlineStorageModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="offlineStorageModalLabel">Saved Dive Plans</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div id="savedPlansContainer">
                            ${savedPlans.length === 0 ? 
                                `<div class="alert alert-info">
                                    <i class="fas fa-info-circle me-2"></i>
                                    You haven't saved any dive plans for offline use yet.
                                </div>` : 
                                ''
                            }
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-danger" id="clearStorageBtn">Clear All Saved Data</button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add the modal to the DOM
    document.body.appendChild(modalContainer);
    
    // If we have saved plans, populate them
    if (savedPlans.length > 0) {
        const container = document.getElementById('savedPlansContainer');
        
        // Clear the container first
        container.innerHTML = '';
        
        // Add each plan
        savedPlans.forEach(plan => {
            const planDate = new Date(plan.savedAt).toLocaleString();
            const planData = plan.planData;
            
            // Create the plan card
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
            
            // Add the card to the container
            container.appendChild(planCard);
        });
    }
    
    // Set up the event handlers after the modal content is added
    setupStorageModalEvents();
    
    // Show the modal using Bootstrap
    try {
        const modalEl = document.getElementById('offlineStorageModal');
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
        
        // Set up modal cleanup when it's hidden
        modalEl.addEventListener('hidden.bs.modal', function() {
            // Remove URL fragment if present
            if (window.history && window.history.replaceState) {
                try {
                    window.history.replaceState('', document.title, window.location.pathname + window.location.search);
                } catch (e) {
                    console.log("URL cleanup error:", e);
                }
            }
            
            // Remove modal from DOM after a delay (safer for mobile)
            setTimeout(function() {
                try {
                    const modalToRemove = document.getElementById('offlineStorageModal');
                    if (modalToRemove && modalToRemove.parentNode) {
                        modalToRemove.parentNode.removeChild(modalToRemove);
                    }
                } catch (e) {
                    console.log("Modal removal error:", e);
                }
            }, 300);
        });
    } catch (e) {
        console.error("Error showing modal:", e);
    }
}

/**
 * Set up event handlers for the storage modal buttons
 */
function setupStorageModalEvents() {
    // Clear storage button
    const clearBtn = document.getElementById('clearStorageBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear all saved dive plans and checklists? This cannot be undone.')) {
                // Clear storage
                localStorage.setItem('scuplan_data', JSON.stringify({
                    plans: [],
                    checklists: []
                }));
                
                // Close the current modal
                try {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('offlineStorageModal'));
                    if (modal) {
                        modal.hide();
                    }
                } catch (e) {
                    console.log("Modal close error:", e);
                }
                
                // Show success message
                showAlert('All saved data has been cleared', 'success');
                
                // Reopen the modal to show empty state after a delay
                setTimeout(function() {
                    showOfflineStorageModal();
                }, 500);
            }
        });
    }
    
    // Load plan buttons
    document.querySelectorAll('.load-plan-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const planId = this.getAttribute('data-plan-id');
            
            // Close the modal first
            try {
                const modal = bootstrap.Modal.getInstance(document.getElementById('offlineStorageModal'));
                if (modal) {
                    modal.hide();
                }
            } catch (e) {
                console.log("Modal close error:", e);
            }
            
            // Load the plan after a delay
            setTimeout(function() {
                loadOfflinePlan(planId);
            }, 500);
        });
    });
    
    // Delete plan buttons
    document.querySelectorAll('.delete-plan-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const planId = this.getAttribute('data-plan-id');
            deleteOfflinePlan(planId);
        });
    });
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
        showAlert('Failed to load plan: ' + (error.message || 'Unknown error'), 'danger');
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
