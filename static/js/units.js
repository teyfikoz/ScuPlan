/**
 * Units Conversion and Management System
 * Handles conversion between Metric and Imperial units for diving calculations
 */

class UnitsManager {
    constructor() {
        this.currentSystem = localStorage.getItem('unitSystem') || 'metric';
        this.initializeToggle();
        this.applyUnits();
    }

    /**
     * Initialize the unit system (METRIC ONLY)
     */
    initializeToggle() {
        // Force metric system only - no toggle needed
        this.currentSystem = 'metric';
        localStorage.setItem('unitSystem', 'metric');
        return; // Skip toggle creation
    }

    /**
     * Create the unit toggle UI element (DISABLED - METRIC ONLY)
     */
    createToggle() {
        // No toggle creation - metric system only
        return;
    }

    /**
     * Set the unit system
     * @param {string} system - 'metric' or 'imperial'
     */
    setSystem(system) {
        this.currentSystem = system;
        localStorage.setItem('unitSystem', system);
        this.updateToggleLabel();
        this.convertInputValues(); // Convert input values first
        this.applyUnits();
        this.triggerUnitsChange();
    }

    /**
     * Trigger a units change event for other components
     */
    triggerUnitsChange() {
        const event = new CustomEvent('unitsChanged', {
            detail: {
                system: this.currentSystem,
                units: {
                    depth: this.getDepthUnit(),
                    pressure: this.getPressureUnit(),
                    volume: this.getVolumeUnit()
                }
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * Update the toggle label
     */
    updateToggleLabel() {
        const label = document.getElementById('unitLabel');
        if (label) {
            label.textContent = this.currentSystem === 'metric' ? 'Metric' : 'Imperial';
        }
    }

    /**
     * Apply unit labels throughout the UI
     */
    applyUnits() {
        // Update depth labels
        document.querySelectorAll('[data-unit="depth"]').forEach(element => {
            element.textContent = this.getDepthUnit();
        });

        // Update pressure labels
        document.querySelectorAll('[data-unit="pressure"]').forEach(element => {
            element.textContent = this.getPressureUnit();
        });

        // Update volume labels
        document.querySelectorAll('[data-unit="volume"]').forEach(element => {
            element.textContent = this.getVolumeUnit();
        });
        
        // Convert input field values
        this.convertInputValues();
        
        // Update any existing results displays
        this.updateAllUnits();
    }

    /**
     * Trigger a custom event when units change
     */
    triggerUnitsChange() {
        window.dispatchEvent(new CustomEvent('unitsChanged', {
            detail: { system: this.currentSystem }
        }));
    }

    /**
     * Get current depth unit
     */
    getDepthUnit() {
        return this.currentSystem === 'metric' ? 'm' : 'ft';
    }

    /**
     * Get current pressure unit
     */
    getPressureUnit() {
        return this.currentSystem === 'metric' ? 'bar' : 'psi';
    }

    /**
     * Get current volume unit
     */
    getVolumeUnit() {
        return this.currentSystem === 'metric' ? 'L' : 'cu ft';
    }

    /**
     * Convert depth between units
     */
    convertDepth(value, fromSystem = null) {
        if (fromSystem === null) fromSystem = this.currentSystem;
        
        if (fromSystem === 'metric' && this.currentSystem === 'imperial') {
            return value * 3.28084; // meters to feet
        } else if (fromSystem === 'imperial' && this.currentSystem === 'metric') {
            return value / 3.28084; // feet to meters
        }
        return value;
    }

    /**
     * Convert pressure between units
     */
    convertPressure(value, fromSystem = null) {
        if (fromSystem === null) fromSystem = this.currentSystem;
        
        if (fromSystem === 'metric' && this.currentSystem === 'imperial') {
            return value * 14.5038; // bar to psi
        } else if (fromSystem === 'imperial' && this.currentSystem === 'metric') {
            return value / 14.5038; // psi to bar
        }
        return value;
    }

    /**
     * Convert volume between units
     */
    convertVolume(value, fromSystem = null) {
        if (fromSystem === null) fromSystem = this.currentSystem;
        
        if (fromSystem === 'metric' && this.currentSystem === 'imperial') {
            return value / 28.3168; // liters to cubic feet
        } else if (fromSystem === 'imperial' && this.currentSystem === 'metric') {
            return value * 28.3168; // cubic feet to liters
        }
        return value;
    }

    /**
     * Format value with appropriate unit
     */
    formatDepth(value, precision = 1) {
        return `${value.toFixed(precision)} ${this.getDepthUnit()}`;
    }

    formatPressure(value, precision = 1) {
        return `${value.toFixed(precision)} ${this.getPressureUnit()}`;
    }

    formatVolume(value, precision = 1) {
        return `${value.toFixed(precision)} ${this.getVolumeUnit()}`;
    }

    /**
     * Get conversion factors for calculations
     */
    getConversionFactors() {
        return {
            depth: this.currentSystem === 'imperial' ? 3.28084 : 1,
            pressure: this.currentSystem === 'imperial' ? 14.5038 : 1,
            volume: this.currentSystem === 'imperial' ? 1/28.3168 : 1
        };
    }

    /**
     * Convert input field values when units change
     */
    convertInputValues() {
        // Store current values before conversion
        const previousSystem = this.currentSystem === 'metric' ? 'imperial' : 'metric';
        
        // Convert depth inputs - comprehensive selectors
        const depthInputs = document.querySelectorAll(`
            input[id*="Depth"], input[id*="depth"], 
            input[id="maxDepth"], input[id="firstDiveDepth"], 
            input[id="secondDiveDepth"], input[id="ndlDepth"],
            input[id="avgDepth"], input[id="simDepth"]
        `);
        depthInputs.forEach(input => {
            if (input.value && !isNaN(input.value)) {
                const oldValue = parseFloat(input.value);
                const newValue = this.convertDepth(oldValue, previousSystem);
                input.value = Math.round(newValue * 10) / 10; // Round to 1 decimal
            }
        });
        
        // Convert pressure inputs  
        const pressureInputs = document.querySelectorAll(`
            input[id*="pressure"], input[id*="Pressure"],
            input[id="workingPressure"]
        `);
        pressureInputs.forEach(input => {
            if (input.value && !isNaN(input.value)) {
                const oldValue = parseFloat(input.value);
                const newValue = this.convertPressure(oldValue, previousSystem);
                input.value = Math.round(newValue);
            }
        });
        
        // Convert SAC rate and volume inputs
        const volumeInputs = document.querySelectorAll(`
            input[id*="SAC"], input[id*="sac"], input[id*="Rate"],
            input[id="tankSize"], input[id="simSAC"]
        `);
        volumeInputs.forEach(input => {
            if (input.value && !isNaN(input.value)) {
                const oldValue = parseFloat(input.value);
                const newValue = this.convertVolume(oldValue, previousSystem);
                input.value = Math.round(newValue * 10) / 10; // Round to 1 decimal
            }
        });
        
        // Update any displayed results that might be visible
        this.updateDisplayedResults();
    }

    /**
     * Update displayed results when units change
     */
    updateDisplayedResults() {
        // Update dive plan results if visible
        const diveResults = document.getElementById('diveResults');
        if (diveResults && diveResults.style.display !== 'none') {
            // Trigger recalculation of dive plan
            const calculateBtn = document.querySelector('button[onclick="calculateDivePlan()"]');
            if (calculateBtn && typeof calculateDivePlan === 'function') {
                calculateDivePlan();
            }
        }
        
        // Update any visible calculator results
        const resultContainers = document.querySelectorAll('.alert:not([style*="display: none"])');
        resultContainers.forEach(container => {
            // Update unit displays in results
            const spans = container.querySelectorAll('span[id*="Depth"], span[id*="depth"], span[id*="Pressure"], span[id*="pressure"]');
            spans.forEach(span => {
                const textContent = span.textContent;
                if (textContent.includes('m') || textContent.includes('ft')) {
                    // Update depth units in result text
                    const value = parseFloat(textContent);
                    if (!isNaN(value)) {
                        span.textContent = this.formatDepth(this.convertDepth(value, this.currentSystem === 'metric' ? 'imperial' : 'metric'));
                    }
                }
            });
        });
    }
    
    /**
     * Update all unit displays in existing content
     */
    updateAllUnits() {
        // Update any depth values displayed in results
        document.querySelectorAll('[data-depth]').forEach(element => {
            const depth = parseFloat(element.getAttribute('data-depth'));
            if (!isNaN(depth)) {
                const converted = this.currentSystem === 'metric' ? depth : depth * 3.28084;
                element.textContent = Math.round(converted * 10) / 10 + this.getDepthUnit();
            }
        });
        
        // Update pressure displays
        document.querySelectorAll('[data-pressure]').forEach(element => {
            const pressure = parseFloat(element.getAttribute('data-pressure'));
            if (!isNaN(pressure)) {
                const converted = this.currentSystem === 'metric' ? pressure : pressure * 14.5038;
                element.textContent = Math.round(converted) + this.getPressureUnit();
            }
        });
    }
}

// Initialize global units manager
window.unitsManager = null;
document.addEventListener('DOMContentLoaded', function() {
    window.unitsManager = new UnitsManager();
});