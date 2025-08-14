/**
 * Tank Air Remaining Simulation
 * Advanced air consumption calculations for dive planning
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
                                    <span class="air-value fw-bold text-info" id="remainingPressureValue">-- <span data-unit="pressure">bar</span></span>
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
                                    <span class="air-value" id="avgDepthUsed">-- <span data-unit="depth">m</span></span>
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

        // Listen for units change
        window.addEventListener('unitsChanged', () => {
            this.updateUnitsDisplay();
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

        // Show decompression explanation when air simulation is displayed
        const decoBox = document.getElementById('decoExplanationBox');
        if (decoBox) {
            decoBox.style.display = 'block';
        }
    }

    /**
     * Calculate air consumption based on dive profile and tank data
     */
    calculateAirConsumption(diveData, tank) {
        const depth = parseFloat(diveData.depth) || 30;
        const bottomTime = parseFloat(diveData.bottomTime) || 30;
        const descentTime = parseFloat(diveData.descentTime) || 2;
        const ascentTime = parseFloat(diveData.ascentTime) || 3;
        const totalTime = bottomTime + descentTime + ascentTime;

        // Tank specifications
        const tankSize = parseFloat(tank.size) || 12; // liters
        const tankPressure = parseFloat(tank.pressure) || 200; // bar
        const totalAir = tankSize * tankPressure; // total air in liters at 1 bar

        // SAC rate estimation (can be made configurable)
        const sacRate = parseFloat(tank.sacRate) || 20; // L/min at surface

        // Calculate air consumption for each phase
        const descentConsumption = this.calculatePhaseConsumption(
            sacRate, 0, depth, descentTime
        );
        
        const bottomConsumption = this.calculatePhaseConsumption(
            sacRate, depth, depth, bottomTime
        );
        
        const ascentConsumption = this.calculatePhaseConsumption(
            sacRate, depth, 0, ascentTime
        );

        const totalAirUsed = descentConsumption + bottomConsumption + ascentConsumption;
        const remainingAir = totalAir - totalAirUsed;
        const remainingPressure = remainingAir / tankSize;

        // Calculate average depth for display
        const avgDepth = (depth * (bottomTime + descentTime/2 + ascentTime/2)) / totalTime;

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
     * Display air consumption results
     */
    displayAirResults(consumption, diveData) {
        const unitsManager = window.unitsManager;
        
        // Update values with unit conversions
        const airUsedDisplay = unitsManager ? 
            unitsManager.formatVolume(consumption.totalAirUsed, 0) :
            `${Math.round(consumption.totalAirUsed)} L`;
            
        const remainingAirDisplay = unitsManager ? 
            unitsManager.formatVolume(consumption.remainingAir, 0) :
            `${Math.round(consumption.remainingAir)} L`;
            
        const remainingPressureDisplay = unitsManager ? 
            unitsManager.formatPressure(consumption.remainingPressure, 1) :
            `${consumption.remainingPressure.toFixed(1)} bar`;
            
        const avgDepthDisplay = unitsManager ? 
            unitsManager.formatDepth(consumption.avgDepth, 1) :
            `${consumption.avgDepth.toFixed(1)} m`;

        // Update DOM elements
        document.getElementById('airUsedValue').textContent = airUsedDisplay;
        document.getElementById('remainingAirValue').textContent = remainingAirDisplay;
        document.getElementById('remainingPressureValue').innerHTML = remainingPressureDisplay;
        document.getElementById('sacRateUsed').textContent = `${consumption.sacRate} L/min`;
        document.getElementById('avgDepthUsed').innerHTML = avgDepthDisplay;

        // Show warnings if necessary
        this.checkAirWarnings(consumption);
    }

    /**
     * Display run time table with segment breakdown
     */
    displayRunTimeTable(consumption, diveData) {
        const tableContainer = document.getElementById('runTimeTableContainer');
        const tableBody = document.getElementById('runTimeTableBody');
        
        if (!tableContainer || !tableBody) return;

        const unitsManager = window.unitsManager;
        const descentTime = parseFloat(diveData.descentTime) || 2;
        const bottomTime = parseFloat(diveData.bottomTime) || 30;
        const ascentTime = parseFloat(diveData.ascentTime) || 3;
        
        let cumulativeTime = 0;
        let remainingAir = consumption.totalAir;

        const segments = [
            {
                name: 'Descent',
                time: descentTime,
                airUsed: consumption.phases.descent
            },
            {
                name: 'Bottom',
                time: bottomTime,
                airUsed: consumption.phases.bottom
            },
            {
                name: 'Ascent',
                time: ascentTime,
                airUsed: consumption.phases.ascent
            }
        ];

        let tableHTML = '';
        segments.forEach(segment => {
            cumulativeTime += segment.time;
            remainingAir -= segment.airUsed;
            
            const airUsedDisplay = unitsManager ? 
                unitsManager.formatVolume(segment.airUsed, 0) :
                `${Math.round(segment.airUsed)} L`;
                
            const remainingDisplay = unitsManager ? 
                unitsManager.formatVolume(remainingAir, 0) :
                `${Math.round(remainingAir)} L`;
            
            tableHTML += `
                <tr>
                    <td><strong>${segment.name}</strong></td>
                    <td>${segment.time}</td>
                    <td>${airUsedDisplay}</td>
                    <td>${cumulativeTime}</td>
                    <td>${remainingDisplay}</td>
                </tr>
            `;
        });

        tableBody.innerHTML = tableHTML;
        tableContainer.style.display = 'block';
    }

    /**
     * Check for air consumption warnings
     */
    checkAirWarnings(consumption) {
        const warningContainer = document.getElementById('airWarning');
        const warningText = document.getElementById('airWarningText');
        
        if (!warningContainer || !warningText) return;

        let warning = null;
        
        if (consumption.remainingPressure < 50) {
            warning = 'Low remaining air pressure. Consider reducing dive time or depth.';
        } else if (consumption.remainingAir < 500) {
            warning = 'Low remaining air volume. Plan for emergency ascent procedures.';
        } else if (consumption.totalAirUsed / consumption.totalAir > 0.8) {
            warning = 'High air consumption ratio. Consider backup air source or buddy procedures.';
        }

        if (warning) {
            warningText.textContent = warning;
            warningContainer.style.display = 'block';
        } else {
            warningContainer.style.display = 'none';
        }
    }

    /**
     * Get tank data from the tanks system
     */
    getTankData() {
        const tanks = [];
        document.querySelectorAll('.tank-container').forEach(container => {
            const sizeInput = container.querySelector('input[placeholder*="size"]');
            const pressureInput = container.querySelector('input[placeholder*="pressure"]');
            const o2Input = container.querySelector('input[placeholder*="O₂"]');
            
            if (sizeInput && pressureInput) {
                tanks.push({
                    size: sizeInput.value,
                    pressure: pressureInput.value,
                    o2: o2Input ? o2Input.value : 21,
                    sacRate: 20 // Default SAC rate, can be made configurable
                });
            }
        });
        return tanks;
    }

    /**
     * Recalculate air consumption when tank data changes
     */
    recalculateAirConsumption() {
        // Trigger recalculation if dive results are visible
        const resultsContainer = document.getElementById('diveResults');
        if (resultsContainer && resultsContainer.style.display !== 'none') {
            // Get current dive data from form
            const diveData = {
                depth: document.getElementById('depthInput')?.value,
                bottomTime: document.getElementById('timeInput')?.value,
                descentTime: 2, // Default values
                ascentTime: 3
            };
            this.updateAirSimulation(diveData);
        }
    }

    /**
     * Update units display when unit system changes
     */
    updateUnitsDisplay() {
        // Re-trigger display update if results are visible
        this.recalculateAirConsumption();
    }
}

// Initialize air consumption calculator
document.addEventListener('DOMContentLoaded', function() {
    new AirConsumptionCalculator();
});