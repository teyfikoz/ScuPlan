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
    if (!tank) return;
    
    // Get the form
    const form = document.getElementById('tankForm');
    if (!form) return;
    
    // Reset the form
    form.reset();
    
    // Set form values from tank data
    document.getElementById('tankSize').value = tank.size;
    document.getElementById('tankPressure').value = tank.pressure;
    document.getElementById('gasType').value = tank.gas_type;
    
    // Set gas percentages based on gas type
    if (tank.gas_type === 'nitrox' || tank.gas_type === 'trimix') {
        document.getElementById('o2Percentage').value = tank.o2_percentage;
    }
    
    if (tank.gas_type === 'trimix') {
        document.getElementById('hePercentage').value = tank.he_percentage;
    }
    
    // Update gas percentage fields visibility
    handleGasTypeChange();
    
    // Store the tank index being edited
    app.editingTankIndex = index;
    
    // Set modal title
    document.getElementById('tankModalLabel').textContent = 'Edit Tank';
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('tankModal'));
    modal.show();
    app.modalInstance = modal;
}

/**
 * Save tank data from the modal form
 */
function saveTank() {
    // Get form data
    const size = parseFloat(document.getElementById('tankSize').value);
    const pressure = parseFloat(document.getElementById('tankPressure').value);
    const gasType = document.getElementById('gasType').value;
    
    // Check for valid entries
    if (isNaN(size) || isNaN(pressure) || size <= 0 || pressure <= 0) {
        showAlert('Please enter valid tank size and pressure values', 'warning');
        return;
    }
    
    // Get gas percentages based on type
    let o2Percentage = 21.0;  // Default for air
    let hePercentage = 0.0;   // Default for air and nitrox
    
    if (gasType === 'nitrox' || gasType === 'trimix') {
        o2Percentage = parseFloat(document.getElementById('o2Percentage').value);
        
        if (isNaN(o2Percentage) || o2Percentage <= 0 || o2Percentage > 100) {
            showAlert('Please enter a valid oxygen percentage (1-100%)', 'warning');
            return;
        }
    }
    
    if (gasType === 'trimix') {
        hePercentage = parseFloat(document.getElementById('hePercentage').value);
        
        if (isNaN(hePercentage) || hePercentage < 0 || hePercentage > 100) {
            showAlert('Please enter a valid helium percentage (0-100%)', 'warning');
            return;
        }
        
        // Check that O2 + He doesn't exceed 100%
        if (o2Percentage + hePercentage > 100) {
            showAlert('Oxygen + Helium percentages cannot exceed 100%', 'warning');
            return;
        }
    }
    
    // Create tank object
    const tank = {
        size: size,
        pressure: pressure,
        gas_type: gasType,
        o2_percentage: o2Percentage,
        he_percentage: hePercentage
    };
    
    // Check if editing or adding new
    if (app.editingTankIndex !== undefined && app.editingTankIndex !== null) {
        // Replace existing tank
        app.tanks[app.editingTankIndex] = tank;
        app.editingTankIndex = null;
    } else {
        // Add new tank
        app.tanks.push(tank);
    }
    
    // Update display
    updateTanksDisplay();
    
    // Close the modal
    if (app.modalInstance) {
        app.modalInstance.hide();
        app.modalInstance = null;
    }
    
    // Check if tanks are suitable for the planned dive
    validateTanksForDive();
}

/**
 * Remove a tank from the list
 * @param {number} index - Index of the tank to remove
 */
function removeTank(index) {
    if (index >= 0 && index < app.tanks.length) {
        app.tanks.splice(index, 1);
        updateTanksDisplay();
        
        // Check if tanks are suitable for the planned dive
        validateTanksForDive();
    }
}

/**
 * Update the display of tanks in the interface
 */
function updateTanksDisplay() {
    const container = document.getElementById('tanksContainer');
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Show message if no tanks
    if (!app.tanks || app.tanks.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info" id="noTanksMessage">
                <i class="fas fa-info-circle me-2"></i>No tanks added yet. Add a tank to start.
            </div>
        `;
        return;
    }
    
    // Create a container for all tanks
    const tanksWrapper = document.createElement('div');
    tanksWrapper.className = 'tank-items';
    
    // Add each tank
    app.tanks.forEach((tank, index) => {
        const tankItem = document.createElement('div');
        tankItem.className = 'tank-item mb-2 p-3 border rounded';
        
        // Get nitrogen percentage
        const n2Percentage = 100 - tank.o2_percentage - tank.he_percentage;
        
        // Format gas mix display
        let gasInfo = '';
        if (tank.gas_type === 'air') {
            gasInfo = 'Air (21% O₂, 79% N₂)';
        } else if (tank.gas_type === 'nitrox') {
            gasInfo = `Nitrox (${tank.o2_percentage}% O₂, ${(100-tank.o2_percentage).toFixed(1)}% N₂)`;
        } else if (tank.gas_type === 'trimix') {
            gasInfo = `Trimix (${tank.o2_percentage}% O₂, ${tank.he_percentage}% He, ${n2Percentage.toFixed(1)}% N₂)`;
        }
        
        // Tank content in liters
        const contentLiters = tank.size * tank.pressure;
        
        tankItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-top">
                <div>
                    <span class="fw-bold"><i class="fas fa-flask me-2"></i>${tank.size}L ${tank.gas_type.charAt(0).toUpperCase() + tank.gas_type.slice(1)}</span>
                    <div class="small text-muted">${gasInfo}</div>
                    <div class="mt-1">
                        <span class="badge bg-primary">${tank.pressure} bar</span>
                        <span class="badge bg-info">${contentLiters.toFixed(0)} L gas</span>
                    </div>
                </div>
                <div>
                    <button type="button" class="btn btn-sm btn-outline-primary me-1" onclick="showEditTankModal(${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeTank(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        tanksWrapper.appendChild(tankItem);
    });
    
    container.appendChild(tanksWrapper);
}

/**
 * Handle gas type change in the form
 */
function handleGasTypeChange() {
    const gasType = document.getElementById('gasType').value;
    const o2Container = document.getElementById('o2Container');
    const heContainer = document.getElementById('heContainer');
    
    if (gasType === 'nitrox') {
        // Show oxygen, hide helium
        o2Container.style.display = 'block';
        heContainer.style.display = 'none';
    } else if (gasType === 'trimix') {
        // Show both oxygen and helium
        o2Container.style.display = 'block';
        heContainer.style.display = 'block';
    } else {
        // Air - hide both
        o2Container.style.display = 'none';
        heContainer.style.display = 'none';
    }
}

/**
 * Calculate gas consumption for the current plan
 * @returns {Object|null} Gas consumption data or null if calculation not possible
 */
function calculateGasConsumption() {
    // Get dive parameters
    const depth = parseFloat(document.getElementById('diveDepth').value);
    const bottomTime = parseFloat(document.getElementById('bottomTime').value);
    const sacRate = parseFloat(document.getElementById('sacRate').value);
    
    // Check if we have valid parameters
    if (isNaN(depth) || isNaN(bottomTime) || isNaN(sacRate) || 
        depth <= 0 || bottomTime <= 0 || sacRate <= 0) {
        return null;
    }
    
    // Check if we have tanks
    if (!app.tanks || app.tanks.length === 0) {
        return null;
    }
    
    // Pressure at depth (ATM)
    const pressureAtDepth = depth / 10 + 1;
    
    // Calculate bottom gas consumption
    const bottomGasConsumption = sacRate * pressureAtDepth * bottomTime;
    
    // Add safety margin (50%)
    const totalConsumption = bottomGasConsumption * 1.5;
    
    // Calculate gas remaining and gas used for each tank
    const results = app.tanks.map(tank => {
        const totalGas = tank.size * tank.pressure;
        const gasRemaining = Math.max(0, totalGas - totalConsumption);
        const gasUsed = Math.min(totalGas, totalConsumption);
        const pressureRemaining = gasRemaining / tank.size;
        const pressureUsed = gasUsed / tank.size;
        
        return {
            tank: tank,
            totalGas: totalGas,
            gasUsed: gasUsed,
            gasRemaining: gasRemaining,
            pressureRemaining: pressureRemaining,
            pressureUsed: pressureUsed,
            percentUsed: (gasUsed / totalGas) * 100,
            percentRemaining: (gasRemaining / totalGas) * 100
        };
    });
    
    return {
        totalConsumption: totalConsumption,
        bottomGasConsumption: bottomGasConsumption,
        safetyMargin: totalConsumption - bottomGasConsumption,
        results: results
    };
}

/**
 * Validate tanks for the current dive plan
 */
function validateTanksForDive() {
    // Get dive parameters
    const depth = parseFloat(document.getElementById('diveDepth').value);
    const bottomTime = parseFloat(document.getElementById('bottomTime').value);
    
    // Check if we have valid parameters
    if (isNaN(depth) || isNaN(bottomTime) || depth <= 0 || bottomTime <= 0) {
        return;
    }
    
    // Check if we have tanks
    if (!app.tanks || app.tanks.length === 0) {
        return;
    }
    
    // Check each tank for gas appropriateness
    app.tanks.forEach((tank, index) => {
        let warnings = [];
        
        // Check MOD for gas
        const maxDepth = calculateMOD(tank.o2_percentage / 100);
        if (depth > maxDepth) {
            warnings.push(`Maximum operating depth (${maxDepth.toFixed(1)}m) exceeded`);
        }
        
        // Display warnings if any
        const warningContainer = document.getElementById('tankWarnings');
        if (warningContainer) {
            if (warnings.length > 0) {
                warningContainer.innerHTML = `
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <strong>Tank Warnings:</strong>
                        <ul class="mb-0 mt-1">
                            ${warnings.map(warning => `<li>${warning}</li>`).join('')}
                        </ul>
                    </div>
                `;
                warningContainer.style.display = 'block';
            } else {
                warningContainer.style.display = 'none';
            }
        }
    });
}

/**
 * Calculate Maximum Operating Depth (MOD) for a given O2 percentage
 * @param {number} oxygenPercent - Oxygen percentage in decimal form (0.0-1.0)
 * @param {number} pO2Limit - Maximum partial pressure of oxygen (default 1.4)
 * @returns {number} Maximum Operating Depth in meters
 */
function calculateMOD(oxygenPercent, pO2Limit = 1.4) {
    return ((pO2Limit / oxygenPercent) - 1) * 10;
}

/**
 * Suggest appropriate gas mix based on dive depth
 */
function suggestMix() {
    // Get planned depth
    const depth = parseFloat(document.getElementById('diveDepth').value);
    
    if (isNaN(depth) || depth <= 0) {
        showAlert('Please enter a valid dive depth', 'warning');
        return;
    }
    
    let o2Percentage, hePercentage = 0, gasType;
    
    // Recreational depth: suggest Nitrox
    if (depth <= 30) {
        // Calculate optimal nitrox for the depth
        const maxO2 = ((1.4 / ((depth / 10) + 1)) * 100).toFixed(0);
        o2Percentage = Math.min(36, maxO2); // Cap at 36% for recreational
        gasType = 'nitrox';
    } 
    // Technical depth: suggest Trimix
    else {
        // For deeper dives, use trimix
        gasType = 'trimix';
        
        // Calculate END-based trimix
        const targetEND = 30; // Target Equivalent Narcotic Depth
        
        // Calculate fraction of helium needed to maintain END at target
        const absolutePressure = (depth / 10) + 1;
        const targetNarcoticPressure = (targetEND / 10) + 1;
        const narcoticFraction = targetNarcoticPressure / absolutePressure;
        
        // Calculate safe oxygen percentage (PO2 of 1.4)
        o2Percentage = ((1.4 / absolutePressure) * 100).toFixed(0);
        
        // Calculate helium percentage
        hePercentage = (100 - (narcoticFraction * 100) - o2Percentage).toFixed(0);
        
        // Ensure percentages are within valid ranges
        o2Percentage = Math.max(16, Math.min(o2Percentage, 21)); // Between 16-21%
        hePercentage = Math.max(0, Math.min(hePercentage, 80));  // Between 0-80%
    }
    
    // Set the gas type in the form
    document.getElementById('gasType').value = gasType;
    
    // Set the percentages if they exist
    if (gasType === 'nitrox' || gasType === 'trimix') {
        document.getElementById('o2Percentage').value = o2Percentage;
    }
    
    if (gasType === 'trimix') {
        document.getElementById('hePercentage').value = hePercentage;
    }
    
    // Update the form display
    handleGasTypeChange();
    
    // Show suggestion message
    if (gasType === 'nitrox') {
        showAlert(`Suggested Nitrox: ${o2Percentage}% O₂ for ${depth}m depth`, 'info');
    } else {
        showAlert(`Suggested Trimix: ${o2Percentage}/${hePercentage} (O₂/He) for ${depth}m depth`, 'info');
    }
}

/**
 * Convert bar to PSI
 * @param {number} bar - Pressure in bar
 * @returns {number} Pressure in PSI
 */
function barToPsi(bar) {
    return bar * 14.5038;
}

/**
 * Convert PSI to bar
 * @param {number} psi - Pressure in PSI
 * @returns {number} Pressure in bar
 */
function psiToBar(psi) {
    return psi / 14.5038;
}

/**
 * Convert liters to cubic feet
 * @param {number} liters - Volume in liters
 * @returns {number} Volume in cubic feet
 */
function litersToCubicFeet(liters) {
    return liters * 0.035315;
}

/**
 * Convert cubic feet to liters
 * @param {number} cubicFeet - Volume in cubic feet
 * @returns {number} Volume in liters
 */
function cubicFeetToLiters(cubicFeet) {
    return cubicFeet / 0.035315;
}

/**
 * Calculate gas volume at standard temperature and pressure
 * @param {number} tankSize - Tank size in liters
 * @param {number} pressure - Pressure in bar
 * @returns {number} Gas volume in liters at STP
 */
function calculateGasVolume(tankSize, pressure) {
    return tankSize * pressure;
}
