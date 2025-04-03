/**
 * ScuPlan - Main Application JavaScript
 * Initializes and coordinates different components of the dive planning application
 */

// Global application state
const app = {
    currentPlan: null,
    tanks: [],
    buddies: [],
    isOffline: !navigator.onLine,
    modalInstance: null
};

/**
 * Initialize the dive planner with all necessary components
 */
function initDivePlanner() {
    console.log('Initializing ScuPlan Dive Planner');
    
    // Initialize all components
    initTankManagement();
    initBuddyManagement();
    
    // Initialize storage and donation features if they exist
    if (typeof initOfflineStorage === 'function') {
        initOfflineStorage();
    }
    
    if (typeof initDonationFeatures === 'function') {
        initDonationFeatures();
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Check for internet connectivity
    updateConnectionStatus();
    
    // Check if we're on the main page
    if (document.getElementById('divePlanForm')) {
        setupDivePlanForm();
    }
}

/**
 * Initialize the shared plan view
 */
function initSharedPlanView() {
    console.log('Initializing Shared Plan View');
    
    // Get the plan ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get('id');
    
    if (!planId) {
        showPlanNotFound();
        return;
    }
    
    // Load the shared plan
    loadSharedPlan(planId);
    
    // Load a default pre-dive checklist
    loadPreDiveChecklist();
    
    // Set up event listeners for the shared plan page
    setupSharedPlanEvents();
}

/**
 * Initialize checklist functionality
 */
function initChecklists() {
    console.log('Initializing Checklists');
    
    // Check if we're on the checklist page
    if (document.getElementById('checklistTabs')) {
        // Load default checklists
        loadDefaultChecklists();
        
        // Set up event listeners for checklist page
        setupChecklistEvents();
        
        // Check for offline saved checklists
        if (typeof loadOfflineChecklists === 'function') {
            loadOfflineChecklists();
        }
    }
    
    // Initialize quick checklist on the dive planner page
    if (typeof initializeQuickChecklist === 'function') {
        initializeQuickChecklist();
    }
}

/**
 * Set up global event listeners
 */
function setupEventListeners() {
    // Check for network status changes
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
    
    // Setup event listeners for offline storage dialog
    const offlineStorageButton = document.getElementById('offlineStorageButton');
    if (offlineStorageButton) {
        offlineStorageButton.addEventListener('click', function() {
            if (typeof showOfflineStorageModal === 'function') {
                showOfflineStorageModal();
            } else {
                showAlert('Offline storage functionality is not available', 'warning');
            }
        });
    }
    
    const footerSavedPlans = document.getElementById('footerSavedPlans');
    if (footerSavedPlans) {
        footerSavedPlans.addEventListener('click', function() {
            if (typeof showOfflineStorageModal === 'function') {
                showOfflineStorageModal();
            } else {
                showAlert('Offline storage functionality is not available', 'warning');
            }
        });
    }
    
    // Donation copy button
    const copyDonationBtn = document.getElementById('copyDonationBtn');
    if (copyDonationBtn) {
        copyDonationBtn.addEventListener('click', function() {
            if (typeof copyDonationAddress === 'function') {
                copyDonationAddress();
            } else {
                // Fallback implementation
                const btcAddress = document.getElementById('btcAddress').innerText;
                const tempInput = document.createElement('input');
                tempInput.value = btcAddress;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                showAlert('Bitcoin donation address copied to clipboard', 'success');
            }
        });
    }
    
    // Setup footer resource links
    const offlineGuideLink = document.getElementById('offlineGuideLink');
    if (offlineGuideLink) {
        offlineGuideLink.addEventListener('click', function(e) {
            e.preventDefault();
            showOfflineGuide(e);
        });
    }
    
    const exportGuideLink = document.getElementById('exportGuideLink');
    if (exportGuideLink) {
        exportGuideLink.addEventListener('click', function(e) {
            e.preventDefault();
            showExportGuide(e);
        });
    }
    
    const donationGuideLink = document.getElementById('donationGuideLink');
    if (donationGuideLink) {
        donationGuideLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof showDonationInfo === 'function') {
                showDonationInfo(e);
            } else {
                showAlert('Donation information is not available at the moment', 'info');
            }
        });
    }
}

/**
 * Set up specific event listeners for the dive plan form
 */
function setupDivePlanForm() {
    // Calculate button
    const calculateButton = document.getElementById('calculateButton');
    if (calculateButton) {
        calculateButton.addEventListener('click', calculateDivePlan);
    }
    
    // Tank modals
    const addTankButton = document.getElementById('addTankButton');
    if (addTankButton) {
        addTankButton.addEventListener('click', showAddTankModal);
    }
    
    const saveTankButton = document.getElementById('saveTankButton');
    if (saveTankButton) {
        saveTankButton.addEventListener('click', saveTank);
    }
    
    // Buddy modals
    const addBuddyButton = document.getElementById('addBuddyButton');
    if (addBuddyButton) {
        addBuddyButton.addEventListener('click', showAddBuddyModal);
    }
    
    const saveBuddyButton = document.getElementById('saveBuddyButton');
    if (saveBuddyButton) {
        saveBuddyButton.addEventListener('click', saveBuddy);
    }
    
    // Save and share buttons (will be shown after calculation)
    const saveOfflineButton = document.getElementById('saveOfflineButton');
    if (saveOfflineButton) {
        saveOfflineButton.addEventListener('click', function() {
            if (typeof saveCurrentPlanOffline === 'function') {
                saveCurrentPlanOffline();
            } else {
                showAlert('Offline storage functionality is not available', 'warning');
            }
        });
    }
    
    const sharePlanButton = document.getElementById('sharePlanButton');
    if (sharePlanButton) {
        sharePlanButton.addEventListener('click', showShareModal);
    }
    
    const printPlanButton = document.getElementById('printPlanButton');
    if (printPlanButton) {
        printPlanButton.addEventListener('click', printCurrentPlan);
    }
    
    // Share modal buttons
    const copyShareLinkBtn = document.getElementById('copyShareLinkBtn');
    if (copyShareLinkBtn) {
        copyShareLinkBtn.addEventListener('click', copyShareLink);
    }
    
    const emailShareLinkBtn = document.getElementById('emailShareLinkBtn');
    if (emailShareLinkBtn) {
        emailShareLinkBtn.addEventListener('click', emailShareLink);
    }
    
    // Gas type changes
    const gasType = document.getElementById('gasType');
    if (gasType) {
        gasType.addEventListener('change', handleGasTypeChange);
    }
}

/**
 * Set up event listeners for the shared plan page
 */
function setupSharedPlanEvents() {
    // Button event listeners
    const saveToPlannerBtn = document.getElementById('saveToPlannerBtn');
    if (saveToPlannerBtn) {
        saveToPlannerBtn.addEventListener('click', saveSharedPlanToPlanner);
    }
    
    const printSharedPlanBtn = document.getElementById('printSharedPlanBtn');
    if (printSharedPlanBtn) {
        printSharedPlanBtn.addEventListener('click', printSharedPlan);
    }
    
    const printPreDiveBtn = document.getElementById('printPreDiveBtn');
    if (printPreDiveBtn) {
        printPreDiveBtn.addEventListener('click', printPreDiveChecklist);
    }
}

/**
 * Set up event listeners for the checklist page
 */
function setupChecklistEvents() {
    // Create checklist button
    const createChecklistBtn = document.getElementById('createChecklistBtn');
    if (createChecklistBtn) {
        createChecklistBtn.addEventListener('click', showCreateChecklistModal);
    }
    
    // Add checklist item button
    const addChecklistItemBtn = document.getElementById('addChecklistItemBtn');
    if (addChecklistItemBtn) {
        addChecklistItemBtn.addEventListener('click', addChecklistItemInput);
    }
    
    // Save checklist button
    const saveChecklistBtn = document.getElementById('saveChecklistBtn');
    if (saveChecklistBtn) {
        saveChecklistBtn.addEventListener('click', saveCustomChecklist);
    }
    
    // Print buttons
    document.querySelectorAll('.print-checklist-btn').forEach(btn => {
        btn.addEventListener('click', printChecklist);
    });
    
    // Print viewed checklist
    const printViewedChecklistBtn = document.getElementById('printViewedChecklistBtn');
    if (printViewedChecklistBtn) {
        printViewedChecklistBtn.addEventListener('click', printViewedChecklist);
    }
    
    // Manage offline checklists
    const manageOfflineChecklistsBtn = document.getElementById('manageOfflineChecklistsBtn');
    if (manageOfflineChecklistsBtn) {
        manageOfflineChecklistsBtn.addEventListener('click', function() {
            if (typeof showManageOfflineChecklistsModal === 'function') {
                showManageOfflineChecklistsModal();
            } else {
                showAlert('Offline checklist management is not available', 'warning');
            }
        });
    }
    
    // Clear all offline data
    const clearAllOfflineBtn = document.getElementById('clearAllOfflineBtn');
    if (clearAllOfflineBtn) {
        clearAllOfflineBtn.addEventListener('click', function() {
            if (typeof clearAllOfflineData === 'function') {
                clearAllOfflineData();
            } else {
                showAlert('Offline data clearing is not available', 'warning');
            }
        });
    }
}

/**
 * Calculate the dive plan based on input parameters
 */
function calculateDivePlan() {
    const diveDepth = document.getElementById('diveDepth');
    const bottomTime = document.getElementById('bottomTime');
    const diveLocation = document.getElementById('diveLocation');
    const diveType = document.getElementById('diveType');
    const sacRate = document.getElementById('sacRate');
    
    if (!diveDepth || !bottomTime) {
        showAlert('Dive form elements not found', 'danger');
        return;
    }
    
    const depth = parseFloat(diveDepth.value);
    const time = parseFloat(bottomTime.value);
    const location = diveLocation ? diveLocation.value : '';
    const type = diveType ? diveType.value : 'recreational';
    const sac = sacRate ? parseFloat(sacRate.value) : 20;
    
    // Input validation
    if (isNaN(depth) || depth <= 0) {
        showAlert('Please enter a valid depth', 'danger');
        return;
    }
    
    if (isNaN(time) || time <= 0) {
        showAlert('Please enter a valid bottom time', 'danger');
        return;
    }
    
    if (isNaN(sac) || sac <= 0) {
        showAlert('Please enter a valid SAC rate', 'danger');
        return;
    }
    
    // Construct plan data
    const planData = {
        depth: depth,
        bottomTime: time,
        location: location,
        diveType: type,
        sacRate: sac,
        tanks: app.tanks,
        buddies: app.buddies
    };
    
    // Show loading indicator
    showLoading('Calculating dive plan...');
    
    // Send API request
    fetch('/api/calculate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(planData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Hide loading indicator
        hideLoading();
        
        // Update application state
        app.currentPlan = data;
        
        // Update the UI with results
        displayDivePlanResults(data);
        
        // Calculate gas consumption
        if (app.tanks.length > 0) {
            calculateGasConsumption(data);
        }
    })
    .catch(error => {
        hideLoading();
        console.error('Error calculating dive plan:', error);
        
        if (app.isOffline) {
            showAlert('You are offline. Using simplified calculations.', 'warning');
            
            // Use client-side calculation as fallback when offline
            const offlineResults = calculateOfflineDivePlan(planData);
            app.currentPlan = offlineResults;
            displayDivePlanResults(offlineResults);
        } else {
            showAlert('Failed to calculate dive plan: ' + error.message, 'danger');
        }
    });
}

/**
 * Display the results of the dive plan calculation
 */
function displayDivePlanResults(data) {
    // Display the results card
    const resultsCard = document.getElementById('diveResultsCard');
    if (resultsCard) {
        resultsCard.style.display = 'block';
    }
    
    // Update the stat values
    const maxDepthResult = document.getElementById('maxDepthResult');
    const bottomTimeResult = document.getElementById('bottomTimeResult');
    const totalTimeResult = document.getElementById('totalTimeResult');
    
    if (maxDepthResult) maxDepthResult.textContent = data.depth.toFixed(1);
    if (bottomTimeResult) bottomTimeResult.textContent = data.bottomTime.toFixed(0);
    if (totalTimeResult) totalTimeResult.textContent = data.totalDiveTime.toFixed(0);
    
    // Show the profile visualization
    const profileVisualizationSection = document.getElementById('profileVisualizationSection');
    if (profileVisualizationSection) {
        profileVisualizationSection.style.display = 'block';
    }
    
    // Update profile display values
    const descentTimeResult = document.getElementById('descentTimeResult');
    const bottomTimeDisplay = document.getElementById('bottomTimeDisplay');
    const ascentTimeResult = document.getElementById('ascentTimeResult');
    const totalTimeDisplay = document.getElementById('totalTimeDisplay');
    
    if (descentTimeResult) descentTimeResult.textContent = data.profile.descentTime.toFixed(1) + ' min';
    if (bottomTimeDisplay) bottomTimeDisplay.textContent = data.profile.bottomTime.toFixed(1) + ' min';
    if (ascentTimeResult) ascentTimeResult.textContent = data.profile.ascentTime.toFixed(1) + ' min';
    if (totalTimeDisplay) totalTimeDisplay.textContent = data.profile.totalTime.toFixed(1) + ' min';
    
    // Display decompression stops if any
    const decoStopsContainer = document.getElementById('decoStopsContainer');
    const decoStopsList = document.getElementById('decoStopsList');
    
    if (decoStopsContainer && decoStopsList) {
        if (data.profile.decoStops && data.profile.decoStops.length > 0) {
            decoStopsContainer.style.display = 'block';
            decoStopsList.innerHTML = '';
            
            data.profile.decoStops.forEach(stop => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${stop.depth.toFixed(1)}</td>
                    <td>${stop.time.toFixed(0)}</td>
                `;
                decoStopsList.appendChild(row);
            });
        } else {
            decoStopsContainer.style.display = 'none';
        }
    }
    
    // Draw the dive profile chart
    if (typeof drawDiveProfileChart === 'function') {
        drawDiveProfileChart(data.profile);
    }
}

/**
 * Calculate gas consumption for the current plan
 */
function calculateGasConsumption(planData) {
    // Only proceed if we have tanks
    if (!app.tanks || app.tanks.length === 0) {
        const gasConsumptionResults = document.getElementById('gasConsumptionResults');
        if (gasConsumptionResults) {
            gasConsumptionResults.innerHTML = '<div class="text-center text-muted"><small>Add tanks to see gas consumption</small></div>';
        }
        return;
    }
    
    const sacRate = document.getElementById('sacRate');
    
    const data = {
        depth: planData.depth,
        bottomTime: planData.bottomTime,
        sacRate: sacRate ? sacRate.value : 20,
        tanks: app.tanks
    };
    
    fetch('/api/gas_consumption', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        displayGasConsumptionResults(data.results);
    })
    .catch(error => {
        console.error('Error calculating gas consumption:', error);
        
        if (app.isOffline) {
            // Use simplified calculation when offline
            const offlineResults = calculateOfflineGasConsumption(planData);
            displayGasConsumptionResults(offlineResults);
        } else {
            const gasConsumptionResults = document.getElementById('gasConsumptionResults');
            if (gasConsumptionResults) {
                gasConsumptionResults.innerHTML = '<div class="alert alert-danger">Failed to calculate gas consumption</div>';
            }
        }
    });
}

/**
 * Display gas consumption results
 */
function displayGasConsumptionResults(results) {
    const container = document.getElementById('gasConsumptionResults');
    if (!container) return;
    
    container.innerHTML = '';
    
    results.forEach(result => {
        const gasType = result.gasType.charAt(0).toUpperCase() + result.gasType.slice(1);
        const gasInfo = result.gasType === 'air' ? 'Air' : 
                       `${gasType} (${result.o2}% O₂${result.he > 0 ? ', ' + result.he + '% He' : ''})`;
        
        const tankDiv = document.createElement('div');
        tankDiv.className = 'mb-3 p-3 bg-light rounded';
        tankDiv.innerHTML = `
            <h6 class="mb-2">Tank ${result.tankIndex + 1}: ${result.tankSize}L @ ${result.initialPressure} bar (${gasInfo})</h6>
            <div class="row">
                <div class="col-6">
                    <div class="small text-muted">Consumption:</div>
                    <div class="fw-bold">${result.totalConsumption} L</div>
                </div>
                <div class="col-6">
                    <div class="small text-muted">Remaining (with reserve):</div>
                    <div class="fw-bold">${result.safeRemainingPressure < 30 ? '<span class="text-danger">' : ''}${result.safeRemainingPressure.toFixed(0)} bar${result.safeRemainingPressure < 30 ? '</span>' : ''}</div>
                </div>
            </div>
        `;
        container.appendChild(tankDiv);
    });
}

/**
 * Update connection status indicator based on online/offline status
 */
function updateConnectionStatus() {
    app.isOffline = !navigator.onLine;
    
    const offlineIndicator = document.getElementById('offlineIndicator');
    if (offlineIndicator) {
        if (app.isOffline) {
            offlineIndicator.classList.add('show');
        } else {
            offlineIndicator.classList.remove('show');
        }
    }
}

/**
 * Show loading indicator with message
 */
function showLoading(message = 'Loading...') {
    // Create loading overlay if it doesn't exist
    if (!document.getElementById('loadingOverlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        
        overlay.innerHTML = `
            <div class="bg-white p-4 rounded shadow-sm text-center">
                <div class="spinner-border text-primary mb-2" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div id="loadingMessage">${message}</div>
            </div>
        `;
        
        document.body.appendChild(overlay);
    } else {
        // Update existing overlay
        document.getElementById('loadingMessage').textContent = message;
        document.getElementById('loadingOverlay').style.display = 'flex';
    }
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

/**
 * Show alert message
 */
function showAlert(message, type = 'info', timeout = 5000) {
    // Create alert container if it doesn't exist
    if (!document.getElementById('alertContainer')) {
        const container = document.createElement('div');
        container.id = 'alertContainer';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            max-width: 350px;
            z-index: 9999;
        `;
        document.body.appendChild(container);
    }
    
    // Create alert element
    const alertId = 'alert-' + Date.now();
    const alertElement = document.createElement('div');
    alertElement.id = alertId;
    alertElement.className = `alert alert-${type} alert-dismissible fade show`;
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to container
    document.getElementById('alertContainer').appendChild(alertElement);
    
    // Auto-dismiss after timeout
    if (timeout > 0) {
        setTimeout(() => {
            const alert = document.getElementById(alertId);
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, timeout);
    }
}

/**
 * Load the shared plan from the server
 */
function loadSharedPlan(planId) {
    // Show loading
    const loadingContainer = document.getElementById('loadingContainer');
    const planDetailsContainer = document.getElementById('planDetailsContainer');
    
    if (loadingContainer) loadingContainer.style.display = 'block';
    if (planDetailsContainer) planDetailsContainer.style.display = 'none';
    
    // Fetch the plan
    fetch(`/api/plan/${planId}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load plan');
        }
        return response.json();
    })
    .then(data => {
        // Store the plan data globally
        window.sharedPlan = data;
        
        // Display the plan
        if (loadingContainer) loadingContainer.style.display = 'none';
        if (planDetailsContainer) planDetailsContainer.style.display = 'block';
        
        const planNotFound = document.getElementById('planNotFound');
        if (planNotFound) planNotFound.style.display = 'none';
        
        displaySharedPlanDetails(data);
    })
    .catch(error => {
        console.error('Error loading shared plan:', error);
        
        if (loadingContainer) loadingContainer.style.display = 'none';
        
        const planNotFound = document.getElementById('planNotFound');
        if (planNotFound) planNotFound.style.display = 'block';
    });
}

/**
 * Display the shared plan details on the share page
 */
function displaySharedPlanDetails(data) {
    // Update basic information
    document.getElementById('sharedLocation').textContent = data.location || 'Not specified';
    document.getElementById('sharedDate').textContent = new Date(data.date).toLocaleDateString();
    document.getElementById('sharedDiveType').textContent = capitalizeFirstLetter(data.dive_type);
    document.getElementById('sharedMaxDepth').textContent = data.depth + ' meters';
    document.getElementById('sharedBottomTime').textContent = data.bottom_time + ' minutes';
    document.getElementById('sharedTotalTime').textContent = data.total_dive_time + ' minutes';
    
    // Update profile display values
    document.getElementById('sharedDescentTime').textContent = data.profile.descentTime.toFixed(1) + ' min';
    document.getElementById('sharedBottomTimeDisplay').textContent = data.profile.bottomTime.toFixed(1) + ' min';
    document.getElementById('sharedAscentTime').textContent = data.profile.ascentTime.toFixed(1) + ' min';
    document.getElementById('sharedTotalTimeDisplay').textContent = data.profile.totalTime.toFixed(1) + ' min';
    
    // Draw profile chart
    if (typeof drawDiveProfileChart === 'function') {
        drawDiveProfileChart(data.profile, 'sharedProfileChart');
    }
    
    // Display decompression stops if any
    const sharedDecoStopsContainer = document.getElementById('sharedDecoStopsContainer');
    const sharedDecoStopsList = document.getElementById('sharedDecoStopsList');
    
    if (data.profile.decoStops && data.profile.decoStops.length > 0) {
        sharedDecoStopsContainer.style.display = 'block';
        sharedDecoStopsList.innerHTML = '';
        
        data.profile.decoStops.forEach(stop => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${stop.depth.toFixed(1)}</td>
                <td>${stop.time.toFixed(0)}</td>
            `;
            sharedDecoStopsList.appendChild(row);
        });
    } else {
        sharedDecoStopsContainer.style.display = 'none';
    }
    
    // Display tanks if any
    const sharedTanksContainer = document.getElementById('sharedTanksContainer');
    const noSharedTanksMessage = document.getElementById('noSharedTanksMessage');
    
    if (data.tanks && data.tanks.length > 0) {
        noSharedTanksMessage.style.display = 'none';
        sharedTanksContainer.innerHTML = '';
        
        data.tanks.forEach((tank, index) => {
            const tankDiv = document.createElement('div');
            tankDiv.className = 'p-3 bg-light rounded mb-2';
            
            // Get gas info
            let gasInfo = '';
            if (tank.gas_type === 'air') {
                gasInfo = 'Air';
            } else if (tank.gas_type === 'nitrox') {
                gasInfo = `Nitrox ${tank.o2_percentage}% O₂`;
            } else if (tank.gas_type === 'trimix') {
                gasInfo = `Trimix ${tank.o2_percentage}% O₂, ${tank.he_percentage}% He`;
            } else if (tank.gas_type === 'oxygen') {
                gasInfo = 'Oxygen (100% O₂)';
            }
            
            tankDiv.innerHTML = `
                <div class="fw-bold">Tank ${index + 1}</div>
                <div class="small">${tank.size}L @ ${tank.pressure} bar</div>
                <div class="small">${gasInfo}</div>
            `;
            
            sharedTanksContainer.appendChild(tankDiv);
        });
    } else {
        noSharedTanksMessage.style.display = 'block';
    }
    
    // Display buddies if any
    const sharedBuddiesContainer = document.getElementById('sharedBuddiesContainer');
    const noSharedBuddiesMessage = document.getElementById('noSharedBuddiesMessage');
    
    if (data.buddies && data.buddies.length > 0) {
        noSharedBuddiesMessage.style.display = 'none';
        sharedBuddiesContainer.innerHTML = '';
        
        data.buddies.forEach(buddy => {
            const buddyDiv = document.createElement('div');
            buddyDiv.className = 'p-3 bg-light rounded mb-2';
            
            buddyDiv.innerHTML = `
                <div class="fw-bold">${buddy.name}</div>
                <div class="small">${buddy.certification || 'No certification specified'}</div>
                <div class="small">Skill Level: ${capitalizeFirstLetter(buddy.skill_level || 'Not specified')}</div>
                ${buddy.specialty && buddy.specialty !== 'none' ? 
                    `<div class="small">Specialty: ${capitalizeFirstLetter(buddy.specialty)}</div>` : ''}
            `;
            
            sharedBuddiesContainer.appendChild(buddyDiv);
        });
    } else {
        noSharedBuddiesMessage.style.display = 'block';
    }
}

/**
 * Load default pre-dive checklist for the shared plan page
 */
function loadPreDiveChecklist() {
    const sharedPreDiveChecklist = document.getElementById('sharedPreDiveChecklist');
    if (!sharedPreDiveChecklist) return;
    
    fetch('/api/checklists?type=pre-dive')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load pre-dive checklists');
        }
        return response.json();
    })
    .then(checklists => {
        if (checklists.length > 0) {
            const checklist = checklists[0];
            
            // Create checklist HTML
            let html = '';
            
            checklist.items.forEach(item => {
                html += `
                    <div class="form-check checklist-item">
                        <input class="form-check-input" type="checkbox" id="shared_checklist_${item.id}">
                        <label class="form-check-label" for="shared_checklist_${item.id}">${item.text}</label>
                    </div>
                `;
            });
            
            sharedPreDiveChecklist.innerHTML = html;
            
            // Add event listeners
            sharedPreDiveChecklist.querySelectorAll('.form-check-input').forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    if (this.checked) {
                        this.closest('.checklist-item').classList.add('completed');
                    } else {
                        this.closest('.checklist-item').classList.remove('completed');
                    }
                });
            });
        } else {
            sharedPreDiveChecklist.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    No pre-dive checklists available.
                </div>
            `;
        }
    })
    .catch(error => {
        console.error('Error loading pre-dive checklist:', error);
        
        sharedPreDiveChecklist.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i>
                Failed to load pre-dive checklist. ${error.message}
            </div>
        `;
    });
}

/**
 * Show information about offline functionality
 */
function showOfflineGuide(e) {
    e.preventDefault();
    
    const modalHtml = `
        <div class="modal fade" id="offlineGuideModal" tabindex="-1" aria-labelledby="offlineGuideModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="offlineGuideModalLabel">Offline Usage Guide</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>ScuPlan is designed to work even when you're offline. Here's how to use it:</p>
                        
                        <h6 class="mt-3">Saving Plans for Offline Use</h6>
                        <ol>
                            <li>Create a dive plan as usual</li>
                            <li>Click the "Save Offline" button in the results panel</li>
                            <li>The plan will be stored in your browser's local storage</li>
                        </ol>
                        
                        <h6 class="mt-3">Accessing Offline Plans</h6>
                        <ol>
                            <li>Click the "Saved Plans" button in the navigation bar</li>
                            <li>You'll see a list of all your saved plans</li>
                            <li>Click "Load" to load a plan into the planner</li>
                        </ol>
                        
                        <h6 class="mt-3">Offline Calculations</h6>
                        <p>When offline, ScuPlan will use simplified calculations that don't require a server connection. These calculations may not be as precise as the online version, but they provide reasonable estimates for planning purposes.</p>
                        
                        <div class="alert alert-info mt-3">
                            <i class="fas fa-info-circle me-2"></i>
                            Offline data is stored only in your browser. If you clear your browser data or switch to a different device, your saved plans won't be available.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Got it</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Create and show the modal
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    const modal = new bootstrap.Modal(document.getElementById('offlineGuideModal'));
    modal.show();
    
    // Remove the modal from the DOM after it's hidden
    document.getElementById('offlineGuideModal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modalContainer);
    });
}

/**
 * Show information about export and print functionality
 */
function showExportGuide(e) {
    e.preventDefault();
    
    const modalHtml = `
        <div class="modal fade" id="exportGuideModal" tabindex="-1" aria-labelledby="exportGuideModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exportGuideModalLabel">Export & Print Guide</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>ScuPlan offers several ways to export or print your dive plans and checklists:</p>
                        
                        <h6 class="mt-3">Printing Dive Plans</h6>
                        <ol>
                            <li>Create a dive plan</li>
                            <li>Click the "Print Plan" button in the results panel</li>
                            <li>Your browser's print dialog will open</li>
                            <li>Select your printer or save as PDF</li>
                        </ol>
                        
                        <h6 class="mt-3">Printing Checklists</h6>
                        <ol>
                            <li>Go to the Checklists page</li>
                            <li>Find the checklist you want to print</li>
                            <li>Click the "Print" button next to it</li>
                            <li>Your browser's print dialog will open</li>
                        </ol>
                        
                        <h6 class="mt-3">Sharing Plans</h6>
                        <ol>
                            <li>Create a dive plan</li>
                            <li>Click the "Share Plan" button</li>
                            <li>Copy the generated link</li>
                            <li>Send the link to your dive buddies</li>
                        </ol>
                        
                        <div class="alert alert-info mt-3">
                            <i class="fas fa-info-circle me-2"></i>
                            When printing, try the "Save as PDF" option to create a digital copy that you can store on your device or share via email.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Got it</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Create and show the modal
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    const modal = new bootstrap.Modal(document.getElementById('exportGuideModal'));
    modal.show();
    
    // Remove the modal from the DOM after it's hidden
    document.getElementById('exportGuideModal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modalContainer);
    });
}

/**
 * Utility function to capitalize the first letter of a string
 */
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Initialize the application when the DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    const currentYear = document.getElementById('currentYear');
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }
    
    // Check which page we're on
    if (document.getElementById('divePlanForm')) {
        initDivePlanner();
        
        // Check for imported plan
        if (typeof checkForImportedPlan === 'function') {
            checkForImportedPlan();
        }
    } else if (document.getElementById('checklistTabs')) {
        initChecklists();
    } else if (document.getElementById('sharedProfileChart')) {
        initSharedPlanView();
    }
});
