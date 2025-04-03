/**
 * ScuPlan - Sharing Module
 * Handles functionality related to sharing dive plans
 */

/**
 * Show the share modal and generate a share link
 */
function showShareModal() {
    if (!app.currentPlan || !app.currentPlan.shareToken) {
        showAlert('Please calculate a dive plan first', 'warning');
        return;
    }
    
    // Get share link
    const shareLink = window.location.origin + '/share?id=' + app.currentPlan.shareToken;
    
    // Update modal content
    const container = document.getElementById('shareLinkContainer');
    if (container) {
        container.innerHTML = `<code>${shareLink}</code>`;
    }
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('sharePlanModal'));
    modal.show();
}

/**
 * Copy the share link to clipboard
 */
function copyShareLink() {
    const container = document.getElementById('shareLinkContainer');
    const code = container.querySelector('code');
    
    if (!code) {
        showAlert('No share link generated', 'danger');
        return;
    }
    
    // Copy to clipboard
    const tempInput = document.createElement('input');
    tempInput.value = code.innerText;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    // Show success message
    showAlert('Share link copied to clipboard', 'success');
}

/**
 * Email the share link
 */
function emailShareLink() {
    const container = document.getElementById('shareLinkContainer');
    const code = container.querySelector('code');
    
    if (!code) {
        showAlert('No share link generated', 'danger');
        return;
    }
    
    // Get the subject and body
    const subject = 'ScuPlan - Shared Dive Plan';
    const body = `Check out this dive plan I created with ScuPlan:\n\n${code.innerText}\n\n`;
    
    // Create mailto link
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open email client
    window.location.href = mailtoLink;
}

/**
 * Save the current dive plan to planner
 * Used when loading from a shared plan
 */
function saveSharedPlanToPlanner() {
    // Check if we have a shared plan
    if (!window.sharedPlan) {
        showAlert('No shared plan data found', 'danger');
        return;
    }
    
    try {
        // Store the plan in app state
        const planData = window.sharedPlan;
        
        // Redirect to the main page with the plan data
        localStorage.setItem('importedPlan', JSON.stringify(planData));
        window.location.href = '/';
    } catch (error) {
        console.error('Error saving shared plan:', error);
        showAlert('Failed to save plan: ' + error.message, 'danger');
    }
}

/**
 * Check for imported plan data on page load
 * Used when redirecting from a shared plan
 */
function checkForImportedPlan() {
    const importedPlanData = localStorage.getItem('importedPlan');
    
    if (importedPlanData) {
        try {
            const planData = JSON.parse(importedPlanData);
            
            // Clear storage to prevent loading it again
            localStorage.removeItem('importedPlan');
            
            // Apply the imported plan data
            document.getElementById('diveDepth').value = planData.depth;
            document.getElementById('bottomTime').value = planData.bottomTime;
            document.getElementById('diveLocation').value = planData.location || '';
            document.getElementById('diveType').value = planData.diveType || 'recreational';
            
            // Load tanks if any
            if (planData.tanks && planData.tanks.length > 0) {
                app.tanks = planData.tanks;
                updateTanksDisplay();
            }
            
            // Load buddies if any
            if (planData.buddies && planData.buddies.length > 0) {
                app.buddies = planData.buddies;
                updateBuddiesDisplay();
            }
            
            // Calculate the plan
            calculateDivePlan();
            
            showAlert('Imported shared plan successfully', 'success');
        } catch (error) {
            console.error('Error importing plan:', error);
        }
    }
}
