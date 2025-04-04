/**
 * ScuPlan - Gas Validation Module
 * Handles validation of gas requirements for dives
 */

/**
 * Check if the current tank setup is valid for the planned dive
 * @param {Object} divePlan - The dive plan to validate
 * @returns {Object} - Validation result with status and message
 */
function validateGasRequirements(divePlan) {
    // If no depth or bottom time, can't validate
    if (!divePlan.depth || !divePlan.bottomTime) {
        return {
            valid: false,
            message: "Dive parameters missing"
        };
    }
    
    // If no tanks defined, it's invalid
    if (!divePlan.tanks || divePlan.tanks.length === 0) {
        return {
            valid: false,
            message: "No tanks defined for this dive"
        };
    }
    
    // Calculate required gas volume
    const estimatedGasNeeded = calculateGasRequirement(divePlan);
    
    // Calculate available gas volume
    const availableGas = calculateAvailableGas(divePlan.tanks);
    
    // Check if we have enough gas
    if (availableGas < estimatedGasNeeded) {
        return {
            valid: false,
            message: `Insufficient gas supply. Need ~${estimatedGasNeeded}L but only have ${availableGas}L available.`
        };
    }
    
    // For deeper dives, check appropriate gas mixture
    if (divePlan.depth > 30) {
        const hasAppropriateGasMix = checkAppropriateGasMix(divePlan);
        if (!hasAppropriateGasMix.valid) {
            return hasAppropriateGasMix;
        }
    }
    
    // If everything passes, it's valid
    return {
        valid: true,
        message: "Gas requirements satisfied"
    };
}

/**
 * Calculate gas requirement for the dive
 * @param {Object} divePlan - The dive plan
 * @returns {number} - Estimated gas needed in liters
 */
function calculateGasRequirement(divePlan) {
    const { depth, bottomTime, sacRate = 20 } = divePlan;
    
    // Basic calculation: SAC * depth in ATA * time
    const ata = (depth / 10) + 1;
    const gasNeeded = sacRate * ata * bottomTime;
    
    // Add safety reserve (33%)
    const withReserve = gasNeeded * 1.33;
    
    return Math.ceil(withReserve);
}

/**
 * Calculate available gas from all tanks
 * @param {Array} tanks - Array of tank objects
 * @returns {number} - Available gas in liters
 */
function calculateAvailableGas(tanks) {
    let totalAvailable = 0;
    
    tanks.forEach(tank => {
        const tankVolume = tank.size;
        const tankPressure = tank.pressure;
        
        // Convert to available gas at surface
        const availableGas = tankVolume * tankPressure;
        totalAvailable += availableGas;
    });
    
    return totalAvailable;
}

/**
 * Check if the gas mix is appropriate for the dive depth
 * @param {Object} divePlan - The dive plan
 * @returns {Object} - Validation result
 */
function checkAppropriateGasMix(divePlan) {
    const { depth, tanks } = divePlan;
    
    // For dives deeper than 30m, check oxygen percentage
    if (depth > 30) {
        // Check if any tank has appropriate oxygen
        const hasAppropriateO2 = tanks.some(tank => {
            if (tank.gasType === 'nitrox' || tank.gasType === 'trimix') {
                // For depths > 30m, oxygen % should typically be lower than 21%
                return tank.o2Percentage < 21;
            }
            return false;
        });
        
        if (!hasAppropriateO2) {
            return {
                valid: false,
                message: "For dives deeper than 30m, consider using a gas mix with lower oxygen percentage"
            };
        }
    }
    
    // For dives deeper than 40m, check for helium
    if (depth > 40) {
        // Check if any tank has helium
        const hasHelium = tanks.some(tank => {
            return tank.gasType === 'trimix' && tank.hePercentage > 0;
        });
        
        if (!hasHelium) {
            return {
                valid: false,
                message: "For dives deeper than 40m, consider using trimix with helium to reduce narcosis"
            };
        }
    }
    
    return { valid: true, message: "Appropriate gas mix for depth" };
}

/**
 * Update the gas consumption display in results section
 * @param {Object} divePlan - The dive plan data
 */
function updateGasConsumptionDisplay(divePlan) {
    const gasConsumptionSection = document.getElementById('gasConsumption');
    if (!gasConsumptionSection) return;
    
    // Try to calculate gas requirements
    try {
        // Get the estimated gas needed
        const estimatedGasNeeded = calculateGasRequirement(divePlan);
        const availableGas = calculateAvailableGas(divePlan.tanks || []);
        
        // Check if we have enough gas and appropriate mixture
        const gasCheck = validateGasRequirements(divePlan);
        
        // Format recommended reserve
        const recommendedReserve = Math.ceil(estimatedGasNeeded * 0.33);
        const reserveText = `~${recommendedReserve}L`;
        
        // Format tank configuration
        let tankConfig = '';
        if (divePlan.tanks && divePlan.tanks.length > 0) {
            divePlan.tanks.forEach((tank, index) => {
                if (index > 0) tankConfig += ', ';
                tankConfig += `${tank.size}L tank (${tank.pressure} bar)`;
            });
        } else {
            tankConfig = '1 x 12L tank (200 bar)';
        }
        
        // Check if it's a very shallow dive (less than 10m)
        if (divePlan.depth < 10 && divePlan.bottomTime < 20) {
            // For very shallow, short dives, just show basic info without warnings
            gasConsumptionSection.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    <strong>Gas Consumption</strong>: For this shallow dive, standard recreational equipment is sufficient.
                </div>
                <div class="mt-3">
                    <h6>Gas Requirements for this Dive:</h6>
                    <ul class="list-unstyled">
                        <li><i class="fas fa-check-circle text-success me-1"></i> Estimated gas needed: ~${estimatedGasNeeded}L (w/o reserve)</li>
                        <li><i class="fas fa-check-circle text-success me-1"></i> Recommended with reserve: ~${Math.ceil(estimatedGasNeeded * 1.3)}L</li>
                        <li><i class="fas fa-check-circle text-success me-1"></i> Recommended configuration: 1 x 12L tank</li>
                        <li><i class="fas fa-check-circle text-success me-1"></i> Recommended gas mix: Air or Nitrox 32%</li>
                    </ul>
                </div>
            `;
            return;
        }
        
        // If validation failed, show warning
        if (!gasCheck.valid) {
            gasConsumptionSection.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Failed to calculate gas consumption. Please check your dive parameters and tank settings.
                </div>
                <div class="mt-2">
                    <strong>Possible reasons:</strong>
                    <ul>
                        <li>Tank size or pressure may be too low for this dive</li>
                        <li>Technical dives may require specific gas mixtures</li>
                        <li>Deep dives may need multiple tanks or special gases</li>
                    </ul>
                </div>
                <div class="mt-3">
                    <h6>Gas Requirements for this Dive:</h6>
                    <ul class="list-unstyled">
                        <li><i class="fas fa-info-circle me-1"></i> Estimated gas needed: ~${estimatedGasNeeded}L (w/o reserve)</li>
                        <li><i class="fas fa-info-circle me-1"></i> Recommended with reserve: ~${Math.ceil(estimatedGasNeeded * 1.3)}L</li>
                        <li><i class="fas fa-info-circle me-1"></i> Recommended configuration: 1 x 12L tank (200L gas @ 200 bar)</li>
                        <li><i class="fas fa-info-circle me-1"></i> Recommended gas mix: Air or Nitrox 32%</li>
                    </ul>
                </div>
                <div class="small mt-2 text-muted">
                    Based on average SAC rate of 20L/min at surface. Your actual consumption may vary based on experience, conditions, and exertion level.
                </div>
            `;
        } else {
            // Show success message
            gasConsumptionSection.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle me-2"></i>
                    Gas requirements satisfied for this dive plan.
                </div>
                <div class="mt-3">
                    <h6>Gas Requirements for this Dive:</h6>
                    <ul class="list-unstyled">
                        <li><i class="fas fa-check-circle text-success me-1"></i> Estimated gas needed: ~${estimatedGasNeeded}L (w/o reserve)</li>
                        <li><i class="fas fa-check-circle text-success me-1"></i> Recommended with reserve: ~${Math.ceil(estimatedGasNeeded * 1.3)}L</li>
                        <li><i class="fas fa-check-circle text-success me-1"></i> Recommended configuration: ${tankConfig}</li>
                        <li><i class="fas fa-check-circle text-success me-1"></i> Recommended gas mix: Air or Nitrox 32%</li>
                    </ul>
                </div>
                <div class="small mt-2 text-muted">
                    Based on average SAC rate of 20L/min at surface. Your actual consumption may vary based on experience, conditions, and exertion level.
                </div>
            `;
        }
    } catch (error) {
        // If calculation fails, show error
        console.error('Error calculating gas consumption:', error);
        gasConsumptionSection.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-times-circle me-2"></i>
                Error calculating gas requirements. Please check your inputs.
            </div>
        `;
    }
}
