/**
 * ScuPlan - Tank Management Module
 * Handles all tank-related functionality including adding, editing, and validating tanks
 */

/**
 * Initialize tank management functionality
 */
function initTankManagement() {
    // Set up event listeners
    const addTankButton = document.getElementById('addTankButton');
    if (addTankButton) {
        addTankButton.addEventListener('click', showAddTankModal);
    }
    
    const saveTankButton = document.getElementById('saveTankButton');
    if (saveTankButton) {
        saveTankButton.addEventListener('click', saveTank);
    }
    
    // Initialize gas type change handler for the modal
    const gasTypeSelect = document.getElementById('tankGasType');
    if (gasTypeSelect) {
        gasTypeSelect.addEventListener('change', handleGasTypeChange);
    }
    
    // Add suggest mix button handler
    const suggestMixButton = document.getElementById('suggestMixButton');
    if (suggestMixButton) {
        suggestMixButton.addEventListener('click', suggestBestMix);
    }
    
    console.log('Tank management initialized');
}

/**
 * Show the modal to add a new tank
 */
function showAddTankModal() {
    // Reset form
    const tankForm = document.getElementById('tankForm');
    if (tankForm) {
        tankForm.reset();
    }
    
    // Set default values
    document.getElementById('tankSize').value = '12';
    document.getElementById('tankPressure').value = '200';
    document.getElementById('tankGasType').value = 'air';
    document.getElementById('tankO2').value = '21';
    document.getElementById('tankHe').value = '0';
    
    // Hide advanced gas options initially
    handleGasTypeChange();
    
    // Set modal title
    const modalTitle = document.getElementById('tankModalLabel');
    if (modalTitle) {
        modalTitle.textContent = 'Add New Tank';
    }
    
    // Set edit index to null (indicating a new tank)
    document.getElementById('tankForm').dataset.editIndex = '-1';
    
    // Show the modal
    const tankModal = new bootstrap.Modal(document.getElementById('tankModal'));
    tankModal.show();
}

/**
 * Show the modal to edit an existing tank
 * @param {number} index - Index of the tank to edit
 */
function showEditTankModal(index) {
    // Get the tank
    const tank = app.tanks[index];
    if (!tank) {
        showAlert('Tank not found', 'danger');
        return;
    }
    
    // Set form values
    document.getElementById('tankSize').value = tank.size;
    document.getElementById('tankPressure').value = tank.pressure;
    document.getElementById('tankGasType').value = tank.gasType;
    document.getElementById('tankO2').value = tank.o2;
    document.getElementById('tankHe').value = tank.he;
    
    // Show/hide advanced gas options
    handleGasTypeChange();
    
    // Set modal title
    const modalTitle = document.getElementById('tankModalLabel');
    if (modalTitle) {
        modalTitle.textContent = 'Edit Tank';
    }
    
    // Set edit index
    document.getElementById('tankForm').dataset.editIndex = index;
    
    // Show the modal
    const tankModal = new bootstrap.Modal(document.getElementById('tankModal'));
    tankModal.show();
}

/**
 * Handle changes to gas type selection
 */
function handleGasTypeChange() {
    const gasType = document.getElementById('tankGasType').value;
    const advancedOptions = document.getElementById('advancedGasOptions');
    const o2Input = document.getElementById('tankO2');
    const heInput = document.getElementById('tankHe');
    const suggestButton = document.getElementById('suggestMixButton');
    
    if (gasType === 'air') {
        // Hide advanced options and set default values
        if (advancedOptions) advancedOptions.classList.add('d-none');
        if (o2Input) o2Input.value = '21';
        if (heInput) heInput.value = '0';
        if (suggestButton) suggestButton.classList.add('d-none');
    } else if (gasType === 'nitrox') {
        // Show O2 options, hide He options
        if (advancedOptions) advancedOptions.classList.remove('d-none');
        if (o2Input) o2Input.value = '32';
        if (heInput) {
            heInput.value = '0';
            heInput.closest('.mb-3').classList.add('d-none');
        }
        if (suggestButton) suggestButton.classList.remove('d-none');
    } else if (gasType === 'trimix') {
        // Show all options
        if (advancedOptions) advancedOptions.classList.remove('d-none');
        if (heInput) heInput.closest('.mb-3').classList.remove('d-none');
        if (suggestButton) suggestButton.classList.remove('d-none');
    }
}

/**
 * Suggest the best gas mix based on dive depth
 */
function suggestBestMix() {
    // Get depth from the dive plan form
    const depthInput = document.getElementById('depth');
    if (!depthInput || !depthInput.value) {
        showAlert('Please enter a depth in the dive planner first', 'warning');
        return;
    }
    
    const depth = parseFloat(depthInput.value);
    if (isNaN(depth) || depth <= 0) {
        showAlert('Please enter a valid depth', 'warning');
        return;
    }
    
    // Get gas type
    const gasType = document.getElementById('tankGasType').value;
    
    // Suggest mix based on depth and gas type
    if (gasType === 'nitrox') {
        // Simple nitrox calculation (conservative)
        let o2Percent = 21;
        
        if (depth <= 40) {
            // Maximum pO2 of 1.4 at target depth
            o2Percent = Math.floor((1.4 / ((depth / 10) + 1)) * 100);
            
            // Round down to be conservative and to nearest multiple of 4
            o2Percent = Math.floor(o2Percent / 4) * 4;
            
            // Clamp to reasonable limits
            o2Percent = Math.max(21, Math.min(o2Percent, 40));
        } else {
            // Deep dive - use more conservative values
            if (depth <= 50) {
                o2Percent = 21;
            } else {
                o2Percent = 18; // Hypoxic mix for very deep dives
            }
        }
        
        // Update O2 input
        document.getElementById('tankO2').value = o2Percent;
        
        showAlert(`Suggested Nitrox mix: ${o2Percent}% oxygen for ${depth}m depth`, 'info');
    } else if (gasType === 'trimix') {
        // Trimix calculations
        let o2Percent = 21;
        let hePercent = 0;
        
        if (depth <= 30) {
            // Shallow dive - suggest nitrox instead
            o2Percent = 32;
            hePercent = 0;
            showAlert('For depths up to 30m, Nitrox is usually sufficient. Consider changing gas type.', 'info');
        } else if (depth <= 40) {
            // Moderate depth - minimal helium
            o2Percent = 28;
            hePercent = 15;
        } else if (depth <= 50) {
            o2Percent = 21;
            hePercent = 25;
        } else if (depth <= 60) {
            o2Percent = 18;
            hePercent = 35;
        } else if (depth <= 70) {
            o2Percent = 15;
            hePercent = 45;
        } else {
            // Very deep dive
            o2Percent = 10;
            hePercent = 60;
        }
        
        // Update inputs
        document.getElementById('tankO2').value = o2Percent;
        document.getElementById('tankHe').value = hePercent;
        
        showAlert(`Suggested Trimix: ${o2Percent}/${hePercent} for ${depth}m depth`, 'info');
    }
}

/**
 * Validate a gas mix for a given depth
 * @param {string} gasType - Type of gas (air, nitrox, trimix)
 * @param {number} o2Percent - Oxygen percentage
 * @param {number} hePercent - Helium percentage
 * @param {number} depth - Dive depth in meters
 * @returns {Object} Validation result with status and messages
 */
function validateGasMix(gasType, o2Percent, hePercent, depth) {
    const result = {
        isValid: true,
        warnings: [],
        errors: []
    };
    
    // Check total gas percentage
    const totalPercent = o2Percent + hePercent;
    if (totalPercent > 100) {
        result.errors.push('Total gas percentage exceeds 100%');
        result.isValid = false;
    }
    
    // Validate oxygen percentage
    if (o2Percent < 5) {
        result.errors.push('Oxygen percentage is dangerously low (hypoxic)');
        result.isValid = false;
    } else if (o2Percent < 16) {
        result.warnings.push('Hypoxic mix - not breathable at surface');
    }
    
    // Calculate MOD (Maximum Operating Depth)
    const pO2Limit = 1.4; // Conservative pO2 limit
    const mod = Math.floor(((pO2Limit / (o2Percent / 100)) - 1) * 10);
    
    // Check if depth exceeds MOD
    if (depth > mod) {
        result.errors.push(`Depth of ${depth}m exceeds MOD of ${mod}m for this mix`);
        result.isValid = false;
    } else if (depth > mod - 5) {
        result.warnings.push(`Depth of ${depth}m is close to MOD of ${mod}m`);
    }
    
    // For trimix, check END (Equivalent Narcotic Depth)
    if (gasType === 'trimix' && hePercent > 0) {
        const n2Percent = 100 - o2Percent - hePercent;
        const end = ((depth + 10) * (n2Percent / 79)) - 10;
        
        if (end > 40) {
            result.warnings.push(`END of ${Math.round(end)}m exceeds recommended 40m limit`);
        }
    }
    
    return result;
}

/**
 * Save tank data from the modal form
 */
function saveTank() {
    // Get form values
    const size = parseFloat(document.getElementById('tankSize').value);
    const pressure = parseFloat(document.getElementById('tankPressure').value);
    const gasType = document.getElementById('tankGasType').value;
    let o2 = parseFloat(document.getElementById('tankO2').value);
    let he = parseFloat(document.getElementById('tankHe').value);
    
    // Validate inputs
    if (isNaN(size) || size <= 0) {
        showAlert('Please enter a valid tank size', 'danger');
        return;
    }
    
    if (isNaN(pressure) || pressure <= 0) {
        showAlert('Please enter a valid tank pressure', 'danger');
        return;
    }
    
    // Set default values based on gas type
    if (gasType === 'air') {
        o2 = 21;
        he = 0;
    } else {
        // Validate gas percentages
        if (isNaN(o2) || o2 < 0 || o2 > 100) {
            showAlert('Please enter a valid oxygen percentage (0-100)', 'danger');
            return;
        }
        
        if (isNaN(he) || he < 0 || he > 100) {
            showAlert('Please enter a valid helium percentage (0-100)', 'danger');
            return;
        }
        
        if (o2 + he > 100) {
            showAlert('Oxygen and helium percentages cannot exceed 100%', 'danger');
            return;
        }
    }
    
    // Get depth for gas validation
    let depth = 0;
    const depthInput = document.getElementById('depth');
    if (depthInput && depthInput.value) {
        depth = parseFloat(depthInput.value);
    }
    
    // Validate gas mix if depth is provided
    if (depth > 0) {
        const validation = validateGasMix(gasType, o2, he, depth);
        
        // Show warnings
        if (validation.warnings.length > 0) {
            validation.warnings.forEach(warning => {
                showAlert(warning, 'warning');
            });
        }
        
        // Show errors and prevent saving if invalid
        if (!validation.isValid) {
            validation.errors.forEach(error => {
                showAlert(error, 'danger');
            });
            return;
        }
    }
    
    // Create tank object
    const tank = {
        size: size,
        pressure: pressure,
        gasType: gasType,
        o2: o2,
        he: he
    };
    
    // Check if editing existing tank or adding new one
    const editIndex = parseInt(document.getElementById('tankForm').dataset.editIndex);
    
    if (editIndex >= 0 && editIndex < app.tanks.length) {
        // Update existing tank
        app.tanks[editIndex] = tank;
        showAlert('Tank updated', 'success');
    } else {
        // Add new tank
        app.tanks.push(tank);
        showAlert('Tank added', 'success');
    }
    
    // Update UI
    updateTanksDisplay();
    
    // Hide modal
    const tankModal = bootstrap.Modal.getInstance(document.getElementById('tankModal'));
    tankModal.hide();
}

/**
 * Remove a tank from the list
 * @param {number} index - Index of the tank to remove
 */
function removeTank(index) {
    // Remove tank
    app.tanks.splice(index, 1);
    
    // Update UI
    updateTanksDisplay();
    
    showAlert('Tank removed', 'info');
}

/**
 * Update the display of tanks in the interface
 */
function updateTanksDisplay() {
    const container = document.getElementById('tanksContainer');
    const noTanksMessage = document.getElementById('noTanksMessage');
    
    if (!container) return;
    
    // Clear existing content except the no tanks message
    Array.from(container.children).forEach(child => {
        if (child.id !== 'noTanksMessage') {
            child.remove();
        }
    });
    
    // Show/hide no tanks message
    if (app.tanks.length === 0) {
        if (noTanksMessage) noTanksMessage.classList.remove('d-none');
        return;
    } else {
        if (noTanksMessage) noTanksMessage.classList.add('d-none');
    }
    
    // Add each tank
    app.tanks.forEach((tank, index) => {
        const tankCard = document.createElement('div');
        tankCard.className = 'card mb-3 tank-item';
        
        // Generate gas label
        let gasLabel;
        let gasClass;
        
        if (tank.gasType === 'air') {
            gasLabel = 'Air';
            gasClass = 'bg-info';
        } else if (tank.gasType === 'nitrox') {
            gasLabel = `Nitrox ${tank.o2}%`;
            gasClass = 'bg-warning';
        } else {
            gasLabel = `Trimix ${tank.o2}/${tank.he}`;
            gasClass = 'bg-danger';
        }
        
        // Create card content
        tankCard.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 class="card-title">${tank.size}L Tank</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${tank.pressure} bar</h6>
                        <span class="badge ${gasClass} me-2">${gasLabel}</span>
                    </div>
                    <div>
                        <button type="button" class="btn btn-sm btn-outline-primary edit-tank-btn" data-index="${index}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger remove-tank-btn" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        const editButton = tankCard.querySelector('.edit-tank-btn');
        editButton.addEventListener('click', () => showEditTankModal(index));
        
        const removeButton = tankCard.querySelector('.remove-tank-btn');
        removeButton.addEventListener('click', () => removeTank(index));
        
        // Add to container
        container.appendChild(tankCard);
    });
}
