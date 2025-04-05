/**
 * ScuPlan - Storage Management Module
 * Handles local storage for offline functionality, including dive plans and checklists
 */

/**
 * Save a dive plan for offline use
 * @param {Object} planData - The dive plan data to save
 * @returns {Object} The saved plan object with ID
 */
function saveDivePlanOffline(planData) {
    // Get existing data or initialize empty structure
    const storageData = JSON.parse(localStorage.getItem('scuplan_data') || '{"plans":[],"checklists":[]}');
    
    // Create a new plan object
    const plan = {
        id: generateUniqueId(),
        planData: planData,
        savedAt: new Date().toISOString()
    };
    
    // Add the plan to storage
    storageData.plans.push(plan);
    localStorage.setItem('scuplan_data', JSON.stringify(storageData));
    
    return plan;
}

/**
 * Delete a saved dive plan
 * @param {string} planId - ID of the plan to delete
 * @returns {boolean} True if successful
 */
function deleteSavedPlan(planId) {
    // Get existing data
    const storageData = JSON.parse(localStorage.getItem('scuplan_data') || '{"plans":[],"checklists":[]}');
    
    // Find the plan index
    const planIndex = storageData.plans.findIndex(plan => plan.id === planId);
    
    if (planIndex !== -1) {
        // Remove the plan
        storageData.plans.splice(planIndex, 1);
        localStorage.setItem('scuplan_data', JSON.stringify(storageData));
        
        // If we're on the saved plans page, update the display
        if (window.location.pathname === '/saved-plans') {
            loadAndDisplaySavedPlans();
        } else {
            // Update the modal if it's open
            const modalEl = document.getElementById('offlineStorageModal');
            if (modalEl) {
                showOfflineStorageModal();
            }
        }
        
        return true;
    }
    
    return false;
}

/**
 * Load a saved dive plan
 * @param {string} planId - ID of the plan to load
 * @returns {Object|null} The plan data or null if not found
 */
function loadSavedPlan(planId) {
    // Get existing data
    const storageData = JSON.parse(localStorage.getItem('scuplan_data') || '{"plans":[],"checklists":[]}');
    
    // Find the plan
    const plan = storageData.plans.find(plan => plan.id === planId);
    
    if (plan) {
        // If not on main page, redirect
        if (window.location.pathname !== '/') {
            // Save the plan ID to session storage to load after redirect
            sessionStorage.setItem('load_plan_id', planId);
            window.location.href = '/';
            return null;
        }
        
        // Load the plan data into the form
        loadPlanIntoForm(plan.planData);
        
        // Calculate the plan (this will update all displays)
        calculateDivePlan();
        
        return plan.planData;
    }
    
    return null;
}

/**
 * This function has been replaced by a dedicated saved-plans page.
 * Keeping this function as an empty stub for backward compatibility.
 */
function showOfflineStorageModal() {
    // Redirect to the saved plans page
    window.location.href = '/saved-plans';
}

/**
 * Load and display saved dive plans on the saved-plans page
 */
function loadAndDisplaySavedPlans() {
    // Get saved plans from storage
    const storageData = JSON.parse(localStorage.getItem('scuplan_data') || '{"plans":[],"checklists":[]}');
    const savedPlans = storageData.plans;
    
    // Get the container
    const container = document.getElementById('savedPlansContainer');
    if (!container) return; // If not on the saved plans page
    
    // Clear the container first
    container.innerHTML = '';
    
    // If no plans, show a message
    if (savedPlans.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                You haven't saved any dive plans for offline use yet.
            </div>
            <div class="text-center mt-4">
                <p>To save a dive plan, create a plan in the Dive Planner and click "Save Offline".</p>
                <a href="/" class="btn btn-primary mt-3">
                    <i class="fas fa-file-medical me-1"></i> Create New Dive Plan
                </a>
            </div>
        `;
        return;
    }
    
    // Sort plans by date (newest first)
    savedPlans.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    
    // Add each plan
    savedPlans.forEach(plan => {
        const planDate = new Date(plan.savedAt).toLocaleString();
        const planData = plan.planData;
        
        // Create the plan card
        const planCard = document.createElement('div');
        planCard.className = 'card mb-4';
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
                <div class="small text-muted mb-3">Saved on: ${planDate}</div>
                <div class="row">
                    <div class="col-md-4">
                        <div class="small text-muted">Dive type</div>
                        <div>${capitalizeFirstLetter(planData.diveType)}</div>
                    </div>
                    <div class="col-md-4">
                        <div class="small text-muted">Location</div>
                        <div>${planData.location || 'Not specified'}</div>
                    </div>
                    <div class="col-md-4">
                        <div class="small text-muted">Date</div>
                        <div>${planData.diveDate || 'Not specified'}</div>
                    </div>
                </div>
                <hr>
                <div class="row">
                    <div class="col-md-3">
                        <div class="small text-muted">Depth</div>
                        <div class="fs-5 fw-bold">${planData.depth}m</div>
                    </div>
                    <div class="col-md-3">
                        <div class="small text-muted">Bottom Time</div>
                        <div class="fs-5 fw-bold">${planData.bottomTime}min</div>
                    </div>
                    <div class="col-md-3">
                        <div class="small text-muted">Total Time</div>
                        <div class="fs-5 fw-bold">${planData.totalDiveTime || '?'}min</div>
                    </div>
                    <div class="col-md-3">
                        <div class="small text-muted">Decompression</div>
                        <div class="fs-5 fw-bold">${planData.decoLevels && planData.decoLevels.length > 0 ? 'Required' : 'No-Stop'}</div>
                    </div>
                </div>
                ${planData.tanks && planData.tanks.length > 0 ? `
                <hr>
                <div class="mt-3">
                    <div class="small text-muted mb-2">Tanks</div>
                    <div class="row">
                        ${planData.tanks.map(tank => `
                            <div class="col-md-4 mb-2">
                                <div class="small tank-block">
                                    <div><strong>${tank.size}L</strong> at ${tank.pressure} bar</div>
                                    <div>${getGasLabel(tank)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                ${planData.buddies && planData.buddies.length > 0 ? `
                <hr>
                <div class="mt-3">
                    <div class="small text-muted mb-2">Buddies</div>
                    <div class="row">
                        ${planData.buddies.map(buddy => `
                            <div class="col-md-4 mb-2">
                                <div class="small buddy-block">
                                    <div><strong>${buddy.name}</strong></div>
                                    <div>${buddy.certification} (${buddy.skillLevel})</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
        
        container.appendChild(planCard);
    });
    
    // Add event listeners for the buttons
    document.querySelectorAll('.load-plan-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const planId = this.getAttribute('data-plan-id');
            loadSavedPlan(planId);
        });
    });
    
    document.querySelectorAll('.delete-plan-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const planId = this.getAttribute('data-plan-id');
            if (confirm('Are you sure you want to delete this dive plan?')) {
                deleteSavedPlan(planId);
                showAlert('Dive plan deleted', 'success');
            }
        });
    });
    
    // Add clear all button event
    const clearAllBtn = document.getElementById('clearAllPlansBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear all saved dive plans? This cannot be undone.')) {
                const storageData = JSON.parse(localStorage.getItem('scuplan_data') || '{"plans":[],"checklists":[]}');
                storageData.plans = [];
                localStorage.setItem('scuplan_data', JSON.stringify(storageData));
                loadAndDisplaySavedPlans();
                showAlert('All dive plans deleted', 'success');
            }
        });
    }
}

/**
 * Helper function to create a gas label
 * @param {Object} tank - Tank data
 * @returns {string} Formatted gas label
 */
function getGasLabel(tank) {
    if (tank.gasType === 'air') {
        return 'Air';
    } else if (tank.gasType === 'nitrox') {
        return `Nitrox ${tank.o2_percentage}%`;
    } else if (tank.gasType === 'trimix') {
        return `Trimix ${tank.o2_percentage}/${tank.he_percentage}`;
    } else if (tank.gasType === 'heliox') {
        return `Heliox ${tank.o2_percentage}/${tank.he_percentage}`;
    }
    return tank.gasType;
}

/**
 * Initialize saved plans on page load
 */
function initSavedPlans() {
    if (window.location.pathname === '/saved-plans') {
        loadAndDisplaySavedPlans();
    }
}

/**
 * Check for any plans to load from session storage (after redirect)
 */
function checkPendingPlanLoad() {
    const planId = sessionStorage.getItem('load_plan_id');
    if (planId) {
        // Clear it immediately to prevent repeated loads
        sessionStorage.removeItem('load_plan_id');
        
        // Load the plan
        setTimeout(() => {
            loadSavedPlan(planId);
        }, 500);  // Small delay to ensure page is fully loaded
    }
}

/**
 * Generate a unique ID for storage items
 * @returns {string} Unique ID
 */
function generateUniqueId() {
    return 'plan_' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

/**
 * Helper function to capitalize the first letter of a string
 * @param {string} str - Input string
 * @returns {string} Capitalized string
 */
function capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}
