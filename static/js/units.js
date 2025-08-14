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
     * Initialize the unit system toggle in the UI
     */
    initializeToggle() {
        // Create toggle element if it doesn't exist
        if (!document.getElementById('unitToggle')) {
            this.createToggle();
        }
        
        // Set initial state
        const toggle = document.getElementById('unitToggle');
        if (toggle) {
            toggle.checked = this.currentSystem === 'imperial';
            toggle.addEventListener('change', (e) => {
                this.setSystem(e.target.checked ? 'imperial' : 'metric');
            });
        }
    }

    /**
     * Create the unit toggle UI element
     */
    createToggle() {
        const navbar = document.querySelector('.navbar-nav');
        if (navbar) {
            const toggleContainer = document.createElement('li');
            toggleContainer.className = 'nav-item d-flex align-items-center ms-3';
            toggleContainer.innerHTML = `
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="unitToggle">
                    <label class="form-check-label text-light small" for="unitToggle">
                        <span id="unitLabel">${this.currentSystem === 'metric' ? 'Metric' : 'Imperial'}</span>
                    </label>
                </div>
            `;
            navbar.appendChild(toggleContainer);
        }
    }

    /**
     * Set the unit system
     * @param {string} system - 'metric' or 'imperial'
     */
    setSystem(system) {
        this.currentSystem = system;
        localStorage.setItem('unitSystem', system);
        this.updateToggleLabel();
        this.applyUnits();
        this.triggerUnitsChange();
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
}

// Initialize global units manager
let unitsManager;
document.addEventListener('DOMContentLoaded', function() {
    unitsManager = new UnitsManager();
});