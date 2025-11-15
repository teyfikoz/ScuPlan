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
    if (!window.app) {
        window.app = {};
    }
    if (!window.app.buddies) {
        window.app.buddies = [];
    }

    // Display any existing buddies
    updateBuddiesDisplay();
}

/**
 * Show the modal to add a new buddy
 */
function showAddBuddyModal() {
    const buddyModal = document.getElementById('buddyModal');
    if (!buddyModal) {
        console.error('Buddy modal not found');
        return;
    }

    // Reset the form
    const buddyForm = document.getElementById('buddyForm');
    if (buddyForm) {
        buddyForm.reset();
    }

    // Reset modal title
    const modalLabel = document.getElementById('buddyModalLabel');
    if (modalLabel) {
        modalLabel.textContent = 'Add Buddy';
    }

    // Show the modal using Bootstrap
    const modal = new bootstrap.Modal(buddyModal);
    modal.show();

    if (window.app) {
        window.app.modalInstance = modal;
    }
}

/**
 * Show the modal to edit an existing buddy
 */
function showEditBuddyModal(index) {
    const buddy = window.app.buddies[index];

    const buddyName = document.getElementById('buddyName');
    const buddyCert = document.getElementById('buddyCertification');
    const buddySkill = document.getElementById('buddySkillLevel');
    const buddySpecialty = document.getElementById('buddySpecialty');

    if (buddyName) buddyName.value = buddy.name;
    if (buddyCert) buddyCert.value = buddy.certification || '';
    if (buddySkill) buddySkill.value = buddy.skillLevel || 'intermediate';
    if (buddySpecialty) buddySpecialty.value = buddy.specialty || 'none';

    const saveBuddyButton = document.getElementById('saveBuddyButton');
    if (saveBuddyButton) {
        saveBuddyButton.setAttribute('data-edit-index', index);
    }

    const modalLabel = document.getElementById('buddyModalLabel');
    if (modalLabel) {
        modalLabel.textContent = 'Edit Buddy';
    }

    const buddyModal = document.getElementById('buddyModal');
    if (buddyModal) {
        const modal = new bootstrap.Modal(buddyModal);
        modal.show();

        if (window.app) {
            window.app.modalInstance = modal;
        }
    }
}

/**
 * Save buddy data from the modal form
 */
function saveBuddy() {
    const name = document.getElementById('buddyName').value.trim();
    const certification = document.getElementById('buddyCertification').value.trim();
    const skillLevel = document.getElementById('buddySkillLevel').value;
    const specialty = document.getElementById('buddySpecialty').value;

    if (!name) {
        alert('Please enter a buddy name');
        return;
    }

    const buddy = {
        name: name,
        certification: certification,
        skillLevel: skillLevel,
        specialty: specialty
    };

    const saveButton = document.getElementById('saveBuddyButton');
    if (!saveButton) return;

    const editIndex = saveButton.getAttribute('data-edit-index');

    if (editIndex !== null && editIndex !== undefined) {
        window.app.buddies[editIndex] = buddy;
        saveButton.removeAttribute('data-edit-index');

        const modalLabel = document.getElementById('buddyModalLabel');
        if (modalLabel) {
            modalLabel.textContent = 'Add Buddy';
        }
    } else {
        window.app.buddies.push(buddy);
    }

    updateBuddiesDisplay();

    if (window.app && window.app.modalInstance) {
        window.app.modalInstance.hide();
    }
}

/**
 * Remove a buddy from the list
 */
function removeBuddy(index) {
    if (index >= 0 && index < window.app.buddies.length) {
        window.app.buddies.splice(index, 1);
        updateBuddiesDisplay();
    }
}

/**
 * Update the display of buddies
 */
function updateBuddiesDisplay() {
    const container = document.getElementById('buddiesContainer');
    const noMessage = document.getElementById('noBuddiesMessage');

    if (!container || !noMessage) return;

    container.innerHTML = '';

    if (!window.app.buddies || window.app.buddies.length === 0) {
        noMessage.style.display = 'block';
        return;
    } else {
        noMessage.style.display = 'none';
    }

    window.app.buddies.forEach((buddy, index) => {
        const buddyElement = document.createElement('div');
        buddyElement.className = 'buddy-item mb-3 p-3 bg-light rounded';

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

        const specialtyBadge = (buddy.specialty && buddy.specialty !== 'none')
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

function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}