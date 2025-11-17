/**
 * ScuPlan - Dive Plan Enhancements
 * Gas consumption display and save plan functionality
 */

// Listen for calculation completion
document.addEventListener('DOMContentLoaded', function() {
    // Hook into calculate button to add our enhancements
    const originalCalculateButton = document.getElementById('calculateButton');
    if (originalCalculateButton) {
        originalCalculateButton.addEventListener('click', function() {
            // Wait for calculation to complete
            setTimeout(() => {
                enhanceDivePlanDisplay();
            }, 1500);
        });
    }

    // Setup save plan button
    setupSavePlanButton();

    // Listen for successful dive plan calculations
    document.addEventListener('divePlanCalculated', function() {
        console.log('Dive plan calculated, enhancing display...');
        enhanceDivePlanDisplay();
    });
});

/**
 * Enhance dive plan display with gas consumption and save functionality
 */
function enhanceDivePlanDisplay() {
    console.log('Enhancing dive plan display...');

    // Check if we have tanks
    if (!window.app || !window.app.tanks || window.app.tanks.length === 0) {
        console.log('No tanks defined, showing warning message');
        // Hide gas consumption section
        const gasSection = document.getElementById('gasConsumptionSummary');
        if (gasSection) {
            gasSection.style.display = 'none';
        }

        // Show warning in tank status quick indicator
        const quickStatus = document.getElementById('tankStatusQuick');
        const statusTitle = document.getElementById('tankStatusTitle');
        const statusMessage = document.getElementById('tankStatusMessage');

        if (quickStatus && statusTitle && statusMessage) {
            quickStatus.className = 'alert mb-3 alert-warning';
            statusTitle.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>⚠️ No Tanks Added';
            statusMessage.textContent = 'Please add at least one tank using the "Add Tank" button above to see gas consumption analysis.';
            quickStatus.style.display = 'block';
        }

        return;
    }

    // Get current dive parameters
    const depth = parseFloat(document.getElementById('diveDepth').value);
    const bottomTime = parseFloat(document.getElementById('bottomTime').value);
    const sacRate = parseFloat(document.getElementById('sacRate').value) || 20;

    console.log('Dive parameters:', {depth, bottomTime, sacRate, tanks: window.app.tanks.length});

    if (!depth || !bottomTime) {
        console.log('Missing depth or bottom time');
        return;
    }

    // Calculate gas consumption for each tank
    const gasConsumptionResults = calculateGasConsumption(depth, bottomTime, sacRate);
    console.log('Gas consumption results:', gasConsumptionResults);

    // Display gas consumption
    displayGasConsumption(gasConsumptionResults);

    // Show save plan section
    const savePlanSection = document.getElementById('savePlanSection');
    if (savePlanSection) {
        savePlanSection.style.display = 'block';
        console.log('Save plan section shown');
    }
}

/**
 * Calculate gas consumption for all tanks
 */
function calculateGasConsumption(depth, bottomTime, sacRate) {
    const results = [];

    window.app.tanks.forEach((tank, index) => {
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
        const safetyReserve = totalConsumption * 0.5; // 50% safety reserve
        const safeRemainingGas = remainingGas - safetyReserve;
        const safeRemainingPressure = safeRemainingGas / tankSize;

        // Check if tank is sufficient
        const isSufficient = remainingGas > 0;
        const isSafe = safeRemainingGas > 0;

        // Add to results
        results.push({
            tankIndex: index + 1,
            tankSize: tankSize,
            initialPressure: tankPressure,
            gasType: tank.gasType || 'Air',
            o2: tank.o2 || 21,
            he: tank.he || 0,
            totalGas: totalGas,
            totalConsumption: totalConsumption,
            bottomConsumption: bottomConsumption,
            descentConsumption: descentConsumption,
            ascentConsumption: ascentConsumption,
            remainingGas: remainingGas,
            remainingPressure: remainingPressure,
            safeRemainingGas: safeRemainingGas,
            safeRemainingPressure: safeRemainingPressure,
            safetyReserve: safetyReserve,
            isSufficient: isSufficient,
            isSafe: isSafe
        });
    });

    return results;
}

/**
 * Display gas consumption results
 */
function displayGasConsumption(results) {
    const container = document.getElementById('gasConsumptionDetails');
    const alertContainer = document.getElementById('tankSufficiencyAlert');

    if (!container || !alertContainer) {
        return;
    }

    let html = '';
    let hasInsufficientTank = false;
    let hasUnsafeTank = false;

    results.forEach(tank => {
        const statusClass = !tank.isSufficient ? 'danger' : (!tank.isSafe ? 'warning' : 'success');
        const statusIcon = !tank.isSufficient ? 'fa-times-circle' : (!tank.isSafe ? 'fa-exclamation-triangle' : 'fa-check-circle');
        const statusText = !tank.isSufficient ? 'INSUFFICIENT' : (!tank.isSafe ? 'TIGHT' : 'SUFFICIENT');

        if (!tank.isSufficient) hasInsufficientTank = true;
        if (!tank.isSafe) hasUnsafeTank = true;

        html += `
            <div class="card mb-2 border-${statusClass}">
                <div class="card-body p-2">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h6 class="mb-0">
                            <i class="fas fa-flask me-1"></i>Tank ${tank.tankIndex}
                            <span class="badge bg-${statusClass}">
                                <i class="fas ${statusIcon} me-1"></i>${statusText}
                            </span>
                        </h6>
                        <small class="text-muted">${tank.tankSize}L @ ${tank.initialPressure} bar</small>
                    </div>
                    <div class="row g-2 small">
                        <div class="col-6">
                            <strong>Total Gas:</strong> ${tank.totalGas.toFixed(0)} L
                        </div>
                        <div class="col-6">
                            <strong>Consumed:</strong> ${tank.totalConsumption.toFixed(0)} L
                        </div>
                        <div class="col-6">
                            <strong>Remaining:</strong> ${tank.remainingGas.toFixed(0)} L (${tank.remainingPressure.toFixed(0)} bar)
                        </div>
                        <div class="col-6">
                            <strong>Safety Reserve:</strong> ${tank.safetyReserve.toFixed(0)} L
                        </div>
                        <div class="col-12">
                            <strong>Safe Remaining:</strong>
                            <span class="text-${statusClass} fw-bold">
                                ${tank.safeRemainingGas.toFixed(0)} L (${tank.safeRemainingPressure.toFixed(0)} bar)
                            </span>
                        </div>
                    </div>
                    <div class="progress mt-2" style="height: 20px;">
                        <div class="progress-bar bg-danger" role="progressbar"
                             style="width: ${(tank.totalConsumption / tank.totalGas * 100).toFixed(1)}%"
                             title="Consumed">
                        </div>
                        <div class="progress-bar bg-warning" role="progressbar"
                             style="width: ${(tank.safetyReserve / tank.totalGas * 100).toFixed(1)}%"
                             title="Safety Reserve">
                        </div>
                        <div class="progress-bar bg-success" role="progressbar"
                             style="width: ${(tank.safeRemainingGas / tank.totalGas * 100).toFixed(1)}%"
                             title="Safe Remaining">
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Show alert if tanks are insufficient
    let alertHTML = '';
    if (hasInsufficientTank) {
        alertHTML = `
            <div class="alert alert-danger mb-0">
                <i class="fas fa-exclamation-circle me-2"></i>
                <strong>WARNING:</strong> One or more tanks have insufficient gas for this dive!
                Please use larger tanks or reduce dive depth/time.
            </div>
        `;
    } else if (hasUnsafeTank) {
        alertHTML = `
            <div class="alert alert-warning mb-0">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>CAUTION:</strong> Gas reserves are tight. Consider using larger tanks or reducing dive depth/time for better safety margins.
            </div>
        `;
    } else {
        alertHTML = `
            <div class="alert alert-success mb-0">
                <i class="fas fa-check-circle me-2"></i>
                <strong>GOOD:</strong> All tanks have sufficient gas with adequate safety reserves.
            </div>
        `;
    }

    alertContainer.innerHTML = alertHTML;

    // Update quick tank status indicator
    updateTankStatusQuick(hasInsufficientTank, hasUnsafeTank, results);

    // Show the gas consumption section
    document.getElementById('gasConsumptionSummary').style.display = 'block';
}

/**
 * Update the quick tank status indicator in results section
 */
function updateTankStatusQuick(hasInsufficientTank, hasUnsafeTank, results) {
    const quickStatus = document.getElementById('tankStatusQuick');
    const statusTitle = document.getElementById('tankStatusTitle');
    const statusMessage = document.getElementById('tankStatusMessage');

    if (!quickStatus || !statusTitle || !statusMessage) {
        return;
    }

    // Determine overall status
    let statusClass, statusIcon, title, message;

    if (hasInsufficientTank) {
        statusClass = 'alert-danger';
        statusIcon = 'fa-exclamation-circle';
        title = '⚠️ Insufficient Gas';
        message = `Tank(s) do not have enough gas for this dive! Total consumption exceeds available gas.`;
    } else if (hasUnsafeTank) {
        statusClass = 'alert-warning';
        statusIcon = 'fa-exclamation-triangle';
        title = '⚡ Tight Gas Reserves';
        message = `Gas reserves are tight. Safety margins are minimal. Consider larger tanks or shorter dive.`;
    } else {
        statusClass = 'alert-success';
        statusIcon = 'fa-check-circle';
        title = '✓ Gas Sufficient';

        // Calculate total remaining
        const totalRemaining = results.reduce((sum, tank) => sum + tank.safeRemainingGas, 0);
        const totalConsumed = results.reduce((sum, tank) => sum + tank.totalConsumption, 0);

        message = `All tanks have adequate gas with ${totalRemaining.toFixed(0)}L safe reserve after consuming ${totalConsumed.toFixed(0)}L.`;
    }

    // Update the display
    quickStatus.className = `alert mb-3 ${statusClass}`;
    statusTitle.innerHTML = `<i class="fas ${statusIcon} me-2"></i>${title}`;
    statusMessage.textContent = message;
    quickStatus.style.display = 'block';
}

/**
 * Setup save plan button functionality
 */
function setupSavePlanButton() {
    const saveButton = document.getElementById('savePlanButton');
    if (!saveButton) {
        return;
    }

    saveButton.addEventListener('click', async function() {
        // Gather all dive plan data
        const planData = {
            depth: parseFloat(document.getElementById('diveDepth').value),
            bottomTime: parseFloat(document.getElementById('bottomTime').value),
            diveType: document.getElementById('diveType').value,
            location: document.getElementById('diveLocation').value,
            diveDate: document.getElementById('diveDate').value,
            diveTime: document.getElementById('diveTime').value,
            tanks: window.app.tanks || [],
            buddies: window.app.buddies || [],
            save: true
        };

        // Show loading state
        const statusDiv = document.getElementById('saveStatus');
        statusDiv.innerHTML = '<div class="alert alert-info mb-0"><i class="fas fa-spinner fa-spin me-2"></i>Saving dive plan...</div>';
        statusDiv.style.display = 'block';
        saveButton.disabled = true;

        try {
            // Call the calculate API with save=true
            const response = await fetch('/api/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(planData)
            });

            const result = await response.json();

            if (response.ok && result.shareToken) {
                statusDiv.innerHTML = `
                    <div class="alert alert-success mb-0">
                        <i class="fas fa-check-circle me-2"></i>
                        <strong>Saved!</strong> Your dive plan has been saved.
                        <div class="mt-2">
                            <a href="/share?id=${result.shareToken}" target="_blank" class="btn btn-sm btn-success">
                                <i class="fas fa-share-alt me-1"></i>View Saved Plan
                            </a>
                        </div>
                    </div>
                `;
            } else {
                throw new Error(result.error || 'Failed to save dive plan');
            }
        } catch (error) {
            statusDiv.innerHTML = `
                <div class="alert alert-danger mb-0">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>Error:</strong> ${error.message}
                </div>
            `;
        } finally {
            saveButton.disabled = false;
        }
    });
}
