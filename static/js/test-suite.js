
/**
 * ScuPlan Test Suite
 * Comprehensive testing for unit conversion, navigation, and core features
 */

class ScuPlanTestSuite {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            tests: []
        };
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('🧪 ScuPlan Test Suite Starting...\n');
        
        await this.testUnitConversion();
        await this.testNavigation();
        await this.testDOMElements();
        await this.testDataPersistence();
        
        this.printResults();
    }

    /**
     * Test unit conversion functionality
     */
    async testUnitConversion() {
        console.log('📏 Testing Unit Conversion...');
        
        // Test 1: Check if UnitConverter exists
        this.assert(
            'UnitConverter class exists',
            typeof UnitConverter !== 'undefined'
        );

        // Test 2: Check if global instance exists
        this.assert(
            'Global unitsManager instance exists',
            window.unitsManager !== undefined
        );

        if (window.unitsManager) {
            // Test 3: Default system is metric
            this.assert(
                'Default unit system is metric',
                window.unitsManager.currentSystem === 'metric'
            );

            // Test 4: Depth conversion (meters to feet)
            const depthMeters = 18;
            const depthFeet = window.unitsManager.conversions.depth.toImperial(depthMeters);
            this.assert(
                'Depth conversion m->ft (18m ≈ 59.05ft)',
                Math.abs(depthFeet - 59.05512) < 0.001
            );

            // Test 5: Pressure conversion (bar to PSI)
            const pressureBar = 200;
            const pressurePsi = window.unitsManager.conversions.pressure.toImperial(pressureBar);
            this.assert(
                'Pressure conversion bar->PSI (200 bar ≈ 2900.76 PSI)',
                Math.abs(pressurePsi - 2900.76) < 1
            );

            // Test 6: Volume conversion (liters to cuft)
            const volumeLiters = 12;
            const volumeCuft = window.unitsManager.conversions.volume.toImperial(volumeLiters);
            this.assert(
                'Volume conversion L->cuft (12L ≈ 0.424 cuft)',
                Math.abs(volumeCuft - 0.424) < 0.01
            );

            // Test 7: Get unit labels
            this.assert(
                'Depth unit label is "m"',
                window.unitsManager.getUnit('depth') === 'm'
            );

            this.assert(
                'Pressure unit label is "bar"',
                window.unitsManager.getUnit('pressure') === 'bar'
            );
        }
    }

    /**
     * Test navigation functionality
     */
    async testNavigation() {
        console.log('🧭 Testing Navigation...');

        // Test navigation links exist
        const navLinks = [
            'Dive Planner',
            'Checklists', 
            'Technical',
            'Dive Routes',
            'Education',
            'Saved Plans'
        ];

        navLinks.forEach(linkText => {
            const link = Array.from(document.querySelectorAll('a')).find(
                a => a.textContent.includes(linkText)
            );
            this.assert(
                `Navigation link "${linkText}" exists`,
                link !== undefined
            );
        });

        // Test footer links
        const footerLinks = [
            'offlineGuideLink',
            'exportGuideLink',
            'footerSavedPlans'
        ];

        footerLinks.forEach(linkId => {
            const link = document.getElementById(linkId);
            this.assert(
                `Footer link #${linkId} exists`,
                link !== null
            );
        });
    }

    /**
     * Test critical DOM elements
     */
    async testDOMElements() {
        console.log('🏗️ Testing DOM Elements...');

        // Test form elements
        const formElements = [
            'diveDepth',
            'bottomTime',
            'diveLocation',
            'diveType',
            'sacRate'
        ];

        formElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            this.assert(
                `Form element #${elementId} exists`,
                element !== null
            );
        });

        // Test action buttons
        const buttons = [
            'calculateButton',
            'addTankButton',
            'addBuddyButton'
        ];

        buttons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            this.assert(
                `Button #${buttonId} exists`,
                button !== null
            );
        });

        // Test result containers
        const resultContainers = [
            'diveResultsCard',
            'gasConsumptionResults',
            'buddyConsumptionResults'
        ];

        resultContainers.forEach(containerId => {
            const container = document.getElementById(containerId);
            this.assert(
                `Result container #${containerId} exists`,
                container !== null
            );
        });
    }

    /**
     * Test data persistence
     */
    async testDataPersistence() {
        console.log('💾 Testing Data Persistence...');

        // Test localStorage access
        try {
            localStorage.setItem('scuplan_test', 'test');
            const value = localStorage.getItem('scuplan_test');
            localStorage.removeItem('scuplan_test');
            
            this.assert(
                'localStorage is accessible',
                value === 'test'
            );
        } catch (e) {
            this.assert(
                'localStorage is accessible',
                false
            );
        }

        // Test unit preference saving
        if (window.unitsManager) {
            try {
                window.unitsManager.saveUserPreference();
                const saved = localStorage.getItem('scuplan_unit_system');
                this.assert(
                    'Unit preference is saved',
                    saved === 'metric'
                );
            } catch (e) {
                this.assert(
                    'Unit preference is saved',
                    false
                );
            }
        }
    }

    /**
     * Assert helper
     */
    assert(testName, condition) {
        const result = {
            name: testName,
            passed: !!condition
        };
        
        this.results.tests.push(result);
        
        if (result.passed) {
            this.results.passed++;
            console.log(`  ✅ ${testName}`);
        } else {
            this.results.failed++;
            console.error(`  ❌ ${testName}`);
        }
    }

    /**
     * Print test results
     */
    printResults() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 Test Results Summary');
        console.log('='.repeat(50));
        console.log(`Total Tests: ${this.results.tests.length}`);
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`Success Rate: ${((this.results.passed / this.results.tests.length) * 100).toFixed(1)}%`);
        console.log('='.repeat(50) + '\n');

        // Return results for programmatic access
        return this.results;
    }
}

// Auto-run tests when page loads (after a delay to ensure everything is initialized)
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.scuplanTests = new ScuPlanTestSuite();
        
        // Add test button to navbar
        const testButton = document.createElement('button');
        testButton.className = 'btn btn-warning btn-sm';
        testButton.innerHTML = '<i class="fas fa-vial"></i> Run Tests';
        testButton.style.position = 'fixed';
        testButton.style.bottom = '20px';
        testButton.style.right = '20px';
        testButton.style.zIndex = '9999';
        testButton.onclick = () => window.scuplanTests.runAllTests();
        
        document.body.appendChild(testButton);
        
        console.log('🧪 Test suite ready! Click the "Run Tests" button or run: window.scuplanTests.runAllTests()');
    }, 2000);
});

// Export for manual testing
window.ScuPlanTestSuite = ScuPlanTestSuite;
