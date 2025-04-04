/**
 * ScuPlan - Gas Management Module
 * Handles all functionality related to gas calculations and tank management
 */

/**
 * Calculate gas consumption for the current dive plan
 * @param {Object} planData - The current dive plan data
 */
function calculateGasConsumption(planData) {
    // Only proceed if we have tanks
    if (!app.tanks || app.tanks.length === 0) {
        const gasConsumptionResults = document.getElementById('gasConsumptionResults');
        if (gasConsumptionResults) {
            gasConsumptionResults.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    No tanks added. Please add at least one tank to calculate gas consumption.
                </div>
                <div class="text-center mt-2">
                    <button class="btn btn-sm btn-outline-primary" onclick="showAddTankModal()">
                        <i class="fas fa-plus me-1"></i> Add Tank
                    </button>
                </div>
            `;
        }
        return;
    }
    
    const sacRate = document.getElementById('sacRate');
    
    const data = {
        depth: planData.depth,
        bottomTime: planData.bottomTime,
        sacRate: sacRate ? sacRate.value : 20,
        tanks: app.tanks
    };
    
    fetch('/api/gas-consumption', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        displayGasConsumptionResults(data.results);
    })
    .catch(error => {
        console.error('Error calculating gas consumption:', error);
        
        if (app.isOffline) {
            // Use simplified calculation when offline
            const offlineResults = calculateOfflineGasConsumption(planData);
            displayGasConsumptionResults(offlineResults);
        } else {
            // Use offline calculation as a fallback for any errors
            try {
                const fallbackResults = calculateOfflineGasConsumption(planData);
                displayGasConsumptionResults(fallbackResults);
            } catch (fallbackError) {
                console.error('Fallback calculation failed:', fallbackError);
                const gasConsumptionResults = document.getElementById('gasConsumptionResults');
                if (gasConsumptionResults) {
                    gasConsumptionResults.innerHTML = `
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-circle me-2"></i>
                            Failed to calculate gas consumption. Please check your dive parameters.
                        </div>
                    `;
                }
            }
        }
    });
}

/**
 * Display gas consumption results in the UI
 * @param {Array} results - Gas consumption results for each tank
 */
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
        
        // Check if there's enough gas and create appropriate alert level
        let alertClass = 'success';
        let statusIcon = 'fa-check-circle';
        let statusText = 'Adequate gas supply';
        
        if (result.safeRemainingPressure < 20) {
            alertClass = 'danger';
            statusIcon = 'fa-exclamation-triangle';
            statusText = 'Insufficient gas!';
        } else if (result.safeRemainingPressure < 50) {
            alertClass = 'warning';
            statusIcon = 'fa-exclamation-circle';
            statusText = 'Minimal gas reserve';
        }
        
        const tankDiv = document.createElement('div');
        tankDiv.className = 'mb-3 p-3 bg-light rounded';
        tankDiv.innerHTML = `
            <h6 class="mb-2">Tank ${result.tankIndex + 1}: ${result.tankSize}L @ ${result.initialPressure} bar (${gasInfo})</h6>
            
            <div class="row g-2 mb-2">
                <div class="col-md-3 col-6">
                    <div class="border rounded p-2 text-center h-100">
                        <div class="small text-muted">Descent</div>
                        <div class="fw-bold">${result.descentConsumption} L</div>
                    </div>
                </div>
                <div class="col-md-3 col-6">
                    <div class="border rounded p-2 text-center h-100">
                        <div class="small text-muted">Bottom</div>
                        <div class="fw-bold">${result.bottomConsumption} L</div>
                    </div>
                </div>
                <div class="col-md-3 col-6">
                    <div class="border rounded p-2 text-center h-100">
                        <div class="small text-muted">Ascent</div>
                        <div class="fw-bold">${result.ascentConsumption} L</div>
                    </div>
                </div>
                <div class="col-md-3 col-6">
                    <div class="border rounded p-2 text-center h-100">
                        <div class="small text-muted">Total</div>
                        <div class="fw-bold">${result.totalConsumption} L</div>
                    </div>
                </div>
            </div>
            
            <div class="alert alert-${alertClass} mb-2 py-1 px-2">
                <i class="fas ${statusIcon} me-1"></i> ${statusText}
            </div>
            
            <div class="progress mb-2" style="height: 25px;">
                <div class="progress-bar bg-success" role="progressbar" style="width: ${Math.min(50, (result.descentConsumption / (result.tankSize * result.initialPressure)) * 100)}%">
                    <span class="small">Descent</span>
                </div>
                <div class="progress-bar bg-warning" role="progressbar" style="width: ${Math.min(50, (result.bottomConsumption / (result.tankSize * result.initialPressure)) * 100)}%">
                    <span class="small">Bottom</span>
                </div>
                <div class="progress-bar bg-info" role="progressbar" style="width: ${Math.min(50, (result.ascentConsumption / (result.tankSize * result.initialPressure)) * 100)}%">
                    <span class="small">Ascent</span>
                </div>
                <div class="progress-bar bg-danger" role="progressbar" style="width: ${Math.min(50, (result.safetyReserve / (result.tankSize * result.initialPressure)) * 100)}%">
                    <span class="small">Reserve</span>
                </div>
                <div class="progress-bar bg-primary" role="progressbar" style="width: ${Math.min(100, (result.safeRemainingPressure * result.tankSize / (result.tankSize * result.initialPressure)) * 100)}%">
                    <span class="small">Remaining</span>
                </div>
            </div>
            
            <div class="row g-2">
                <div class="col-6">
                    <div class="border rounded p-2 h-100">
                        <div class="small text-muted">Remaining Gas</div>
                        <div class="d-flex justify-content-between">
                            <span class="fw-bold">${result.remainingGas} L</span>
                            <span>(${result.remainingPressure} bar)</span>
                        </div>
                    </div>
                </div>
                <div class="col-6">
                    <div class="border rounded p-2 h-100">
                        <div class="small text-muted">With Safety Reserve</div>
                        <div class="d-flex justify-content-between">
                            <span class="fw-bold">${Math.max(0, result.remainingGas - result.safetyReserve)} L</span>
                            <span>(${result.safeRemainingPressure} bar)</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(tankDiv);
        
        // Add a canvas for the chart and draw it if we're not in a very small viewport
        if (window.innerWidth > 576) {
            const chartContainer = document.createElement('div');
            chartContainer.className = 'mt-3';
            
            const canvas = document.createElement('canvas');
            canvas.id = `gasChart-${result.tankIndex}`;
            canvas.style.maxHeight = '180px';
            
            chartContainer.appendChild(canvas);
            tankDiv.appendChild(chartContainer);
            
            // Draw the chart
            drawGasConsumptionChart({
                descentConsumption: result.descentConsumption,
                bottomConsumption: result.bottomConsumption,
                ascentConsumption: result.ascentConsumption,
                safetyReserve: result.safetyReserve,
                safeRemainingVolume: Math.max(0, result.remainingGas - result.safetyReserve)
            }, `gasChart-${result.tankIndex}`);
        }
    });
}

/**
 * Calculate total gas needed for a dive
 * @param {number} depth - Dive depth in meters
 * @param {number} bottomTime - Bottom time in minutes
 * @param {number} sacRate - Surface air consumption rate (L/min)
 * @returns {number} Total gas needed in liters
 */
function calculateTotalGasNeeded(depth, bottomTime, sacRate = 20) {
    const pressureFactor = (depth / 10) + 1;
    const bottomConsumption = sacRate * pressureFactor * bottomTime;
    
    // Descent and ascent times
    const descentTime = depth / 18; // 18 m/min descent rate
    const ascentTime = (depth / 9) + (depth > 15 ? 3 : 0); // 9 m/min ascent + safety stop if deeper than 15m
    
    // Descent and ascent consumption with average pressure factors
    const descentConsumption = sacRate * ((depth / 20) + 1) * descentTime;
    const ascentConsumption = sacRate * ((depth / 20) + 1) * ascentTime;
    
    // Total gas needed including safety reserve (33%)
    const totalConsumption = bottomConsumption + descentConsumption + ascentConsumption;
    const withReserve = totalConsumption * 1.33;
    
    return withReserve;
}

/**
 * Recommend optimal gas mixes based on planned depth
 * @param {number} depth - Planned dive depth
 * @returns {string} Recommendation text
 */
function recommendGasMix(depth) {
    if (depth <= 18) {
        return 'Air or Nitrox 32% (EANx32)';
    } else if (depth <= 30) {
        return 'Air or Nitrox 32/28% (EANx32/28)';
    } else if (depth <= 40) {
        return 'Air or Nitrox 21-28% (EANx21-28)';
    } else if (depth <= 50) {
        return 'Trimix 21/35 or 18/45';
    } else if (depth <= 60) {
        return 'Trimix 18/45 or 15/55';
    } else {
        return 'Trimix 10/70 or 12/65';
    }
}
