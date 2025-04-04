function displayGasConsumptionResults(results) {
    const container = document.getElementById('gasConsumptionResults');
    if (!container) return;
    
    // Sonuç yoksa veya boşsa, offline hesaplama yap
    if (!results || results.length === 0) {
        const diveDepth = parseFloat(document.getElementById('maxDepth')?.value || 10);
        const bottomTime = parseFloat(document.getElementById('bottomTime')?.value || 30);
        const sacRate = parseFloat(document.getElementById('sacRate')?.value || 20);
        
        if (app.tanks && app.tanks.length > 0) {
            // Sığ dalışlarda basit hesaplama
            const tank = app.tanks[0];
            const tankSize = tank.size || 12;
            const tankPressure = tank.pressure || 200;
            
            // Basit tüketim hesaplaması
            const pressureFactor = (diveDepth / 10) + 1;
            const bottomConsumption = sacRate * pressureFactor * bottomTime;
            const descentTime = diveDepth / 18;
            const ascentTime = diveDepth / 9;
            
            if (diveDepth > 15) {
                ascentTime += 3; // Güvenlik durağı
            }
            
            const totalConsumption = bottomConsumption + 
                                    (sacRate * ((diveDepth / 20) + 1) * descentTime) + 
                                    (sacRate * ((diveDepth / 20) + 1) * ascentTime);
            
            const tankGas = tankSize * tankPressure;
            const remainingGas = tankGas - totalConsumption;
            
            results = [{
                tankIndex: 0,
                tankSize: tankSize,
                initialPressure: tankPressure,
                gasType: tank.gasType || 'air',
                o2: tank.o2 || 21,
                he: tank.he || 0,
                totalConsumption: Math.round(totalConsumption),
                descentConsumption: Math.round(sacRate * ((diveDepth / 20) + 1) * descentTime),
                bottomConsumption: Math.round(bottomConsumption),
                ascentConsumption: Math.round(sacRate * ((diveDepth / 20) + 1) * ascentTime),
                remainingGas: Math.max(0, Math.round(remainingGas)),
                remainingPressure: Math.max(0, Math.round(remainingGas / tankSize)),
                safetyReserve: Math.round(totalConsumption * 0.33),
                safeRemainingPressure: Math.max(0, Math.round((remainingGas - (totalConsumption * 0.33)) / tankSize))
            }];
        }
    }
    
    if (!results || results.length === 0) {
        container.innerHTML = '<div class="text-center text-muted"><small>No gas consumption data available</small></div>';
        return;
    }
    
    container.innerHTML = '';
    
    results.forEach(result => {
        const gasType = (result.gasType || 'air').charAt(0).toUpperCase() + (result.gasType || 'air').slice(1);
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
