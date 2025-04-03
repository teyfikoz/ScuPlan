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
    initOfflineStorage();
    initDonationFeatures();
    
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
    
    // Load default checklists
    loadDefaultChecklists();
    
    // Set up event listeners for checklist page
    setupChecklistEvents();
    
    // Check for offline saved checklists
    loadOfflineChecklists();
}

/**
 * Set up global event listeners
 */
function setupEventListeners() {
    // Check for network status changes
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
    
    // Setup event listeners for offline storage dialog
    document.getElementById('offlineStorageButton').addEventListener('click', showOfflineStorageModal);
    document.getElementById('footerSavedPlans').addEventListener('click', showOfflineStorageModal);
    
    // Donation copy button
    document.getElementById('copyDonationBtn').addEventListener('click', copyDonationAddress);
    
    // Setup footer resource links
    document.getElementById('offlineGuideLink').addEventListener('click', showOfflineGuide);
    document.getElementById('exportGuideLink').addEventListener('click', showExportGuide);
    document.getElementById('donationGuideLink').addEventListener('click', showDonationInfo);
}

/**
 * Set up specific event listeners for the dive plan form
 */
function setupDivePlanForm() {
    // Calculate button
    document.getElementById('calculateButton').addEventListener('click', calculateDivePlan);
    
    // Tank modals
    document.getElementById('addTankButton').addEventListener('click', showAddTankModal);
    document.getElementById('saveTankButton').addEventListener('click', saveTank);
    
    // Buddy modals
    document.getElementById('addBuddyButton').addEventListener('click', showAddBuddyModal);
    document.getElementById('saveBuddyButton').addEventListener('click', saveBuddy);
    
    // Save and share buttons (will be shown after calculation)
    document.getElementById('saveOfflineButton').addEventListener('click', saveCurrentPlanOffline);
    document.getElementById('sharePlanButton').addEventListener('click', showShareModal);
    document.getElementById('printPlanButton').addEventListener('click', printCurrentPlan);
    
    // Share modal buttons
    document.getElementById('copyShareLinkBtn').addEventListener('click', copyShareLink);
    document.getElementById('emailShareLinkBtn').addEventListener('click', emailShareLink);
    
    // Gas type changes
    document.getElementById('gasType').addEventListener('change', handleGasTypeChange);
}

/**
 * Set up event listeners for the shared plan page
 */
function setupSharedPlanEvents() {
    // Button event listeners
    document.getElementById('saveToPlannerBtn').addEventListener('click', saveSharedPlanToPlanner);
    document.getElementById('printSharedPlanBtn').addEventListener('click', printSharedPlan);
    document.getElementById('printPreDiveBtn').addEventListener('click', printPreDiveChecklist);
}

/**
 * Set up event listeners for the checklist page
 */
function setupChecklistEvents() {
    // Create checklist button
    document.getElementById('createChecklistBtn').addEventListener('click', showCreateChecklistModal);
    
    // Add checklist item button
    document.getElementById('addChecklistItemBtn').addEventListener('click', addChecklistItemInput);
    
    // Save checklist button
    document.getElementById('saveChecklistBtn').addEventListener('click', saveCustomChecklist);
    
    // Print buttons
    document.querySelectorAll('.print-checklist-btn').forEach(btn => {
        btn.addEventListener('click', printChecklist);
    });
    
    // Print viewed checklist
    document.getElementById('printViewedChecklistBtn').addEventListener('click', printViewedChecklist);
    
    // Manage offline checklists
    document.getElementById('manageOfflineChecklistsBtn').addEventListener('click', showManageOfflineChecklistsModal);
    
    // Clear all offline data
    document.getElementById('clearAllOfflineBtn').addEventListener('click', clearAllOfflineData);
}

/**
 * Calculate the dive plan based on input parameters
 */
function calculateDivePlan() {
    const depth = parseFloat(document.getElementById('diveDepth').value);
    const bottomTime = parseFloat(document.getElementById('bottomTime').value);
    const location = document.getElementById('diveLocation').value;
    const diveType = document.getElementById('diveType').value;
    const sacRate = parseFloat(document.getElementById('sacRate').value);
    
    // Input validation
    if (isNaN(depth) || depth <= 0) {
        showAlert('Please enter a valid depth', 'danger');
        return;
    }
    
    if (isNaN(bottomTime) || bottomTime <= 0) {
        showAlert('Please enter a valid bottom time', 'danger');
        return;
    }
    
    if (isNaN(sacRate) || sacRate <= 0) {
        showAlert('Please enter a valid SAC rate', 'danger');
        return;
    }
    
    // Construct plan data
    const planData = {
        depth: depth,
        bottomTime: bottomTime,
        location: location,
        diveType: diveType,
        sacRate: sacRate,
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
    document.getElementById('diveResultsCard').style.display = 'block';
    
    // Update the stat values
    document.getElementById('maxDepthResult').textContent = data.depth.toFixed(1);
    document.getElementById('bottomTimeResult').textContent = data.bottomTime.toFixed(0);
    document.getElementById('totalTimeResult').textContent = data.totalDiveTime.toFixed(0);
    
    // Show the profile visualization
    document.getElementById('profileVisualizationSection').style.display = 'block';
    
    // Update profile display values
    document.getElementById('descentTimeResult').textContent = data.profile.descentTime.toFixed(1) + ' min';
    document.getElementById('bottomTimeDisplay').textContent = data.profile.bottomTime.toFixed(1) + ' min';
    document.getElementById('ascentTimeResult').textContent = data.profile.ascentTime.toFixed(1) + ' min';
    document.getElementById('totalTimeDisplay').textContent = data.profile.totalTime.toFixed(1) + ' min';
    
    // Display decompression stops if any
    const decoStopsContainer = document.getElementById('decoStopsContainer');
    const decoStopsList = document.getElementById('decoStopsList');
    
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
    
    // Draw the dive profile chart
    drawDiveProfileChart(data.profile);
}

/**
 * Calculate gas consumption for the current plan
 */
function calculateGasConsumption(planData) {
    // Only proceed if we have tanks
    if (!app.tanks || app.tanks.length === 0) {
        document.getElementById('gasConsumptionResults').innerHTML = '<div class="text-center text-muted"><small>Add tanks to see gas consumption</small></div>';
        return;
    }
    
    const data = {
        depth: planData.depth,
        bottomTime: planData.bottomTime,
        sacRate: document.getElementById('sacRate').value,
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
            document.getElementById('gasConsumptionResults').innerHTML = '<div class="alert alert-danger">Failed to calculate gas consumption</div>';
        }
    });
}

/**
 * Display gas consumption results
 */
function displayGasConsumptionResults(results) {
    const container = document.getElementById('gasConsumptionResults');
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
 * Fallback method for offline dive plan calculation
 */
function calculateOfflineDivePlan(planData) {
    console.log('Using offline dive plan calculation');
    
    const depth = planData.depth;
    const bottomTime = planData.bottomTime;
    
    // Simple calculation for descent and ascent times
    const descentRate = 18; // m/min
    const ascentRate = 9;   // m/min
    
    const descentTime = depth / descentRate;
    
    // Simplified deco calculations
    const isDecoNeeded = (depth > 18 && bottomTime > 35) || (depth > 30 && bottomTime > 20);
    let decoStops = [];
    let ascentTime = 0;
    
    if (isDecoNeeded) {
        // Very simplified decompression model
        const derinlikFaktoru = depth / 10;
        const zamanFaktoru = bottomTime / 20;
        
        if (depth > 30) {
            // Add stops based on depth
            if (depth > 40) {
                const dokuzMetreDurak = Math.ceil(zamanFaktoru * derinlikFaktoru * 0.8);
                if (dokuzMetreDurak > 1) {
                    decoStops.push({ depth: 9, time: dokuzMetreDurak });
                }
            }
            
            const altiMetreDurak = Math.ceil(zamanFaktoru * derinlikFaktoru * 1.5);
            if (altiMetreDurak > 1) {
                decoStops.push({ depth: 6, time: altiMetreDurak });
            }
        }
        
        // Always add 3m safety stop
        const ucMetreDurak = Math.ceil(zamanFaktoru * derinlikFaktoru * 2);
        decoStops.push({ depth: 3, time: Math.max(3, ucMetreDurak) });
        
        // Calculate ascent time with stops
        let currentDepth = depth;
        
        // Ascent to first stop or surface
        if (decoStops.length > 0) {
            ascentTime = (currentDepth - decoStops[0].depth) / ascentRate;
            currentDepth = decoStops[0].depth;
            
            // Time at each stop and transit to next stop
            for (let i = 0; i < decoStops.length; i++) {
                const stop = decoStops[i];
                ascentTime += stop.time;
                
                if (i < decoStops.length - 1) {
                    const nextStop = decoStops[i + 1];
                    ascentTime += (stop.depth - nextStop.depth) / ascentRate;
                    currentDepth = nextStop.depth;
                }
            }
            
            // Final ascent from last stop to surface
            ascentTime += currentDepth / ascentRate;
        } else {
            // Direct ascent to surface
            ascentTime = depth / ascentRate;
        }
    } else {
        // No deco stops needed
        ascentTime = depth / ascentRate;
        
        // Add 3-minute safety stop at 5m for non-deco dives deeper than 15m
        if (depth > 15) {
            decoStops.push({ depth: 5, time: 3 });
            // Adjust ascent time to include safety stop
            ascentTime = (depth - 5) / ascentRate + 3 + 5 / ascentRate;
        }
    }
    
    // Total dive time
    const totalTime = descentTime + bottomTime + ascentTime;
    
    // Create simplified profile
    const profile = {
        points: [
            { time: 0, depth: 0, phase: 'surface' },
            { time: descentTime, depth: depth, phase: 'bottom_start' },
            { time: descentTime + bottomTime, depth: depth, phase: 'bottom_end' }
        ],
        decoStops: decoStops,
        descentTime: descentTime,
        bottomTime: bottomTime,
        ascentTime: ascentTime,
        totalTime: totalTime
    };
    
    // Add ascent profile points
    let timeElapsed = descentTime + bottomTime;
    let currentDepth = depth;
    
    // Add deco stop points if any
    if (decoStops.length > 0) {
        for (let i = 0; i < decoStops.length; i++) {
            const stop = decoStops[i];
            
            // Transit to this stop
            timeElapsed += (currentDepth - stop.depth) / ascentRate;
            profile.points.push({
                time: timeElapsed,
                depth: stop.depth,
                phase: 'deco_start'
            });
            
            // Time at this stop
            timeElapsed += stop.time;
            profile.points.push({
                time: timeElapsed,
                depth: stop.depth,
                phase: 'deco_stop'
            });
            
            currentDepth = stop.depth;
        }
        
        // Final ascent to surface
        timeElapsed += currentDepth / ascentRate;
    } else {
        // Direct ascent to surface
        timeElapsed += ascentTime;
    }
    
    // Add surface point
    profile.points.push({
        time: timeElapsed,
        depth: 0,
        phase: 'surface'
    });
    
    // Return dive plan object
    return {
        depth: depth,
        bottomTime: bottomTime,
        diveType: planData.diveType,
        location: planData.location,
        profile: profile,
        tanks: planData.tanks,
        buddies: planData.buddies,
        totalDiveTime: totalTime
    };
}

/**
 * Fallback method for offline gas consumption calculation
 */
function calculateOfflineGasConsumption(planData) {
    console.log('Using offline gas consumption calculation');
    
    const depth = parseFloat(planData.depth);
    const bottomTime = parseFloat(planData.bottomTime);
    const sacRate = parseFloat(document.getElementById('sacRate').value) || 20; // L/min at surface
    
    const results = [];
    
    app.tanks.forEach((tank, index) => {
        // Calculate pressure based on depth (atmospheres)
        const pressureFactor = (depth / 10) + 1;
        
        // Calculate consumption during different phases
        const bottomConsumption = sacRate * pressureFactor * bottomTime;
        
        // Simplified descent and ascent consumption
        const descentTime = depth / 18; // 18 m/min descent rate
        const descentPressureFactor = (depth / 20) + 1; // Average pressure during descent
        const descentConsumption = sacRate * descentPressureFactor * descentTime;
        
        // Simplified ascent calculation
        let ascentConsumption = 0;
        let ascentTime = 0;
        
        // Check if decompression is needed
        const isDecoNeeded = (depth > 18 && bottomTime > 35) || (depth > 30 && bottomTime > 20);
        
        if (isDecoNeeded) {
            // Very simplified deco model
            const derinlikFaktoru = depth / 10;
            const zamanFaktoru = bottomTime / 20;
            
            // Estimated total deco time
            let totalDecoTime = 0;
            
            if (depth > 30) {
                if (depth > 40) {
                    totalDecoTime += Math.ceil(zamanFaktoru * derinlikFaktoru * 0.8); // 9m stop
                }
                
                totalDecoTime += Math.ceil(zamanFaktoru * derinlikFaktoru * 1.5); // 6m stop
            }
            
            totalDecoTime += Math.max(3, Math.ceil(zamanFaktoru * derinlikFaktoru * 2)); // 3m stop
            
            // Average ascent depth for consumption calculation
            const avgAscentDepth = depth / 3;
            const avgAscentPressureFactor = (avgAscentDepth / 10) + 1;
            
            // Estimate total ascent time (transit + stops)
            ascentTime = (depth / 9) + totalDecoTime; // 9 m/min ascent rate
            
            // Calculate consumption during ascent with deco
            ascentConsumption = sacRate * avgAscentPressureFactor * ascentTime;
        } else {
            // No deco stops
            ascentTime = depth / 9; // 9 m/min ascent rate
            
            // For non-deco dives deeper than 15m, add 3 min safety stop
            if (depth > 15) {
                ascentTime += 3;
            }
            
            const avgAscentDepth = depth / 2;
            const ascentPressureFactor = (avgAscentDepth / 10) + 1;
            ascentConsumption = sacRate * ascentPressureFactor * ascentTime;
        }
        
        // Total gas consumption
        const totalConsumption = bottomConsumption + descentConsumption + ascentConsumption;
        
        // Tank gas volume
        const tankSize = parseFloat(tank.size);
        const tankPressure = parseFloat(tank.pressure);
        const totalGas = tankSize * tankPressure;
        
        // Remaining gas
        const remainingGas = totalGas - totalConsumption;
        const remainingPressure = remainingGas / tankSize;
        
        // Safety reserve (1/3 rule)
        const safetyReserve = totalConsumption / 3;
        const safeRemainingGas = remainingGas - safetyReserve;
        const safeRemainingPressure = safeRemainingGas / tankSize;
        
        // Add to results
        results.push({
            tankIndex: index,
            tankSize: tankSize,
            initialPressure: tankPressure,
            gasType: tank.gasType,
            o2: tank.o2,
            he: tank.he,
            totalConsumption: totalConsumption.toFixed(1),
            bottomConsumption: bottomConsumption.toFixed(1),
            descentConsumption: descentConsumption.toFixed(1),
            ascentConsumption: ascentConsumption.toFixed(1),
            remainingGas: remainingGas.toFixed(1),
            remainingPressure: remainingPressure.toFixed(1),
            safeRemainingPressure: safeRemainingPressure.toFixed(1),
            safetyReserve: safetyReserve.toFixed(1)
        });
    });
    
    return results;
}

/**
 * Update connection status indicator based on online/offline status
 */
function updateConnectionStatus() {
    const indicator = document.getElementById('offlineIndicator');
    app.isOffline = !navigator.onLine;
    
    if (app.isOffline) {
        indicator.classList.add('show');
    } else {
        indicator.classList.remove('show');
    }
}

/**
 * Show loading indicator with message
 */
function showLoading(message = 'Loading...') {
    // Create loading indicator if it doesn't exist
    let loadingIndicator = document.getElementById('loadingIndicator');
    
    if (!loadingIndicator) {
        loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'loadingIndicator';
        loadingIndicator.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75';
        loadingIndicator.style.zIndex = '9999';
        loadingIndicator.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2" id="loadingMessage">${message}</p>
            </div>
        `;
        document.body.appendChild(loadingIndicator);
    } else {
        document.getElementById('loadingMessage').textContent = message;
        loadingIndicator.style.display = 'flex';
    }
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

/**
 * Show alert message
 */
function showAlert(message, type = 'info', timeout = 5000) {
    // Create alert container if it doesn't exist
    let alertContainer = document.getElementById('alertContainer');
    
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alertContainer';
        alertContainer.className = 'position-fixed top-0 start-50 translate-middle-x mt-4';
        alertContainer.style.zIndex = '9999';
        document.body.appendChild(alertContainer);
    }
    
    // Create alert element
    const alertId = 'alert-' + Date.now();
    const alertElement = document.createElement('div');
    alertElement.id = alertId;
    alertElement.className = `alert alert-${type} alert-dismissible fade show`;
    alertElement.role = 'alert';
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    alertContainer.appendChild(alertElement);
    
    // Auto-dismiss after timeout
    if (timeout > 0) {
        setTimeout(() => {
            const alert = document.getElementById(alertId);
            if (alert) {
                alert.classList.remove('show');
                setTimeout(() => alert.remove(), 300);
            }
        }, timeout);
    }
}

/**
 * Load the shared plan from the server
 */
function loadSharedPlan(planId) {
    fetch(`/api/plan/${planId}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Plan not found');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('loadingContainer').style.display = 'none';
        document.getElementById('planDetailsContainer').style.display = 'block';
        
        displaySharedPlanDetails(data);
    })
    .catch(error => {
        document.getElementById('loadingContainer').style.display = 'none';
        document.getElementById('planDetailsContainer').style.display = 'block';
        document.getElementById('planNotFound').style.display = 'block';
        document.getElementById('planContent').style.display = 'none';
        
        console.error('Error loading shared plan:', error);
    });
}

/**
 * Display the shared plan details on the share page
 */
function displaySharedPlanDetails(data) {
    // Basic info
    document.getElementById('sharedLocation').textContent = data.location || 'Not specified';
    document.getElementById('sharedDate').textContent = data.diveDate || 'Not specified';
    document.getElementById('sharedDiveType').textContent = capitalizeFirstLetter(data.diveType) || 'Recreational';
    document.getElementById('sharedMaxDepth').textContent = `${data.depth.toFixed(1)} meters`;
    document.getElementById('sharedBottomTime').textContent = `${data.bottomTime.toFixed(0)} minutes`;
    document.getElementById('sharedTotalTime').textContent = `${data.totalDiveTime.toFixed(0)} minutes`;
    
    // Profile info
    document.getElementById('sharedDescentTime').textContent = `${data.profile.descentTime.toFixed(1)} min`;
    document.getElementById('sharedBottomTimeDisplay').textContent = `${data.profile.bottomTime.toFixed(1)} min`;
    document.getElementById('sharedAscentTime').textContent = `${data.profile.ascentTime.toFixed(1)} min`;
    document.getElementById('sharedTotalTimeDisplay').textContent = `${data.profile.totalTime.toFixed(1)} min`;
    
    // Draw profile chart
    drawDiveProfileChart(data.profile, 'sharedProfileChart');
    
    // Display deco stops
    const decoStopsContainer = document.getElementById('sharedDecoStopsContainer');
    const decoStopsList = document.getElementById('sharedDecoStopsList');
    
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
    
    // Display tanks
    const tanksContainer = document.getElementById('sharedTanksContainer');
    const noTanksMessage = document.getElementById('noSharedTanksMessage');
    
    if (data.tanks && data.tanks.length > 0) {
        noTanksMessage.style.display = 'none';
        tanksContainer.innerHTML = '';
        
        data.tanks.forEach((tank, index) => {
            const gasType = tank.gasType.charAt(0).toUpperCase() + tank.gasType.slice(1);
            const gasInfo = tank.gasType === 'air' ? 'Air' : 
                           `${gasType} (${tank.o2}% O₂${tank.he > 0 ? ', ' + tank.he + '% He' : ''})`;
            
            const tankElement = document.createElement('div');
            tankElement.className = 'tank-item mb-2';
            tankElement.innerHTML = `
                <div class="fw-bold">Tank ${index + 1}</div>
                <div class="small">${tank.size}L @ ${tank.pressure} bar</div>
                <div class="small">${gasInfo}</div>
            `;
            tanksContainer.appendChild(tankElement);
        });
    } else {
        noTanksMessage.style.display = 'block';
    }
    
    // Display buddies
    const buddiesContainer = document.getElementById('sharedBuddiesContainer');
    const noBuddiesMessage = document.getElementById('noSharedBuddiesMessage');
    
    if (data.buddies && data.buddies.length > 0) {
        noBuddiesMessage.style.display = 'none';
        buddiesContainer.innerHTML = '';
        
        data.buddies.forEach(buddy => {
            const buddyElement = document.createElement('div');
            buddyElement.className = 'buddy-item mb-2';
            buddyElement.innerHTML = `
                <div class="fw-bold">${buddy.name}</div>
                <div class="small">Certification: ${buddy.certification || 'Not specified'}</div>
                <div class="small">Skill Level: ${capitalizeFirstLetter(buddy.skillLevel) || 'Not specified'}</div>
                ${buddy.specialty && buddy.specialty !== 'none' ? `<div class="small">Specialty: ${capitalizeFirstLetter(buddy.specialty)}</div>` : ''}
            `;
            buddiesContainer.appendChild(buddyElement);
        });
    } else {
        noBuddiesMessage.style.display = 'block';
    }
}

/**
 * Load default pre-dive checklist for the shared plan page
 */
function loadPreDiveChecklist() {
    fetch('/api/checklists?type=pre-dive')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load checklist');
        }
        return response.json();
    })
    .then(checklists => {
        if (checklists.length > 0) {
            const defaultChecklist = checklists[0];
            const container = document.getElementById('sharedPreDiveChecklist');
            
            container.innerHTML = '';
            
            defaultChecklist.items.forEach(item => {
                const checkboxItem = document.createElement('div');
                checkboxItem.className = 'form-check checklist-item';
                checkboxItem.innerHTML = `
                    <input class="form-check-input" type="checkbox" id="sharedCheck${item.id}">
                    <label class="form-check-label" for="sharedCheck${item.id}">${item.text}</label>
                `;
                container.appendChild(checkboxItem);
            });
        }
    })
    .catch(error => {
        console.error('Error loading pre-dive checklist:', error);
        document.getElementById('sharedPreDiveChecklist').innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>Failed to load checklist
            </div>
        `;
    });
}

/**
 * Handle gas type change in the tank modal
 */
function handleGasTypeChange() {
    const gasType = document.getElementById('gasType').value;
    const heliumContainer = document.getElementById('heliumContainer');
    const oxygenInput = document.getElementById('oxygenPercentage');
    
    // Show/hide helium input based on gas type
    if (gasType === 'trimix') {
        heliumContainer.style.display = 'block';
    } else {
        heliumContainer.style.display = 'none';
    }
    
    // Set appropriate oxygen ranges based on gas type
    if (gasType === 'air') {
        oxygenInput.value = '21';
        oxygenInput.setAttribute('readonly', 'readonly');
    } else if (gasType === 'nitrox') {
        oxygenInput.removeAttribute('readonly');
        oxygenInput.min = '22';
        oxygenInput.max = '40';
        if (oxygenInput.value < 22) oxygenInput.value = '32';
    } else if (gasType === 'trimix') {
        oxygenInput.removeAttribute('readonly');
        oxygenInput.min = '5';
        oxygenInput.max = '30';
        if (oxygenInput.value < 5 || oxygenInput.value > 30) oxygenInput.value = '18';
    } else if (gasType === 'oxygen') {
        oxygenInput.value = '100';
        oxygenInput.setAttribute('readonly', 'readonly');
    }
}

/**
 * Show the share modal and generate a share link
 */
function showShareModal() {
    if (!app.currentPlan || !app.currentPlan.id) {
        showAlert('Please calculate and save a dive plan first', 'warning');
        return;
    }
    
    // Get the modal and show it
    const shareModal = new bootstrap.Modal(document.getElementById('sharePlanModal'));
    shareModal.show();
    
    // Generate the share link
    const shareLink = window.location.origin + '/share?id=' + app.currentPlan.shareToken;
    document.getElementById('shareLinkContainer').innerHTML = shareLink;
}

/**
 * Copy the share link to clipboard
 */
function copyShareLink() {
    const linkContainer = document.getElementById('shareLinkContainer');
    const linkText = linkContainer.textContent || linkContainer.innerText;
    
    navigator.clipboard.writeText(linkText).then(() => {
        showAlert('Link copied to clipboard!', 'success', 2000);
    }).catch(err => {
        console.error('Could not copy text: ', err);
        showAlert('Failed to copy link', 'danger');
    });
}

/**
 * Email the share link
 */
function emailShareLink() {
    const linkContainer = document.getElementById('shareLinkContainer');
    const linkText = linkContainer.textContent || linkContainer.innerText;
    const subject = 'Dive Plan from ScuPlan';
    const body = `Check out this dive plan I created with ScuPlan.\n\nDive Plan Link: ${linkText}\n\nThis link contains all the details of the dive plan including depth, time, decompression stops, and gas consumption.`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Print the current dive plan
 */
function printCurrentPlan() {
    if (!app.currentPlan) {
        showAlert('No dive plan to print', 'warning');
        return;
    }
    
    // Create a printable version
    preparePrint('divePlan');
}

/**
 * Print the shared dive plan
 */
function printSharedPlan() {
    preparePrint('sharedPlan');
}

/**
 * Print the pre-dive checklist from the shared plan page
 */
function printPreDiveChecklist() {
    preparePrint('sharedChecklist');
}

/**
 * General function to prepare content for printing
 */
function preparePrint(contentType) {
    // Store the original body content
    const originalContent = document.body.innerHTML;
    
    // Create print-specific content
    let printContent = '';
    
    if (contentType === 'divePlan') {
        // Current dive plan
        printContent = generatePrintableDivePlan(app.currentPlan);
    } else if (contentType === 'sharedPlan') {
        // Shared dive plan
        const location = document.getElementById('sharedLocation').textContent;
        const date = document.getElementById('sharedDate').textContent;
        const diveType = document.getElementById('sharedDiveType').textContent;
        const maxDepth = document.getElementById('sharedMaxDepth').textContent;
        const bottomTime = document.getElementById('sharedBottomTime').textContent;
        const totalTime = document.getElementById('sharedTotalTime').textContent;
        
        printContent = `
            <div class="print-container">
                <h1>ScuPlan - Dive Plan</h1>
                <hr>
                <div class="print-section">
                    <h2>Dive Information</h2>
                    <div class="print-grid">
                        <div class="print-item">
                            <div class="print-label">Location:</div>
                            <div class="print-value">${location}</div>
                        </div>
                        <div class="print-item">
                            <div class="print-label">Date:</div>
                            <div class="print-value">${date}</div>
                        </div>
                        <div class="print-item">
                            <div class="print-label">Dive Type:</div>
                            <div class="print-value">${diveType}</div>
                        </div>
                        <div class="print-item">
                            <div class="print-label">Max Depth:</div>
                            <div class="print-value">${maxDepth}</div>
                        </div>
                        <div class="print-item">
                            <div class="print-label">Bottom Time:</div>
                            <div class="print-value">${bottomTime}</div>
                        </div>
                        <div class="print-item">
                            <div class="print-label">Total Dive Time:</div>
                            <div class="print-value">${totalTime}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Deco Stops -->
                <div class="print-section" id="printDecoStops"></div>
                
                <!-- Tanks -->
                <div class="print-section" id="printTanks"></div>
                
                <!-- Buddies -->
                <div class="print-section" id="printBuddies"></div>
                
                <div class="print-footer">
                    <p>Generated with ScuPlan - Dive Planning Made Easy</p>
                </div>
            </div>
        `;
        
        // Add print-specific styles
        const printStyles = `
            <style>
                .print-container { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; }
                .print-section { margin-bottom: 20px; }
                h1 { text-align: center; }
                h2 { font-size: 18px; margin-bottom: 10px; }
                .print-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .print-item { margin-bottom: 10px; }
                .print-label { font-weight: bold; }
                .print-footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                
                @media print {
                    body { margin: 0; padding: 20px; }
                }
            </style>
        `;
        
        printContent = printStyles + printContent;
        
        // Set the content
        document.body.innerHTML = printContent;
        
        // Add deco stops if any
        const decoStopsContainer = document.getElementById('sharedDecoStopsContainer');
        if (decoStopsContainer && decoStopsContainer.style.display !== 'none') {
            const decoStopsList = document.getElementById('sharedDecoStopsList').cloneNode(true);
            document.getElementById('printDecoStops').innerHTML = `
                <h2>Decompression Stops</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Depth (m)</th>
                            <th>Time (min)</th>
                        </tr>
                    </thead>
                    <tbody>${decoStopsList.innerHTML}</tbody>
                </table>
            `;
        }
        
        // Add tanks if any
        const tanksContainer = document.getElementById('sharedTanksContainer');
        if (tanksContainer) {
            const tanksContent = tanksContainer.innerHTML;
            if (!tanksContent.includes('No tanks specified')) {
                document.getElementById('printTanks').innerHTML = `
                    <h2>Tanks</h2>
                    <div>${tanksContent}</div>
                `;
            }
        }
        
        // Add buddies if any
        const buddiesContainer = document.getElementById('sharedBuddiesContainer');
        if (buddiesContainer) {
            const buddiesContent = buddiesContainer.innerHTML;
            if (!buddiesContent.includes('No buddies specified')) {
                document.getElementById('printBuddies').innerHTML = `
                    <h2>Dive Buddies</h2>
                    <div>${buddiesContent}</div>
                `;
            }
        }
    } else if (contentType === 'sharedChecklist') {
        // Pre-dive checklist
        const checklistItems = document.getElementById('sharedPreDiveChecklist').querySelectorAll('.checklist-item');
        
        let checklistHtml = '';
        checklistItems.forEach((item, index) => {
            const label = item.querySelector('label').textContent;
            checklistHtml += `
                <div class="print-checklist-item">
                    <div class="print-checkbox">□</div>
                    <div class="print-checklist-text">${label}</div>
                </div>
            `;
        });
        
        printContent = `
            <div class="print-container">
                <h1>Pre-Dive Checklist</h1>
                <hr>
                <div class="print-checklist">
                    ${checklistHtml}
                </div>
                <div class="print-footer">
                    <p>Generated with ScuPlan - Dive Planning Made Easy</p>
                </div>
            </div>
            <style>
                .print-container { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; }
                h1 { text-align: center; }
                .print-checklist { margin: 20px 0; }
                .print-checklist-item { display: flex; margin-bottom: 15px; }
                .print-checkbox { width: 20px; height: 20px; margin-right: 10px; font-size: 20px; }
                .print-checklist-text { font-size: 16px; }
                .print-footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
                
                @media print {
                    body { margin: 0; padding: 20px; }
                }
            </style>
        `;
    } else if (contentType === 'checklist') {
        // Regular checklist from checklist page
        printContent = document.getElementById('printChecklistContent').innerHTML;
    }
    
    // Set the content for printing
    document.body.innerHTML = printContent;
    
    // Print the page
    window.print();
    
    // Restore the original content after printing
    document.body.innerHTML = originalContent;
    
    // Reinitialize necessary components
    if (contentType === 'divePlan') {
        initDivePlanner();
    } else if (contentType === 'sharedPlan' || contentType === 'sharedChecklist') {
        initSharedPlanView();
    } else if (contentType === 'checklist') {
        initChecklists();
    }
}

/**
 * Generate printable content for a dive plan
 */
function generatePrintableDivePlan(plan) {
    if (!plan) return '<div class="text-center">No dive plan data available</div>';
    
    // Format date
    const date = new Date().toLocaleDateString();
    
    return `
        <div class="print-container">
            <h1>ScuPlan - Dive Plan</h1>
            <hr>
            <div class="print-section">
                <h2>Dive Information</h2>
                <div class="print-grid">
                    <div class="print-item">
                        <div class="print-label">Location:</div>
                        <div class="print-value">${plan.location || 'Not specified'}</div>
                    </div>
                    <div class="print-item">
                        <div class="print-label">Date:</div>
                        <div class="print-value">${date}</div>
                    </div>
                    <div class="print-item">
                        <div class="print-label">Dive Type:</div>
                        <div class="print-value">${capitalizeFirstLetter(plan.diveType)}</div>
                    </div>
                    <div class="print-item">
                        <div class="print-label">Max Depth:</div>
                        <div class="print-value">${plan.depth.toFixed(1)} meters</div>
                    </div>
                    <div class="print-item">
                        <div class="print-label">Bottom Time:</div>
                        <div class="print-value">${plan.bottomTime.toFixed(0)} minutes</div>
                    </div>
                    <div class="print-item">
                        <div class="print-label">Total Dive Time:</div>
                        <div class="print-value">${plan.totalDiveTime.toFixed(0)} minutes</div>
                    </div>
                </div>
            </div>
            
            <div class="print-section">
                <h2>Dive Profile</h2>
                <div class="print-grid">
                    <div class="print-item">
                        <div class="print-label">Descent Time:</div>
                        <div class="print-value">${plan.profile.descentTime.toFixed(1)} minutes</div>
                    </div>
                    <div class="print-item">
                        <div class="print-label">Bottom Time:</div>
                        <div class="print-value">${plan.profile.bottomTime.toFixed(1)} minutes</div>
                    </div>
                    <div class="print-item">
                        <div class="print-label">Ascent Time:</div>
                        <div class="print-value">${plan.profile.ascentTime.toFixed(1)} minutes</div>
                    </div>
                    <div class="print-item">
                        <div class="print-label">Total Time:</div>
                        <div class="print-value">${plan.profile.totalTime.toFixed(1)} minutes</div>
                    </div>
                </div>
                
                ${plan.profile.decoStops && plan.profile.decoStops.length > 0 ? `
                    <h3>Decompression Stops</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Depth (m)</th>
                                <th>Time (min)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${plan.profile.decoStops.map(stop => `
                                <tr>
                                    <td>${stop.depth.toFixed(1)}</td>
                                    <td>${stop.time.toFixed(0)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : ''}
            </div>
            
            ${app.tanks.length > 0 ? `
                <div class="print-section">
                    <h2>Tanks</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Size</th>
                                <th>Pressure</th>
                                <th>Gas</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${app.tanks.map(tank => {
                                const gasType = tank.gasType.charAt(0).toUpperCase() + tank.gasType.slice(1);
                                const gasInfo = tank.gasType === 'air' ? 'Air' : 
                                               `${gasType} (${tank.o2}% O₂${tank.he > 0 ? ', ' + tank.he + '% He' : ''})`;
                                return `
                                    <tr>
                                        <td>${tank.size} L</td>
                                        <td>${tank.pressure} bar</td>
                                        <td>${gasInfo}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            ` : ''}
            
            ${app.buddies.length > 0 ? `
                <div class="print-section">
                    <h2>Dive Buddies</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Certification</th>
                                <th>Skill Level</th>
                                <th>Specialty</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${app.buddies.map(buddy => `
                                <tr>
                                    <td>${buddy.name}</td>
                                    <td>${buddy.certification || '-'}</td>
                                    <td>${capitalizeFirstLetter(buddy.skillLevel) || '-'}</td>
                                    <td>${buddy.specialty !== 'none' ? capitalizeFirstLetter(buddy.specialty) : '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : ''}
            
            <div class="print-footer">
                <p>Generated with ScuPlan - Dive Planning Made Easy</p>
            </div>
        </div>
        
        <style>
            .print-container { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; }
            .print-section { margin-bottom: 20px; }
            h1 { text-align: center; }
            h2 { font-size: 18px; margin-bottom: 10px; }
            h3 { font-size: 16px; margin-top: 15px; margin-bottom: 10px; }
            .print-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .print-item { margin-bottom: 10px; }
            .print-label { font-weight: bold; }
            .print-footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            
            @media print {
                body { margin: 0; padding: 20px; }
            }
        </style>
    `;
}

/**
 * Utility function to capitalize the first letter of a string
 */
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Show the offline storage modal with saved plans
 */
function showOfflineStorageModal() {
    // Load saved plans from localStorage
    const savedPlans = getSavedPlansFromStorage();
    
    // Get modal elements
    const modal = new bootstrap.Modal(document.getElementById('storageModal'));
    const savedPlansList = document.getElementById('savedPlansList');
    const noSavedPlansMessage = document.getElementById('noSavedPlansMessage');
    
    // Clear previous content
    savedPlansList.innerHTML = '';
    
    // Check if there are saved plans
    if (savedPlans.length === 0) {
        noSavedPlansMessage.style.display = 'block';
    } else {
        noSavedPlansMessage.style.display = 'none';
        
        // Add each saved plan to the list
        savedPlans.forEach((plan, index) => {
            const planItem = document.createElement('a');
            planItem.className = 'list-group-item list-group-item-action';
            planItem.href = '#';
            planItem.setAttribute('data-index', index);
            
            const date = new Date(plan.savedAt || Date.now()).toLocaleString();
            const location = plan.location || 'Unnamed location';
            const depth = plan.depth.toFixed(1);
            const time = plan.bottomTime.toFixed(0);
            
            planItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <div class="fw-bold">${location}</div>
                        <div class="small text-muted">
                            ${depth}m for ${time}min - ${capitalizeFirstLetter(plan.diveType)}
                        </div>
                        <div class="small text-muted">Saved: ${date}</div>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-primary me-1 load-plan-btn" data-index="${index}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-plan-btn" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            savedPlansList.appendChild(planItem);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.load-plan-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(btn.getAttribute('data-index'));
                loadPlanFromStorage(index);
                modal.hide();
            });
        });
        
        document.querySelectorAll('.delete-plan-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(btn.getAttribute('data-index'));
                deletePlanFromStorage(index);
                // Remove the item from the list
                btn.closest('.list-group-item').remove();
                
                // Show no plans message if all plans are deleted
                if (savedPlansList.children.length === 0) {
                    noSavedPlansMessage.style.display = 'block';
                }
            });
        });
    }
    
    // Show the modal
    modal.show();
}

/**
 * Show information about offline functionality
 */
function showOfflineGuide(e) {
    e.preventDefault();
    
    alert(`Offline Usage Guide:

ScuPlan works offline! Here's how:

1. Save your dive plans using the "Save Offline" button
2. Save checklists for offline access
3. All saved plans and checklists can be accessed without internet
4. Calculations will use simplified models when offline
5. You can export and print even when offline

Your saved data is stored in your browser's local storage.`);
}

/**
 * Show information about export and print functionality
 */
function showExportGuide(e) {
    e.preventDefault();
    
    alert(`Export & Print Guide:

ScuPlan allows you to share and export your dive plans:

1. Print: Create a printer-friendly version of your dive plan
2. Share Link: Generate a unique link to share with dive buddies
3. Email: Send the dive plan directly via email
4. Save Offline: Store plans in your browser for offline access

Printed dive plans include all essential information including profile, tanks, buddies, and decompression stops.`);
}

/**
 * Show information about donation options
 */
function showDonationInfo(e) {
    e.preventDefault();
    
    alert(`Support ScuPlan:

Thank you for considering a donation to ScuPlan!

Your contributions help keep this tool free and continuously improving. All donations are used for:

1. Server costs and maintenance
2. Development of new features
3. Improving dive calculation models
4. Adding more checklists and resources

You can donate using cryptocurrency through the addresses shown at the bottom of each page.

Thank you for your support!`);
}

/**
 * Initialize the application when the DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check which page we're on and initialize accordingly
    if (document.getElementById('divePlanForm')) {
        initDivePlanner();
    } else if (document.getElementById('planDetailsContainer')) {
        initSharedPlanView();
    } else if (document.getElementById('checklistTabs')) {
        initChecklists();
    }
});

// Global event listener for offline/online status
window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);
