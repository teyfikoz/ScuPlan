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
    
    try {
        // Ensure the required DOM elements exist before proceeding
        const loadingContainer = document.getElementById('loadingContainer');
        const planDetailsContainer = document.getElementById('planDetailsContainer');
        
        if (!loadingContainer || !planDetailsContainer) {
            console.error('Required DOM elements not found');
            alert('Error: Page elements not found. Please refresh the page.');
            return;
        }
        
        // Get the plan ID from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const planId = urlParams.get('id');
        
        if (!planId) {
            showPlanNotFound('No plan ID specified in the URL');
            return;
        }
        
        // Load the shared plan
        loadSharedPlan(planId);
        
        // Load a default pre-dive checklist
        loadPreDiveChecklist();
        
        // Set up event listeners for the shared plan page
        setupSharedPlanEvents();
    } catch (error) {
        console.error('Error in initSharedPlanView:', error);
        
        // Try to handle error gracefully
        const errorMsg = document.getElementById('jsNotFound');
        if (errorMsg) {
            errorMsg.textContent = 'An error occurred: ' + error.message;
            errorMsg.style.display = 'block';
        }
        
        const loadingContainer = document.getElementById('loadingContainer');
        if (loadingContainer) loadingContainer.style.display = 'none';
        
        const planDetailsContainer = document.getElementById('planDetailsContainer');
        if (planDetailsContainer) planDetailsContainer.style.display = 'block';
    }
}

/**
 * Show the plan not found message with a specific error
 */
function showPlanNotFound(errorMessage) {
    console.log('Showing plan not found message:', errorMessage);
    
    // Hide loading indicator
    const loadingContainer = document.getElementById('loadingContainer');
    if (loadingContainer) loadingContainer.style.display = 'none';
    
    // Show error message
    const planNotFound = document.getElementById('planNotFound');
    if (planNotFound) {
        planNotFound.innerHTML = `
            <i class="fas fa-exclamation-circle me-2"></i>
            <strong>Dive plan not found.</strong> ${errorMessage || 'The plan may have been deleted or the link is invalid.'}
        `;
        planNotFound.style.display = 'block';
    }
    
    // Hide plan details container if it exists
    const planDetailsContainer = document.getElementById('planDetailsContainer');
    if (planDetailsContainer) planDetailsContainer.style.display = 'none';
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
    
    // Setup About Me modal link
    const aboutMeLink = document.getElementById('aboutMeLink');
    if (aboutMeLink) {
        aboutMeLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Use Bootstrap's modal instance or create new one
            const aboutModal = document.getElementById('aboutMeModal');
            if (aboutModal) {
                const modal = new bootstrap.Modal(aboutModal);
                modal.show();
            } else {
                showAlert('About section is currently not available', 'warning');
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
    const diveDate = document.getElementById('diveDate');
    const diveTime = document.getElementById('diveTime');
    const sacRate = document.getElementById('sacRate');
    
    if (!diveDepth || !bottomTime) {
        showAlert('Dive form elements not found', 'danger');
        return;
    }
    
    const depth = parseFloat(diveDepth.value);
    const time = parseFloat(bottomTime.value);
    const location = diveLocation ? diveLocation.value : '';
    const type = diveType ? diveType.value : 'recreational';
    const date = diveDate ? diveDate.value : '';
    const timeOfDay = diveTime ? diveTime.value : '';
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
        diveDate: date,
        diveTime: timeOfDay,
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
    
    // Update the stat values with proper unit conversion
    const maxDepthResult = document.getElementById('maxDepthResult');
    const bottomTimeResult = document.getElementById('bottomTimeResult');
    const totalTimeResult = document.getElementById('totalTimeResult');
    
    if (maxDepthResult && window.unitsManager) {
        const convertedDepth = window.unitsManager.convertDepth(data.depth, 'metric');
        maxDepthResult.textContent = convertedDepth.toFixed(1);
    } else if (maxDepthResult) {
        maxDepthResult.textContent = data.depth.toFixed(1);
    }
    
    if (bottomTimeResult) bottomTimeResult.textContent = data.bottomTime.toFixed(0);
    if (totalTimeResult) totalTimeResult.textContent = data.totalDiveTime.toFixed(0);
    
    // Display buddy information
    const buddyResultsContainer = document.getElementById('buddyConsumptionResults');
    if (buddyResultsContainer) {
        if (app.buddies && app.buddies.length > 0) {
            let buddyHtml = '';
            app.buddies.forEach((buddy, index) => {
                const certification = buddy.certification || 'Not specified';
                const skillLevel = buddy.skillLevel ? 
                    buddy.skillLevel.charAt(0).toUpperCase() + buddy.skillLevel.slice(1) : 
                    'Not specified';
                const specialty = buddy.specialty && buddy.specialty !== 'none' ? 
                    buddy.specialty.charAt(0).toUpperCase() + buddy.specialty.slice(1) : 
                    'None';
                    
                buddyHtml += `
                    <div class="p-2 bg-light rounded mb-2">
                        <div class="fw-bold">${buddy.name}</div>
                        <div class="small">${certification}</div>
                        <div class="small">Skill: ${skillLevel}</div>
                        ${specialty !== 'None' ? `<div class="small">Specialty: ${specialty}</div>` : ''}
                    </div>
                `;
            });
            buddyResultsContainer.innerHTML = buddyHtml;
        } else {
            buddyResultsContainer.innerHTML = `
                <div class="text-center text-muted">
                    <small>Add buddies to see them here</small>
                </div>
            `;
        }
    }
    
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
        console.log('Checking decompression stops:', data.profile.decoStops);
        
        if (data.profile.decoStops && data.profile.decoStops.length > 0) {
            console.log('Displaying decompression stops:', data.profile.decoStops);
            decoStopsContainer.style.display = 'block';
            decoStopsList.innerHTML = '';
            
            data.profile.decoStops.forEach(stop => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${stop.depth.toFixed(1)}m</td>
                    <td>${stop.time.toFixed(0)} min</td>
                `;
                decoStopsList.appendChild(row);
            });
        } else {
            console.log('No decompression stops to display');
            decoStopsContainer.style.display = 'none';
        }
    } else {
        console.error('Decompression stops containers not found');
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
    
    fetch('/api/gas-consumption', {
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
                // Check if there are any tanks defined
                if (!app.tanks || app.tanks.length === 0) {
                    // No tanks added
                    gasConsumptionResults.innerHTML = `
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-circle me-2"></i>
                            No tanks added. Please add at least one tank to calculate gas consumption.
                        </div>
                        <div class="text-center mt-2">
                            <button class="btn btn-sm btn-outline-primary" onclick="showAddTankModal()">
                                <i class="fas fa-plus me-1"></i> Add Tank
                            </button>
                        </div>
                    `;
                } else {
                    // Other calculation error
                    // Get the current dive depth and time
                    const diveDepth = parseFloat(document.getElementById('diveDepth')?.value || document.getElementById('maxDepth')?.value || 0);
                    const diveTime = parseFloat(document.getElementById('diveTime')?.value || document.getElementById('bottomTime')?.value || 0);
                    
                    // Calculate approximate gas needs
                    const atmosphericPressure = (diveDepth / 10) + 1; // in bars
                    const avgSacRate = 20; // Average SAC rate in L/min
                    const estimatedGasNeeded = avgSacRate * atmosphericPressure * diveTime;
                    const recommendedReserve = estimatedGasNeeded * 0.5; // 50% reserve
                    const totalGasNeeded = estimatedGasNeeded + recommendedReserve;
                    
                    // Recommendations based on depth
                    let recommendedTanks = '';
                    let recommendedGasMix = '';
                    
                    if (diveDepth <= 18) {
                        recommendedTanks = '1 x 12L tank (2400L gas @ 200 bar)';
                        recommendedGasMix = 'Air or Nitrox 32%';
                    } else if (diveDepth <= 30) {
                        recommendedTanks = '1 x 15L tank (3000L gas @ 200 bar)';
                        recommendedGasMix = 'Air or Nitrox 32%';
                    } else if (diveDepth <= 40) {
                        recommendedTanks = '1 x 15L tank + deco tank (total ~3600L gas)';
                        recommendedGasMix = 'Nitrox 32% or Trimix 21/35';
                    } else if (diveDepth <= 60) {
                        recommendedTanks = '2 x 12L tanks or 1 x 20L tank + deco (~4800L gas)';
                        recommendedGasMix = 'Trimix 18/45';
                    } else {
                        recommendedTanks = 'Twin tanks + stage bottles (~6000L+ gas)';
                        recommendedGasMix = 'Trimix 15/55 or 10/70';
                    }
                    
                    gasConsumptionResults.innerHTML = `
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-circle me-2"></i>
                            Failed to calculate gas consumption. Please check your dive parameters and tank settings.
                        </div>
                        <div class="small text-muted mt-2">
                            <p><strong>Possible reasons:</strong></p>
                            <ul>
                                <li>Tank size or pressure may be too low for this dive</li>
                                <li>Technical dives may require specific gas mixtures</li>
                                <li>Deep dives may need multiple tanks or special gases</li>
                            </ul>
                            
                            <div class="mt-3 border-top pt-2">
                                <p><strong>Gas Requirements for this Dive:</strong></p>
                                <ul>
                                    <li>Estimated gas needed: ~${Math.round(estimatedGasNeeded)}L (w/o reserve)</li>
                                    <li>Recommended with reserve: ~${Math.round(totalGasNeeded)}L</li>
                                    <li>Recommended configuration: ${recommendedTanks}</li>
                                    <li>Recommended gas mix: ${recommendedGasMix}</li>
                                </ul>
                                <p class="small fst-italic">Based on average SAC rate of ${avgSacRate}L/min at surface. 
                                Your actual consumption may vary based on experience, conditions, and exertion level.</p>
                            </div>
                        </div>
                    `;
                }
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
        
        // Apply unit conversions
        let tankSize, pressure, consumption, volumeUnit, pressureUnit;
        
        if (window.unitsManager) {
            tankSize = window.unitsManager.convertVolume(result.tankSize, 'metric');
            pressure = window.unitsManager.convertPressure(result.initialPressure, 'metric');
            consumption = window.unitsManager.convertVolume(result.totalConsumption, 'metric');
            const safePressure = window.unitsManager.convertPressure(result.safeRemainingPressure, 'metric');
            
            volumeUnit = window.unitsManager.getVolumeUnit();
            pressureUnit = window.unitsManager.getPressureUnit();
            
            const tankDiv = document.createElement('div');
            tankDiv.className = 'mb-3 p-3 bg-light rounded';
            tankDiv.innerHTML = `
                <h6 class="mb-2">Tank ${result.tankIndex + 1}: ${tankSize.toFixed(1)}${volumeUnit} @ ${pressure.toFixed(0)} ${pressureUnit} (${gasInfo})</h6>
                <div class="row">
                    <div class="col-6">
                        <div class="small text-muted">Consumption:</div>
                        <div class="fw-bold">${consumption.toFixed(0)} ${volumeUnit}</div>
                    </div>
                    <div class="col-6">
                        <div class="small text-muted">Remaining (with reserve):</div>
                        <div class="fw-bold">${safePressure < (window.unitsManager.currentSystem === 'imperial' ? 435 : 30) ? '<span class="text-danger">' : ''}${safePressure.toFixed(0)} ${pressureUnit}${safePressure < (window.unitsManager.currentSystem === 'imperial' ? 435 : 30) ? '</span>' : ''}</div>
                    </div>
                </div>
            `;
            container.appendChild(tankDiv);
        } else {
            // Fallback without unit conversion
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
        }
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
    
    // Hide any previous error
    const planNotFound = document.getElementById('planNotFound');
    if (planNotFound) planNotFound.style.display = 'none';
    
    const jsNotFound = document.getElementById('jsNotFound');
    if (jsNotFound) jsNotFound.style.display = 'none';
    
    console.log('Loading shared plan with ID:', planId);
    
    // Validate planId format before making request
    if (!planId || planId.length < 8) {
        console.error('Invalid plan ID format:', planId);
        if (loadingContainer) loadingContainer.style.display = 'none';
        
        if (planNotFound) {
            planNotFound.innerHTML = `
                <i class="fas fa-exclamation-circle me-2"></i>
                <strong>Dive plan not found.</strong> Invalid plan ID format.
            `;
            planNotFound.style.display = 'block';
        }
        return;
    }
    
    // Fetch the plan
    fetch(`/api/plan/${planId}`)
    .then(response => {
        if (!response.ok) {
            // First try to read JSON error message
            return response.json()
                .then(errData => {
                    // Extract error details if available
                    const errorMsg = errData.message || 'Failed to load plan';
                    throw new Error(errorMsg);
                })
                .catch(jsonError => {
                    // If JSON parsing fails, use the response status text
                    throw new Error(`Failed to load plan: ${response.statusText}`);
                });
        }
        return response.json();
    })
    .then(data => {
        console.log('Successfully loaded shared plan');
        
        // Check if we have valid data
        if (!data) {
            throw new Error('Received empty response from server');
        }
        
        // Validate required plan data
        if (typeof data.depth === 'undefined' || data.depth === null) {
            console.warn('Plan missing depth data');
            data.depth = 0;
        }
        
        if (typeof data.bottomTime === 'undefined' || data.bottomTime === null) {
            console.warn('Plan missing bottom time data');
            data.bottomTime = 0;
        }
        
        if (!data.profile) {
            console.warn('Plan missing profile data, creating default');
            data.profile = {
                descentTime: 0,
                bottomTime: data.bottomTime || 0,
                ascentTime: 0,
                totalTime: data.bottomTime || 0,
                decoStops: []
            };
        }
        
        // Store the plan data globally
        window.sharedPlan = data;
        
        // Display the plan
        if (loadingContainer) loadingContainer.style.display = 'none';
        if (planDetailsContainer) planDetailsContainer.style.display = 'block';
        
        if (planNotFound) planNotFound.style.display = 'none';
        
        displaySharedPlanDetails(data);
    })
    .catch(error => {
        console.error('Error loading shared plan:', error);
        
        // Hide loading indicator
        if (loadingContainer) loadingContainer.style.display = 'none';
        
        // Show error message with details
        if (planNotFound) {
            planNotFound.innerHTML = `
                <i class="fas fa-exclamation-circle me-2"></i>
                <strong>Dive plan not found.</strong> ${error.message || 'The plan may have been deleted or the link is invalid.'}
            `;
            planNotFound.style.display = 'block';
        }
    });
}

/**
 * Display the shared plan details on the share page
 */
function displaySharedPlanDetails(data) {
    try {
        // Safety check for the data parameter
        if (!data) {
            console.error('No data provided to displaySharedPlanDetails');
            throw new Error('No plan data available');
        }
        
        // Update basic information safely
        const safeSetText = (id, value, defaultValue = 'Not specified') => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value || defaultValue;
            } else {
                console.warn(`Element with id ${id} not found`);
            }
        };
        
        safeSetText('sharedLocation', data.location);
        
        // Tarih ve saat bilgilerini birlikte göster
        let dateDisplay = 'Not specified';
        if (data.diveDate) {
            try {
                dateDisplay = new Date(data.diveDate).toLocaleDateString();
                if (data.diveTime) {
                    dateDisplay += ' ' + data.diveTime;
                }
            } catch (e) {
                console.warn('Error formatting date:', e);
                dateDisplay = 'Invalid date';
            }
        }
        safeSetText('sharedDate', dateDisplay);
        
        safeSetText('sharedDiveType', data.diveType ? capitalizeFirstLetter(data.diveType) : 'Recreational');
        safeSetText('sharedMaxDepth', (data.depth || '0') + ' meters');
        safeSetText('sharedBottomTime', (data.bottomTime || '0') + ' minutes');
        safeSetText('sharedTotalTime', (data.totalDiveTime || '0') + ' minutes');
    
        // Update profile display values safely
        if (data.profile) {
            safeSetText('sharedDescentTime', data.profile.descentTime ? data.profile.descentTime.toFixed(1) + ' min' : '0.0 min');
            safeSetText('sharedBottomTimeDisplay', data.profile.bottomTime ? data.profile.bottomTime.toFixed(1) + ' min' : '0.0 min');
            safeSetText('sharedAscentTime', data.profile.ascentTime ? data.profile.ascentTime.toFixed(1) + ' min' : '0.0 min');
            safeSetText('sharedTotalTimeDisplay', data.profile.totalTime ? data.profile.totalTime.toFixed(1) + ' min' : '0.0 min');
            
            // Draw profile chart
            if (typeof drawDiveProfileChart === 'function') {
                drawDiveProfileChart(data.profile, 'sharedProfileChart');
            }
        } else {
            console.warn('No profile data available');
            safeSetText('sharedDescentTime', '0.0 min');
            safeSetText('sharedBottomTimeDisplay', '0.0 min');
            safeSetText('sharedAscentTime', '0.0 min');
            safeSetText('sharedTotalTimeDisplay', '0.0 min');
        }
    
        // Display decompression stops if any
        const sharedDecoStopsContainer = document.getElementById('sharedDecoStopsContainer');
        const sharedDecoStopsList = document.getElementById('sharedDecoStopsList');
    
    // Handle decompression stops safely
    if (data.profile && data.profile.decoStops && data.profile.decoStops.length > 0) {
        if (sharedDecoStopsContainer) sharedDecoStopsContainer.style.display = 'block';
        if (sharedDecoStopsList) {
            sharedDecoStopsList.innerHTML = '';
            
            data.profile.decoStops.forEach(stop => {
                try {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${stop.depth ? stop.depth.toFixed(1) : '0.0'}</td>
                        <td>${stop.time ? stop.time.toFixed(0) : '0'}</td>
                    `;
                    sharedDecoStopsList.appendChild(row);
                } catch (e) {
                    console.warn('Error creating deco stop row:', e);
                }
            });
        }
    } else {
        if (sharedDecoStopsContainer) sharedDecoStopsContainer.style.display = 'none';
    }
    
        // Display tanks if any - safely with error handling
        const sharedTanksContainer = document.getElementById('sharedTanksContainer');
        const noSharedTanksMessage = document.getElementById('noSharedTanksMessage');
        
        if (data.tanks && data.tanks.length > 0 && sharedTanksContainer && noSharedTanksMessage) {
            try {
                noSharedTanksMessage.style.display = 'none';
                sharedTanksContainer.innerHTML = '';
                
                data.tanks.forEach((tank, index) => {
                    try {
                        const tankDiv = document.createElement('div');
                        tankDiv.className = 'p-3 bg-light rounded mb-2';
                        
                        // Get tank properties with defaults
                        const size = tank.size || '12';
                        const pressure = tank.pressure || '200';
                        
                        // Get gas info
                        let gasInfo = 'Air';
                        const gasType = tank.gas_type || 'air';
                        
                        if (gasType === 'nitrox') {
                            const o2 = tank.o2_percentage || 32;
                            gasInfo = `Nitrox ${o2}% O₂`;
                        } else if (gasType === 'trimix') {
                            const o2 = tank.o2_percentage || 21;
                            const he = tank.he_percentage || 35;
                            gasInfo = `Trimix ${o2}% O₂, ${he}% He`;
                        } else if (gasType === 'oxygen') {
                            gasInfo = 'Oxygen (100% O₂)';
                        }
                        
                        tankDiv.innerHTML = `
                            <div class="fw-bold">Tank ${index + 1}</div>
                            <div class="small">${size}L @ ${pressure} bar</div>
                            <div class="small">${gasInfo}</div>
                        `;
                        
                        sharedTanksContainer.appendChild(tankDiv);
                    } catch (e) {
                        console.warn('Error rendering tank:', e);
                    }
                });
            } catch (e) {
                console.error('Error displaying tanks:', e);
                if (noSharedTanksMessage) {
                    noSharedTanksMessage.style.display = 'block';
                }
            }
        } else {
            if (noSharedTanksMessage) noSharedTanksMessage.style.display = 'block';
        }
    
        // Display buddies if any - safely with error handling
        const sharedBuddiesContainer = document.getElementById('sharedBuddiesContainer');
        const noSharedBuddiesMessage = document.getElementById('noSharedBuddiesMessage');
        
        if (data.buddies && data.buddies.length > 0 && sharedBuddiesContainer && noSharedBuddiesMessage) {
            try {
                noSharedBuddiesMessage.style.display = 'none';
                sharedBuddiesContainer.innerHTML = '';
                
                data.buddies.forEach(buddy => {
                    try {
                        const buddyDiv = document.createElement('div');
                        buddyDiv.className = 'p-3 bg-light rounded mb-2';
                        
                        // Get name with fallback
                        const name = buddy.name || 'Unnamed Buddy';
                        
                        // Other properties with fallbacks
                        const certification = buddy.certification || 'No certification specified';
                        const skillLevel = buddy.skill_level || 'not specified';
                        const formattedSkillLevel = capitalizeFirstLetter(skillLevel);
                        
                        // Only show specialty if it exists and isn't 'none'
                        const specialtyLine = (buddy.specialty && buddy.specialty !== 'none')
                            ? `<div class="small">Specialty: ${capitalizeFirstLetter(buddy.specialty)}</div>`
                            : '';
                        
                        buddyDiv.innerHTML = `
                            <div class="fw-bold">${name}</div>
                            <div class="small">${certification}</div>
                            <div class="small">Skill Level: ${formattedSkillLevel}</div>
                            ${specialtyLine}
                        `;
                        
                        sharedBuddiesContainer.appendChild(buddyDiv);
                    } catch (e) {
                        console.warn('Error rendering buddy:', e);
                    }
                });
            } catch (e) {
                console.error('Error displaying buddies:', e);
                if (noSharedBuddiesMessage) {
                    noSharedBuddiesMessage.style.display = 'block';
                }
            }
        } else {
            if (noSharedBuddiesMessage) noSharedBuddiesMessage.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error in displaySharedPlanDetails:', error);
        
        // Show JS error message
        const jsNotFound = document.getElementById('jsNotFound');
        if (jsNotFound) {
            jsNotFound.textContent = 'JavaScript error: ' + error.message;
            jsNotFound.style.display = 'block';
        }
        
        // Hide loading and display plan container
        const loadingContainer = document.getElementById('loadingContainer');
        if (loadingContainer) loadingContainer.style.display = 'none';
        
        const planDetailsContainer = document.getElementById('planDetailsContainer');
        if (planDetailsContainer) planDetailsContainer.style.display = 'block';
        
        // Hide the plan content
        const planContent = document.getElementById('planContent');
        if (planContent) planContent.style.display = 'none';
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
    e.stopPropagation();
    
    // Remove any existing modal first
    const existingModal = document.getElementById('offlineGuideModal');
    if (existingModal) {
        const bsModal = bootstrap.Modal.getInstance(existingModal);
        if (bsModal) bsModal.dispose();
        existingModal.remove();
    }
    
    const modalHtml = `
        <div class="modal fade" id="offlineGuideModal" tabindex="-1" aria-labelledby="offlineGuideModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
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
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modalElement = document.getElementById('offlineGuideModal');
    const modal = new bootstrap.Modal(modalElement, {
        backdrop: true,
        keyboard: true,
        focus: true
    });
    
    // Clean up after modal is hidden
    modalElement.addEventListener('hidden.bs.modal', function(event) {
        modal.dispose();
        modalElement.remove();
    }, { once: true });
    
    modal.show();
}

/**
 * Print the current dive plan
 */
function printCurrentPlan() {
    // Only proceed if we have a dive plan
    if (!app.currentPlan) {
        showAlert('No dive plan to print', 'warning');
        return;
    }
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        showAlert('Pop-up blocked. Please allow pop-ups to print the plan.', 'warning');
        return;
    }
    
    // Function to format date
    const formatDate = (date) => {
        if (!date) return 'Not specified';
        const d = new Date(date);
        return d.toLocaleDateString();
    };
    
    // Get total time from profile if available, otherwise use plan value
    const totalTime = (app.currentPlan.profile && app.currentPlan.profile.totalTime) 
        ? app.currentPlan.profile.totalTime.toFixed(1) 
        : app.currentPlan.totalDiveTime;
    
    // Create tanks HTML if there are tanks
    let tanksHtml = '';
    if (app.tanks && app.tanks.length > 0) {
        tanksHtml = `
            <div class="section">
                <h3>Tanks</h3>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Size</th>
                            <th>Pressure</th>
                            <th>Gas</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        app.tanks.forEach((tank, index) => {
            let gasInfo = 'Air';
            // Standart gaz bilgisi
            let o2 = tank.o2Percentage || tank.o2 || 21;
            let he = tank.hePercentage || tank.he || 0;
            
            if (tank.gasType === 'nitrox' || tank.gas_type === 'nitrox') {
                gasInfo = `Nitrox ${o2}% O₂`;
            } else if (tank.gasType === 'trimix' || tank.gas_type === 'trimix') {
                gasInfo = `Trimix ${o2}% O₂, ${he}% He`;
            } else if (tank.gasType === 'oxygen' || tank.gas_type === 'oxygen') {
                gasInfo = 'Oxygen (100% O₂)';
            }
            
            // Tanklar için standart boyut ve basınç değerleri (eğer belirtilmemişse)
            let tankSize = tank.size || 12; // Litre olarak
            let tankPressure = tank.pressure || 200; // Bar olarak
            
            tanksHtml += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${tankSize} L</td>
                    <td>${tankPressure} bar</td>
                    <td>${gasInfo}</td>
                </tr>
            `;
        });
        
        tanksHtml += `
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // Create buddies HTML if there are buddies
    let buddiesHtml = '';
    if (app.buddies && app.buddies.length > 0) {
        buddiesHtml = `
            <div class="section">
                <h3>Dive Buddies</h3>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Certification</th>
                            <th>Skill Level</th>
                            <th>Specialty</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        app.buddies.forEach(buddy => {
            const specialtyDisplay = buddy.specialty && buddy.specialty !== 'none' 
                ? buddy.specialty.charAt(0).toUpperCase() + buddy.specialty.slice(1) 
                : 'None';
            
            buddiesHtml += `
                <tr>
                    <td>${buddy.name}</td>
                    <td>${buddy.certification || 'Not specified'}</td>
                    <td>${buddy.skillLevel ? buddy.skillLevel.charAt(0).toUpperCase() + buddy.skillLevel.slice(1) : 'Not specified'}</td>
                    <td>${specialtyDisplay}</td>
                </tr>
            `;
        });
        
        buddiesHtml += `
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // Create deco stops HTML if there are any
    let decoStopsHtml = '';
    if (app.currentPlan.profile && app.currentPlan.profile.decoStops && app.currentPlan.profile.decoStops.length > 0) {
        decoStopsHtml = `
            <div class="section">
                <h3>Decompression Stops</h3>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Depth (m)</th>
                            <th>Time (min)</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        app.currentPlan.profile.decoStops.forEach(stop => {
            decoStopsHtml += `
                <tr>
                    <td>${stop.depth.toFixed(1)}</td>
                    <td>${stop.time.toFixed(0)}</td>
                </tr>
            `;
        });
        
        decoStopsHtml += `
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // Build the HTML content
    const content = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Dive Plan</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    color: #333;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #ddd;
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                    color: #007bff;
                }
                .section {
                    margin-bottom: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 10px;
                }
                table, th, td {
                    border: 1px solid #ddd;
                }
                th, td {
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f8f9fa;
                }
                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    margin-bottom: 20px;
                }
                .summary-item {
                    padding: 10px;
                    background-color: #f8f9fa;
                    border-radius: 4px;
                }
                .summary-item p {
                    margin: 0;
                }
                .summary-item .label {
                    font-size: 0.9em;
                    color: #666;
                }
                .summary-item .value {
                    font-weight: bold;
                    font-size: 1.1em;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 0.8em;
                    color: #666;
                    border-top: 1px solid #ddd;
                    padding-top: 10px;
                }
                @media print {
                    body {
                        padding: 0;
                    }
                    .print-button {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">ScuPlan</div>
                    <p>Dive Plan Report</p>
                </div>
                
                <div class="section">
                    <h3>Dive Summary</h3>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <p class="label">Location</p>
                            <p class="value">${app.currentPlan.location || 'Not specified'}</p>
                        </div>
                        <div class="summary-item">
                            <p class="label">Date & Time</p>
                            <p class="value">${app.currentPlan.diveDate ? 
                               (new Date(app.currentPlan.diveDate).toLocaleDateString() + 
                                (app.currentPlan.diveTime ? ' ' + app.currentPlan.diveTime : '')) : 
                               'Not specified'}</p>
                        </div>
                        <div class="summary-item">
                            <p class="label">Dive Type</p>
                            <p class="value">${app.currentPlan.diveType ? app.currentPlan.diveType.charAt(0).toUpperCase() + app.currentPlan.diveType.slice(1) : 'Recreational'}</p>
                        </div>
                        <div class="summary-item">
                            <p class="label">Maximum Depth</p>
                            <p class="value">${app.currentPlan.depth.toFixed(1)} m</p>
                        </div>
                        <div class="summary-item">
                            <p class="label">Bottom Time</p>
                            <p class="value">${app.currentPlan.bottomTime.toFixed(0)} min</p>
                        </div>
                        <div class="summary-item">
                            <p class="label">Total Dive Time</p>
                            <p class="value">${totalTime} min</p>
                        </div>
                    </div>
                </div>
                
                ${decoStopsHtml}
                ${tanksHtml}
                ${buddiesHtml}
                
                <div class="section">
                    <h3>Dive Profile</h3>
                    <table class="table table-bordered">
                        <tbody>
                            <tr>
                                <th>Descent Time</th>
                                <td>${app.currentPlan.profile ? app.currentPlan.profile.descentTime.toFixed(1) : '2.0'} min</td>
                            </tr>
                            <tr>
                                <th>Bottom Time</th>
                                <td>${app.currentPlan.bottomTime.toFixed(0)} min</td>
                            </tr>
                            <tr>
                                <th>Ascent Time</th>
                                <td>${app.currentPlan.profile ? app.currentPlan.profile.ascentTime.toFixed(1) : '3.0'} min</td>
                            </tr>
                            <tr>
                                <th>Total Time</th>
                                <td>${totalTime} min</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="footer">
                    <p>Generated by ScuPlan on ${new Date().toLocaleString()}</p>
                    <p>This plan is for reference only. Always dive within your training and capabilities.</p>
                </div>
                
                <div class="print-button" style="text-align: center; margin-top: 20px;">
                    <button onclick="window.print()">Print this plan</button>
                </div>
            </div>
            <script>
                // Automatically open print dialog when page loads
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 500);
                };
            </script>
        </body>
        </html>
    `;
    
    // Write the content to the new window and open print dialog
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
}

/**
 * Print the shared dive plan
 */
function printSharedPlan() {
    // Only proceed if we have a shared plan
    if (!window.sharedPlan) {
        showAlert('No shared plan data to print', 'warning');
        return;
    }
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        showAlert('Pop-up blocked. Please allow pop-ups to print the plan.', 'warning');
        return;
    }
    
    // Function to format date
    const formatDate = (date) => {
        if (!date) return 'Not specified';
        const d = new Date(date);
        return d.toLocaleDateString();
    };
    
    // Create tanks HTML if there are tanks
    let tanksHtml = '';
    if (window.sharedPlan.tanks && window.sharedPlan.tanks.length > 0) {
        tanksHtml = `
            <div class="section">
                <h3>Tanks</h3>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Size</th>
                            <th>Pressure</th>
                            <th>Gas</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        window.sharedPlan.tanks.forEach((tank, index) => {
            let gasInfo = 'Air';
            
            // Standart gaz bilgisi
            let o2 = tank.o2_percentage || tank.o2 || 21;
            let he = tank.he_percentage || tank.he || 0;
            
            if (tank.gas_type === 'nitrox' || tank.gasType === 'nitrox') {
                gasInfo = `Nitrox ${o2}% O₂`;
            } else if (tank.gas_type === 'trimix' || tank.gasType === 'trimix') {
                gasInfo = `Trimix ${o2}% O₂, ${he}% He`;
            } else if (tank.gas_type === 'oxygen' || tank.gasType === 'oxygen') {
                gasInfo = 'Oxygen (100% O₂)';
            }
            
            // Tanklar için standart boyut ve basınç değerleri (eğer belirtilmemişse)
            let tankSize = tank.size || 12; // Litre olarak
            let tankPressure = tank.pressure || 200; // Bar olarak
            
            tanksHtml += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${tankSize} L</td>
                    <td>${tankPressure} bar</td>
                    <td>${gasInfo}</td>
                </tr>
            `;
        });
        
        tanksHtml += `
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // Create buddies HTML if there are buddies
    let buddiesHtml = '';
    if (window.sharedPlan.buddies && window.sharedPlan.buddies.length > 0) {
        buddiesHtml = `
            <div class="section">
                <h3>Dive Buddies</h3>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Certification</th>
                            <th>Skill Level</th>
                            <th>Specialty</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        window.sharedPlan.buddies.forEach(buddy => {
            const specialtyDisplay = buddy.specialty && buddy.specialty !== 'none' 
                ? buddy.specialty.charAt(0).toUpperCase() + buddy.specialty.slice(1) 
                : 'None';
            
            buddiesHtml += `
                <tr>
                    <td>${buddy.name}</td>
                    <td>${buddy.certification || 'Not specified'}</td>
                    <td>${buddy.skill_level ? buddy.skill_level.charAt(0).toUpperCase() + buddy.skill_level.slice(1) : 'Not specified'}</td>
                    <td>${specialtyDisplay}</td>
                </tr>
            `;
        });
        
        buddiesHtml += `
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // Create deco stops HTML if there are any
    let decoStopsHtml = '';
    if (window.sharedPlan.profile && window.sharedPlan.profile.decoStops && window.sharedPlan.profile.decoStops.length > 0) {
        decoStopsHtml = `
            <div class="section">
                <h3>Decompression Stops</h3>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Depth (m)</th>
                            <th>Time (min)</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        window.sharedPlan.profile.decoStops.forEach(stop => {
            decoStopsHtml += `
                <tr>
                    <td>${stop.depth.toFixed(1)}</td>
                    <td>${stop.time.toFixed(0)}</td>
                </tr>
            `;
        });
        
        decoStopsHtml += `
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // Build the HTML content
    const content = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Shared Dive Plan</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    color: #333;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #ddd;
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                    color: #007bff;
                }
                .section {
                    margin-bottom: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 10px;
                }
                table, th, td {
                    border: 1px solid #ddd;
                }
                th, td {
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f8f9fa;
                }
                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    margin-bottom: 20px;
                }
                .summary-item {
                    padding: 10px;
                    background-color: #f8f9fa;
                    border-radius: 4px;
                }
                .summary-item p {
                    margin: 0;
                }
                .summary-item .label {
                    font-size: 0.9em;
                    color: #666;
                }
                .summary-item .value {
                    font-weight: bold;
                    font-size: 1.1em;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 0.8em;
                    color: #666;
                    border-top: 1px solid #ddd;
                    padding-top: 10px;
                }
                @media print {
                    body {
                        padding: 0;
                    }
                    .print-button {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">ScuPlan</div>
                    <p>Shared Dive Plan Report</p>
                </div>
                
                <div class="section">
                    <h3>Dive Summary</h3>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <p class="label">Location</p>
                            <p class="value">${window.sharedPlan.location || 'Not specified'}</p>
                        </div>
                        <div class="summary-item">
                            <p class="label">Date & Time</p>
                            <p class="value">${window.sharedPlan.diveDate ? 
                               (new Date(window.sharedPlan.diveDate).toLocaleDateString() + 
                                (window.sharedPlan.diveTime ? ' ' + window.sharedPlan.diveTime : '')) : 
                               formatDate(window.sharedPlan.date)}</p>
                        </div>
                        <div class="summary-item">
                            <p class="label">Dive Type</p>
                            <p class="value">${window.sharedPlan.dive_type ? window.sharedPlan.dive_type.charAt(0).toUpperCase() + window.sharedPlan.dive_type.slice(1) : 'Recreational'}</p>
                        </div>
                        <div class="summary-item">
                            <p class="label">Maximum Depth</p>
                            <p class="value">${window.sharedPlan.depth.toFixed(1)} m</p>
                        </div>
                        <div class="summary-item">
                            <p class="label">Bottom Time</p>
                            <p class="value">${window.sharedPlan.bottom_time.toFixed(0)} min</p>
                        </div>
                        <div class="summary-item">
                            <p class="label">Total Dive Time</p>
                            <p class="value">${window.sharedPlan.total_dive_time.toFixed(0)} min</p>
                        </div>
                    </div>
                </div>
                
                ${decoStopsHtml}
                ${tanksHtml}
                ${buddiesHtml}
                
                <div class="section">
                    <h3>Dive Profile</h3>
                    <table class="table table-bordered">
                        <tbody>
                            <tr>
                                <th>Descent Time</th>
                                <td>${window.sharedPlan.profile ? window.sharedPlan.profile.descentTime.toFixed(1) : '2.0'} min</td>
                            </tr>
                            <tr>
                                <th>Bottom Time</th>
                                <td>${window.sharedPlan.bottom_time.toFixed(0)} min</td>
                            </tr>
                            <tr>
                                <th>Ascent Time</th>
                                <td>${window.sharedPlan.profile ? window.sharedPlan.profile.ascentTime.toFixed(1) : '3.0'} min</td>
                            </tr>
                            <tr>
                                <th>Total Time</th>
                                <td>${window.sharedPlan.total_dive_time.toFixed(0)} min</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="footer">
                    <p>Generated by ScuPlan on ${new Date().toLocaleString()}</p>
                    <p>This shared plan is for reference only. Always dive within your training and capabilities.</p>
                </div>
                
                <div class="print-button" style="text-align: center; margin-top: 20px;">
                    <button onclick="window.print()">Print this plan</button>
                </div>
            </div>
            <script>
                // Automatically open print dialog when page loads
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 500);
                };
            </script>
        </body>
        </html>
    `;
    
    // Write the content to the new window and open print dialog
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
}

/**
 * Print the pre-dive checklist from the shared plan page
 */
function printPreDiveChecklist() {
    const checklistContainer = document.getElementById('sharedPreDiveChecklist');
    if (!checklistContainer) {
        showAlert('No checklist available to print', 'warning');
        return;
    }
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        showAlert('Pop-up blocked. Please allow pop-ups to print the checklist.', 'warning');
        return;
    }
    
    // Get the current state of the checklist (which items are checked)
    const items = [];
    checklistContainer.querySelectorAll('.checklist-item').forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        const label = item.querySelector('label');
        
        items.push({
            text: label.textContent,
            checked: checkbox.checked
        });
    });
    
    // Build the HTML content
    const content = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Pre-Dive Checklist</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    color: #333;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #ddd;
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                    color: #007bff;
                }
                .checklist-item {
                    padding: 8px 0;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    align-items: center;
                }
                .checklist-item input {
                    margin-right: 10px;
                }
                .checklist-item.checked {
                    color: #999;
                    text-decoration: line-through;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 0.8em;
                    color: #666;
                    border-top: 1px solid #ddd;
                    padding-top: 10px;
                }
                @media print {
                    body {
                        padding: 0;
                    }
                    .print-button {
                        display: none;
                    }
                    .checklist-item input {
                        -webkit-appearance: none;
                        -moz-appearance: none;
                        appearance: none;
                        width: 16px;
                        height: 16px;
                        border: 1px solid #333;
                        margin-right: 10px;
                        position: relative;
                    }
                    .checklist-item.checked input:before {
                        content: '✓';
                        position: absolute;
                        top: -5px;
                        left: 2px;
                        font-size: 16px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">ScuPlan</div>
                    <p>Pre-Dive Checklist</p>
                </div>
                
                <div class="checklist-container">
    `;
    
    // Add each checklist item
    items.forEach(item => {
        content += `
            <div class="checklist-item ${item.checked ? 'checked' : ''}">
                <input type="checkbox" ${item.checked ? 'checked' : ''}>
                <span>${item.text}</span>
            </div>
        `;
    });
    
    // Complete the HTML
    const completeContent = content + `
                </div>
                
                <div class="footer">
                    <p>Generated by ScuPlan on ${new Date().toLocaleString()}</p>
                    <p>Always complete a thorough safety check before every dive.</p>
                </div>
                
                <div class="print-button" style="text-align: center; margin-top: 20px;">
                    <button onclick="window.print()">Print this checklist</button>
                </div>
            </div>
            <script>
                // Automatically open print dialog when page loads
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 500);
                };
            </script>
        </body>
        </html>
    `;
    
    // Write the content to the new window and open print dialog
    printWindow.document.open();
    printWindow.document.write(completeContent);
    printWindow.document.close();
}

/**
 * Show information about export and print functionality
 */
function showExportGuide(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Remove any existing modal first
    const existingModal = document.getElementById('exportGuideModal');
    if (existingModal) {
        const bsModal = bootstrap.Modal.getInstance(existingModal);
        if (bsModal) bsModal.dispose();
        existingModal.remove();
    }
    
    const modalHtml = `
        <div class="modal fade" id="exportGuideModal" tabindex="-1" aria-labelledby="exportGuideModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
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
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modalElement = document.getElementById('exportGuideModal');
    const modal = new bootstrap.Modal(modalElement, {
        backdrop: true,
        keyboard: true,
        focus: true
    });
    
    // Clean up after modal is hidden
    modalElement.addEventListener('hidden.bs.modal', function(event) {
        modal.dispose();
        modalElement.remove();
    }, { once: true });
    
    modal.show();
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
        
        // Initialize date field with proper format (dd.mm.yyyy style)
        const dateInput = document.getElementById('diveDate');
        if (dateInput && !dateInput.value) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            dateInput.value = `${year}-${month}-${day}`;
        }
        
        // Initialize time field
        const timeInput = document.getElementById('diveTime');
        if (timeInput && !timeInput.value) {
            timeInput.value = '10:00';
        }
        
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
