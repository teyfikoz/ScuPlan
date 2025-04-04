/**
 * Calculate gas consumption for the current dive plan
 * @param {Object} planData - The current dive plan data
 */
function calculateGasConsumption(planData) {
    // Only proceed if we have tanks
    if (!app.tanks || app.tanks.length === 0) {
        const gasConsumptionResults = document.getElementById('gasConsumptionResults');
        if (gasConsumptionResults) {
            gasConsumptionResults.innerHTML = '<div class="text-center text-muted"><small>Add tanks to see gas consumption</small></div>';
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
