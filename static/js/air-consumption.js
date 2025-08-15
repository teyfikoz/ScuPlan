/**
 * Tank Air Remaining Simulation
 * Advanced air consumption calculations for dive planning
 * METRIC SYSTEM ONLY
 */

class AirConsumptionCalculator {
    constructor() {
        this.initializeAirSimulation();
        this.bindEvents();
    }

    /**
     * Initialize air simulation display
     */
    initializeAirSimulation() {
        // Add air simulation container to dive results if it doesn't exist
        const resultsCard = document.querySelector('.dive-results .card-body');
        if (resultsCard && !document.getElementById('airSimulationContainer')) {
            const airSimulationHTML = `
                <div id="airSimulationContainer" class="mb-3" style="display: none;">
                    <h6><i class="fas fa-air-freshener me-2"></i>Air Consumption Simulation</h6>
                    <div id="airSimulationResults" class="air-simulation-box p-3 bg-light rounded">
                        <div class="row">
                            <div class="col-md-4">
                                <div class="air-stat">
                                    <span class="air-label">Air Used:</span>
                                    <span class="air-value fw-bold text-danger" id="airUsedValue">-- L</span>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="air-stat">
                                    <span class="air-label">Remaining Air:</span>
                                    <span class="air-value fw-bold text-success" id="remainingAirValue">-- L</span>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="air-stat">
                                    <span class="air-label">Remaining Pressure:</span>
                                    <span class="air-value fw-bold text-info" id="remainingPressureValue">-- bar</span>
                                </div>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-md-6">
                                <div class="air-stat">
                                    <span class="air-label">SAC Rate Used:</span>
                                    <span class="air-value" id="sacRateUsed">-- L/min</span>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="air-stat">
                                    <span class="air-label">Avg. Depth:</span>
                                    <span class="air-value" id="avgDepthUsed">-- m</span>
                                </div>
                            </div>
                        </div>
                        <div class="air-warning mt-2" id="airWarning" style="display: none;">
                            <div class="alert alert-warning alert-sm mb-0">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                <span id="airWarningText"></span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Insert before buddy results container
            const buddyContainer = document.getElementById('buddyResultsContainer');
            if (buddyContainer) {
                buddyContainer.insertAdjacentHTML('beforebegin', airSimulationHTML);
            }
        }
    }

    /**
     * Bind events for air consumption updates
     */
    bindEvents() {
        // Listen for dive calculation updates
        window.addEventListener('diveCalculated', (event) => {
            this.updateAirSimulation(event.detail);
        });

        // Listen for tank data changes
        window.addEventListener('tanksUpdated', () => {
            this.recalculateAirConsumption();
        });
    }

    /**
     * Update air simulation with dive data
     */
    updateAirSimulation(diveData) {
        const container = document.getElementById('airSimulationContainer');
        if (!container) return;

        // Get tank data
        const tanks = this.getTankData();
        if (tanks.length === 0) {
            container.style.display = 'none';
            return;
        }

        // Calculate air consumption for primary tank
        const primaryTank = tanks[0];
        const airConsumption = this.calculateAirConsumption(diveData, primaryTank);

        // Display results
        this.displayAirResults(airConsumption, diveData);
        this.displayRunTimeTable(airConsumption, diveData);
        container.style.display = 'block';
    }

    /**
     * Calculate air consumption based on dive profile and tank data
     */
    calculateAirConsumption(diveData, tank) {
        const depth = parseFloat(diveData.depth) || 18;
        const bottomTime = parseFloat(diveData.bottomTime) || 30;
        const sacRate = parseFloat(diveData.sacRate) || 20; // L/min
        const tankSize = parseFloat(tank.size) || 12; // L
        const tankPressure = parseFloat(tank.pressure) || 200; // bar
        
        const descentTime = parseFloat(diveData.descentTime) || 2;
        const ascentTime = parseFloat(diveData.ascentTime) || 3;
        
        // Calculate consumption for each phase (metric only)
        const descentConsumption = this.calculatePhaseConsumption(sacRate, 0, depth, descentTime);
        const bottomConsumption = this.calculatePhaseConsumption(sacRate, depth, depth, bottomTime);
        const ascentConsumption = this.calculatePhaseConsumption(sacRate, depth, 0, ascentTime);
        
        const totalAirUsed = descentConsumption + bottomConsumption + ascentConsumption;
        const totalAir = tankSize * tankPressure;
        const remainingAir = totalAir - totalAirUsed;
        const remainingPressure = remainingAir / tankSize;
        
        const avgDepth = (depth * (bottomTime + descentTime/2 + ascentTime/2)) / (bottomTime + descentTime + ascentTime);
        
        return {
            totalAirUsed,
            remainingAir,
            remainingPressure,
            totalAir,
            sacRate,
            avgDepth,
            phases: {
                descent: descentConsumption,
                bottom: bottomConsumption,
                ascent: ascentConsumption
            }
        };
    }

    /**
     * Calculate air consumption for a dive phase
     */
    calculatePhaseConsumption(sacRate, startDepth, endDepth, time) {
        const avgDepth = (startDepth + endDepth) / 2;
        const pressureAtDepth = (avgDepth / 10) + 1; // absolute pressure in bar
        return sacRate * pressureAtDepth * time;
    }

    /**
     * Display air consumption results (metric only)
     */
    displayAirResults(consumption, diveData) {
        // Update DOM elements with metric units only
        document.getElementById('airUsedValue').textContent = `${Math.round(consumption.totalAirUsed)} L`;
        document.getElementById('remainingAirValue').textContent = `${Math.round(consumption.remainingAir)} L`;
        document.getElementById('remainingPressureValue').textContent = `${consumption.remainingPressure.toFixed(1)} bar`;
        document.getElementById('sacRateUsed').textContent = `${consumption.sacRate} L/min`;
        document.getElementById('avgDepthUsed').textContent = `${consumption.avgDepth.toFixed(1)} m`;

        // Show warnings if necessary
        this.checkAirWarnings(consumption);
    }

    /**
     * Check and display air consumption warnings
     */
    checkAirWarnings(consumption) {
        const warningContainer = document.getElementById('airWarning');
        const warningText = document.getElementById('airWarningText');
        
        if (!warningContainer || !warningText) return;
        
        let warnings = [];
        
        // Check if remaining air is critically low
        const remainingPercentage = (consumption.remainingAir / consumption.totalAir) * 100;
        if (remainingPercentage < 30) {
            warnings.push(`Low air warning: Only ${remainingPercentage.toFixed(1)}% air remaining`);
        }
        
        // Check if remaining pressure is below safety reserve
        if (consumption.remainingPressure < 50) {
            warnings.push(`Safety reserve warning: Remaining pressure ${consumption.remainingPressure.toFixed(1)} bar is below 50 bar safety minimum`);
        }
        
        if (warnings.length > 0) {
            warningText.textContent = warnings.join('. ');
            warningContainer.style.display = 'block';
        } else {
            warningContainer.style.display = 'none';
        }
    }

    /**
     * Get tank data from the app state
     */
    getTankData() {
        return window.app && window.app.tanks ? window.app.tanks : [];
    }

    /**
     * Recalculate air consumption when tanks are updated
     */
    recalculateAirConsumption() {
        // Get the last calculated dive data
        const lastDiveData = window.app && window.app.currentPlan ? window.app.currentPlan : null;
        if (lastDiveData) {
            this.updateAirSimulation(lastDiveData);
        }
    }
}

// Initialize air consumption calculator
document.addEventListener('DOMContentLoaded', function() {
    window.airConsumptionCalculator = new AirConsumptionCalculator();
});