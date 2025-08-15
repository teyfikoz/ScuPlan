/**
 * Minimal Unit Converter Widget
 * Supports meters ↔ feet, liters ↔ cu ft, bar ↔ psi
 */

class MinimalUnitConverter {
    constructor() {
        this.createWidget();
        this.initializeEventListeners();
    }

    createWidget() {
        // Check if widget already exists
        if (document.getElementById('unitConverterWidget')) return;

        const widget = document.createElement('div');
        widget.id = 'unitConverterWidget';
        widget.className = 'unit-converter-widget position-fixed';
        widget.style.cssText = `
            top: 20px;
            right: 20px;
            width: 300px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000;
            display: none;
            padding: 16px;
            font-family: system-ui, -apple-system, sans-serif;
        `;

        widget.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="mb-0"><i class="fas fa-exchange-alt me-2"></i>Unit Converter</h6>
                <button type="button" class="btn-close" onclick="unitConverter.hideWidget()"></button>
            </div>

            <!-- Depth Conversion -->
            <div class="converter-section mb-3">
                <label class="form-label small fw-bold">Depth Conversion</label>
                <div class="row g-2">
                    <div class="col-6">
                        <div class="input-group input-group-sm">
                            <input type="number" class="form-control" id="depthMeters" placeholder="0" step="0.1">
                            <span class="input-group-text">m</span>
                            <span class="tooltip-icon" data-bs-toggle="tooltip" title="Meters - metric depth measurement">?</span>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="input-group input-group-sm">
                            <input type="number" class="form-control" id="depthFeet" placeholder="0" step="0.1">
                            <span class="input-group-text">ft</span>
                            <span class="tooltip-icon" data-bs-toggle="tooltip" title="Feet - imperial depth measurement">?</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Volume Conversion -->
            <div class="converter-section mb-3">
                <label class="form-label small fw-bold">Volume Conversion</label>
                <div class="row g-2">
                    <div class="col-6">
                        <div class="input-group input-group-sm">
                            <input type="number" class="form-control" id="volumeLiters" placeholder="0" step="1">
                            <span class="input-group-text">L</span>
                            <span class="tooltip-icon" data-bs-toggle="tooltip" title="Liters - metric volume measurement">?</span>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="input-group input-group-sm">
                            <input type="number" class="form-control" id="volumeCuFt" placeholder="0" step="0.1">
                            <span class="input-group-text">cu ft</span>
                            <span class="tooltip-icon" data-bs-toggle="tooltip" title="Cubic feet - imperial volume measurement">?</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pressure Conversion -->
            <div class="converter-section mb-3">
                <label class="form-label small fw-bold">Pressure Conversion</label>
                <div class="row g-2">
                    <div class="col-6">
                        <div class="input-group input-group-sm">
                            <input type="number" class="form-control" id="pressureBar" placeholder="0" step="1">
                            <span class="input-group-text">bar</span>
                            <span class="tooltip-icon" data-bs-toggle="tooltip" title="Bar - metric pressure measurement">?</span>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="input-group input-group-sm">
                            <input type="number" class="form-control" id="pressurePsi" placeholder="0" step="1">
                            <span class="input-group-text">psi</span>
                            <span class="tooltip-icon" data-bs-toggle="tooltip" title="PSI - pounds per square inch">?</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Location-based suggestion -->
            <div class="text-center">
                <small class="text-muted" id="locationSuggestion">
                    <i class="fas fa-info-circle me-1"></i>
                    Most countries use metric system for diving
                </small>
            </div>
        `;

        document.body.appendChild(widget);
        this.addCustomStyles();
        this.initializeTooltips();
        this.detectLocationPreference();
    }

    addCustomStyles() {
        if (document.getElementById('unitConverterStyles')) return;

        const styles = document.createElement('style');
        styles.id = 'unitConverterStyles';
        styles.textContent = `
            .unit-converter-widget .tooltip-icon {
                position: absolute;
                right: -18px;
                top: 50%;
                transform: translateY(-50%);
                width: 16px;
                height: 16px;
                background: #007bff;
                color: white;
                border-radius: 50%;
                font-size: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: help;
                border: none;
            }
            
            .unit-converter-widget .input-group {
                position: relative;
            }
            
            .converter-section {
                padding: 8px;
                background: #f8f9fa;
                border-radius: 4px;
            }
            
            #unitConverterToggle {
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 999;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
        `;
        document.head.appendChild(styles);
    }

    initializeEventListeners() {
        // Create toggle button
        this.createToggleButton();

        // Add conversion event listeners with debouncing
        this.addConversionListeners();
    }

    createToggleButton() {
        if (document.getElementById('unitConverterToggle')) return;

        const toggleButton = document.createElement('button');
        toggleButton.id = 'unitConverterToggle';
        toggleButton.className = 'btn btn-primary btn-sm';
        toggleButton.innerHTML = '<i class="fas fa-exchange-alt"></i> Units';
        toggleButton.onclick = () => this.toggleWidget();
        
        document.body.appendChild(toggleButton);
    }

    addConversionListeners() {
        // Depth conversion
        const depthMeters = document.getElementById('depthMeters');
        const depthFeet = document.getElementById('depthFeet');
        
        depthMeters?.addEventListener('input', (e) => {
            if (e.target.value) {
                const feet = (parseFloat(e.target.value) * 3.28084).toFixed(1);
                depthFeet.value = feet;
            } else {
                depthFeet.value = '';
            }
        });

        depthFeet?.addEventListener('input', (e) => {
            if (e.target.value) {
                const meters = (parseFloat(e.target.value) / 3.28084).toFixed(1);
                depthMeters.value = meters;
            } else {
                depthMeters.value = '';
            }
        });

        // Volume conversion
        const volumeLiters = document.getElementById('volumeLiters');
        const volumeCuFt = document.getElementById('volumeCuFt');
        
        volumeLiters?.addEventListener('input', (e) => {
            if (e.target.value) {
                const cuft = (parseFloat(e.target.value) / 28.3168).toFixed(2);
                volumeCuFt.value = cuft;
            } else {
                volumeCuFt.value = '';
            }
        });

        volumeCuFt?.addEventListener('input', (e) => {
            if (e.target.value) {
                const liters = (parseFloat(e.target.value) * 28.3168).toFixed(0);
                volumeLiters.value = liters;
            } else {
                volumeLiters.value = '';
            }
        });

        // Pressure conversion
        const pressureBar = document.getElementById('pressureBar');
        const pressurePsi = document.getElementById('pressurePsi');
        
        pressureBar?.addEventListener('input', (e) => {
            if (e.target.value) {
                const psi = (parseFloat(e.target.value) * 14.5038).toFixed(0);
                pressurePsi.value = psi;
            } else {
                pressurePsi.value = '';
            }
        });

        pressurePsi?.addEventListener('input', (e) => {
            if (e.target.value) {
                const bar = (parseFloat(e.target.value) / 14.5038).toFixed(1);
                pressureBar.value = bar;
            } else {
                pressureBar.value = '';
            }
        });
    }

    initializeTooltips() {
        // Initialize Bootstrap tooltips if available
        if (window.bootstrap && bootstrap.Tooltip) {
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
        }
    }

    detectLocationPreference() {
        // Simple location-based suggestion (no API calls)
        const suggestion = document.getElementById('locationSuggestion');
        if (!suggestion) return;

        // Get browser language for basic suggestion
        const language = navigator.language || navigator.userLanguage;
        
        if (language.startsWith('en-US')) {
            suggestion.innerHTML = '<i class="fas fa-flag-usa me-1"></i>USA typically uses imperial units (feet, psi)';
        } else if (language.startsWith('en-GB')) {
            suggestion.innerHTML = '<i class="fas fa-flag me-1"></i>UK diving uses metric depths, imperial pressure';
        } else {
            suggestion.innerHTML = '<i class="fas fa-globe me-1"></i>Most countries use metric system for diving';
        }
    }

    toggleWidget() {
        const widget = document.getElementById('unitConverterWidget');
        if (widget) {
            widget.style.display = widget.style.display === 'none' ? 'block' : 'none';
        }
    }

    showWidget() {
        const widget = document.getElementById('unitConverterWidget');
        if (widget) {
            widget.style.display = 'block';
        }
    }

    hideWidget() {
        const widget = document.getElementById('unitConverterWidget');
        if (widget) {
            widget.style.display = 'none';
        }
    }

    // Utility methods for other parts of the app
    static convertDepth(value, fromUnit) {
        if (fromUnit === 'meters') {
            return value * 3.28084; // to feet
        } else {
            return value / 3.28084; // to meters
        }
    }

    static convertVolume(value, fromUnit) {
        if (fromUnit === 'liters') {
            return value / 28.3168; // to cu ft
        } else {
            return value * 28.3168; // to liters
        }
    }

    static convertPressure(value, fromUnit) {
        if (fromUnit === 'bar') {
            return value * 14.5038; // to psi
        } else {
            return value / 14.5038; // to bar
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're not on the dive education page (to avoid conflicts)
    if (!window.location.pathname.includes('dive-education')) {
        window.unitConverter = new MinimalUnitConverter();
        console.log('Minimal Unit Converter initialized');
    }
});

// Export for global use
window.MinimalUnitConverter = MinimalUnitConverter;