/**
 * ScuPlan - Dive Planning Module
 * Handles dive planning calculations, profile generation, and related functionalities
 */

/**
 * Calculate a simplified dive profile when offline or for quick calculations
 * @param {Object} planData - Plan data including depth and bottom time
 * @returns {Object} Calculated dive plan with profile
 */
function calculateOfflineDivePlan(planData) {
    console.log('Using offline dive plan calculation');
    
    const depth = planData.depth;
    const bottomTime = planData.bottomTime;
    
    // Simple calculation for descent and ascent times
    const descentRate = 18; // m/min (iniş hızı)
    const ascentRate = 9;   // m/min (çıkış hızı)
    
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
        // Ascent to first stop
        const firstStop = decoStops[0];
        const timeToFirstStop = (currentDepth - firstStop.depth) / ascentRate;
        timeElapsed += timeToFirstStop;
        
        profile.points.push({
            time: timeElapsed,
            depth: firstStop.depth,
            phase: 'deco_start'
        });
        
        // Process each stop
        for (let i = 0; i < decoStops.length; i++) {
            const stop = decoStops[i];
            
            // Time at this stop
            timeElapsed += stop.time;
            profile.points.push({
                time: timeElapsed,
                depth: stop.depth,
                phase: 'deco_stop'
            });
            
            // Transit to next stop if not the last one
            if (i < decoStops.length - 1) {
                const nextStop = decoStops[i + 1];
                const transitTime = (stop.depth - nextStop.depth) / ascentRate;
                timeElapsed += transitTime;
                
                profile.points.push({
                    time: timeElapsed,
                    depth: nextStop.depth,
                    phase: 'deco_transit'
                });
            }
        }
        
        // Final ascent to surface
        const lastStop = decoStops[decoStops.length - 1];
        const timeToSurface = lastStop.depth / ascentRate;
        timeElapsed += timeToSurface;
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
 * Calculate gas consumption offline using simplified models
 * @param {Object} planData - Plan data including depth, time, and tanks
 * @returns {Array} Gas consumption results for each tank
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
            totalConsumption: Math.round(totalConsumption),
            bottomConsumption: Math.round(bottomConsumption),
            descentConsumption: Math.round(descentConsumption),
            ascentConsumption: Math.round(ascentConsumption),
            remainingGas: Math.round(remainingGas),
            remainingPressure: Math.round(remainingPressure),
            safeRemainingPressure: Math.round(safeRemainingPressure),
            safetyReserve: Math.round(safetyReserve)
        });
    });
    
    return results;
}

/**
 * Check if a dive requires decompression based on depth and time
 * @param {number} depth - Dive depth in meters
 * @param {number} bottomTime - Bottom time in minutes
 * @returns {boolean} True if decompression is needed
 */
function isDecompressionNeeded(depth, bottomTime) {
    // Simple model for no-decompression limits
    const noDecoLimits = [
        {depth: 10, time: 219},
        {depth: 12, time: 147},
        {depth: 15, time: 92},
        {depth: 18, time: 63},
        {depth: 21, time: 48},
        {depth: 24, time: 37},
        {depth: 27, time: 29},
        {depth: 30, time: 24},
        {depth: 33, time: 19},
        {depth: 36, time: 16},
        {depth: 39, time: 14},
        {depth: 42, time: 11},
        {depth: 45, time: 9},
        {depth: 48, time: 8},
        {depth: 51, time: 7},
        {depth: 54, time: 6},
        {depth: 57, time: 6}
    ];
    
    // Find the closest depth in the table (rounded up)
    let closestLimit = noDecoLimits[0];
    
    for (const limit of noDecoLimits) {
        if (limit.depth >= depth) {
            closestLimit = limit;
            break;
        }
        closestLimit = limit;
    }
    
    // If the depth is beyond our table limits
    if (depth > 57) {
        return true; // Assume deco needed for very deep dives
    }
    
    // Compare bottom time with the no-deco limit
    return bottomTime > closestLimit.time;
}

/**
 * Calculate Equivalent Air Depth (EAD) for nitrox mixtures
 * @param {number} depth - Actual depth in meters
 * @param {number} oxygenPercent - Oxygen percentage in the gas mix
 * @returns {number} Equivalent Air Depth
 */
function calculateEAD(depth, oxygenPercent) {
    const oxygenFraction = oxygenPercent / 100;
    const nitrogenFraction = 1 - oxygenFraction;
    const airNitrogenFraction = 0.79;
    
    // EAD formula: EAD = ((FN2 / 0.79) * (Depth + 10)) - 10
    const ead = ((nitrogenFraction / airNitrogenFraction) * (depth + 10)) - 10;
    
    return Math.round(ead * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate Maximum Operating Depth (MOD) for a given O2 percentage
 * @param {number} oxygenPercent - Oxygen percentage in the gas mix
 * @param {number} pO2Limit - Maximum partial pressure of oxygen (default 1.4)
 * @returns {number} Maximum Operating Depth in meters
 */
function calculateMOD(oxygenPercent, pO2Limit = 1.4) {
    const oxygenFraction = oxygenPercent / 100;
    
    // MOD formula: MOD = ((pO2Limit / FO2) - 1) * 10
    const mod = ((pO2Limit / oxygenFraction) - 1) * 10;
    
    return Math.floor(mod); // Round down to be conservative
}

/**
 * Calculate partial pressure of oxygen at a given depth
 * @param {number} depth - Depth in meters
 * @param {number} oxygenPercent - Oxygen percentage in the gas mix
 * @returns {number} Partial pressure of oxygen (pO2)
 */
function calculatePO2(depth, oxygenPercent) {
    const oxygenFraction = oxygenPercent / 100;
    const pressure = (depth / 10) + 1; // Convert depth to pressure in bar
    
    // pO2 formula: pO2 = FO2 * Pressure
    const pO2 = oxygenFraction * pressure;
    
    return Math.round(pO2 * 100) / 100; // Round to 2 decimal places
}

/**
 * Check if the current dive plan is within recreational limits
 * @param {number} depth - Dive depth in meters
 * @param {number} bottomTime - Bottom time in minutes
 * @param {Object} gas - Gas data with o2_percentage
 * @returns {Object} Validation result with status and messages
 */
function validateDivePlan(depth, bottomTime, gas) {
    const results = {
        isValid: true,
        warnings: [],
        errors: []
    };
    
    // Check depth limits
    if (depth > 40) {
        results.warnings.push(`Depth of ${depth}m exceeds recreational diving limits of 40m.`);
    }
    if (depth > 57) {
        results.errors.push(`Depth of ${depth}m exceeds technical diving limits for most divers.`);
        results.isValid = false;
    }
    
    // Check decompression status
    if (isDecompressionNeeded(depth, bottomTime)) {
        results.warnings.push(`Bottom time of ${bottomTime} minutes at ${depth}m requires decompression stops.`);
    }
    
    // Check gas limitations if provided
    if (gas) {
        const o2Percent = gas.o2_percentage || 21;
        
        // Check MOD for nitrox
        if (o2Percent > 21) {
            const mod = calculateMOD(o2Percent);
            if (depth > mod) {
                results.errors.push(`Depth of ${depth}m exceeds the MOD of ${mod}m for ${o2Percent}% oxygen.`);
                results.isValid = false;
            } else if (depth > mod - 5) {
                results.warnings.push(`Depth of ${depth}m is close to the MOD of ${mod}m for ${o2Percent}% oxygen.`);
            }
            
            // Check pO2
            const pO2 = calculatePO2(depth, o2Percent);
            if (pO2 > 1.6) {
                results.errors.push(`Partial pressure of oxygen (${pO2} bar) exceeds critical limit of 1.6 bar.`);
                results.isValid = false;
            } else if (pO2 > 1.4) {
                results.warnings.push(`Partial pressure of oxygen (${pO2} bar) exceeds recommended limit of 1.4 bar.`);
            }
        }
    }
    
    // Check for very short dives
    if (bottomTime < 5) {
        results.warnings.push(`Bottom time of ${bottomTime} minutes is very short.`);
    }
    
    return results;
}

/**
 * Save the current dive plan to planner
 * Used when loading from a shared plan
 */
function saveSharedPlanToPlanner() {
    try {
        // Get plan data from the page
        const location = document.getElementById('sharedLocation').textContent;
        const diveType = document.getElementById('sharedDiveType').textContent;
        const maxDepth = document.getElementById('sharedMaxDepth').textContent;
        const bottomTime = document.getElementById('sharedBottomTime').textContent;
        
        // Extract numeric values
        const depth = parseFloat(maxDepth.replace('meters', '').trim());
        const time = parseFloat(bottomTime.replace('minutes', '').trim());
        
        // Get tanks if available
        const tanks = [];
        const tanksContainer = document.getElementById('sharedTanksContainer');
        const tankItems = tanksContainer.querySelectorAll('.tank-item');
        
        tankItems.forEach(item => {
            const tankInfo = item.querySelector('.small').textContent;
            const gasInfo = item.querySelectorAll('.small')[1].textContent;
            
            // Parse tank info
            const [size, pressure] = tankInfo.split('@').map(s => parseFloat(s.replace(/[^0-9.]/g, '')));
            
            // Parse gas info
            let gasType = 'air';
            let o2 = 21;
            let he = 0;
            
            if (gasInfo.includes('Nitrox') || gasInfo.includes('nitrox')) {
                gasType = 'nitrox';
                o2 = parseFloat(gasInfo.match(/(\d+)%\s*O₂/)[1]);
            } else if (gasInfo.includes('Trimix') || gasInfo.includes('trimix')) {
                gasType = 'trimix';
                o2 = parseFloat(gasInfo.match(/(\d+)%\s*O₂/)[1]);
                he = parseFloat(gasInfo.match(/(\d+)%\s*He/)[1]);
            } else if (gasInfo.includes('Oxygen') || gasInfo.includes('oxygen')) {
                gasType = 'oxygen';
                o2 = 100;
            }
            
            tanks.push({
                size: size,
                pressure: pressure,
                gasType: gasType,
                o2: o2,
                he: he
            });
        });
        
        // Get buddies if available
        const buddies = [];
        const buddiesContainer = document.getElementById('sharedBuddiesContainer');
        const buddyItems = buddiesContainer.querySelectorAll('.buddy-item');
        
        buddyItems.forEach(item => {
            const name = item.querySelector('.fw-bold').textContent;
            const certificationText = item.querySelectorAll('.small')[0].textContent;
            const skillLevelText = item.querySelectorAll('.small')[1].textContent;
            
            const certification = certificationText.replace('Certification:', '').trim();
            const skillLevel = skillLevelText.replace('Skill Level:', '').trim().toLowerCase();
            
            let specialty = 'none';
            if (item.querySelectorAll('.small').length > 2) {
                const specialtyText = item.querySelectorAll('.small')[2].textContent;
                specialty = specialtyText.replace('Specialty:', '').trim().toLowerCase();
            }
            
            buddies.push({
                name: name,
                certification: certification,
                skillLevel: skillLevel,
                specialty: specialty
            });
        });
        
        // Store the data to localStorage to pass it to the planner page
        const planData = {
            location: location === 'Not specified' ? '' : location,
            diveType: diveType.toLowerCase(),
            depth: depth,
            bottomTime: time,
            tanks: tanks,
            buddies: buddies
        };
        
        localStorage.setItem('importedPlan', JSON.stringify(planData));
        
        // Redirect to planner page
        window.location.href = '/';
        
    } catch (error) {
        console.error('Error saving plan to planner:', error);
        alert('Failed to import dive plan. Please try again.');
    }
}

/**
 * Check for imported plan data on page load
 * Used when redirecting from a shared plan
 */
function checkForImportedPlan() {
    const importedPlanData = localStorage.getItem('importedPlan');
    
    if (importedPlanData) {
        try {
            const planData = JSON.parse(importedPlanData);
            
            // Fill in the form fields
            document.getElementById('diveLocation').value = planData.location || '';
            document.getElementById('diveType').value = planData.diveType || 'recreational';
            document.getElementById('diveDepth').value = planData.depth || 18;
            document.getElementById('bottomTime').value = planData.bottomTime || 40;
            
            // Import tanks if any
            if (planData.tanks && planData.tanks.length > 0) {
                app.tanks = planData.tanks;
                updateTanksDisplay();
            }
            
            // Import buddies if any
            if (planData.buddies && planData.buddies.length > 0) {
                app.buddies = planData.buddies;
                updateBuddiesDisplay();
            }
            
            // Clear the imported data
            localStorage.removeItem('importedPlan');
            
            // Notify the user
            showAlert('Dive plan imported successfully!', 'success');
            
            // Calculate the dive plan
            setTimeout(() => {
                document.getElementById('calculateButton').click();
            }, 500);
            
        } catch (error) {
            console.error('Error loading imported plan:', error);
        }
    }
}

// Listen for page load to check for imported plans
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('divePlanForm')) {
        checkForImportedPlan();
    }
});
/**
 * Initialize dive planner functionality
 */
function initializeDivePlanner() {
    console.log('Initializing dive planner...');
    
    // Set up event listeners
    const calculateButton = document.getElementById('calculateButton');
    if (calculateButton) {
        calculateButton.addEventListener('click', calculateDivePlan);
    }
    
    // Initialize date picker for dive date
    const diveDateInput = document.getElementById('diveDate');
    if (diveDateInput) {
        initializeDatePicker(diveDateInput);
    }
    
    // Initialize time input for dive time
    const diveTimeInput = document.getElementById('diveTime');
    if (diveTimeInput) {
        diveTimeInput.addEventListener('blur', function() {
            formatTimeInput(this);
        });
    }
    
    // Initialize depth and time inputs with validation
    const depthInput = document.getElementById('depth');
    if (depthInput) {
        depthInput.addEventListener('blur', function() {
            validateDepthInput(this);
        });
    }
    
    const bottomTimeInput = document.getElementById('bottomTime');
    if (bottomTimeInput) {
        bottomTimeInput.addEventListener('blur', function() {
            validateTimeInput(this);
        });
    }
    
    console.log('Dive planner initialized');
}
