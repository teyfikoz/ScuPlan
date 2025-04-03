/**
 * ScuPlan - Tank Management Module
 * Handles all functionality related to dive tanks and gas management
 */

/**
 * Initialize tank management functionality
 */
function initTankManagement() {
    console.log('Initializing tank management module');
    
    // Reset tanks array if needed
    if (!app.tanks) {
        app.tanks = [];
    }
    
    // Set up gas type change handler
    const gasTypeSelect = document.getElementById('gasType');
    if (gasTypeSelect) {
        gasTypeSelect.addEventListener('change', handleGasTypeChange);
    }
    
    // Display any existing tanks
    updateTanksDisplay();
}

/**
 * Show the modal to add a new tank
 */
function showAddTankModal() {
    // Reset the form
    document.getElementById('tankForm').reset();
    
    // Reset modal title
    document.getElementById('tankModalLabel').textContent = 'Add Tank';
    
    // Reset gas type display
    handleGasTypeChange();
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('tankModal'));
    modal.show();
    app.modalInstance = modal;
}

/**
 * Show the modal to edit an existing tank
 * @param {number} index - Index of the tank to edit
 */
function showEditTankModal(index) {
    // Get the tank data
    const tank = app.tanks[index];
    
    // Fill the form with existing data
    document.getElementById('tankSize').value = tank.size;
    document.getElementById('tankPressure').value = tank.pressure;
    document.getElementById('gasType').value = tank.gasType;
    
    // Set O2 and He values
    document.getElementById('oxygenPercentage').value = tank.o2;
    if (document.getElementById('heliumPercentage')) {
        document.getElementById('heliumPercentage').value = tank.he || 0;
    }
    
    // Handle gas type display
    handleGasTypeChange();
    
    // Set data attribute for the save button
    document.getElementById('saveTankButton').setAttribute('data-edit-index', index);
    
    // Update modal title
    document.getElementById('tankModalLabel').textContent = 'Edit Tank';
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('tankModal'));
    modal.show();
    app.modalInstance = modal;
}

/**
 * Handle changes to the gas type selection
 */
function handleGasTypeChange() {
    const gasTypeSelect = document.getElementById('gasType');
    if (!gasTypeSelect) return; // Element doesn't exist
    
    const gasType = gasTypeSelect.value;
    const heliumContainer = document.getElementById('heliumContainer');
    const oxygenInput = document.getElementById('oxygenPercentage');
    const helperContainer = document.getElementById('gasTypeHelper');
    
    if (!heliumContainer || !oxygenInput) return; // Elements don't exist
    
    // Show/hide helium input based on gas type
    if (gasType === 'trimix') {
        heliumContainer.style.display = 'block';
    } else {
        heliumContainer.style.display = 'none';
    }
    
    // Reset helper text initially
    if (helperContainer) {
        helperContainer.innerHTML = '';
    }
    
    // Set appropriate oxygen ranges based on gas type
    if (gasType === 'air') {
        oxygenInput.value = '21';
        oxygenInput.setAttribute('readonly', 'readonly');
        if (helperContainer) {
            helperContainer.innerHTML = '<small class="text-muted">Standard air contains 21% oxygen.</small>';
        }
    } else if (gasType === 'nitrox') {
        oxygenInput.removeAttribute('readonly');
        oxygenInput.min = '22';
        oxygenInput.max = '40';
        if (parseFloat(oxygenInput.value) < 22) oxygenInput.value = '32';
        
        if (helperContainer) {
            helperContainer.innerHTML = '<small class="text-muted">Typical recreational nitrox mixes are 32% or 36% oxygen.</small>';
        }
    } else if (gasType === 'trimix') {
        oxygenInput.removeAttribute('readonly');
        oxygenInput.min = '5';
        oxygenInput.max = '30';
        if (parseFloat(oxygenInput.value) < 5 || parseFloat(oxygenInput.value) > 30) oxygenInput.value = '18';
        
        if (helperContainer) {
            helperContainer.innerHTML = `
                <small class="text-muted">
                    <div class="mb-1">Common Trimix Configurations:</div>
                    <ul class="ps-3 mb-1">
                        <li>Trimix 18/45 - For depths ~45-60m (18% O₂, 45% He)</li>
                        <li>Trimix 15/55 - For depths ~60-75m (15% O₂, 55% He)</li>
                        <li>Trimix 10/70 - For depths ~75-100m (10% O₂, 70% He)</li>
                    </ul>
                    <div>Click for recommended mix for your planned depth.</div>
                </small>
                <button type="button" class="btn btn-sm btn-outline-info mt-1" onclick="suggestBestMix()">
                    <i class="fas fa-calculator me-1"></i> Suggest Mix
                </button>
            `;
        }
    } else if (gasType === 'oxygen') {
        oxygenInput.value = '100';
        oxygenInput.setAttribute('readonly', 'readonly');
        if (helperContainer) {
            helperContainer.innerHTML = '<small class="text-warning">Warning: 100% oxygen has a maximum operating depth of 6 meters.</small>';
        }
    }
}

/**
 * Save tank data from the modal form
 */
function saveTank() {
    // Get form values
    const size = parseFloat(document.getElementById('tankSize').value);
    const pressure = parseFloat(document.getElementById('tankPressure').value);
    const gasType = document.getElementById('gasType').value;
    const o2 = parseFloat(document.getElementById('oxygenPercentage').value);
    const he = gasType === 'trimix' ? parseFloat(document.getElementById('heliumPercentage').value) : 0;
    
    // Validate inputs
    if (isNaN(size) || size <= 0) {
        showAlert('Please enter a valid tank size', 'warning');
        return;
    }
    
    if (isNaN(pressure) || pressure <= 0) {
        showAlert('Please enter a valid tank pressure', 'warning');
        return;
    }
    
    if (isNaN(o2) || o2 < 5 || o2 > 100) {
        showAlert('Please enter a valid oxygen percentage', 'warning');
        return;
    }
    
    if (gasType === 'trimix' && (isNaN(he) || he < 0 || he > 95)) {
        showAlert('Please enter a valid helium percentage', 'warning');
        return;
    }
    
    // Check total gas percentage for trimix
    if (gasType === 'trimix' && (o2 + he > 100)) {
        showAlert('Total gas percentage cannot exceed 100%', 'warning');
        return;
    }
    
    // Create tank object
    const tank = {
        size: size,
        pressure: pressure,
        gasType: gasType,
        o2: o2,
        he: he
    };
    
    // Check if we're editing or adding
    const saveButton = document.getElementById('saveTankButton');
    if (!saveButton) return;
    
    const editIndex = saveButton.getAttribute('data-edit-index');
    
    if (editIndex !== null && editIndex !== undefined) {
        // Update existing tank
        app.tanks[editIndex] = tank;
        saveButton.removeAttribute('data-edit-index');
        
        const tankModalLabel = document.getElementById('tankModalLabel');
        if (tankModalLabel) {
            tankModalLabel.textContent = 'Add Tank';
        }
    } else {
        // Add new tank
        app.tanks.push(tank);
    }
    
    // Update the display
    updateTanksDisplay();
    
    // Close the modal
    if (app.modalInstance) {
        app.modalInstance.hide();
    }
}

/**
 * Remove a tank from the list
 * @param {number} index - Index of the tank to remove
 */
function removeTank(index) {
    if (index >= 0 && index < app.tanks.length) {
        app.tanks.splice(index, 1);
        updateTanksDisplay();
    }
}

/**
 * Calculate Equivalent Narcotic Depth (END) for a given gas mix
 * @param {number} depth - Actual depth in meters
 * @param {number} o2Percent - Oxygen percentage
 * @param {number} hePercent - Helium percentage
 * @returns {number} END in meters
 */
function calculateEND(depth, o2Percent, hePercent = 0) {
    // Convert percentages to decimals
    const fO2 = o2Percent / 100;
    const fHe = hePercent / 100;
    const fN2 = 1 - fO2 - fHe;
    
    // Calculate narcotic effect of nitrogen at depth
    const ambientPressure = (depth / 10) + 1; // in bars
    const n2Narcotic = fN2 * ambientPressure;
    
    // Calculate END
    const end = ((n2Narcotic / 0.79) - 1) * 10;
    
    // Round for display
    return Math.floor(end);
}

/**
 * Update the display of tanks in the interface
 */
function updateTanksDisplay() {
    const container = document.getElementById('tanksContainer');
    const noMessage = document.getElementById('noTanksMessage');
    
    if (!container || !noMessage) return; // Not on a page with tanks display
    
    // Clear current content
    container.innerHTML = '';
    
    // Show/hide the no tanks message
    if (app.tanks.length === 0) {
        noMessage.style.display = 'block';
        return;
    } else {
        noMessage.style.display = 'none';
    }
    
    // Get current depth for END calculations
    const depthInput = document.getElementById('maxDepth');
    const currentDepth = depthInput ? parseFloat(depthInput.value) : 30;
    
    // Add each tank to the display
    app.tanks.forEach((tank, index) => {
        const tankElement = document.createElement('div');
        tankElement.className = 'tank-item mb-3 p-3 bg-light rounded';
        
        // Get gas info string
        let gasInfo = '';
        if (tank.gasType === 'air') {
            gasInfo = 'Air';
        } else if (tank.gasType === 'nitrox') {
            gasInfo = `Nitrox ${tank.o2}% O₂`;
        } else if (tank.gasType === 'trimix') {
            gasInfo = `Trimix ${tank.o2}/${tank.he}`;
        } else if (tank.gasType === 'oxygen') {
            gasInfo = 'Oxygen (100% O₂)';
        }
        
        // Calculate technical diving values
        let techInfo = '';
        
        // MOD for any gas with oxygen
        const mod = calculateMOD(tank.o2);
        techInfo += `<div class="small ${mod < currentDepth ? 'text-danger fw-bold' : ''}">
                      MOD: ${mod}m ${mod < currentDepth ? '⚠️' : ''}
                     </div>`;
        
        // END for trimix
        if (tank.gasType === 'trimix') {
            const end = calculateEND(currentDepth, tank.o2, tank.he);
            techInfo += `<div class="small ${end > 30 ? 'text-warning' : ''}">
                          END at ${currentDepth}m: ${end}m ${end > 30 ? '⚠️' : ''}
                         </div>`;
        }
        
        // Tank volume calculation
        const totalVolume = tank.size * tank.pressure;
        
        tankElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <div class="fw-bold mb-1">Tank ${index + 1}</div>
                    <div class="small mb-1">${tank.size}L @ ${tank.pressure} bar (${totalVolume.toFixed(0)}L gas)</div>
                    <div class="small mb-1">${gasInfo}</div>
                    ${techInfo}
                </div>
                <div>
                    <button type="button" class="btn btn-sm btn-outline-primary me-1 edit-tank-btn" data-index="${index}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger remove-tank-btn" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(tankElement);
    });
    
    // Add event listeners to the buttons
    document.querySelectorAll('.edit-tank-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            showEditTankModal(index);
        });
    });
    
    document.querySelectorAll('.remove-tank-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeTank(index);
        });
    });
}

/**
 * Calculate maximum operating depth for a given O2 percentage
 * @param {number} o2Percent - Oxygen percentage
 * @param {number} ppO2Max - Maximum partial pressure (default 1.4)
 * @returns {number} Maximum operating depth in meters
 */
function calculateMOD(o2Percent, ppO2Max = 1.4) {
    // Convert percentage to decimal
    const fO2 = o2Percent / 100;
    
    // Calculate MOD: (ppO2Max / fO2) - 1 * 10
    const mod = ((ppO2Max / fO2) - 1) * 10;
    
    // Round down to be conservative
    return Math.floor(mod);
}

/**
 * Suggest the best gas mix based on planned dive depth
 */
function suggestBestMix() {
    // Get the planned depth from the dive plan form
    const depthInput = document.getElementById('maxDepth');
    
    if (!depthInput) {
        showAlert('Please enter your planned depth first', 'warning');
        return;
    }
    
    const depth = parseFloat(depthInput.value);
    
    if (isNaN(depth) || depth <= 0) {
        showAlert('Please enter a valid depth', 'warning');
        return;
    }
    
    // Call API to get best mix
    fetch(`/api/technical/best-mix?depth=${depth}&max_po2=1.4&max_end=30`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Fill in the form with the calculated values
            const oxygenInput = document.getElementById('oxygenPercentage');
            const heliumInput = document.getElementById('heliumPercentage');
            
            if (oxygenInput && heliumInput) {
                oxygenInput.value = Math.round(data.o2_percentage);
                heliumInput.value = Math.round(data.he_percentage);
                
                // Show a success message with details
                showAlert(`
                    <strong>Suggested Trimix:</strong><br>
                    ${Math.round(data.o2_percentage)}% O₂, ${Math.round(data.he_percentage)}% He<br>
                    MOD: ${Math.floor(data.mod)}m<br>
                    END at ${depth}m: ${Math.floor(data.end)}m
                `, 'success', 8000);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Failed to calculate best mix', 'danger');
        });
}

/**
 * Calculate gas consumption for a specific tank
 * @param {Object} tank - Tank object with size, pressure, etc.
 * @param {number} depth - Maximum depth in meters
 * @param {number} bottomTime - Bottom time in minutes
 * @param {number} sacRate - Surface air consumption rate in L/min
 * @returns {Object} Gas consumption details
 */
function calculateTankConsumption(tank, depth, bottomTime, sacRate) {
    // Calculation parameters
    const pressureFactor = (depth / 10) + 1;  // Pressure at depth
    const descentRate = 18;                   // m/min
    const ascentRate = 9;                     // m/min
    
    // Calculate times
    const descentTime = depth / descentRate;
    const ascentTime = depth / ascentRate;
    
    // Gas volume in the tank (liters)
    const tankVolume = tank.size * tank.pressure;
    
    // Consumption calculations
    const descentConsumption = sacRate * ((depth / 20) + 1) * descentTime;
    const bottomConsumption = sacRate * pressureFactor * bottomTime;
    const ascentConsumption = sacRate * ((depth / 20) + 1) * ascentTime;
    
    // Total consumption
    const totalConsumption = descentConsumption + bottomConsumption + ascentConsumption;
    
    // Remaining gas
    const remainingVolume = tankVolume - totalConsumption;
    const remainingPressure = remainingVolume / tank.size;
    
    // Safety reserve (1/3 rule)
    const safetyReserve = totalConsumption / 3;
    const safeRemainingVolume = remainingVolume - safetyReserve;
    const safeRemainingPressure = safeRemainingVolume / tank.size;
    
    // Return results
    return {
        tankVolume: tankVolume,
        descentConsumption: descentConsumption,
        bottomConsumption: bottomConsumption,
        ascentConsumption: ascentConsumption,
        totalConsumption: totalConsumption,
        remainingVolume: remainingVolume,
        remainingPressure: remainingPressure,
        safetyReserve: safetyReserve,
        safeRemainingVolume: safeRemainingVolume,
        safeRemainingPressure: safeRemainingPressure
    };
}
