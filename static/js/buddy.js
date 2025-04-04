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
    
    // Set up event listeners
    const addBuddyButton = document.getElementById('addBuddyButton');
    if (addBuddyButton) {
        addBuddyButton.addEventListener('click', showAddBuddyModal);
    }
    
    const saveBuddyButton = document.getElementById('saveBuddyButton');
    if (saveBuddyButton) {
        saveBuddyButton.addEventListener('click', saveBuddy);
    }
    
    // Display any existing buddies
    updateBuddiesDisplay();
    
    console.log('Buddy management initialized');
}

/**
 * Show the modal to add a new buddy
 */
function showAddBuddyModal() {
    const buddyForm = document.getElementById('buddyForm');
    if (!buddyForm) return;
    
    // Reset the form
    buddyForm.reset();
    
    // Set default values
    const buddySkillSelect = document.getElementById('buddySkillLevel');
    if (buddySkillSelect) {
        buddySkillSelect.value = 'intermediate';
    }
    
    // Reset edit index
    buddyForm.dataset.editIndex = '-1';
    
    // Update modal title
    const buddyModalLabel = document.getElementById('buddyModalLabel');
    if (buddyModalLabel) {
        buddyModalLabel.textContent = 'Add Dive Buddy';
    }
    
    // Show the modal
    const buddyModal = new bootstrap.Modal(document.getElementById('buddyModal'));
    buddyModal.show();
}

/**
 * Show the modal to edit an existing buddy
 * @param {number} index - Index of the buddy to edit
 */
function showEditBuddyModal(index) {
    // Get the buddy data
    const buddy = app.buddies[index];
    if (!buddy) {
        showAlert('Buddy not found', 'danger');
        return;
    }
    
    const buddyForm = document.getElementById('buddyForm');
    const buddyNameInput = document.getElementById('buddyName');
    const buddyCertInput = document.getElementById('buddyCertification');
    const buddySkillSelect = document.getElementById('buddySkillLevel');
    const buddySpecialtySelect = document.getElementById('buddySpecialty');
    
    if (!buddyForm || !buddyNameInput || !buddyCertInput || !buddySkillSelect || !buddySpecialtySelect) {
        return;
    }
    
    // Fill the form with existing data
    buddyNameInput.value = buddy.name;
    buddyCertInput.value = buddy.certification || 'OWD';
    buddySkillSelect.value = buddy.skillLevel || 'intermediate';
    buddySpecialtySelect.value = buddy.specialty || '';
    
    // Set edit index
    buddyForm.dataset.editIndex = index;
    
    // Update modal title
    const buddyModalLabel = document.getElementById('buddyModalLabel');
    if (buddyModalLabel) {
        buddyModalLabel.textContent = 'Edit Dive Buddy';
    }
    
    // Show the modal
    const buddyModal = new bootstrap.Modal(document.getElementById('buddyModal'));
    buddyModal.show();
}

/**
 * Save buddy data from the modal form
 */
function saveBuddy() {
    // Get form values
    const buddyForm = document.getElementById('buddyForm');
    const buddyNameInput = document.getElementById('buddyName');
    const buddyCertInput = document.getElementById('buddyCertification');
    const buddySkillSelect = document.getElementById('buddySkillLevel');
    const buddySpecialtySelect = document.getElementById('buddySpecialty');
    
    if (!buddyForm || !buddyNameInput || !buddyCertInput || !buddySkillSelect || !buddySpecialtySelect) {
        return;
    }
    
    const name = buddyNameInput.value.trim();
    const certification = buddyCertInput.value;
    const skillLevel = buddySkillSelect.value;
    const specialty = buddySpecialtySelect.value;
    
    // Validate inputs
    if (!name) {
        showAlert('Please enter a buddy name', 'warning');
        return;
    }
    
    // Create buddy object
    const buddy = {
        name: name,
        certification: certification,
        skillLevel: skillLevel,
        specialty: specialty
    };
    
    // Check if editing or adding
    const editIndex = parseInt(buddyForm.dataset.editIndex);
    
    if (editIndex >= 0 && editIndex < app.buddies.length) {
        // Update existing buddy
        app.buddies[editIndex] = buddy;
        showAlert('Buddy updated', 'success');
    } else {
        // Add new buddy
        app.buddies.push(buddy);
        showAlert('Buddy added', 'success');
    }
    
    // Update UI
    updateBuddiesDisplay();
    
    // Hide modal
    const buddyModal = bootstrap.Modal.getInstance(document.getElementById('buddyModal'));
    buddyModal.hide();
}

/**
 * Remove a buddy from the list
 * @param {number} index - Index of the buddy to remove
 */
function removeBuddy(index) {
    // Remove buddy
    app.buddies.splice(index, 1);
    
    // Update UI
    updateBuddiesDisplay();
    
    showAlert('Buddy removed', 'info');
}

/**
 * Update the display of buddies in the interface
 */
function updateBuddiesDisplay() {
    const container = document.getElementById('buddiesContainer');
    const noBuddiesMessage = document.getElementById('noBuddiesMessage');
    
    if (!container) return;
    
    // Clear existing content except the no buddies message
    Array.from(container.children).forEach(child => {
        if (child.id !== 'noBuddiesMessage') {
            child.remove();
        }
    });
    
    // Show/hide no buddies message
    if (app.buddies.length === 0) {
        if (noBuddiesMessage) noBuddiesMessage.classList.remove('d-none');
        return;
    } else {
        if (noBuddiesMessage) noBuddiesMessage.classList.add('d-none');
    }
    
    // Add each buddy
    app.buddies.forEach((buddy, index) => {
        const buddyCard = document.createElement('div');
        buddyCard.className = 'card mb-3 buddy-item';
        
        // Create buddy content
        buddyCard.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 class="card-title">${buddy.name}</h5>
                        <div class="mb-2">
                            <span class="badge bg-info me-1">${buddy.certification || 'Not specified'}</span>
                            <span class="badge bg-secondary">${capitalizeFirstLetter(buddy.skillLevel) || 'Intermediate'}</span>
                        </div>
                        ${buddy.specialty ? `<p class="card-text small text-muted">${buddy.specialty}</p>` : ''}
                    </div>
                    <div>
                        <button type="button" class="btn btn-sm btn-outline-primary edit-buddy-btn" data-index="${index}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger remove-buddy-btn" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        const editButton = buddyCard.querySelector('.edit-buddy-btn');
        editButton.addEventListener('click', () => showEditBuddyModal(index));
        
        const removeButton = buddyCard.querySelector('.remove-buddy-btn');
        removeButton.addEventListener('click', () => removeBuddy(index));
        
        // Add to container
        container.appendChild(buddyCard);
    });
}

/**
 * Get buddy certification recommendations based on dive parameters
 * @param {number} depth - Planned dive depth
 * @param {boolean} isDecoNeeded - Whether decompression is needed
 * @returns {Object} Recommended certification levels
 */
function getBuddyRecommendations(depth, isDecoNeeded) {
    const recommendations = {
        minimumCert: '',
        recommendedCert: '',
        specialties: []
    };
    
    // Determine certification based on depth
    if (depth <= 18) {
        recommendations.minimumCert = 'OWD';
        recommendations.recommendedCert = 'OWD';
    } else if (depth <= 30) {
        recommendations.minimumCert = 'OWD';
        recommendations.recommendedCert = 'AOWD';
        recommendations.specialties.push('Deep Diving');
    } else if (depth <= 40) {
        recommendations.minimumCert = 'AOWD';
        recommendations.recommendedCert = 'AOWD';
        recommendations.specialties.push('Deep Diving');
    } else {
        recommendations.minimumCert = 'TecDiver';
        recommendations.recommendedCert = 'TecDiver';
        recommendations.specialties.push('Technical Diving');
    }
    
    // Add specialties based on decompression
    if (isDecoNeeded) {
        if (depth <= 40) {
            recommendations.recommendedCert = 'AOWD';
        } else {
            recommendations.recommendedCert = 'TecDiver';
        }
        
        recommendations.specialties.push('Decompression Procedures');
    }
    
    return recommendations;
}

/**
 * Show buddy compatibility warnings based on the current dive plan
 * @param {Object} plan - The current dive plan
 */
function showBuddyCompatibilityWarnings(plan) {
    if (!plan || !app.buddies || app.buddies.length === 0) return;
    
    const depth = plan.depth;
    const isDecoNeeded = plan.profile && plan.profile.decoStops && 
                       plan.profile.decoStops.length > 0 && 
                       plan.profile.decoStops[0].depth > 5;
    
    const recommendations = getBuddyRecommendations(depth, isDecoNeeded);
    
    // Check each buddy against recommendations
    app.buddies.forEach(buddy => {
        let warningMessage = '';
        
        // Check certification level
        if (buddy.certification === 'OWD' && recommendations.minimumCert === 'AOWD') {
            warningMessage = `${buddy.name} may need advanced training for this depth.`;
        } else if (buddy.certification === 'OWD' && recommendations.minimumCert === 'TecDiver') {
            warningMessage = `${buddy.name} does not have sufficient certification for this technical dive.`;
        }
        
        // Check for specialty requirements
        if (isDecoNeeded && buddy.specialty !== 'technical' && buddy.certification !== 'TecDiver') {
            warningMessage = `${buddy.name} may not be trained for decompression diving.`;
        }
        
        if (warningMessage) {
            showAlert(warningMessage, 'warning');
        }
    });
}
