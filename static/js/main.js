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
    if (typeof initTankManagement === 'function') {
        initTankManagement();
    }
    
    if (typeof initBuddyManagement === 'function') {
        initBuddyManagement();
    }
    
    // Check for pending saved plan loads
    if (typeof checkPendingPlanLoad === 'function') {
        checkPendingPlanLoad();
    }
    
    if (typeof initDonationFeatures === 'function') {
        initDonationFeatures();
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Check for offline status
    checkOfflineStatus();
    
    // Check for parameters in the URL for imported plans
    checkForImportedPlan();
}

/**
 * Set up all event listeners for the application
 */
function setupEventListeners() {
    // Calculate button
    const calculateButton = document.getElementById('calculateButton');
    if (calculateButton) {
        calculateButton.addEventListener('click', calculateDivePlan);
    }
    
    // Save offline button
    const saveOfflineButton = document.getElementById('saveOfflineButton');
    if (saveOfflineButton) {
        saveOfflineButton.addEventListener('click', saveCurrentPlanOffline);
    }
    
    // New plan button
    const newPlanButton = document.getElementById('newPlanButton');
    if (newPlanButton) {
        newPlanButton.addEventListener('click', resetDivePlan);
    }
    
    // Print button
    const printButton = document.getElementById('printButton');
    if (printButton) {
        printButton.addEventListener('click', printDivePlan);
    }
    
    // Share button
    const shareButton = document.getElementById('shareButton');
    if (shareButton) {
        shareButton.addEventListener('click', shareDivePlan);
    }
    
    // Offline status event listeners
    window.addEventListener('online', checkOfflineStatus);
    window.addEventListener('offline', checkOfflineStatus);
}

/**
 * Calculate the dive plan based on current parameters
 */
function calculateDivePlan() {
    // Show the loading state
    const initialStateContainer = document.getElementById('initialStateContainer');
    const loadingStateContainer = document.getElementById('loadingStateContainer');
    const resultsContainer = document.getElementById('resultsContainer');
    
    if (initialStateContainer) initialStateContainer.style.display = 'none';
    if (loadingStateContainer) loadingStateContainer.style.display = 'block';
    if (resultsContainer) resultsContainer.style.display = 'none';
    
    // Get form values
    const diveType = document.getElementById('diveType').value;
    const depth = parseFloat(document.getElementById('depth').value);
    const bottomTime = parseFloat(document.getElementById('bottomTime').value);
    const location = document.getElementById('location').value;
    const diveDate = document.getElementById('diveDate').value;
    const diveTime = document.getElementById('diveTime').value;
    
    // Validate inputs
    if (isNaN(depth) || isNaN(bottomTime)) {
        showAlert('Please enter valid depth and bottom time values', 'danger');
        if (initialStateContainer) initialStateContainer.style.display = 'block';
        if (loadingStateContainer) loadingStateContainer.style.display = 'none';
        return;
    }
    
    // Check if we have at least one tank added
    if (app.tanks.length === 0) {
        showAlert('Please add at least one tank', 'warning');
        if (initialStateContainer) initialStateContainer.style.display = 'block';
        if (loadingStateContainer) loadingStateContainer.style.display = 'none';
        return;
    }
    
    // Basic plan data
    const planData = {
        diveType: diveType,
        depth: depth,
        bottomTime: bottomTime,
        location: location,
        diveDate: diveDate,
        diveTime: diveTime,
        tanks: app.tanks,
        buddies: app.buddies
    };
    
    // Use the API if online, otherwise use offline calculation
    if (!app.isOffline) {
        // Call API to calculate plan
        fetch('/api/dive-plan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
            app.currentPlan = data;
            updateDivePlanResults(data);
        })
        .catch(error => {
            console.error('Error calculating dive plan:', error);
            showAlert('Failed to calculate dive plan. Using offline mode.', 'warning');
            
            // Fallback to offline calculation
            const offlinePlan = calculateOfflineDivePlan(planData);
            app.currentPlan = offlinePlan;
            updateDivePlanResults(offlinePlan);
        });
    } else {
        // Use offline calculation
        const offlinePlan = calculateOfflineDivePlan(planData);
        app.currentPlan = offlinePlan;
        updateDivePlanResults(offlinePlan);
    }
}

/**
 * Update the UI with dive plan results
 * @param {Object} data - The calculated dive plan data
 */
function updateDivePlanResults(data) {
    // Hide loading, show results
    const loadingStateContainer = document.getElementById('loadingStateContainer');
    const resultsContainer = document.getElementById('resultsContainer');
    
    if (loadingStateContainer) loadingStateContainer.style.display = 'none';
    if (resultsContainer) resultsContainer.style.display = 'block';
    
    // Update summary values
    const totalDiveTime = document.getElementById('totalDiveTime');
    const maxDepth = document.getElementById('maxDepth');
    const decompressionStatus = document.getElementById('decompressionStatus');
    
    if (totalDiveTime) totalDiveTime.textContent = `${data.totalDiveTime} min`;
    if (maxDepth) maxDepth.textContent = `${data.depth} m`;
    
    // Update decompression status
    const isDecoRequired = data.decoLevels && data.decoLevels.length > 0;
    if (decompressionStatus) {
        decompressionStatus.textContent = isDecoRequired ? 'Required' : 'No-Stop';
        decompressionStatus.className = isDecoRequired ? 'result-value text-warning' : 'result-value text-success';
    }
    
    // Update decompression stops section
    const decompressionStopsSection = document.getElementById('decompressionStopsSection');
    if (decompressionStopsSection) {
        if (isDecoRequired) {
            decompressionStopsSection.style.display = 'block';
            
            // Populate deco stops table
            const decoStopsTable = document.getElementById('decoStopsTable');
            const tbody = decoStopsTable.querySelector('tbody');
            tbody.innerHTML = '';
            
            // Create the stops rows
            for (let i = 0; i < data.decoLevels.length; i++) {
                const depth = data.decoLevels[i];
                const time = data.decoTimes[i];
                
                // Find the appropriate gas
                let gas = "Air";
                
                if (app.tanks.length > 1) {
                    // Find best gas for this depth (highest O2 that's safe at this depth)
                    const decoGas = findBestDecoGas(depth);
                    if (decoGas) {
                        gas = `${decoGas.gasType.charAt(0).toUpperCase() + decoGas.gasType.slice(1)} ${decoGas.o2_percentage}%`;
                        if (decoGas.he_percentage > 0) {
                            gas += `/${decoGas.he_percentage}%`;
                        }
                    }
                }
                
                const row = `
                    <tr>
                        <td>${depth}</td>
                        <td>${time}</td>
                        <td>${gas}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            }
        } else {
            decompressionStopsSection.style.display = 'none';
        }
    }
    
    // Display buddy information
    updateBuddyInfoDisplay();
    
    // Update safety notes
    updateSafetyNotes();
    
    // Calculate and update gas consumption
    calculateGasConsumption();
    
    // Draw the dive profile chart
    drawDiveProfile();
}

/**
 * Update the buddy information display in results
 */
function updateBuddyInfoDisplay() {
    const plannedBuddiesInfo = document.getElementById('plannedBuddiesInfo');
    const buddiesList = document.getElementById('buddiesList');
    
    if (plannedBuddiesInfo && buddiesList) {
        if (app.buddies && app.buddies.length > 0) {
            plannedBuddiesInfo.style.display = 'block';
            
            let buddyHtml = '';
            app.buddies.forEach(buddy => {
                // Get readable values for certifications and skill levels
                const certification = getCertificationLabel(buddy.certification);
                const skillLevel = getSkillLevelLabel(buddy.skillLevel);
                const specialty = buddy.specialty === 'none' ? 'None' : 
                                 buddy.specialty.charAt(0).toUpperCase() + buddy.specialty.slice(1);
                
                buddyHtml += `
                    <div class="buddy-info-block mb-2 p-2 border-bottom">
                        <div class="fw-bold">${buddy.name}</div>
                        <div class="small">${certification}</div>
                        <div class="small">Skill: ${skillLevel}</div>
                        ${specialty !== 'None' ? `<div class="small">Specialty: ${specialty}</div>` : ''}
                    </div>
                `;
            });
            buddiesList.innerHTML = buddyHtml;
        } else {
            plannedBuddiesInfo.style.display = 'none';
        }
    }
}

/**
 * Update the safety notes based on the current dive plan
 */
function updateSafetyNotes() {
    const safetyNotesList = document.getElementById('safetyNotesList');
    if (!safetyNotesList) return;
    
    // Clear existing notes
    safetyNotesList.innerHTML = '';
    
    // Default safety notes
    const safetyNotes = [
        "Always perform a safety stop at 5m for 3 minutes, even for no-decompression dives",
        "Remember to monitor your gauges and computer regularly during the dive",
        "Maintain proper buoyancy control throughout the dive"
    ];
    
    // Add depth-specific notes
    const depth = app.currentPlan ? app.currentPlan.depth : 0;
    if (depth > 30) {
        safetyNotes.push("This is a deep dive. Ensure you have appropriate deep diving certification");
        safetyNotes.push("Be extra vigilant about gas consumption and decompression obligations");
    }
    
    // Add deco-specific notes
    const isDecoRequired = app.currentPlan && app.currentPlan.decoLevels && app.currentPlan.decoLevels.length > 0;
    if (isDecoRequired) {
        safetyNotes.push("This is a decompression dive. Ensure you have appropriate training");
        safetyNotes.push("Carry backup decompression tables and timing devices");
        safetyNotes.push("Consider carrying additional gas reserves for emergencies");
    }
    
    // Add buddy-specific notes
    if (app.buddies.length === 0) {
        safetyNotes.push("No buddies added. Remember that solo diving requires specific training and equipment");
    } else {
        // Check if any buddies have insufficient certification for this dive
        const isDeepDive = depth > 18;
        const isVeryDeepDive = depth > 30;
        
        app.buddies.forEach(buddy => {
            if (isVeryDeepDive && buddy.certification === 'OW') {
                safetyNotes.push(`Buddy ${buddy.name} has Open Water certification, which is not suitable for dives beyond 18m`);
            } else if (isDeepDive && buddy.certification === 'OW') {
                safetyNotes.push(`Buddy ${buddy.name} has Open Water certification, recommended depth limit is 18m`);
            }
            
            if (isDecoRequired && (buddy.certification === 'OW' || buddy.certification === 'AOW')) {
                safetyNotes.push(`Buddy ${buddy.name} may not have decompression dive training/certification`);
            }
        });
    }
    
    // Add gas-specific notes
    if (app.tanks.length > 0) {
        // Check if gas is appropriate for the dive depth
        app.tanks.forEach((tank, index) => {
            if (tank.gasType === 'nitrox' || tank.gasType === 'trimix' || tank.gasType === 'heliox') {
                safetyNotes.push(`Tank ${index + 1} contains ${getGasLabel(tank)}. Verify MOD before diving`);
                
                // Check if O2 % is too high for the depth
                const po2 = calculatePO2(depth, tank.o2_percentage / 100);
                if (po2 > 1.4) {
                    safetyNotes.push(`WARNING: Tank ${index + 1} has oxygen toxicity risk at planned depth (pO2: ${po2.toFixed(2)})`);
                }
            }
        });
    }
    
    // Add the notes to the list
    safetyNotes.forEach(note => {
        const li = document.createElement('li');
        li.textContent = note;
        safetyNotesList.appendChild(li);
    });
}

/**
 * Draw the dive profile chart
 */
function drawDiveProfile() {
    if (!app.currentPlan) return;
    
    // Generate profile data
    const profileData = generateDiveProfileData(app.currentPlan);
    
    // Call chart.js function if available
    if (typeof drawDiveProfileChart === 'function') {
        drawDiveProfileChart(profileData);
    } else {
        console.error('Dive profile chart function not available');
    }
}

/**
 * Generate dive profile data points for the chart
 * @param {Object} plan - The dive plan data
 * @returns {Object} Chart data object
 */
function generateDiveProfileData(plan) {
    const depth = plan.depth;
    const bottomTime = plan.bottomTime;
    const descentRate = 20; // meters per minute
    const ascentRate = 10;  // meters per minute
    
    // Calculate times
    const descentTime = depth / descentRate;
    const ascentTime = depth / ascentRate;
    
    // Create data points
    const labels = [];
    const depths = [];
    
    // Surface
    labels.push(0);
    depths.push(0);
    
    // Descent
    labels.push(descentTime);
    depths.push(depth);
    
    // Bottom time
    labels.push(descentTime + bottomTime);
    depths.push(depth);
    
    // Add deco stops if any
    if (plan.decoLevels && plan.decoLevels.length > 0) {
        let currentTime = descentTime + bottomTime;
        let currentDepth = depth;
        
        // Calculate time to first stop
        const firstStopDepth = parseInt(plan.decoLevels[0]);
        const timeToFirstStop = (currentDepth - firstStopDepth) / ascentRate;
        
        currentTime += timeToFirstStop;
        currentDepth = firstStopDepth;
        
        labels.push(currentTime);
        depths.push(currentDepth);
        
        // Add each deco stop
        for (let i = 0; i < plan.decoLevels.length; i++) {
            const stopDepth = parseInt(plan.decoLevels[i]);
            const stopTime = parseInt(plan.decoTimes[i]);
            
            // Add point at end of stop time
            currentTime += stopTime;
            labels.push(currentTime);
            depths.push(stopDepth);
            
            // If not the last stop, add point for next stop
            if (i < plan.decoLevels.length - 1) {
                const nextStopDepth = parseInt(plan.decoLevels[i + 1]);
                const timeToNextStop = (stopDepth - nextStopDepth) / ascentRate;
                
                currentTime += timeToNextStop;
                currentDepth = nextStopDepth;
                
                labels.push(currentTime);
                depths.push(currentDepth);
            } else {
                // After last stop, add safety stop at 5m if not already there
                if (stopDepth !== 5) {
                    // Time to safety stop
                    const timeToSafetyStop = (stopDepth - 5) / ascentRate;
                    currentTime += timeToSafetyStop;
                    
                    labels.push(currentTime);
                    depths.push(5);
                    
                    // 3 minute safety stop
                    currentTime += 3;
                    labels.push(currentTime);
                    depths.push(5);
                } else {
                    // If last stop is already at 5m, just ensure it's at least 3 minutes
                    if (stopTime < 3) {
                        // Add additional safety stop time
                        currentTime += (3 - stopTime);
                        labels.push(currentTime);
                        depths.push(5);
                    }
                }
                
                // Final ascent to surface
                const finalAscentTime = 5 / ascentRate;
                currentTime += finalAscentTime;
            }
        }
    } else {
        // No deco stops, add safety stop at 5m
        const timeToSafetyStop = (depth - 5) / ascentRate;
        const safetyStopTime = 3; // minutes
        
        // Add safety stop start point
        labels.push(descentTime + bottomTime + timeToSafetyStop);
        depths.push(5);
        
        // Add safety stop end point
        labels.push(descentTime + bottomTime + timeToSafetyStop + safetyStopTime);
        depths.push(5);
    }
    
    // Surface (end of dive)
    const totalTime = app.currentPlan.totalDiveTime || 
                      (descentTime + bottomTime + ascentTime + (plan.decoLevels ? plan.decoTimes.reduce((a, b) => a + parseInt(b), 0) : 3));
    
    labels.push(totalTime);
    depths.push(0);
    
    // Create the profile object
    return {
        labels: labels,
        depths: depths,
        bottomTime: bottomTime,
        descentTime: descentTime,
        ascentTime: ascentTime,
        totalTime: totalTime,
        decoStops: plan.decoLevels ? plan.decoLevels.map((level, i) => {
            return {
                depth: parseInt(level),
                time: parseInt(plan.decoTimes[i])
            };
        }) : []
    };
}

/**
 * Calculate gas consumption for the current dive plan
 */
function calculateGasConsumption() {
    if (!app.currentPlan || app.tanks.length === 0) return;
    
    const gasConsumptionTable = document.getElementById('gasConsumptionTable');
    const tbody = gasConsumptionTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    // Try to use the API if online
    if (!app.isOffline) {
        fetch('/api/gas-consumption', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                depth: app.currentPlan.depth,
                bottomTime: app.currentPlan.bottomTime,
                totalTime: app.currentPlan.totalDiveTime,
                decoLevels: app.currentPlan.decoLevels,
                decoTimes: app.currentPlan.decoTimes,
                tanks: app.tanks
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayGasConsumptionResults(data);
        })
        .catch(error => {
            console.error('Error calculating gas consumption:', error);
            
            // Fall back to simple calculation
            const consumption = calculateOfflineGasConsumption({
                depth: app.currentPlan.depth,
                bottomTime: app.currentPlan.bottomTime,
                totalTime: app.currentPlan.totalDiveTime,
                tanks: app.tanks
            });
            
            displayGasConsumptionResults(consumption);
        });
    } else {
        // Use offline calculation
        const consumption = calculateOfflineGasConsumption({
            depth: app.currentPlan.depth,
            bottomTime: app.currentPlan.bottomTime,
            totalTime: app.currentPlan.totalDiveTime,
            tanks: app.tanks
        });
        
        displayGasConsumptionResults(consumption);
    }
}

/**
 * Display gas consumption results in the UI
 * @param {Array} consumptionData - Gas consumption data for each tank
 */
function displayGasConsumptionResults(consumptionData) {
    const gasConsumptionTable = document.getElementById('gasConsumptionTable');
    if (!gasConsumptionTable) return;
    
    const tbody = gasConsumptionTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    // Add rows for each tank
    consumptionData.forEach((tank, index) => {
        const row = document.createElement('tr');
        
        // Format gas label
        let gasLabel = 'Air';
        if (tank.gasType === 'nitrox') {
            gasLabel = `Nitrox ${tank.o2_percentage}%`;
        } else if (tank.gasType === 'trimix') {
            gasLabel = `Trimix ${tank.o2_percentage}/${tank.he_percentage}`;
        } else if (tank.gasType === 'heliox') {
            gasLabel = `Heliox ${tank.o2_percentage}/${tank.he_percentage}`;
        }
        
        row.innerHTML = `
            <td>${index + 1}: ${gasLabel}</td>
            <td>${tank.size}L</td>
            <td>${tank.startPressure} bar</td>
            <td>${tank.endPressure} bar</td>
            <td>${(tank.startPressure - tank.endPressure).toFixed(1)} bar</td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Draw gas consumption chart if available
    if (typeof drawGasConsumptionChart === 'function') {
        drawGasConsumptionChart(consumptionData, 'gasConsumptionChart');
    }
}

/**
 * Find the best decompression gas mix for a given depth
 * @param {number} depth - The depth in meters
 * @returns {Object|null} - The best tank to use or null
 */
function findBestDecoGas(depth) {
    if (app.tanks.length <= 1) {
        return null;
    }
    
    // Sort tanks by descending O2 content
    const sortedTanks = [...app.tanks].sort((a, b) => {
        return b.o2_percentage - a.o2_percentage;
    });
    
    // Find the highest O2 mix that's safe at this depth
    for (const tank of sortedTanks) {
        // Calculate the MOD (Maximum Operating Depth)
        const o2Fraction = tank.o2_percentage / 100;
        const mod = (1.4 / o2Fraction - 1) * 10;
        
        if (depth <= mod) {
            return tank;
        }
    }
    
    // If no suitable tank, return the one with the lowest O2
    return sortedTanks[sortedTanks.length - 1];
}

/**
 * Save the current plan to offline storage
 */
function saveCurrentPlanOffline() {
    if (!app.currentPlan) {
        showAlert('No dive plan to save', 'warning');
        return;
    }
    
    // Save the plan
    if (typeof saveDivePlanOffline === 'function') {
        const plan = saveDivePlanOffline(app.currentPlan);
        showAlert('Dive plan saved for offline use', 'success');
    } else {
        showAlert('Offline storage functionality not available', 'danger');
    }
}

/**
 * Reset the dive planner form
 */
function resetDivePlan() {
    // Reset form values
    document.getElementById('diveType').value = 'recreational';
    document.getElementById('depth').value = '18';
    document.getElementById('bottomTime').value = '40';
    document.getElementById('location').value = '';
    document.getElementById('diveDate').value = '';
    document.getElementById('diveTime').value = '';
    
    // Clear tanks and buddies
    app.tanks = [];
    app.buddies = [];
    
    // Update displays
    updateTanksDisplay();
    updateBuddiesDisplay();
    
    // Hide results, show initial state
    const initialStateContainer = document.getElementById('initialStateContainer');
    const resultsContainer = document.getElementById('resultsContainer');
    
    if (initialStateContainer) initialStateContainer.style.display = 'block';
    if (resultsContainer) resultsContainer.style.display = 'none';
    
    app.currentPlan = null;
    
    showAlert('Dive planner reset', 'info');
}

/**
 * Print the current dive plan
 */
function printDivePlan() {
    if (!app.currentPlan) {
        showAlert('No dive plan to print', 'warning');
        return;
    }
    
    // Open a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Generate print content
    const printContent = generatePrintableContent();
    
    // Set the content of the new window
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for resources to load then print
    printWindow.onload = function() {
        printWindow.print();
        // printWindow.close();
    };
}

/**
 * Generate printable HTML content for the dive plan
 * @returns {string} HTML content for printing
 */
function generatePrintableContent() {
    // Get plan data
    const plan = app.currentPlan;
    const date = plan.diveDate ? new Date(plan.diveDate).toLocaleDateString() : 'Not specified';
    const time = plan.diveTime || 'Not specified';
    
    // Format decompression data
    let decoHtml = '';
    if (plan.decoLevels && plan.decoLevels.length > 0) {
        decoHtml = `
            <div class="deco-section">
                <h3>Decompression Schedule</h3>
                <table class="deco-table">
                    <thead>
                        <tr>
                            <th>Depth (m)</th>
                            <th>Time (min)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${plan.decoLevels.map((depth, i) => `
                            <tr>
                                <td>${depth}</td>
                                <td>${plan.decoTimes[i]}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else {
        decoHtml = `
            <div class="deco-section">
                <h3>Decompression</h3>
                <p>No-Stop Dive. Safety stop at 5m for 3 minutes recommended.</p>
            </div>
        `;
    }
    
    // Format tanks data
    const tanksHtml = app.tanks.map((tank, i) => {
        let gasLabel = 'Air';
        if (tank.gasType === 'nitrox') {
            gasLabel = `Nitrox ${tank.o2_percentage}%`;
        } else if (tank.gasType === 'trimix') {
            gasLabel = `Trimix ${tank.o2_percentage}/${tank.he_percentage}`;
        } else if (tank.gasType === 'heliox') {
            gasLabel = `Heliox ${tank.o2_percentage}/${tank.he_percentage}`;
        }
        
        return `
            <div class="tank-item">
                <strong>Tank ${i+1}:</strong> ${tank.size}L at ${tank.pressure} bar, ${gasLabel}
            </div>
        `;
    }).join('');
    
    // Format buddies data
    const buddiesHtml = app.buddies.length > 0 ? 
        app.buddies.map(buddy => {
            return `
                <div class="buddy-item">
                    <strong>${buddy.name}</strong> - ${getCertificationLabel(buddy.certification)}, 
                    ${getSkillLevelLabel(buddy.skillLevel)}
                    ${buddy.specialty !== 'none' ? `, Specialty: ${buddy.specialty}` : ''}
                </div>
            `;
        }).join('') : 
        '<p>No buddies specified</p>';
    
    // Create the HTML content
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Dive Plan: ${plan.location || 'Unnamed Dive'}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                h1 {
                    color: #0066cc;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 10px;
                }
                h2 {
                    color: #0066cc;
                    margin-top: 20px;
                }
                h3 {
                    color: #0066cc;
                    margin-top: 15px;
                    font-size: 16px;
                }
                .summary-data {
                    display: flex;
                    flex-wrap: wrap;
                    margin: 20px 0;
                }
                .summary-item {
                    width: 25%;
                    padding: 10px;
                    box-sizing: border-box;
                }
                .summary-label {
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2;
                }
                .safety-notes {
                    background-color: #fff3cd;
                    border: 1px solid #ffeeba;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 4px;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 12px;
                    color: #777;
                    border-top: 1px solid #ddd;
                    padding-top: 10px;
                }
                .tank-item, .buddy-item {
                    margin-bottom: 8px;
                }
                @media print {
                    body { 
                        padding: 0; 
                        font-size: 12px;
                    }
                    h1 { font-size: 18px; }
                    h2 { font-size: 16px; }
                    h3 { font-size: 14px; }
                }
            </style>
        </head>
        <body>
            <h1>Dive Plan: ${plan.location || 'Unnamed Dive'}</h1>
            
            <div class="summary-data">
                <div class="summary-item">
                    <div class="summary-label">Dive Type</div>
                    <div>${plan.diveType.charAt(0).toUpperCase() + plan.diveType.slice(1)}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Date</div>
                    <div>${date}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Time</div>
                    <div>${time}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Location</div>
                    <div>${plan.location || 'Not specified'}</div>
                </div>
            </div>
            
            <h2>Dive Profile</h2>
            <div class="summary-data">
                <div class="summary-item">
                    <div class="summary-label">Maximum Depth</div>
                    <div>${plan.depth} meters</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Bottom Time</div>
                    <div>${plan.bottomTime} minutes</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Total Dive Time</div>
                    <div>${plan.totalDiveTime} minutes</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Decompression</div>
                    <div>${plan.decoLevels && plan.decoLevels.length > 0 ? 'Required' : 'No-Stop'}</div>
                </div>
            </div>
            
            ${decoHtml}
            
            <h2>Equipment</h2>
            <div class="tanks-section">
                <h3>Tanks</h3>
                ${tanksHtml}
            </div>
            
            <h2>Dive Team</h2>
            <div class="buddies-section">
                <h3>Buddies</h3>
                ${buddiesHtml}
            </div>
            
            <div class="safety-notes">
                <h3>Safety Notes</h3>
                <ul>
                    <li>Always perform a safety stop at 5m for 3 minutes, even for no-decompression dives</li>
                    <li>Remember to monitor your gauges and computer regularly during the dive</li>
                    <li>Maintain proper buoyancy control throughout the dive</li>
                    ${plan.depth > 30 ? '<li>This is a deep dive. Ensure you have appropriate certification</li>' : ''}
                    ${plan.decoLevels && plan.decoLevels.length > 0 ? 
                        '<li>This is a decompression dive. Ensure you have appropriate training</li>' : ''}
                </ul>
            </div>
            
            <div class="footer">
                <p>Generated by ScuPlan on ${new Date().toLocaleString()}</p>
                <p>Use this plan responsibly. Always dive within your training and certification limits.</p>
            </div>
        </body>
        </html>
    `;
}

/**
 * Share the current dive plan
 */
function shareDivePlan() {
    if (!app.currentPlan) {
        showAlert('No dive plan to share', 'warning');
        return;
    }
    
    // Show loading in the share button
    const shareButton = document.getElementById('shareButton');
    const originalContent = shareButton.innerHTML;
    shareButton.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Sharing...';
    shareButton.disabled = true;
    
    // Call the API to get a shareable link
    fetch('/api/share-plan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(app.currentPlan)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Reset the share button
        shareButton.innerHTML = originalContent;
        shareButton.disabled = false;
        
        // Show the share modal with the link
        showShareModal(data.share_url);
    })
    .catch(error => {
        console.error('Error sharing dive plan:', error);
        
        // Reset the share button
        shareButton.innerHTML = originalContent;
        shareButton.disabled = false;
        
        showAlert('Failed to generate share link. Try again later.', 'danger');
    });
}

/**
 * Show the share modal with the shareable link
 * @param {string} shareUrl - The shareable URL
 */
function showShareModal(shareUrl) {
    const sharePlanModal = document.getElementById('sharePlanModal');
    const shareLinkInput = document.getElementById('shareLinkInput');
    
    if (sharePlanModal && shareLinkInput) {
        // Set the link in the input field
        shareLinkInput.value = shareUrl;
        
        // Generate QR code if the library is available
        const shareQRCode = document.getElementById('shareQRCode');
        if (shareQRCode && typeof QRCode !== 'undefined') {
            shareQRCode.innerHTML = '';
            new QRCode(shareQRCode, {
                text: shareUrl,
                width: 128,
                height: 128,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
        }
        
        // Set up the copy button
        const copyShareLinkBtn = document.getElementById('copyShareLinkBtn');
        if (copyShareLinkBtn) {
            copyShareLinkBtn.addEventListener('click', function() {
                shareLinkInput.select();
                document.execCommand('copy');
                
                // Change button text temporarily
                const originalText = copyShareLinkBtn.innerHTML;
                copyShareLinkBtn.innerHTML = '<i class="fas fa-check me-1"></i> Copied!';
                
                setTimeout(() => {
                    copyShareLinkBtn.innerHTML = originalText;
                }, 2000);
            });
        }
        
        // Set up email sharing
        const shareEmailBtn = document.getElementById('shareEmailBtn');
        if (shareEmailBtn) {
            shareEmailBtn.addEventListener('click', function() {
                const subject = encodeURIComponent(`Dive Plan: ${app.currentPlan.location || 'Unnamed Dive'}`);
                const body = encodeURIComponent(`Check out this dive plan I created with ScuPlan!\n\n` + 
                                              `Dive Location: ${app.currentPlan.location || 'Not specified'}\n` +
                                              `Depth: ${app.currentPlan.depth}m\n` +
                                              `Bottom Time: ${app.currentPlan.bottomTime} minutes\n` +
                                              `Total Dive Time: ${app.currentPlan.totalDiveTime} minutes\n\n` +
                                              `View the complete plan here: ${shareUrl}`);
                
                window.location.href = `mailto:?subject=${subject}&body=${body}`;
            });
        }
        
        // Show the modal
        const modal = new bootstrap.Modal(sharePlanModal);
        modal.show();
    }
}

/**
 * Check for offline status and update UI accordingly
 */
function checkOfflineStatus() {
    app.isOffline = !navigator.onLine;
    const offlineIndicator = document.getElementById('offlineIndicator');
    
    if (offlineIndicator) {
        if (app.isOffline) {
            offlineIndicator.style.display = 'block';
        } else {
            offlineIndicator.style.display = 'none';
        }
    }
}

/**
 * Helper function to show alerts
 * @param {string} message - Alert message
 * @param {string} type - Alert type (success, info, warning, danger)
 */
function showAlert(message, type = 'info') {
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertContainer.style.zIndex = '1050';
    alertContainer.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertContainer);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        try {
            const bsAlert = new bootstrap.Alert(alertContainer);
            bsAlert.close();
        } catch (error) {
            // If the alert was already removed, this will throw an error
            console.log('Alert already removed');
        }
    }, 5000);
}

/**
 * Helper function to get certification label
 * @param {string} certCode - Certification code
 * @returns {string} Readable certification label
 */
function getCertificationLabel(certCode) {
    const certMap = {
        'OW': 'Open Water',
        'AOW': 'Advanced Open Water',
        'Rescue': 'Rescue Diver',
        'DM': 'Divemaster',
        'Instructor': 'Instructor',
        'TecBasic': 'Technical Basic',
        'TecAdv': 'Technical Advanced',
        'TecInstructor': 'Technical Instructor',
        'Other': 'Other'
    };
    
    return certMap[certCode] || certCode;
}

/**
 * Helper function to get skill level label
 * @param {string} skillCode - Skill level code
 * @returns {string} Readable skill level label
 */
function getSkillLevelLabel(skillCode) {
    const skillMap = {
        'beginner': 'Beginner (< 20 dives)',
        'intermediate': 'Intermediate (20-100 dives)',
        'experienced': 'Experienced (100-500 dives)',
        'expert': 'Expert (> 500 dives)'
    };
    
    return skillMap[skillCode] || skillCode;
}

/**
 * Calculate partial pressure of oxygen at a given depth
 * @param {number} depth - Depth in meters
 * @param {number} o2Fraction - Oxygen fraction (0.0-1.0)
 * @returns {number} Partial pressure of oxygen (pO2)
 */
function calculatePO2(depth, o2Fraction) {
    const atmosphericPressure = 1; // 1 bar at surface
    const pressurePerDepth = 0.1; // 0.1 bar per meter
    
    const absolutePressure = atmosphericPressure + (depth * pressurePerDepth);
    return absolutePressure * o2Fraction;
}

/**
 * Initialize the application when the document is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize offline status checking
    checkOfflineStatus();
    
    // On pages other than the main planner, we still need to check for
    // page-specific initialization functions
    
    // Check if on the saved plans page
    if (window.location.pathname === '/saved-plans') {
        if (typeof initSavedPlans === 'function') {
            initSavedPlans();
        }
    }
    
    // Check if we're on the technical diving page
    if (window.location.pathname === '/technical') {
        if (typeof initTechnicalTools === 'function') {
            initTechnicalTools();
        }
    }
    
    // Check if we're on the checklists page
    if (window.location.pathname === '/checklist') {
        if (typeof initChecklists === 'function') {
            initChecklists();
        }
    }
});
