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
    if (!window.app) {
        window.app = {};
    }
    if (!window.app.tanks) {
        window.app.tanks = [];
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
    const tankModal = document.getElementById('tankModal');
    if (!tankModal) {
        console.error('Tank modal not found');
        return;
    }

    // Reset the form
    const tankForm = document.getElementById('tankForm');
    if (tankForm) {
        tankForm.reset();
    }

    // Reset modal title
    const modalLabel = document.getElementById('tankModalLabel');
    if (modalLabel) {
        modalLabel.textContent = 'Add Tank';
    }

    // Reset gas type display
    handleGasTypeChange();

    // Show the modal using Bootstrap
    const modal = new bootstrap.Modal(tankModal);
    modal.show();

    if (window.app) {
        window.app.modalInstance = modal;
    }
}

/**
 * Show the modal to edit an existing tank
 * @param {number} index - Index of the tank to edit
 */
function showEditTankModal(index) {
    // Get the tank data
    const tank = window.app.tanks[index];

    // Fill the form with existing data
    const tankSize = document.getElementById('tankSize');
    const tankPressure = document.getElementById('tankPressure');
    const gasType = document.getElementById('gasType');
    const oxygenPercentage = document.getElementById('oxygenPercentage');
    const heliumPercentage = document.getElementById('heliumPercentage');

    if (tankSize) tankSize.value = tank.size;
    if (tankPressure) tankPressure.value = tank.pressure;
    if (gasType) gasType.value = tank.gasType;
    if (oxygenPercentage) oxygenPercentage.value = tank.o2;
    if (heliumPercentage) heliumPercentage.value = tank.he || 0;

    // Handle gas type display
    handleGasTypeChange();

    // Set data attribute for the save button
    const saveTankButton = document.getElementById('saveTankButton');
    if (saveTankButton) {
        saveTankButton.setAttribute('data-edit-index', index);
    }

    // Update modal title
    const modalLabel = document.getElementById('tankModalLabel');
    if (modalLabel) {
        modalLabel.textContent = 'Edit Tank';
    }

    // Show the modal
    const tankModal = document.getElementById('tankModal');
    if (tankModal) {
        const modal = new bootstrap.Modal(tankModal);
        modal.show();

        if (window.app) {
            window.app.modalInstance = modal;
        }
    }
}

/**
 * Handle changes to the gas type selection
 */
function handleGasTypeChange() {
    const gasTypeSelect = document.getElementById('gasType');
    if (!gasTypeSelect) return;

    const gasType = gasTypeSelect.value;
    const heliumContainer = document.getElementById('heliumContainer');
    const oxygenInput = document.getElementById('oxygenPercentage');
    const helperContainer = document.getElementById('gasTypeHelper');

    if (!heliumContainer || !oxygenInput) return;

    // Show/hide helium input based on gas type
    if (gasType === 'trimix') {
        heliumContainer.style.display = 'block';
    } else {
        heliumContainer.style.display = 'none';
    }

    // Reset helper text
    if (helperContainer) {
        helperContainer.innerHTML = '';
    }

    // Set appropriate oxygen ranges
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
            helperContainer.innerHTML = '<small class="text-muted">Common trimix: 18/45, 15/55, 10/70</small>';
        }
    } else if (gasType === 'oxygen') {
        oxygenInput.value = '100';
        oxygenInput.setAttribute('readonly', 'readonly');
        if (helperContainer) {
            helperContainer.innerHTML = '<small class="text-warning">Warning: 100% oxygen MOD is 6 meters.</small>';
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
        alert('Please enter a valid tank size');
        return;
    }

    if (isNaN(pressure) || pressure <= 0) {
        alert('Please enter a valid tank pressure');
        return;
    }

    if (isNaN(o2) || o2 < 5 || o2 > 100) {
        alert('Please enter a valid oxygen percentage');
        return;
    }

    if (gasType === 'trimix' && (isNaN(he) || he < 0 || he > 95)) {
        alert('Please enter a valid helium percentage');
        return;
    }

    if (gasType === 'trimix' && (o2 + he > 100)) {
        alert('Total gas percentage cannot exceed 100%');
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

    // Check if editing or adding
    const saveButton = document.getElementById('saveTankButton');
    if (!saveButton) return;

    const editIndex = saveButton.getAttribute('data-edit-index');

    if (editIndex !== null && editIndex !== undefined) {
        // Update existing tank
        window.app.tanks[editIndex] = tank;
        saveButton.removeAttribute('data-edit-index');

        const modalLabel = document.getElementById('tankModalLabel');
        if (modalLabel) {
            modalLabel.textContent = 'Add Tank';
        }
    } else {
        // Add new tank
        window.app.tanks.push(tank);
    }

    // Update display
    updateTanksDisplay();

    // Close modal
    if (window.app && window.app.modalInstance) {
        window.app.modalInstance.hide();
    }
}

/**
 * Remove a tank from the list
 */
function removeTank(index) {
    if (index >= 0 && index < window.app.tanks.length) {
        window.app.tanks.splice(index, 1);
        updateTanksDisplay();
    }
}

/**
 * Update the display of tanks
 */
function updateTanksDisplay() {
    const container = document.getElementById('tanksContainer');
    const noMessage = document.getElementById('noTanksMessage');

    if (!container || !noMessage) return;

    container.innerHTML = '';

    if (!window.app.tanks || window.app.tanks.length === 0) {
        noMessage.style.display = 'block';
        return;
    } else {
        noMessage.style.display = 'none';
    }

    window.app.tanks.forEach((tank, index) => {
        const tankElement = document.createElement('div');
        tankElement.className = 'tank-item mb-3 p-3 bg-light rounded';

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

        const totalVolume = tank.size * tank.pressure;

        tankElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <div class="fw-bold mb-1">Tank ${index + 1}</div>
                    <div class="small mb-1">${tank.size}L @ ${tank.pressure} bar (${totalVolume.toFixed(0)}L gas)</div>
                    <div class="small mb-1">${gasInfo}</div>
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

    // Add event listeners
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
 * Calculate MOD
 */
function calculateMOD(o2Percent, ppO2Max = 1.4) {
    const fO2 = o2Percent / 100;
    const mod = ((ppO2Max / fO2) - 1) * 10;
    return Math.floor(mod);
}