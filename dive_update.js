// Import the new gas consumption function
function displayDivePlanResults(divePlan) {
    console.log('Displaying dive plan results:', divePlan);
    
    const resultsSection = document.getElementById('resultsSection');
    if (!resultsSection) {
        console.error('Results section not found in the DOM');
        return;
    }
    
    // Make sure the section is visible
    resultsSection.style.display = 'block';
    
    // Update numerical results
    document.getElementById('resultDepth').textContent = divePlan.depth.toFixed(1);
    document.getElementById('resultBottomTime').textContent = divePlan.bottomTime;
    document.getElementById('resultTotalTime').textContent = divePlan.totalDiveTime;
    
    // Update gas consumption section
    updateGasConsumptionDisplay(divePlan);
    
    // Update dive profile chart
    if (divePlan.profile) {
        drawDiveProfileChart(divePlan.profile);
    }
    
    // Update buddies display in results
    updateResultBuddiesDisplay(divePlan.buddies);
    
    // Enable buttons
    document.getElementById('saveOfflineBtn').disabled = false;
    document.getElementById('printPlanBtn').disabled = false;
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}
