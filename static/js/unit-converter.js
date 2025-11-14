/**
 * ScuPlan - Unit Conversion System
 * Handles conversion between Metric and Imperial units for diving calculations
 */

class UnitConverter {
    constructor() {
        this.currentSystem = 'metric'; // Default to metric
        this.initializeSystem();
        this.setupEventListeners();
        this.loadUserPreference();
    }

    /**
     * Initialize the unit conversion system
     */
    initializeSystem() {
        // Conversion factors
        this.conversions = {
            // Distance/Depth: meters <-> feet
            depth: {
                toImperial: (meters) => meters * 3.28084,
                toMetric: (feet) => feet / 3.28084,
                metricUnit: 'm',
                imperialUnit: 'ft',
                precision: 1
            },
            // Pressure: bar <-> PSI
            pressure: {
                toImperial: (bar) => bar * 14.5038,
                toMetric: (psi) => psi / 14.5038,
                metricUnit: 'bar',
                imperialUnit: 'PSI',
                precision: 0
            },
            // Temperature: Celsius <-> Fahrenheit
            temperature: {
                toImperial: (celsius) => (celsius * 9/5) + 32,
                toMetric: (fahrenheit) => (fahrenheit - 32) * 5/9,
                metricUnit: '°C',
                imperialUnit: '°F',
                precision: 1
            },
            // Volume: Liters <-> Cubic Feet
            volume: {
                toImperial: (liters) => liters * 0.0353147,
                toMetric: (cuft) => cuft / 0.0353147,
                metricUnit: 'L',
                imperialUnit: 'cuft',
                precision: 0
            },
            // Weight: Kilograms <-> Pounds
            weight: {
                toImperial: (kg) => kg * 2.20462,
                toMetric: (lbs) => lbs / 2.20462,
                metricUnit: 'kg',
                imperialUnit: 'lbs',
                precision: 1
            },
            // Distance/Visibility: meters <-> yards
            distance: {
                toImperial: (meters) => meters * 1.09361,
                toMetric: (yards) => yards / 1.09361,
                metricUnit: 'm',
                imperialUnit: 'yd',
                precision: 1
            }
        };

        // Make converter globally available
        window.unitsManager = this;
    }

    /**
     * Setup event listeners for unit system toggle
     */
    setupEventListeners() {
        const metricToggle = document.getElementById('metricSystem');
        const imperialToggle = document.getElementById('imperialSystem');

        // Add null checks to prevent errors when elements don't exist
        if (metricToggle) {
            metricToggle.addEventListener('change', () => {
                if (metricToggle.checked) {
                    this.switchToMetric();
                }
            });
        }

        if (imperialToggle) {
            imperialToggle.addEventListener('change', () => {
                if (imperialToggle.checked) {
                    this.switchToImperial();
                }
            });
        }
    }

    /**
     * Switch to metric system
     */
    switchToMetric() {
        console.log('Switching to metric system');
        this.currentSystem = 'metric';
        this.updateAllUnits();
        this.saveUserPreference();
        this.showUnitChangeNotification('Switched to Metric units');
    }

    /**
     * Switch to imperial system
     */
    switchToImperial() {
        console.log('Switching to imperial system');
        this.currentSystem = 'imperial';
        this.updateAllUnits();
        this.saveUserPreference();
        this.showUnitChangeNotification('Switched to Imperial units');
    }

    /**
     * Convert a value from one unit system to another
     */
    convert(value, type, fromSystem = null) {
        if (typeof value !== 'number' || isNaN(value)) {
            return value;
        }

        const conversion = this.conversions[type];
        if (!conversion) {
            console.warn(`Unknown conversion type: ${type}`);
            return value;
        }

        const sourceSystem = fromSystem || (this.currentSystem === 'metric' ? 'imperial' : 'metric');

        if (this.currentSystem === 'metric' && sourceSystem === 'imperial') {
            return parseFloat(conversion.toMetric(value).toFixed(conversion.precision));
        } else if (this.currentSystem === 'imperial' && sourceSystem === 'metric') {
            return parseFloat(conversion.toImperial(value).toFixed(conversion.precision));
        }

        return value;
    }

    /**
     * Get the appropriate unit symbol for the current system
     */
    getUnit(type) {
        const conversion = this.conversions[type];
        if (!conversion) {
            return '';
        }

        return this.currentSystem === 'metric' ? conversion.metricUnit : conversion.imperialUnit;
    }

    /**
     * Get current unit symbols for different measurement types
     */
    getUnits() {
        return {
            depth: this.getUnit('depth'),
            pressure: this.getUnit('pressure'),
            temperature: this.getUnit('temperature'),
            volume: this.getUnit('volume'),
            weight: this.getUnit('weight'),
            distance: this.getUnit('distance')
        };
    }

    /**
     * Convert and format a value with its unit
     */
    formatWithUnit(value, type, precision = null) {
        if (typeof value !== 'number' || isNaN(value)) {
            return '--';
        }

        const conversion = this.conversions[type];
        const convertedValue = this.convert(value, type);
        const unit = this.getUnit(type);
        const finalPrecision = precision !== null ? precision : (conversion?.precision || 1);

        return `${convertedValue.toFixed(finalPrecision)} ${unit}`;
    }

    /**
     * Update all unit labels and values in the DOM
     */
    updateAllUnits() {
        // Update unit labels
        this.updateUnitLabels();

        // Update input values if they exist
        this.updateInputValues();

        // Update result displays
        this.updateResultDisplays();

        // Trigger custom event for other components
        const event = new CustomEvent('unitsChanged', {
            detail: { 
                system: this.currentSystem,
                units: this.getUnits()
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Update unit labels throughout the interface
     */
    updateUnitLabels() {
        // Update elements with data-unit attributes
        const unitElements = document.querySelectorAll('[data-unit]');

        unitElements.forEach(element => {
            const unitType = element.dataset.unit;
            const unit = this.getUnit(unitType);
            if (unit) {
                element.textContent = unit;
            }
        });
    }

    /**
     * Update input values when switching unit systems
     * IMPORTANT: This should ONLY be called when user toggles metric/imperial
     * NEVER call this on input events - it will reset user edits
     * Percentage fields (O2%, He%) should NEVER have data-unit-type and will not be affected
     */
    updateInputValues() {
        // Depth inputs - only convert fields explicitly marked with data-unit-type="depth"
        const depthInputs = document.querySelectorAll('input[data-unit-type="depth"]');
        depthInputs.forEach(input => {
            const currentValue = parseFloat(input.value);
            if (!isNaN(currentValue) && currentValue > 0) {
                const convertedValue = this.convert(currentValue, 'depth', 
                    this.currentSystem === 'metric' ? 'imperial' : 'metric');
                input.value = convertedValue;
            }
        });

        // Pressure inputs - only convert fields explicitly marked with data-unit-type="pressure"
        const pressureInputs = document.querySelectorAll('input[data-unit-type="pressure"]');
        pressureInputs.forEach(input => {
            const currentValue = parseFloat(input.value);
            if (!isNaN(currentValue) && currentValue > 0) {
                const convertedValue = this.convert(currentValue, 'pressure',
                    this.currentSystem === 'metric' ? 'imperial' : 'metric');
                input.value = Math.round(convertedValue);
            }
        });
    }

    /**
     * Update result displays with converted values
     */
    updateResultDisplays() {
        // This will be called by individual components when they need to update
        // Results will be converted in real-time during calculations
    }

    /**
     * Save user's unit system preference
     */
    saveUserPreference() {
        try {
            localStorage.setItem('scuplan_unit_system', this.currentSystem);
        } catch (error) {
            console.warn('Could not save unit preference:', error);
        }
    }

    /**
     * Load user's unit system preference
     */
    loadUserPreference() {
        try {
            const savedSystem = localStorage.getItem('scuplan_unit_system');
            if (savedSystem && (savedSystem === 'metric' || savedSystem === 'imperial')) {
                this.currentSystem = savedSystem;

                // Update toggle buttons
                const metricToggle = document.getElementById('metricSystem');
                const imperialToggle = document.getElementById('imperialSystem');

                if (savedSystem === 'metric' && metricToggle) {
                    metricToggle.checked = true;
                } else if (savedSystem === 'imperial' && imperialToggle) {
                    imperialToggle.checked = true;
                }

                // Update UI to reflect saved preference
                setTimeout(() => this.updateAllUnits(), 100);
            }
        } catch (error) {
            console.warn('Could not load unit preference:', error);
        }
    }

    /**
     * Show notification when units are changed
     */
    showUnitChangeNotification(message) {
        // Create a toast notification
        if (typeof showAlert === 'function') {
            showAlert(message, 'info', 2000);
        } else {
            console.log(message);
        }
    }

    /**
     * Get conversion factors for calculations
     */
    getConversionFactors() {
        return {
            depth: this.currentSystem === 'imperial' ? 3.28084 : 1,
            pressure: this.currentSystem === 'imperial' ? 14.5038 : 1,
            temperature: (value) => this.currentSystem === 'imperial' ? (value * 9/5) + 32 : value,
            volume: this.currentSystem === 'imperial' ? 0.0353147 : 1,
            weight: this.currentSystem === 'imperial' ? 2.20462 : 1
        };
    }

    /**
     * Helper methods for specific conversions commonly used in diving
     */

    // Convert depth with proper precision
    convertDepth(meters, targetSystem = null) {
        const system = targetSystem || this.currentSystem;
        if (system === 'imperial') {
            return parseFloat((meters * 3.28084).toFixed(1));
        }
        return parseFloat(meters.toFixed(1));
    }

    // Convert pressure with proper precision  
    convertPressure(bar, targetSystem = null) {
        const system = targetSystem || this.currentSystem;
        if (system === 'imperial') {
            return Math.round(bar * 14.5038);
        }
        return Math.round(bar);
    }

    // Convert volume with proper precision
    convertVolume(liters, targetSystem = null) {
        const system = targetSystem || this.currentSystem;
        if (system === 'imperial') {
            return Math.round(liters * 0.0353147);
        }
        return Math.round(liters);
    }

    // Get unit strings
    getDepthUnit() { return this.getUnit('depth'); }
    getPressureUnit() { return this.getUnit('pressure'); }
    getVolumeUnit() { return this.getUnit('volume'); }
    getTemperatureUnit() { return this.getUnit('temperature'); }
    getWeightUnit() { return this.getUnit('weight'); }
}

// Initialize unit converter when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Unit Converter');
    window.unitConverter = new UnitConverter();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnitConverter;
}