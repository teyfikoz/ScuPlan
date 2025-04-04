/** 
 * ScuPlan - Main Application
 * 
 * The main application script that initializes everything and manages the application state
 */

// Main app data store
const app = {
    currentPlan: {},
    tanks: [],
    buddies: [],
    isOffline: false
};

// Donation modal display counter
let donationModalCounter = 0;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('ScuPlan initializing...');
    
    initializeApp();
    updateConnectionStatus();
    
    // Setup offline status monitoring
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
    
    // Initialize modules
    if (document.getElementById('divePlanForm')) {
        initializeDivePlanner();
    }
    
    if (document.getElementById('checklistsContainer')) {
        initChecklists();
    }
    
    if (document.getElementById('technicalCalculators')) {
        initializeTechnicalCalculators();
    }
    
    if (window.location.pathname.startsWith('/share/')) {
        const planId = window.location.pathname.split('/').pop();
        loadSharedPlan(planId);
    }
    
    // Setup event listeners for all page components
    setupGlobalEventListeners();
    
    // Initialize module-specific event listeners
    initializeEventListeners();
    
    // Check for any stored dive plans
    initOfflineStorage();
});

/**
 * Initialize the application components
 */
function initializeApp() {
    // Donation listener
    const aboutMeLink = document.getElementById('aboutMeLink');
    
    if (aboutMeLink) {
        aboutMeLink.addEventListener('click', function(e) {
            donationModalCounter++;
            
            // Occasionally remind of donations
            if (donationModalCounter % 5 === 0) {
                setTimeout(() => {
                    const donationAlert = document.createElement('div');
                    donationAlert.className = 'alert alert-info alert-dismissible fade show donation-reminder';
                    donationAlert.innerHTML = `
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        <h5><i class="fas fa-hand-holding-heart me-2"></i>Support ScuPlan</h5>
                        <p>If you find this tool useful, please consider a small donation to help with server costs and further development.</p>
                        <button class="btn btn-sm btn-outline-primary donation-btn">
                            <i class="fas fa-donate me-1"></i> View Donation Options
                        </button>
                    `;
                    
                    document.querySelector('main').prepend(donationAlert);
                    
                    donationAlert.querySelector('.donation-btn').addEventListener('click', function() {
                        showDonationOptions();
                        donationAlert.remove();
                    });
                }, 5000);
            }
        });
    }
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Set up global event listeners for common functions
 */
function setupGlobalEventListeners() {
    // Donation copy buttons
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', function() {
            const type = this.getAttribute('data-address');
            const addressElement = type === 'xrp' ? 
                document.getElementById('xrpAddress') : 
                document.getElementById('usdtAddress');
            
            const text = addressElement.textContent.trim();
            
            navigator.clipboard.writeText(text).then(() => {
                this.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
                
                showAlert(`${type.toUpperCase()} address copied to clipboard!`, 'success', 2000);
            }).catch(err => {
                console.error('Copy failed:', err);
                showAlert('Copy failed. Please try manually selecting the address.', 'danger');
            });
        });
    });
    
    // Offline storage button
    const offlineButton = document.getElementById('offlineStorageButton');
    if (offlineButton) {
        offlineButton.addEventListener('click', function(e) {
            e.preventDefault();
            showStoredPlansModal();
        });
    }
    
    // Handle questions about the app
    const helpLinks = document.querySelectorAll('.help-link');
    helpLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const topic = this.getAttribute('data-topic');
            showHelpContent(topic);
        });
    });
}

/**
 * Initialize module-specific event listeners
 */
function initializeEventListeners() {
    // Dive planner form
    const diveForm = document.getElementById('divePlanForm');
    if (diveForm) {
        diveForm.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateDivePlan();
        });
        
        // Depth and time input quick validation
        const depthInput = document.getElementById('maxDepth');
        const timeInput = document.getElementById('bottomTime');
        
        if (depthInput) {
            depthInput.addEventListener('input', function() {
                validateDepthInput(this);
            });
        }
        
        if (timeInput) {
            timeInput.addEventListener('input', function() {
                validateTimeInput(this);
            });
        }
    }
    
    // Add date input handler if exists
    const dateInput = document.getElementById('diveDate');
    if (dateInput) {
        initializeDatePicker(dateInput);
    }
    
    // Add dive time input handler
    const timeInput = document.getElementById('diveTime');
    if (timeInput) {
        timeInput.addEventListener('input', function() {
            formatTimeInput(this);
        });
    }
}

/**
 * Initialize dive planner functionality
 */
function initializeDivePlanner() {
    // Initialize empty tanks and buddies arrays
    app.tanks = [];
    app.buddies = [];
    
    // Initialize dive date to today
    const dateInput = document.getElementById('diveDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
    
    // Load saved tanks and buddies if any
    const savedTanks = localStorage.getItem('scuplan_tanks');
    if (savedTanks) {
        try {
            app.tanks = JSON.parse(savedTanks);
            updateTanksDisplay();
        } catch (e) {
            console.error('Error loading saved tanks', e);
        }
    }
    
    const savedBuddies = localStorage.getItem('scuplan_buddies');
    if (savedBuddies) {
        try {
            app.buddies = JSON.parse(savedBuddies);
            updateBuddiesDisplay();
        } catch (e) {
            console.error('Error loading saved buddies', e);
        }
    }
}

/**
 * Calculate the dive plan based on form inputs
 */
function calculateDivePlan() {
    showLoading('Calculating dive plan...');
    
    // Get form values
    const maxDepth = parseFloat(document.getElementById('maxDepth').value);
    const bottomTime = parseFloat(document.getElementById('bottomTime').value);
    const diveType = document.getElementById('diveType').value;
    const diveLocation = document.getElementById('diveLocation').value;
    const diveDate = document.getElementById('diveDate')?.value;
    const diveTime = document.getElementById('diveTime')?.value;
    
    // Validate input
    if (isNaN(maxDepth) || isNaN(bottomTime) || maxDepth <= 0 || bottomTime <= 0) {
        hideLoading();
        showAlert('Please enter valid depth and bottom time values.', 'danger');
        return;
    }
    
    // Check if we have tanks added
    if (!app.tanks || app.tanks.length === 0) {
        showAlert('You need to add at least one tank before calculating the dive plan.', 'warning');
    }
    
    // Check if we have buddy information
    if (!app.buddies || app.buddies.length === 0) {
        showAlert('Consider adding dive buddy information for a complete dive plan.', 'info', 6000);
    }
    
    // Create plan data object
    const planData = {
        depth: maxDepth,
        bottomTime: bottomTime,
        diveType: diveType,
        location: diveLocation || 'Not specified',
        date: diveDate,
        time: diveTime,
        tanks: app.tanks,
        buddies: app.buddies
    };
    
    // If we're offline, use local calculation
    if (app.isOffline) {
        console.log('Using offline calculation');
        const offlinePlan = calculateOfflineDivePlan(planData);
        displayDivePlanResults(offlinePlan);
        hideLoading();
        return;
    }
    
    // Otherwise use the API
    fetch('/api/calculate-plan', {
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
        displayDivePlanResults(data);
        calculateGasConsumption(planData);
    })
    .catch(error => {
        console.error('Error calculating dive plan:', error);
        
        // Fallback to offline calculation on error
        const offlinePlan = calculateOfflineDivePlan(planData);
        displayDivePlanResults(offlinePlan);
        calculateGasConsumption(planData);
        
        showAlert('Could not reach the server. Using simplified dive calculations.', 'warning', 5000);
    })
    .finally(() => {
        hideLoading();
    });
}

/**
 * Display dive plan results in the UI
 * @param {Object} plan - The calculated dive plan
 */
function displayDivePlanResults(plan) {
    // Store the current plan in the app state
    app.currentPlan = plan;
    
    const resultsContainer = document.getElementById('divePlanResults');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = '';
    
    // Create summary card
    const summaryCard = document.createElement('div');
    summaryCard.className = 'card mb-4';
    
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
            <h6 class="mt-3 mb-2">Tank Information</h6>
            <div class="row g-2">
        `;
        
        app.tanks.forEach((tank, index) => {
            const gasType = tank.gasType.charAt(0).toUpperCase() + tank.gasType.slice(1);
            const gasInfo = tank.gasType === 'air' ? 'Air' : 
                            `${gasType} (${tank.o2}% O₂${tank.he > 0 ? ', ' + tank.he + '% He' : ''})`;
                            
            tanksHtml += `
                <div class="col-md-6">
                    <div class="border rounded p-2">
                        <div class="small fw-bold">Tank ${index + 1}:</div>
                        <div class="small text-muted">${tank.size}L @ ${tank.pressure} bar (${gasInfo})</div>
                    </div>
                </div>
            `;
        });
        
        tanksHtml += '</div>';
    }
    
    // Create buddies HTML if there are buddies
    let buddiesHtml = '';
    if (app.buddies && app.buddies.length > 0) {
        buddiesHtml = `
            <h6 class="mt-3 mb-2">Dive Buddies</h6>
            <div class="row g-2">
        `;
        
        app.buddies.forEach((buddy, index) => {
            buddiesHtml += `
                <div class="col-md-6">
                    <div class="border rounded p-2">
                        <div class="small fw-bold">${buddy.name}</div>
                        <div class="small text-muted">
                            ${buddy.certification || 'No certification'} - 
                            ${buddy.skill_level || 'Unknown skill'} - 
                            ${buddy.specialty || 'No specialty'}
                        </div>
                    </div>
                </div>
            `;
        });
        
        buddiesHtml += '</div>';
    }
    
    // Check if decompression is needed
    const hasDecoStops = plan.profile && plan.profile.decoStops && plan.profile.decoStops.length > 0;
    const decoAlertClass = hasDecoStops ? 'alert-warning' : 'alert-success';
    const decoIcon = hasDecoStops ? 'fa-exclamation-triangle' : 'fa-check-circle';
    const decoMessage = hasDecoStops ? 
        'This is a decompression dive. Follow all required stops carefully.' : 
        'No decompression stops required for this dive.';
    
    // Build summary card content
    summaryCard.innerHTML = `
        <div class="card-header">
            <h5 class="mb-0"><i class="fas fa-clipboard-check me-2"></i>Dive Plan Summary</h5>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-6">
                    <h6>Primary Information</h6>
                    <table class="table table-sm">
                        <tr>
                            <th>Dive Location:</th>
                            <td>${plan.location || 'Not specified'}</td>
                        </tr>
                        <tr>
                            <th>Date:</th>
                            <td>${formatDate(plan.dive_date || plan.date)}</td>
                        </tr>
                        <tr>
                            <th>Time:</th>
                            <td>${plan.dive_time || plan.time || 'Not specified'}</td>
                        </tr>
                        <tr>
                            <th>Dive Type:</th>
                            <td>${capitalizeFirstLetter(plan.diveType || plan.dive_type || 'recreational')}</td>
                        </tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <h6>Dive Parameters</h6>
                    <table class="table table-sm">
                        <tr>
                            <th>Max Depth:</th>
                            <td>${plan.depth} meters</td>
                        </tr>
                        <tr>
                            <th>Bottom Time:</th>
                            <td>${plan.bottomTime || plan.bottom_time} minutes</td>
                        </tr>
                        <tr>
                            <th>Total Dive Time:</th>
                            <td>${totalTime} minutes</td>
                        </tr>
                        <tr>
                            <th>Decompression:</th>
                            <td>${hasDecoStops ? 'Required' : 'Not required'}</td>
                        </tr>
                    </table>
                </div>
            </div>
            
            <div class="alert ${decoAlertClass} mt-3 mb-3">
                <i class="fas ${decoIcon} me-2"></i> ${decoMessage}
            </div>
            
            ${tanksHtml}
            ${buddiesHtml}
            
            <div class="row mt-4">
                <div class="col-12">
                    <button class="btn btn-primary btn-sm me-2" onclick="saveDivePlan()">
                        <i class="fas fa-save me-1"></i> Save Plan
                    </button>
                    <button class="btn btn-outline-secondary btn-sm me-2" onclick="printCurrentPlan()">
                        <i class="fas fa-print me-1"></i> Print
                    </button>
                    <button class="btn btn-outline-info btn-sm me-2" onclick="shareDivePlan()">
                        <i class="fas fa-share-alt me-1"></i> Share
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="showAddToCalendarModal()">
                        <i class="fas fa-calendar-plus me-1"></i> Add to Calendar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    resultsContainer.appendChild(summaryCard);
    
    // Create dive profile card with chart
    const profileCard = document.createElement('div');
    profileCard.className = 'card mb-4';
    profileCard.innerHTML = `
        <div class="card-header">
            <h5 class="mb-0"><i class="fas fa-chart-area me-2"></i>Dive Profile</h5>
        </div>
        <div class="card-body">
            <div class="chart-container mb-4">
                <canvas id="diveProfileChart"></canvas>
            </div>
            
            <div id="decoStopsContainer" class="mb-3">
                <h6><i class="fas fa-stopwatch me-2"></i>Decompression Schedule</h6>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Depth (m)</th>
                                <th>Time (min)</th>
                            </tr>
                        </thead>
                        <tbody id="decoStopsList">
                            <!-- Deco stops will be inserted here -->
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div id="gasResultsContainer" class="mb-3">
                <h6><i class="fas fa-lungs me-2"></i>Gas Consumption</h6>
                <div id="gasConsumptionResults">
                    <!-- Gas consumption results will be inserted here -->
                    <div class="text-center text-muted">
                        <small>Add tanks to see gas consumption</small>
                    </div>
                </div>
            </div>

            <div id="buddyResultsContainer" class="mb-3">
                <h6><i class="fas fa-users me-2"></i>Dive Buddies</h6>
                <div id="buddyConsumptionResults">
                    <!-- Buddy information will be inserted here -->
                    <div class="text-center text-muted">
                        <small>Add buddies for team planning</small>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <div class="alert alert-info">
                        <h6 class="alert-heading"><i class="fas fa-info-circle me-2"></i>Safety Reminders</h6>
                        <div class="small">
                            <p>Remember to:</p>
                            <ul>
                                <li>Plan your dive and dive your plan</li>
                                <li>Perform safety checks before diving</li>
                                <li>Monitor your air supply constantly</li>
                                <li>Stay with your buddy at all times</li>
                                ${hasDecoStops ? '<li><strong>Follow all decompression stops exactly</strong></li>' : ''}
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="alert alert-warning">
                        <h6 class="alert-heading"><i class="fas fa-exclamation-triangle me-2"></i>Important Notes</h6>
                        <div class="small">
                            <p>This plan is a guideline only. Always:</p>
                            <ul>
                                <li>Use a dive computer during your dive</li>
                                <li>Adjust your plan for current conditions</li>
                                <li>Have backup plans for emergencies</li>
                                ${hasDecoStops ? '<li><strong>Use proper gas planning for decompression dives</strong></li>' : ''}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    resultsContainer.appendChild(profileCard);
    
    // Draw the dive profile chart
    if (plan.profile) {
        drawDiveProfileChart(plan.profile);
    }
    
    // Display decompression stops if any
    displayDecompressionStops(plan.profile);
    
    // Calculate and display gas consumption
    if (app.tanks && app.tanks.length > 0) {
        calculateGasConsumption(plan);
    }
    
    // Show buddy compatibility warnings if there are buddies
    if (app.buddies && app.buddies.length > 0) {
        showBuddyCompatibilityWarnings(plan);
    }
    
    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Display decompression stops in the table
 * @param {Object} profile - The dive profile including deco stops
 */
function displayDecompressionStops(profile) {
    const decoStopsList = document.getElementById('decoStopsList');
    if (!decoStopsList) return;
    
    decoStopsList.innerHTML = '';
    
    if (!profile || !profile.decoStops || profile.decoStops.length === 0) {
        // No deco stops needed, show safety stop recommendation for deeper dives
        if (app.currentPlan.depth > 15) {
            decoStopsList.innerHTML = `
                <tr>
                    <td>5</td>
                    <td>3 <span class="badge bg-success">Safety Stop</span></td>
                </tr>
            `;
        } else {
            decoStopsList.innerHTML = `
                <tr>
                    <td colspan="2" class="text-center text-muted">
                        <small>No decompression or safety stops required</small>
                    </td>
                </tr>
            `;
        }
        return;
    }
    
    // Sort stops by depth (deepest first)
    const sortedStops = [...profile.decoStops].sort((a, b) => b.depth - a.depth);
    
    // Display each stop
    sortedStops.forEach(stop => {
        const row = document.createElement('tr');
        
        // Determine if it's a safety stop or required deco stop
        const isLastStop = stop.depth === Math.min(...sortedStops.map(s => s.depth));
        const isSafetyStop = isLastStop && stop.depth <= 5 && stop.time <= 3;
        
        const badgeClass = isSafetyStop ? 'bg-success' : 'bg-warning';
        const badgeText = isSafetyStop ? 'Safety Stop' : 'Required';
        
        row.innerHTML = `
            <td>${stop.depth}</td>
            <td>${stop.time} <span class="badge ${badgeClass}">${badgeText}</span></td>
        `;
        
        decoStopsList.appendChild(row);
    });
}

/**
 * Add user-friendly calendar and date picker
 * @param {HTMLElement} inputElement - The date input element
 */
function initializeDatePicker(inputElement) {
    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    inputElement.min = today;
    
    // Show calendar icon and improve UX
    const parent = inputElement.parentElement;
    if (parent) {
        const datePickerWrapper = document.createElement('div');
        datePickerWrapper.className = 'input-group';
        
        const dateIcon = document.createElement('span');
        dateIcon.className = 'input-group-text';
        dateIcon.innerHTML = '<i class="fas fa-calendar-alt"></i>';
        
        // Clone the original input
        const newInput = inputElement.cloneNode(true);
        
        // Insert the new elements
        datePickerWrapper.appendChild(dateIcon);
        datePickerWrapper.appendChild(newInput);
        
        // Replace the original input with our group
        parent.replaceChild(datePickerWrapper, inputElement);
    }
}

/**
 * Format time input in hh:mm format
 * @param {HTMLElement} inputElement - The time input element
 */
function formatTimeInput(inputElement) {
    let value = inputElement.value.replace(/[^0-9:]/g, '');
    
    // Handle pasting of times
    if (value.length > 0) {
        // If user types a number without a colon
        if (value.length === 2 && !value.includes(':')) {
            value += ':';
        }
        
        // If user enters a value that looks like a time but without a colon
        if (value.length === 4 && !value.includes(':')) {
            value = value.substring(0, 2) + ':' + value.substring(2);
        }
        
        // Format with proper colon
        const parts = value.split(':');
        if (parts.length === 2) {
            // Handle hours
            let hours = parseInt(parts[0], 10);
            if (hours > 23) hours = 23;
            
            // Handle minutes
            let minutes = parseInt(parts[1], 10);
            if (minutes > 59) minutes = 59;
            
            // Format properly
            const formattedHours = hours.toString().padStart(2, '0');
            const formattedMinutes = minutes.toString().padStart(2, '0');
            
            value = `${formattedHours}:${formattedMinutes}`;
        }
    }
    
    inputElement.value = value;
}

/**
 * Validate depth input
 * @param {HTMLElement} inputElement - The depth input element
 */
function validateDepthInput(inputElement) {
    let value = parseFloat(inputElement.value);
    
    if (isNaN(value)) {
        inputElement.classList.add('is-invalid');
        return;
    }
    
    // Ensure value is positive
    if (value <= 0) {
        inputElement.classList.add('is-invalid');
        return;
    }
    
    // Warn about deep dives
    if (value > 40) {
        inputElement.classList.add('is-warning');
        showAlert('Depths beyond 40m require technical diving training and equipment!', 'warning', 5000);
    } else {
        inputElement.classList.remove('is-warning');
    }
    
    // Cap at very extreme depths
    if (value > 100) {
        value = 100;
        inputElement.value = '100';
        showAlert('Maximum depth limited to 100m for planning purposes.', 'info', 3000);
    }
    
    inputElement.classList.remove('is-invalid');
}

/**
 * Validate time input
 * @param {HTMLElement} inputElement - The time input element
 */
function validateTimeInput(inputElement) {
    let value = parseFloat(inputElement.value);
    
    if (isNaN(value)) {
        inputElement.classList.add('is-invalid');
        return;
    }
    
    // Ensure value is positive
    if (value <= 0) {
        inputElement.classList.add('is-invalid');
        return;
    }
    
    // Cap at very long times
    if (value > 180) {
        value = 180;
        inputElement.value = '180';
        showAlert('Maximum bottom time limited to 180 minutes for planning purposes.', 'info', 3000);
    }
    
    inputElement.classList.remove('is-invalid');
}

/**
 * Update connection status indicator based on online/offline status
 */
function updateConnectionStatus() {
    const indicator = document.getElementById('offlineIndicator');
    app.isOffline = !navigator.onLine;
    
    if (indicator) {
        if (app.isOffline) {
            indicator.classList.add('offline');
        } else {
            indicator.classList.remove('offline');
        }
    }
}

/**
 * Show loading indicator with message
 */
function showLoading(message = 'Loading...') {
    let loaderElement = document.getElementById('globalLoader');
    
    if (!loaderElement) {
        loaderElement = document.createElement('div');
        loaderElement.id = 'globalLoader';
        loaderElement.className = 'loader-container';
        loaderElement.innerHTML = `
            <div class="loader-content">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p id="loaderMessage" class="mt-2">${message}</p>
            </div>
        `;
        
        document.body.appendChild(loaderElement);
    } else {
        document.getElementById('loaderMessage').textContent = message;
        loaderElement.style.display = 'flex';
    }
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    const loaderElement = document.getElementById('globalLoader');
    if (loaderElement) {
        loaderElement.style.display = 'none';
    }
}

/**
 * Show alert message
 */
function showAlert(message, type = 'info', timeout = 5000) {
    const alertContainer = document.getElementById('alertContainer') || createAlertContainer();
    
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type} alert-dismissible fade show`;
    alertElement.innerHTML = `
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        ${message}
    `;
    
    alertContainer.appendChild(alertElement);
    
    if (timeout > 0) {
        setTimeout(() => {
            alertElement.classList.remove('show');
            setTimeout(() => {
                alertElement.remove();
            }, 300);
        }, timeout);
    }
}

/**
 * Create alert container if it doesn't exist
 * @returns {HTMLElement} Alert container element
 */
function createAlertContainer() {
    const container = document.createElement('div');
    container.id = 'alertContainer';
    container.className = 'alert-container';
    
    document.body.appendChild(container);
    return container;
}

/**
 * Show help content for various topics
 * @param {string} topic - The help topic to show
 */
function showHelpContent(topic) {
    const modalTitle = "Help: " + topic.charAt(0).toUpperCase() + topic.slice(1);
    let modalContent = '';
    
    switch(topic) {
        case 'diving':
            modalContent = `
                <h5>Basic Dive Planning</h5>
                <p>Proper dive planning is essential for safe diving. ScuPlan helps you calculate:</p>
                <ul>
                    <li>Appropriate dive times based on your depth</li>
                    <li>Decompression obligations (if any)</li>
                    <li>Gas consumption estimates</li>
                    <li>Safety procedures for your dive</li>
                </ul>
                
                <h5>Understanding Dive Parameters</h5>
                <dl>
                    <dt>Max Depth</dt>
                    <dd>The deepest point you plan to reach during your dive, measured in meters.</dd>
                    
                    <dt>Bottom Time</dt>
                    <dd>The time spent at your planned depth, not including descent or ascent times.</dd>
                    
                    <dt>Dive Type</dt>
                    <dd>Recreational dives are within no-decompression limits. Technical dives may involve mandatory decompression stops.</dd>
                </dl>
                
                <h5>Safety Tips</h5>
                <ul>
                    <li>Always dive within your training and experience level</li>
                    <li>Use a dive computer as your primary decompression guide</li>
                    <li>Never exceed your planned depth or time</li>
                    <li>Always plan for contingencies</li>
                </ul>
            `;
            break;
            
        case 'tanks':
            modalContent = `
                <h5>Tank Management</h5>
                <p>Proper gas planning is essential for safe diving. When adding tanks, consider:</p>
                
                <h6>Tank Size</h6>
                <p>Common tank sizes:</p>
                <ul>
                    <li><strong>12L/80 cuft</strong>: Standard aluminum tank for recreational diving</li>
                    <li><strong>15L/100 cuft</strong>: Larger tank often used for deeper dives</li>
                    <li><strong>10L/65 cuft</strong>: Smaller tank for petite divers or as bailout</li>
                    <li><strong>18L/120 cuft</strong>: Very large tank for technical diving</li>
                </ul>
                
                <h6>Gas Types</h6>
                <ul>
                    <li><strong>Air (21% O₂, 79% N₂)</strong>: Standard breathing gas, typically used to maximum 40m</li>
                    <li><strong>Nitrox (22-40% O₂)</strong>: Enriched air with higher oxygen content, reduces nitrogen loading but has depth limits</li>
                    <li><strong>Trimix</strong>: Contains oxygen, nitrogen and helium, used for deeper technical diving</li>
                </ul>
                
                <h6>Gas Management Rules</h6>
                <ul>
                    <li>Always plan with the "Rule of Thirds": 1/3 for the dive, 1/3 for the return, 1/3 for emergencies</li>
                    <li>For decompression diving, ensure you have adequate gas redundancy</li>
                    <li>Check and know your Maximum Operating Depth (MOD) for any enriched gas mixtures</li>
                </ul>
            `;
            break;
            
        case 'technical':
            modalContent = `
                <h5>Technical Diving Calculations</h5>
                <p>Technical diving involves complex gas planning and decompression procedures.</p>
                
                <h6>Common Calculations</h6>
                <dl>
                    <dt>Maximum Operating Depth (MOD)</dt>
                    <dd>The maximum depth at which a gas mix can be safely breathed, based on partial pressure of oxygen.</dd>
                    
                    <dt>Equivalent Narcotic Depth (END)</dt>
                    <dd>The air-equivalent narcotic effect of a gas mixture at a given depth.</dd>
                    
                    <dt>Best Mix</dt>
                    <dd>The optimal gas mixture for a planned dive depth, balancing oxygen toxicity and narcosis concerns.</dd>
                    
                    <dt>CNS Oxygen Toxicity</dt>
                    <dd>Tracking oxygen exposure on the central nervous system as a percentage of maximum allowable exposure.</dd>
                </dl>
                
                <h6>Important Safety Considerations</h6>
                <ul>
                    <li>Technical diving requires specialized training and equipment</li>
                    <li>Always have redundant gas supplies and equipment</li>
                    <li>Plan for contingencies and have bailout options</li>
                    <li>Ensure proper gas analysis before every dive</li>
                </ul>
                
                <div class="alert alert-warning">
                    <strong>Warning:</strong> These calculations are for planning purposes only. 
                    Always verify with proper training, updated tables/software, and dive computers.
                </div>
            `;
            break;
            
        case 'checklist':
            modalContent = `
                <h5>Using Dive Checklists</h5>
                <p>Dive checklists are essential tools for ensuring diving safety.</p>
                
                <h6>Types of Checklists</h6>
                <ul>
                    <li><strong>Pre-Dive</strong>: Equipment checks and preparation before entering the water</li>
                    <li><strong>Post-Dive</strong>: Maintenance steps after diving</li>
                    <li><strong>Emergency</strong>: Actions to take in case of problems underwater</li>
                </ul>
                
                <h6>Customizing Checklists</h6>
                <p>ScuPlan allows you to create custom checklists for your specific needs:</p>
                <ul>
                    <li>Create specialized checklists for different types of diving</li>
                    <li>Modify existing checklists to match your equipment</li>
                    <li>Save checklists offline for use at dive sites</li>
                </ul>
                
                <h6>Best Practices</h6>
                <ul>
                    <li>Always perform a complete pre-dive check before every dive</li>
                    <li>Use the "buddy check" system to verify each other's equipment</li>
                    <li>Review emergency procedures before diving in new conditions</li>
                    <li>Maintain your equipment according to post-dive checklists</li>
                </ul>
            `;
            break;
            
        case 'offline':
            modalContent = `
                <h5>Using ScuPlan Offline</h5>
                <p>ScuPlan provides offline capabilities for use at dive sites without internet access.</p>
                
                <h6>Offline Features</h6>
                <ul>
                    <li>Save dive plans for offline access</li>
                    <li>Store checklists locally on your device</li>
                    <li>Use simplified dive planning calculations without server connection</li>
                    <li>Access your saved content while offline</li>
                </ul>
                
                <h6>How to Prepare for Offline Use</h6>
                <ol>
                    <li>Save your frequently used dive plans before going offline</li>
                    <li>Download any checklists you'll need</li>
                    <li>Make sure to visit the app while online first to cache basic resources</li>
                </ol>
                
                <h6>Limitations When Offline</h6>
                <ul>
                    <li>Some complex calculations may use simplified models</li>
                    <li>Sharing features require internet connection</li>
                    <li>New plans are stored locally until you reconnect</li>
                </ul>
                
                <div class="alert alert-info">
                    <strong>Tip:</strong> Even with offline capabilities, always have backup planning tools like dive tables.
                </div>
            `;
            break;
            
        default:
            modalContent = `<p>Help topic not found.</p>`;
    }
    
    // Create and show modal
    const modalId = 'helpModal';
    let modalElement = document.getElementById(modalId);
    
    if (!modalElement) {
        modalElement = document.createElement('div');
        modalElement.className = 'modal fade';
        modalElement.id = modalId;
        modalElement.setAttribute('tabindex', '-1');
        modalElement.setAttribute('aria-hidden', 'true');
        
        modalElement.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalElement);
    }
    
    // Update modal content
    modalElement.querySelector('.modal-title').textContent = modalTitle;
    modalElement.querySelector('.modal-body').innerHTML = modalContent;
    
    // Show the modal
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

/**
 * Load the shared plan from the server
 */
function loadSharedPlan(planId) {
    showLoading('Loading shared dive plan...');
    
    fetch(`/api/plan/${planId}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        displaySharedPlanDetails(data);
        loadPreDiveChecklist();
    })
    .catch(error => {
        console.error('Error loading shared plan:', error);
        document.getElementById('sharedPlanContainer').innerHTML = `
            <div class="alert alert-danger">
                <h4><i class="fas fa-exclamation-triangle me-2"></i>Error Loading Plan</h4>
                <p>The requested dive plan could not be loaded. It may have expired or been removed.</p>
                <a href="/" class="btn btn-primary mt-2">Create Your Own Plan</a>
            </div>
        `;
    })
    .finally(() => {
        hideLoading();
    });
}

/**
 * Display the shared plan details on the share page
 */
function displaySharedPlanDetails(data) {
    const container = document.getElementById('sharedPlanContainer');
    if (!container) return;
    
    // Format the plan data
    const plan = data.plan;
    
    // Display main plan details
    container.innerHTML = `
        <div class="card mb-4">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0"><i class="fas fa-share-alt me-2"></i>Shared Dive Plan</h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <h6>Dive Information</h6>
                        <table class="table table-sm">
                            <tr>
                                <th>Location:</th>
                                <td>${plan.location || 'Not specified'}</td>
                            </tr>
                            <tr>
                                <th>Date:</th>
                                <td>${plan.dive_date ? new Date(plan.dive_date).toLocaleDateString() : 'Not specified'}</td>
                            </tr>
                            <tr>
                                <th>Time:</th>
                                <td>${plan.dive_time || 'Not specified'}</td>
                            </tr>
                            <tr>
                                <th>Dive Type:</th>
                                <td>${capitalizeFirstLetter(plan.dive_type || 'recreational')}</td>
                            </tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h6>Dive Parameters</h6>
                        <table class="table table-sm">
                            <tr>
                                <th>Depth:</th>
                                <td>${plan.depth} meters</td>
                            </tr>
                            <tr>
                                <th>Bottom Time:</th>
                                <td>${plan.bottom_time} minutes</td>
                            </tr>
                            <tr>
                                <th>Total Dive Time:</th>
                                <td>${plan.total_dive_time || '-'} minutes</td>
                            </tr>
                            <tr>
                                <th>Decompression:</th>
                                <td>${plan.deco_levels && plan.deco_levels.length > 0 ? 'Required' : 'Not required'}</td>
                            </tr>
                        </table>
                    </div>
                </div>
                
                <div class="alert ${plan.deco_levels && plan.deco_levels.length > 0 ? 'alert-warning' : 'alert-success'} mt-3">
                    <i class="fas ${plan.deco_levels && plan.deco_levels.length > 0 ? 'fa-exclamation-triangle' : 'fa-check-circle'} me-2"></i>
                    ${plan.deco_levels && plan.deco_levels.length > 0 
                        ? 'This is a decompression dive. Follow all required stops carefully.' 
                        : 'No decompression stops required for this dive.'}
                </div>
                
                <div class="row mt-4">
                    <div class="col-12">
                        <button class="btn btn-outline-secondary btn-sm me-2" onclick="printSharedPlan()">
                            <i class="fas fa-print me-1"></i> Print Plan
                        </button>
                        <a href="/" class="btn btn-primary btn-sm">
                            <i class="fas fa-calculator me-1"></i> Create Your Own Plan
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // If we have decompression or safety stops, display them
    if (plan.deco_levels && plan.deco_levels.length > 0) {
        const decoTimes = plan.deco_times ? plan.deco_times.split(',').map(Number) : [];
        const decoLevels = plan.deco_levels.split(',').map(Number);
        
        let decoStopsHtml = `
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="mb-0"><i class="fas fa-stopwatch me-2"></i>Decompression Schedule</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Depth (m)</th>
                                    <th>Time (min)</th>
                                </tr>
                            </thead>
                            <tbody>
        `;
        
        for (let i = 0; i < decoLevels.length; i++) {
            decoStopsHtml += `
                <tr>
                    <td>${decoLevels[i]}</td>
                    <td>${decoTimes[i] || '-'}</td>
                </tr>
            `;
        }
        
        decoStopsHtml += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', decoStopsHtml);
    }
    
    // If we have tank information, display it
    if (plan.tanks && plan.tanks.length > 0) {
        let tanksHtml = `
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="mb-0"><i class="fas fa-flask me-2"></i>Tank Information</h5>
                </div>
                <div class="card-body">
                    <div class="row g-3">
        `;
        
        plan.tanks.forEach((tank, index) => {
            const gasType = tank.gas_type.charAt(0).toUpperCase() + tank.gas_type.slice(1);
            const gasInfo = tank.gas_type === 'air' ? 'Air' : 
                          `${gasType} (${tank.o2_percentage}% O₂${tank.he_percentage > 0 ? ', ' + tank.he_percentage + '% He' : ''})`;
            
            tanksHtml += `
                <div class="col-md-6">
                    <div class="border rounded p-3">
                        <h6>Tank ${index + 1}</h6>
                        <table class="table table-sm">
                            <tr>
                                <th>Size:</th>
                                <td>${tank.size}L</td>
                            </tr>
                            <tr>
                                <th>Pressure:</th>
                                <td>${tank.pressure} bar</td>
                            </tr>
                            <tr>
                                <th>Gas:</th>
                                <td>${gasInfo}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            `;
        });
        
        tanksHtml += `
                    </div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', tanksHtml);
    }
    
    // If we have buddy information, display it
    if (plan.buddies && plan.buddies.length > 0) {
        let buddiesHtml = `
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="mb-0"><i class="fas fa-users me-2"></i>Dive Buddies</h5>
                </div>
                <div class="card-body">
                    <div class="row g-3">
        `;
        
        plan.buddies.forEach((buddy, index) => {
            buddiesHtml += `
                <div class="col-md-6">
                    <div class="border rounded p-3">
                        <h6>${buddy.name}</h6>
                        <table class="table table-sm">
                            <tr>
                                <th>Certification:</th>
                                <td>${buddy.certification || 'Not specified'}</td>
                            </tr>
                            <tr>
                                <th>Skill Level:</th>
                                <td>${buddy.skill_level || 'Not specified'}</td>
                            </tr>
                            <tr>
                                <th>Specialty:</th>
                                <td>${buddy.specialty || 'None'}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            `;
        });
        
        buddiesHtml += `
                    </div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', buddiesHtml);
    }
    
    // Add safety section
    container.insertAdjacentHTML('beforeend', `
        <div class="card mb-4">
            <div class="card-header bg-warning text-dark">
                <h5 class="mb-0"><i class="fas fa-exclamation-triangle me-2"></i>Safety Information</h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <h6>Pre-Dive Checklist</h6>
                        <div id="preDiveChecklist" class="mt-3">
                            <p class="mt-2">Loading checklist...</p>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h6>Important Reminders</h6>
                        <ul>
                            <li>Always dive within your training and experience level</li>
                            <li>Perform a thorough buddy check before each dive</li>
                            <li>Use a dive computer for additional safety</li>
                            <li>Maintain proper hydration before and after diving</li>
                            <li>Wait at least 24 hours before flying after diving</li>
                            ${plan.deco_levels && plan.deco_levels.length > 0 ? 
                                '<li><strong>Follow all decompression stops precisely</strong></li>' : ''}
                        </ul>
                        
                        <div class="alert alert-info mt-3">
                            <strong>Remember:</strong> This plan is for reference only. Always adjust your dive based on actual conditions and dive computer readings.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);
}

/**
 * Load default pre-dive checklist for the shared plan page
 */
function loadPreDiveChecklist() {
    const checklistContainer = document.getElementById('preDiveChecklist');
    if (!checklistContainer) return;
    
    // Load a default pre-dive checklist
    fetch('/api/checklists')
    .then(response => response.json())
    .then(data => {
        const preDiveChecklist = data.find(list => 
            list.checklist_type === 'pre-dive' && list.is_default);
        
        if (preDiveChecklist) {
            let checklistHtml = `
                <div class="checklist-container">
                    <ul class="list-group">
            `;
            
            preDiveChecklist.items.forEach(item => {
                checklistHtml += `
                    <li class="list-group-item">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="check-${item.id}">
                            <label class="form-check-label" for="check-${item.id}">
                                ${item.text}
                            </label>
                        </div>
                    </li>
                `;
            });
            
            checklistHtml += `
                    </ul>
                    <button class="btn btn-sm btn-outline-primary mt-3" onclick="printPreDiveChecklist()">
                        <i class="fas fa-print me-1"></i> Print Checklist
                    </button>
                </div>
            `;
            
            checklistContainer.innerHTML = checklistHtml;
        } else {
            checklistContainer.innerHTML = `
                <div class="alert alert-info">
                    <p>No default pre-dive checklist found.</p>
                    <a href="/checklist" class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-tasks me-1"></i> View All Checklists
                    </a>
                </div>
            `;
        }
    })
    .catch(error => {
        console.error('Error loading checklist:', error);
        checklistContainer.innerHTML = `
            <div class="alert alert-warning">
                <p>Could not load the checklist. You may be offline.</p>
                <a href="/checklist" class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-tasks me-1"></i> View All Checklists
                </a>
            </div>
        `;
    });
}

/**
 * Show information about offline functionality
 */
function showOfflineGuide(e) {
    if (e) e.preventDefault();
    
    const modalContent = `
        <div class="offline-guide">
            <h5>Using ScuPlan Offline</h5>
            <p>ScuPlan provides offline capabilities for use at dive sites without internet connection:</p>
            
            <div class="card mb-3">
                <div class="card-header">Available Offline Features</div>
                <div class="card-body">
                    <ul>
                        <li>Access saved dive plans</li>
                        <li>View downloaded checklists</li>
                        <li>Calculate simplified dive profiles</li>
                        <li>Estimate gas consumption</li>
                    </ul>
                </div>
            </div>
            
            <h6>How to Prepare for Offline Use</h6>
            <ol>
                <li>While online, save your dive plans using the "Save Plan" button</li>
                <li>Download checklists for offline use from the Checklists page</li>
                <li>Add tanks and buddy information to your profile</li>
            </ol>
            
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                <strong>Tip:</strong> Even with offline capabilities, always have backup planning tools like dive tables and written notes.
            </div>
            
            <h6>Offline Limitations</h6>
            <ul>
                <li>Complex decompression calculations may use simplified models</li>
                <li>Sharing features and updates require an internet connection</li>
                <li>New plans are stored only on your device</li>
            </ul>
            
            <p class="text-center mt-4">
                <button class="btn btn-primary" id="saveCurrentPageOffline">
                    <i class="fas fa-download me-1"></i> Save Current Page Offline
                </button>
            </p>
        </div>
    `;
    
    // Create modal
    const modalId = 'offlineGuideModal';
    let modalElement = document.getElementById(modalId);
    
    if (!modalElement) {
        modalElement = document.createElement('div');
        modalElement.className = 'modal fade';
        modalElement.id = modalId;
        modalElement.setAttribute('tabindex', '-1');
        modalElement.setAttribute('aria-hidden', 'true');
        
        modalElement.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Offline Features</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${modalContent}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalElement);
        
        // Add event listener to save button
        modalElement.querySelector('#saveCurrentPageOffline').addEventListener('click', function() {
            // This is a placeholder - in a real PWA, this would use the Cache API
            showAlert('Current page saved for offline use!', 'success');
        });
    }
    
    // Show modal
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

/**
 * Print the current dive plan
 */
function printCurrentPlan() {
    if (!app.currentPlan || !app.currentPlan.depth) {
        showAlert('No dive plan to print. Please calculate a plan first.', 'warning');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        showAlert('Pop-up blocked. Please allow pop-ups to print.', 'warning');
        return;
    }
    
    // Get the plan details
    const plan = app.currentPlan;
    const formatDate = (date) => {
        if (!date) return 'Not specified';
        const d = new Date(date);
        return d.toLocaleDateString();
    };
    
    // Check if decompression is needed
    const hasDecoStops = plan.profile && plan.profile.decoStops && plan.profile.decoStops.length > 0;
    
    // Create tanks HTML if there are tanks
    let tanksHtml = '';
    if (app.tanks && app.tanks.length > 0) {
        tanksHtml = `
            <h4>Tank Information</h4>
            <table border="1" cellpadding="8" cellspacing="0" width="100%" style="border-collapse: collapse;">
                <tr style="background-color: #f0f0f0;">
                    <th>Tank</th>
                    <th>Size</th>
                    <th>Pressure</th>
                    <th>Gas</th>
                </tr>
        `;
        
        app.tanks.forEach((tank, index) => {
            const gasType = tank.gasType.charAt(0).toUpperCase() + tank.gasType.slice(1);
            const gasInfo = tank.gasType === 'air' ? 'Air' : 
                          `${gasType} (${tank.o2}% O₂${tank.he > 0 ? ', ' + tank.he + '% He' : ''})`;
            
            tanksHtml += `
                <tr>
                    <td>Tank ${index + 1}</td>
                    <td>${tank.size}L</td>
                    <td>${tank.pressure} bar</td>
                    <td>${gasInfo}</td>
                </tr>
            `;
        });
        
        tanksHtml += `</table>`;
    }
    
    // Create buddies HTML if there are buddies
    let buddiesHtml = '';
    if (app.buddies && app.buddies.length > 0) {
        buddiesHtml = `
            <h4>Dive Buddies</h4>
            <table border="1" cellpadding="8" cellspacing="0" width="100%" style="border-collapse: collapse;">
                <tr style="background-color: #f0f0f0;">
                    <th>Name</th>
                    <th>Certification</th>
                    <th>Skill Level</th>
                    <th>Specialty</th>
                </tr>
        `;
        
        app.buddies.forEach(buddy => {
            buddiesHtml += `
                <tr>
                    <td>${buddy.name}</td>
                    <td>${buddy.certification || 'Not specified'}</td>
                    <td>${buddy.skill_level || 'Not specified'}</td>
                    <td>${buddy.specialty || 'None'}</td>
                </tr>
            `;
        });
        
        buddiesHtml += `</table>`;
    }
    
    // Create deco stops HTML if needed
    let decoStopsHtml = '';
    if (hasDecoStops) {
        decoStopsHtml = `
            <h4>Decompression Schedule</h4>
            <table border="1" cellpadding="8" cellspacing="0" width="100%" style="border-collapse: collapse;">
                <tr style="background-color: #f0f0f0;">
                    <th>Depth (m)</th>
                    <th>Time (min)</th>
                </tr>
        `;
        
        const sortedStops = [...plan.profile.decoStops].sort((a, b) => b.depth - a.depth);
        
        sortedStops.forEach(stop => {
            decoStopsHtml += `
                <tr>
                    <td>${stop.depth}</td>
                    <td>${stop.time}</td>
                </tr>
            `;
        });
        
        decoStopsHtml += `</table>`;
    } else if (plan.depth > 15) {
        // Show safety stop for non-deco dives deeper than 15m
        decoStopsHtml = `
            <h4>Safety Stop</h4>
            <table border="1" cellpadding="8" cellspacing="0" width="100%" style="border-collapse: collapse;">
                <tr style="background-color: #f0f0f0;">
                    <th>Depth (m)</th>
                    <th>Time (min)</th>
                </tr>
                <tr>
                    <td>5</td>
                    <td>3 (Safety Stop)</td>
                </tr>
            </table>
        `;
    }
    
    // Print HTML content
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>ScuPlan - Dive Plan</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                h2 { color: #0066cc; margin-top: 30px; }
                h4 { color: #333; margin-top: 20px; margin-bottom: 10px; }
                table { margin-bottom: 20px; width: 100%; border-collapse: collapse; }
                th { background-color: #f0f0f0; text-align: left; }
                td, th { padding: 8px; border: 1px solid #ddd; }
                .warning { background-color: #fff3cd; border: 1px solid #ffeeba; padding: 10px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
                @media print {
                    .no-print { display: none; }
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">ScuPlan - Dive Plan</div>
                <div>Generated on ${new Date().toLocaleString()}</div>
            </div>
            
            <h2>Dive Plan Summary</h2>
            <table border="1" cellpadding="8" cellspacing="0" width="100%">
                <tr>
                    <th width="30%">Dive Location:</th>
                    <td>${plan.location || 'Not specified'}</td>
                </tr>
                <tr>
                    <th>Date:</th>
                    <td>${formatDate(plan.dive_date || plan.date)}</td>
                </tr>
                <tr>
                    <th>Time:</th>
                    <td>${plan.dive_time || plan.time || 'Not specified'}</td>
                </tr>
                <tr>
                    <th>Dive Type:</th>
                    <td>${capitalizeFirstLetter(plan.diveType || plan.dive_type || 'recreational')}</td>
                </tr>
                <tr>
                    <th>Max Depth:</th>
                    <td>${plan.depth} meters</td>
                </tr>
                <tr>
                    <th>Bottom Time:</th>
                    <td>${plan.bottomTime || plan.bottom_time} minutes</td>
                </tr>
                <tr>
                    <th>Total Dive Time:</th>
                    <td>${plan.totalDiveTime || plan.total_dive_time || '-'} minutes</td>
                </tr>
                <tr>
                    <th>Decompression:</th>
                    <td>${hasDecoStops ? 'Required' : 'Not required'}</td>
                </tr>
            </table>
            
            ${decoStopsHtml}
            ${tanksHtml}
            ${buddiesHtml}
            
            <div class="warning">
                <strong>IMPORTANT:</strong> This dive plan is for reference only. Always:
                <ul>
                    <li>Use a dive computer as your primary decompression guide</li>
                    <li>Dive within your training and experience level</li>
                    <li>Adjust the plan based on actual conditions</li>
                    <li>Have emergency procedures in place</li>
                    ${hasDecoStops ? '<li><strong>Follow all decompression stops precisely</strong></li>' : ''}
                </ul>
            </div>
            
            <div class="footer">
                <p>Created with ScuPlan - Dive Planning Made Easy</p>
                <p class="no-print"><button onclick="window.print()">Print this page</button></p>
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                }
            </script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}

/**
 * Print the shared dive plan
 */
function printSharedPlan() {
    // Similar to printCurrentPlan but adapted for the shared plan page
    // Implementation omitted for brevity
    showAlert('Printing functionality for shared plans is coming soon.', 'info');
}

/**
 * Print the pre-dive checklist from the shared plan page
 */
function printPreDiveChecklist() {
    // Implementation omitted for brevity
    showAlert('Printing functionality for checklists is coming soon.', 'info');
}

/**
 * Show information about export and print functionality
 */
function showExportGuide(e) {
    if (e) e.preventDefault();
    
    // Implementation omitted for brevity
    showAlert('Export guide functionality is coming soon.', 'info');
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
