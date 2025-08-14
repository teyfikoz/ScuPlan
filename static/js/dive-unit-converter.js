/**
 * Dive Unit Conversion Micro Widget
 * Lightweight converter for diving units (metric ↔ imperial)
 */

class DiveUnitConverter {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentSystem = this.detectUserSystem();
        this.init();
    }

    /**
     * Detect user's preferred unit system based on location
     */
    detectUserSystem() {
        // Simple detection based on common diving regions
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const imperialRegions = ['America/New_York', 'America/Los_Angeles', 'America/Chicago', 'Europe/London'];
        return imperialRegions.some(region => timezone.includes('America') || timezone.includes('London')) ? 'imperial' : 'metric';
    }

    /**
     * Initialize the converter widget
     */
    init() {
        this.render();
        this.attachEventListeners();
    }

    /**
     * Render the converter UI
     */
    render() {
        this.container.innerHTML = `
            <div class="dive-converter-widget">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h6 class="mb-0">
                            <i class="fas fa-exchange-alt me-2"></i>
                            Dive Unit Converter
                        </h6>
                    </div>
                    <div class="card-body">
                        <!-- System Toggle -->
                        <div class="row mb-3">
                            <div class="col-12">
                                <div class="btn-group w-100" role="group">
                                    <input type="radio" class="btn-check" name="systemToggle" id="metricToggle" ${this.currentSystem === 'metric' ? 'checked' : ''}>
                                    <label class="btn btn-outline-primary" for="metricToggle">
                                        <i class="fas fa-ruler me-1"></i>Metric
                                    </label>
                                    
                                    <input type="radio" class="btn-check" name="systemToggle" id="imperialToggle" ${this.currentSystem === 'imperial' ? 'checked' : ''}>
                                    <label class="btn btn-outline-primary" for="imperialToggle">
                                        <i class="fas fa-ruler-horizontal me-1"></i>Imperial
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- Depth Conversion -->
                        <div class="conversion-section mb-3">
                            <label class="form-label">
                                <i class="fas fa-arrow-down me-1"></i>Depth
                                <span class="info-tooltip" data-bs-toggle="tooltip" title="Diving depth measurement">
                                    <i class="fas fa-info-circle text-muted"></i>
                                </span>
                            </label>
                            <div class="row">
                                <div class="col-6">
                                    <div class="input-group">
                                        <input type="number" class="form-control" id="depthInput" step="0.1" placeholder="Enter depth">
                                        <span class="input-group-text" id="depthInputUnit">m</span>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="input-group">
                                        <span class="input-group-text">=</span>
                                        <input type="text" class="form-control" id="depthOutput" readonly>
                                        <span class="input-group-text" id="depthOutputUnit">ft</span>
                                    </div>
                                </div>
                            </div>
                            <small class="text-muted" id="depthExplanation">
                                1 meter = 3.28 feet. Recreational diving limit: 30m/100ft.
                            </small>
                        </div>

                        <!-- Pressure Conversion -->
                        <div class="conversion-section mb-3">
                            <label class="form-label">
                                <i class="fas fa-gauge me-1"></i>Pressure
                                <span class="info-tooltip" data-bs-toggle="tooltip" title="Tank pressure or ambient pressure">
                                    <i class="fas fa-info-circle text-muted"></i>
                                </span>
                            </label>
                            <div class="row">
                                <div class="col-6">
                                    <div class="input-group">
                                        <input type="number" class="form-control" id="pressureInput" step="1" placeholder="Enter pressure">
                                        <span class="input-group-text" id="pressureInputUnit">bar</span>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="input-group">
                                        <span class="input-group-text">=</span>
                                        <input type="text" class="form-control" id="pressureOutput" readonly>
                                        <span class="input-group-text" id="pressureOutputUnit">psi</span>
                                    </div>
                                </div>
                            </div>
                            <small class="text-muted" id="pressureExplanation">
                                1 bar ≈ pressure at 10m underwater. Standard tank: 200 bar/3000 psi.
                            </small>
                        </div>

                        <!-- Quick Conversion Buttons -->
                        <div class="quick-conversions mb-3">
                            <label class="form-label">
                                <i class="fas fa-bolt me-1"></i>Quick Conversions
                            </label>
                            <div class="btn-group-sm" role="group">
                                <button type="button" class="btn btn-outline-secondary quick-btn" data-type="depth" data-value="10">10m</button>
                                <button type="button" class="btn btn-outline-secondary quick-btn" data-type="depth" data-value="18">18m</button>
                                <button type="button" class="btn btn-outline-secondary quick-btn" data-type="depth" data-value="30">30m</button>
                                <button type="button" class="btn btn-outline-secondary quick-btn" data-type="pressure" data-value="200">200 bar</button>
                            </div>
                        </div>

                        <!-- Export Results -->
                        <div class="converter-actions">
                            <div class="row">
                                <div class="col-6">
                                    <button type="button" class="btn btn-sm btn-success w-100" id="copyResults">
                                        <i class="fas fa-copy me-1"></i>Copy Results
                                    </button>
                                </div>
                                <div class="col-6">
                                    <button type="button" class="btn btn-sm btn-info w-100" id="resetConverter">
                                        <i class="fas fa-refresh me-1"></i>Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // System toggle
        document.querySelectorAll('input[name="systemToggle"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentSystem = e.target.id === 'metricToggle' ? 'metric' : 'imperial';
                this.updateSystem();
            });
        });

        // Input field listeners
        document.getElementById('depthInput').addEventListener('input', (e) => {
            this.convertDepth(e.target.value);
        });

        document.getElementById('pressureInput').addEventListener('input', (e) => {
            this.convertPressure(e.target.value);
        });

        // Quick conversion buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.getAttribute('data-type');
                const value = e.target.getAttribute('data-value');
                
                if (type === 'depth') {
                    document.getElementById('depthInput').value = value;
                    this.convertDepth(value);
                } else if (type === 'pressure') {
                    document.getElementById('pressureInput').value = value;
                    this.convertPressure(value);
                }
            });
        });

        // Action buttons
        document.getElementById('copyResults').addEventListener('click', () => {
            this.copyResults();
        });

        document.getElementById('resetConverter').addEventListener('click', () => {
            this.resetConverter();
        });

        // Initialize tooltips
        const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltips.forEach(tooltip => {
            new bootstrap.Tooltip(tooltip);
        });
    }

    /**
     * Update system labels and explanations
     */
    updateSystem() {
        if (this.currentSystem === 'metric') {
            document.getElementById('depthInputUnit').textContent = 'm';
            document.getElementById('depthOutputUnit').textContent = 'ft';
            document.getElementById('pressureInputUnit').textContent = 'bar';
            document.getElementById('pressureOutputUnit').textContent = 'psi';
            document.getElementById('depthExplanation').textContent = '1 meter = 3.28 feet. Recreational diving limit: 30m/100ft.';
            document.getElementById('pressureExplanation').textContent = '1 bar ≈ pressure at 10m underwater. Standard tank: 200 bar/3000 psi.';
        } else {
            document.getElementById('depthInputUnit').textContent = 'ft';
            document.getElementById('depthOutputUnit').textContent = 'm';
            document.getElementById('pressureInputUnit').textContent = 'psi';
            document.getElementById('pressureOutputUnit').textContent = 'bar';
            document.getElementById('depthExplanation').textContent = '1 foot = 0.305 meters. Recreational diving limit: 100ft/30m.';
            document.getElementById('pressureExplanation').textContent = '1 psi = 0.069 bar. Standard tank: 3000 psi/200 bar.';
        }

        // Re-convert current values
        const depthValue = document.getElementById('depthInput').value;
        const pressureValue = document.getElementById('pressureInput').value;
        
        if (depthValue) this.convertDepth(depthValue);
        if (pressureValue) this.convertPressure(pressureValue);
    }

    /**
     * Convert depth values
     */
    convertDepth(value) {
        if (!value || isNaN(value)) {
            document.getElementById('depthOutput').value = '';
            return;
        }

        const input = parseFloat(value);
        let output;

        if (this.currentSystem === 'metric') {
            output = (input * 3.28084).toFixed(2); // meters to feet
        } else {
            output = (input * 0.3048).toFixed(2); // feet to meters
        }

        document.getElementById('depthOutput').value = output;
    }

    /**
     * Convert pressure values
     */
    convertPressure(value) {
        if (!value || isNaN(value)) {
            document.getElementById('pressureOutput').value = '';
            return;
        }

        const input = parseFloat(value);
        let output;

        if (this.currentSystem === 'metric') {
            output = Math.round(input * 14.5038); // bar to psi
        } else {
            output = (input * 0.068948).toFixed(2); // psi to bar
        }

        document.getElementById('pressureOutput').value = output;
    }

    /**
     * Copy conversion results to clipboard
     */
    copyResults() {
        const depthInput = document.getElementById('depthInput').value;
        const depthOutput = document.getElementById('depthOutput').value;
        const pressureInput = document.getElementById('pressureInput').value;
        const pressureOutput = document.getElementById('pressureOutput').value;
        
        const depthInputUnit = document.getElementById('depthInputUnit').textContent;
        const depthOutputUnit = document.getElementById('depthOutputUnit').textContent;
        const pressureInputUnit = document.getElementById('pressureInputUnit').textContent;
        const pressureOutputUnit = document.getElementById('pressureOutputUnit').textContent;

        let results = 'Dive Unit Conversions:\n';
        
        if (depthInput && depthOutput) {
            results += `Depth: ${depthInput}${depthInputUnit} = ${depthOutput}${depthOutputUnit}\n`;
        }
        
        if (pressureInput && pressureOutput) {
            results += `Pressure: ${pressureInput}${pressureInputUnit} = ${pressureOutput}${pressureOutputUnit}\n`;
        }
        
        if (results === 'Dive Unit Conversions:\n') {
            results += 'No conversions to copy.';
        }

        navigator.clipboard.writeText(results).then(() => {
            // Show success feedback
            const btn = document.getElementById('copyResults');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check me-1"></i>Copied!';
            btn.classList.add('btn-success');
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('btn-success');
            }, 2000);
        });
    }

    /**
     * Reset all converter inputs
     */
    resetConverter() {
        document.getElementById('depthInput').value = '';
        document.getElementById('depthOutput').value = '';
        document.getElementById('pressureInput').value = '';
        document.getElementById('pressureOutput').value = '';
    }

    /**
     * Export conversion data as JSON
     */
    exportAsJSON() {
        const data = {
            system: this.currentSystem,
            conversions: {
                depth: {
                    input: document.getElementById('depthInput').value,
                    output: document.getElementById('depthOutput').value,
                    inputUnit: document.getElementById('depthInputUnit').textContent,
                    outputUnit: document.getElementById('depthOutputUnit').textContent
                },
                pressure: {
                    input: document.getElementById('pressureInput').value,
                    output: document.getElementById('pressureOutput').value,
                    inputUnit: document.getElementById('pressureInputUnit').textContent,
                    outputUnit: document.getElementById('pressureOutputUnit').textContent
                }
            },
            timestamp: new Date().toISOString()
        };
        
        return JSON.stringify(data, null, 2);
    }
}

// Auto-initialize if container exists
document.addEventListener('DOMContentLoaded', function() {
    const converterContainer = document.getElementById('diveUnitConverter');
    if (converterContainer) {
        window.diveUnitConverter = new DiveUnitConverter('diveUnitConverter');
    }
});