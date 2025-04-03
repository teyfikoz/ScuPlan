/**
 * ScuPlan - Buddy Management Module
 * Handles all functionality related to dive buddies
 */

/**
 * Initialize buddy management functionality
 */
function initBuddyManagement() {
    console.log('Initializing buddy management module');
    
    // Reset buddies array if needed
    if (!app.buddies) {
        app.buddies = [];
    }
    
    // Display any existing buddies
    // Set up add buddy button 
    const addBuddyButton = document.getElementById("addBuddyButton");
    if (addBuddyButton) {
        addBuddyButton.addEventListener("click", showAddBuddyModal);
    }
    
    // Set up save buddy button
    const saveBuddyButton = document.getElementById("saveBuddyButton");
    if (saveBuddyButton) {
        saveBuddyButton.addEventListener("click", saveBuddy);
    }

    updateBuddiesDisplay();
}
/**
 * Show the modal to add a new buddy
 */
function showAddBuddyModal() {
    const buddyForm = document.getElementById('buddyForm');
    if (!buddyForm) return;
    
    // Reset the form
    buddyForm.reset();
    
    // Show the modal
    const buddyModal = document.getElementById('buddyModal');
    if (!buddyModal) return;
    
    const modal = new bootstrap.Modal(buddyModal);
    modal.show();
    app.modalInstance = modal;
}

/**
 * Show the modal to edit an existing buddy
 * @param {number} index - Index of the buddy to edit
 */
function showEditBuddyModal(index) {
    // Get the buddy data
    const buddy = app.buddies[index];
    
    const buddyNameInput = document.getElementById('buddyName');
    const buddyCertInput = document.getElementById('buddyCertification');
    const buddySkillSelect = document.getElementById('buddySkillLevel');
    const buddySpecialtySelect = document.getElementById('buddySpecialty');
    const saveBuddyButton = document.getElementById('saveBuddyButton');
    const buddyModalLabel = document.getElementById('buddyModalLabel');
    
    if (!buddyNameInput || !buddyCertInput || !buddySkillSelect || 
        !buddySpecialtySelect || !saveBuddyButton || !buddyModalLabel) {
        return;
    }
    
    // Fill the form with existing data
    buddyNameInput.value = buddy.name;
    buddyCertInput.value = buddy.certification || '';
    buddySkillSelect.value = buddy.skillLevel || 'intermediate';
    buddySpecialtySelect.value = buddy.specialty || 'none';
    
    // Set data attribute for the save button
    saveBuddyButton.setAttribute('data-edit-index', index);
    
    // Update modal title
    buddyModalLabel.textContent = 'Edit Dive Buddy';
    
    // Show the modal
    const buddyModal = document.getElementById('buddyModal');
    if (!buddyModal) return;
    
    const modal = new bootstrap.Modal(buddyModal);
    modal.show();
    app.modalInstance = modal;
}

/**
 * Save buddy data from the modal form
 */
function saveBuddy() {
    // Get form values
    const buddyNameInput = document.getElementById('buddyName');
    const buddyCertInput = document.getElementById('buddyCertification');
    const buddySkillSelect = document.getElementById('buddySkillLevel');
    const buddySpecialtySelect = document.getElementById('buddySpecialty');
    const saveBuddyButton = document.getElementById('saveBuddyButton');
    const buddyModalLabel = document.getElementById('buddyModalLabel');
    
    if (!buddyNameInput || !buddyCertInput || !buddySkillSelect || 
        !buddySpecialtySelect || !saveBuddyButton) {
        return;
    }
    
    const name = buddyNameInput.value.trim();
    const certification = buddyCertInput.value.trim();
    const skillLevel = buddySkillSelect.value;
    const specialty = buddySpecialtySelect.value;
    
    // Validate inputs
    if (!name) {
        showAlert('Please enter a buddy name', 'warning');
        return;
    }
    
    // Check if we're editing or adding
    const editIndex = saveBuddyButton.getAttribute('data-edit-index');
    
    // Create buddy object
    const buddy = {
        name: name,
        certification: certification,
        skillLevel: skillLevel,
        specialty: specialty
    };
    
    if (editIndex !== null && editIndex !== undefined) {
        // Update existing buddy
        app.buddies[editIndex] = buddy;
        saveBuddyButton.removeAttribute('data-edit-index');
        
        if (buddyModalLabel) {
            buddyModalLabel.textContent = 'Add Dive Buddy';
        }
    } else {
        // Add new buddy
        app.buddies.push(buddy);
    }
    
    // Update the display
    updateBuddiesDisplay();
    
    // Close the modal
    if (app.modalInstance) {
        app.modalInstance.hide();
    }
}

/**
 * Remove a buddy from the list
 * @param {number} index - Index of the buddy to remove
 */
function removeBuddy(index) {
    if (index >= 0 && index < app.buddies.length) {
        app.buddies.splice(index, 1);
        updateBuddiesDisplay();
    }
}

/**
 * Update the display of buddies in the interface
 */
function updateBuddiesDisplay() {
    const container = document.getElementById('buddiesContainer');
    
    if (!container) return; // Not on a page with buddies display
    
    // Clear current content
    container.innerHTML = '';
    
    // Show/hide the no buddies message
    if (app.buddies.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info" id="noBuddiesMessage">
                <i class="fas fa-info-circle me-2"></i>No buddies added yet. Add a buddy to start.
            </div>
        `;
        return;
    }
    
    // Add each buddy to the display
    app.buddies.forEach((buddy, index) => {
        const buddyElement = document.createElement('div');
        buddyElement.className = 'buddy-item';
        
        // Skill level badge color
        let skillBadgeClass = 'bg-secondary';
        switch (buddy.skillLevel) {
            case 'beginner':
                skillBadgeClass = 'bg-warning text-dark';
                break;
            case 'intermediate':
                skillBadgeClass = 'bg-info text-dark';
                break;
            case 'advanced':
                skillBadgeClass = 'bg-success';
                break;
            case 'professional':
                skillBadgeClass = 'bg-primary';
                break;
        }
        
        // Specialty badge if not 'none'
        const specialtyBadge = buddy.specialty && buddy.specialty !== 'none' 
            ? `<span class="badge bg-light text-dark me-1">${capitalizeFirstLetter(buddy.specialty)}</span>`
            : '';
        
        buddyElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <div class="fw-bold mb-1">${buddy.name}</div>
                    <div class="small mb-1">${buddy.certification || 'No certification specified'}</div>
                    <div>
                        <span class="badge ${skillBadgeClass} me-1">${capitalizeFirstLetter(buddy.skillLevel)}</span>
                        ${specialtyBadge}
                    </div>
                </div>
                <div>
                    <button type="button" class="btn btn-sm btn-outline-primary me-1 edit-buddy-btn" data-index="${index}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger remove-buddy-btn" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(buddyElement);
    });
    
    // Add event listeners to the buttons
    document.querySelectorAll('.edit-buddy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            showEditBuddyModal(index);
        });
    });
    
    document.querySelectorAll('.remove-buddy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeBuddy(index);
        });
    });
}

/**
 * Get buddy certification recommendations based on dive parameters
 * @param {number} depth - Planned dive depth
 * @param {boolean} isDecoNeeded - Whether decompression is needed
 * @returns {Object} Recommended certification levels
 */
function getBuddyRecommendations(depth, isDecoNeeded) {
    let recommendedLevel = 'beginner';
    let recommendedCert = 'Open Water Diver';
    let specialties = [];
    
    // Determine recommendations based on depth
    if (depth <= 18) {
        recommendedLevel = 'beginner';
        recommendedCert = 'Open Water Diver';
    } else if (depth <= 30) {
        recommendedLevel = 'intermediate';
        recommendedCert = 'Advanced Open Water Diver';
        
        if (depth > 25) {
            specialties.push('Deep Diving');
        }
    } else if (depth <= 40) {
        recommendedLevel = 'advanced';
        recommendedCert = 'Advanced Open Water Diver';
        specialties.push('Deep Diving');
    } else {
        recommendedLevel = 'professional';
        recommendedCert = 'Technical Diver';
        specialties.push('Extended Range');
    }
    
    // Add recommendations based on decompression
    if (isDecoNeeded) {
        if (recommendedLevel === 'beginner' || recommendedLevel === 'intermediate') {
            recommendedLevel = 'advanced';
        }
        
        if (!specialties.includes('Deep Diving')) {
            specialties.push('Deep Diving');
        }
        
        specialties.push('Decompression Procedures');
    }
    
    return {
        level: recommendedLevel,
        certification: recommendedCert,
        specialties: specialties
    };
}

/**
 * Show buddy compatibility warnings based on the current dive plan
 * @param {Object} plan - The current dive plan
 */
function showBuddyCompatibilityWarnings(plan) {
    if (!plan || !app.buddies || app.buddies.length === 0) return;
    
    const depth = plan.depth;
    const isDecoNeeded = plan.profile.decoStops && plan.profile.decoStops.length > 0;
    
    // Get recommendations for this dive
    const recommendations = getBuddyRecommendations(depth, isDecoNeeded);
    
    const levelOrder = ['beginner', 'intermediate', 'advanced', 'professional'];
    
    // Check each buddy against the recommendations
    let warnings = [];
    
    app.buddies.forEach(buddy => {
        const buddyLevelIndex = levelOrder.indexOf(buddy.skillLevel);
        const recommendedLevelIndex = levelOrder.indexOf(recommendations.level);
        
        if (buddyLevelIndex < recommendedLevelIndex) {
            warnings.push(`${buddy.name}'s skill level (${capitalizeFirstLetter(buddy.skillLevel)}) may be below recommended level (${capitalizeFirstLetter(recommendations.level)}) for this dive.`);
        }
        
        // Check for specialty requirements
        if (recommendations.specialties.length > 0 && 
            (buddy.specialty === 'none' || !recommendations.specialties.includes(buddy.specialty))) {
            warnings.push(`This dive may require specialties (${recommendations.specialties.join(', ')}) that ${buddy.name} doesn't have.`);
        }
    });
    
    // Show warnings if any
    if (warnings.length > 0) {
        showAlert(`<strong>Buddy Compatibility Warning:</strong><br>${warnings.join('<br>')}`, 'warning', 7000);
    }
}
