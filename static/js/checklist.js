/**
 * ScuPlan - Checklist Module
 * Handles all checklist-related functionality
 */

/**
 * Initialize checklist functionality
 */
function initChecklists() {
    console.log('Initializing checklists module');
    
    // Check if we're on the checklist page
    if (document.getElementById('checklistTabs')) {
        // Load default checklists
        loadDefaultChecklists();
        
        // Set up event listeners for checklist page
        setupChecklistEvents();
        
        // Check for offline saved checklists
        loadOfflineChecklists();
    }
    
    // Initialize quick checklist on the dive planner page
    initializeQuickChecklist();
}

/**
 * Load default checklists from the server
 */
function loadDefaultChecklists() {
    // Load pre-dive checklist
    fetch('/api/checklists?type=pre-dive')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load pre-dive checklists');
        }
        return response.json();
    })
    .then(checklists => {
        if (checklists.length > 0) {
            displayChecklist(checklists[0], 'preChecklistItems');
        }
    })
    .catch(error => {
        console.error('Error loading pre-dive checklists:', error);
        document.getElementById('preChecklistItems').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i>
                Failed to load pre-dive checklist. ${error.message}
            </div>
        `;
    });
    
    // Load post-dive checklist
    fetch('/api/checklists?type=post-dive')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load post-dive checklists');
        }
        return response.json();
    })
    .then(checklists => {
        if (checklists.length > 0) {
            displayChecklist(checklists[0], 'postChecklistItems');
        }
    })
    .catch(error => {
        console.error('Error loading post-dive checklists:', error);
        document.getElementById('postChecklistItems').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i>
                Failed to load post-dive checklist. ${error.message}
            </div>
        `;
    });
    
    // Load emergency checklist
    fetch('/api/checklists?type=emergency')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load emergency checklists');
        }
        return response.json();
    })
    .then(checklists => {
        if (checklists.length > 0) {
            displayChecklist(checklists[0], 'emergencyChecklistItems');
        }
    })
    .catch(error => {
        console.error('Error loading emergency checklists:', error);
        document.getElementById('emergencyChecklistItems').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i>
                Failed to load emergency checklist. ${error.message}
            </div>
        `;
    });
    
    // Load custom checklists
    loadCustomChecklists();
}

/**
 * Load custom checklists from the server
 */
function loadCustomChecklists() {
    fetch('/api/checklists')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load checklists');
        }
        return response.json();
    })
    .then(checklists => {
        // Filter out default checklists (assuming default checklists have is_default=true)
        const customChecklists = checklists.filter(checklist => !checklist.isDefault);
        
        const container = document.getElementById('customChecklistsContainer');
        const noMessage = document.getElementById('noCustomChecklistsMessage');
        
        if (customChecklists.length === 0) {
            container.innerHTML = '';
            noMessage.style.display = 'block';
        } else {
            noMessage.style.display = 'none';
            container.innerHTML = '';
            
            // Display each custom checklist
            customChecklists.forEach(checklist => {
                const checklistCard = document.createElement('div');
                checklistCard.className = 'card mb-3';
                checklistCard.setAttribute('data-checklist-id', checklist.id);
                
                checklistCard.innerHTML = `
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span>${checklist.name}</span>
                        <div>
                            <button type="button" class="btn btn-sm btn-outline-primary view-checklist-btn" data-checklist-id="${checklist.id}">
                                <i class="fas fa-eye me-1"></i>View
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-danger delete-checklist-btn" data-checklist-id="${checklist.id}">
                                <i class="fas fa-trash me-1"></i>Delete
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="small text-muted">Type: ${capitalizeFirstLetter(checklist.type)}</div>
                        <div class="small mt-2">${checklist.items.length} items</div>
                    </div>
                `;
                
                container.appendChild(checklistCard);
            });
            
            // Add event listeners
            document.querySelectorAll('.view-checklist-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const checklistId = btn.getAttribute('data-checklist-id');
                    viewChecklist(checklistId);
                });
            });
            
            document.querySelectorAll('.delete-checklist-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const checklistId = btn.getAttribute('data-checklist-id');
                    deleteChecklist(checklistId);
                });
            });
        }
    })
    .catch(error => {
        console.error('Error loading custom checklists:', error);
        const container = document.getElementById('customChecklistsContainer');
        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i>
                Failed to load custom checklists. ${error.message}
            </div>
        `;
    });
}

/**
 * Display a checklist in the specified container
 * @param {Object} checklist - Checklist data
 * @param {string} containerId - ID of the container element
 */
function displayChecklist(checklist, containerId) {
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error(`Container not found: ${containerId}`);
        return;
    }
    
    container.innerHTML = '';
    
    // Add checklist items
    checklist.items.forEach(item => {
        const checklistItem = document.createElement('div');
        checklistItem.className = 'form-check checklist-item';
        checklistItem.innerHTML = `
            <input class="form-check-input" type="checkbox" id="${containerId}_item_${item.id}">
            <label class="form-check-label" for="${containerId}_item_${item.id}">${item.text}</label>
        `;
        container.appendChild(checklistItem);
    });
    
    // Add event listeners for checkboxes
    container.querySelectorAll('.form-check-input').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                this.closest('.checklist-item').classList.add('completed');
            } else {
                this.closest('.checklist-item').classList.remove('completed');
            }
        });
    });
}

/**
 * View a specific checklist
 * @param {string|number} checklistId - ID of the checklist to view
 */
function viewChecklist(checklistId) {
    fetch(`/api/checklists`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load checklists');
        }
        return response.json();
    })
    .then(checklists => {
        // Find the specific checklist
        const checklist = checklists.find(c => c.id == checklistId);
        
        if (!checklist) {
            throw new Error('Checklist not found');
        }
        
        // Display in the modal
        const modalContent = document.getElementById('viewChecklistContent');
        modalContent.innerHTML = '';
        
        // Add checklist title and details
        const titleDiv = document.createElement('div');
        titleDiv.className = 'mb-3';
        titleDiv.innerHTML = `
            <h5>${checklist.name}</h5>
            <div class="small text-muted">Type: ${capitalizeFirstLetter(checklist.type)}</div>
        `;
        modalContent.appendChild(titleDiv);
        
        // Add checklist items
        checklist.items.forEach(item => {
            const checklistItem = document.createElement('div');
            checklistItem.className = 'form-check checklist-item';
            checklistItem.innerHTML = `
                <input class="form-check-input" type="checkbox" id="view_item_${item.id}">
                <label class="form-check-label" for="view_item_${item.id}">${item.text}</label>
            `;
            modalContent.appendChild(checklistItem);
        });
        
        // Add offline save option
        const saveDiv = document.createElement('div');
        saveDiv.className = 'mt-3';
        saveDiv.innerHTML = `
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="saveViewedChecklist">
                <label class="form-check-label" for="saveViewedChecklist">Save this checklist offline</label>
            </div>
        `;
        modalContent.appendChild(saveDiv);
        
        // Add event listener for checkboxes
        modalContent.querySelectorAll('.form-check-input').forEach(checkbox => {
            if (checkbox.id !== 'saveViewedChecklist') {
                checkbox.addEventListener('change', function() {
                    if (this.checked) {
                        this.closest('.checklist-item').classList.add('completed');
                    } else {
                        this.closest('.checklist-item').classList.remove('completed');
                    }
                });
            }
        });
        
        // Add event listener for save checkbox
        document.getElementById('saveViewedChecklist').addEventListener('change', function() {
            if (this.checked) {
                saveChecklistOffline(checklist);
            } else {
                removeChecklistFromOffline(checklist.id);
            }
        });
        
        // Check if this checklist is already saved offline
        const isAlreadySaved = isChecklistSavedOffline(checklist.id);
        document.getElementById('saveViewedChecklist').checked = isAlreadySaved;
        
        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('viewChecklistModal'));
        modal.show();
        
        // Set the current checklist ID for printing
        document.getElementById('printViewedChecklistBtn').setAttribute('data-checklist-id', checklistId);
    })
    .catch(error => {
        console.error('Error viewing checklist:', error);
        showAlert(`Failed to view checklist: ${error.message}`, 'danger');
    });
}

/**
 * Delete a custom checklist
 * @param {string|number} checklistId - ID of the checklist to delete
 */
function deleteChecklist(checklistId) {
    if (confirm('Are you sure you want to delete this checklist?')) {
        // Also remove from offline storage if saved
        removeChecklistFromOffline(checklistId);
        
        // Remove from the DOM
        const checklistCard = document.querySelector(`.card[data-checklist-id="${checklistId}"]`);
        if (checklistCard) {
            checklistCard.remove();
        }
        
        // Check if there are any custom checklists left
        const container = document.getElementById('customChecklistsContainer');
        if (container.children.length === 0) {
            document.getElementById('noCustomChecklistsMessage').style.display = 'block';
        }
        
        showAlert('Checklist deleted successfully', 'success');
    }
}

/**
 * Show the create checklist modal
 */
function showCreateChecklistModal() {
    // Reset the form
    document.getElementById('createChecklistForm').reset();
    
    // Clear previous items except the first one
    const itemsContainer = document.getElementById('checklistItemsContainer');
    while (itemsContainer.children.length > 1) {
        itemsContainer.removeChild(itemsContainer.lastChild);
    }
    
    // Clear the first item's input value
    const firstItemInput = itemsContainer.querySelector('input');
    if (firstItemInput) {
        firstItemInput.value = '';
    }
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('createChecklistModal'));
    modal.show();
}

/**
 * Add a new checklist item input field
 */
function addChecklistItemInput() {
    const container = document.getElementById('checklistItemsContainer');
    const itemCount = container.children.length;
    
    const newItem = document.createElement('div');
    newItem.className = 'input-group mb-2 checklist-item-input';
    newItem.innerHTML = `
        <input type="text" class="form-control" placeholder="Enter checklist item">
        <button class="btn btn-outline-danger remove-item-btn" type="button">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(newItem);
    
    // Add event listener to the remove button
    newItem.querySelector('.remove-item-btn').addEventListener('click', function() {
        container.removeChild(newItem);
    });
    
    // Focus the new input field
    newItem.querySelector('input').focus();
}

/**
 * Save a custom checklist
 */
function saveCustomChecklist() {
    // Get form values
    const name = document.getElementById('checklistName').value.trim();
    const type = document.getElementById('checklistType').value;
    const saveOffline = document.getElementById('saveChecklistOffline').checked;
    
    // Get checklist items
    const itemInputs = document.querySelectorAll('#checklistItemsContainer input');
    const items = [];
    
    itemInputs.forEach(input => {
        const text = input.value.trim();
        if (text) {
            items.push(text);
        }
    });
    
    // Validate inputs
    if (!name) {
        showAlert('Please enter a checklist name', 'warning');
        return;
    }
    
    if (items.length === 0) {
        showAlert('Please add at least one checklist item', 'warning');
        return;
    }
    
    // Create checklist data
    const checklistData = {
        name: name,
        type: type,
        items: items
    };
    
    // Save to the server
    fetch('/api/checklists', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(checklistData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to create checklist');
        }
        return response.json();
    })
    .then(data => {
        // Save offline if requested
        if (saveOffline) {
            saveChecklistOffline(data);
        }
        
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('createChecklistModal'));
        if (modal) {
            modal.hide();
        }
        
        // Refresh the custom checklists list
        loadCustomChecklists();
        
        // Show success message
        showAlert('Checklist created successfully', 'success');
    })
    .catch(error => {
        console.error('Error creating checklist:', error);
        showAlert(`Failed to create checklist: ${error.message}`, 'danger');
    });
}

/**
 * Initialize the quick checklist on the dive planner page
 */
function initializeQuickChecklist() {
    // Check if we're on the planner page
    const quickChecklistCard = document.getElementById('quickChecklistCard');
    if (!quickChecklistCard) return;
    
    // Get the checkboxes
    const checkboxes = quickChecklistCard.querySelectorAll('input[type="checkbox"]');
    
    // Load saved states if any
    const savedStates = localStorage.getItem('quickChecklistStates');
    
    if (savedStates) {
        try {
            const states = JSON.parse(savedStates);
            checkboxes.forEach((checkbox, index) => {
                if (states[index]) {
                    checkbox.checked = true;
                    checkbox.closest('.checklist-item').classList.add('completed');
                }
            });
        } catch (error) {
            console.error('Error loading quick checklist states:', error);
        }
    }
    
    // Add event listeners to save state on change
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                this.closest('.checklist-item').classList.add('completed');
            } else {
                this.closest('.checklist-item').classList.remove('completed');
            }
            
            // Save all states
            const states = Array.from(checkboxes).map(cb => cb.checked);
            localStorage.setItem('quickChecklistStates', JSON.stringify(states));
        });
    });
}

/**
 * Save a checklist for offline use
 * @param {Object} checklist - Checklist data
 */
function saveChecklistOffline(checklist) {
    // Get existing saved checklists
    let savedChecklists = localStorage.getItem('offlineChecklists');
    let checklists = [];
    
    if (savedChecklists) {
        try {
            checklists = JSON.parse(savedChecklists);
        } catch (error) {
            console.error('Error parsing saved checklists:', error);
            checklists = [];
        }
    }
    
    // Check if this checklist is already saved
    const existingIndex = checklists.findIndex(c => c.id === checklist.id);
    
    if (existingIndex >= 0) {
        // Update existing checklist
        checklists[existingIndex] = checklist;
    } else {
        // Add new checklist
        checklists.push(checklist);
    }
    
    // Save back to localStorage
    localStorage.setItem('offlineChecklists', JSON.stringify(checklists));
    
    // Update offline checklists display if on the checklist page
    if (document.getElementById('offlineChecklistsContainer')) {
        loadOfflineChecklists();
    }
    
    // Show message
    showAlert('Checklist saved for offline use', 'success', 2000);
}

/**
 * Remove a checklist from offline storage
 * @param {string|number} checklistId - ID of the checklist to remove
 */
function removeChecklistFromOffline(checklistId) {
    // Get existing saved checklists
    let savedChecklists = localStorage.getItem('offlineChecklists');
    
    if (!savedChecklists) return;
    
    try {
        let checklists = JSON.parse(savedChecklists);
        
        // Filter out the checklist to remove
        checklists = checklists.filter(c => c.id != checklistId);
        
        // Save back to localStorage
        localStorage.setItem('offlineChecklists', JSON.stringify(checklists));
        
        // Update offline checklists display if on the checklist page
        if (document.getElementById('offlineChecklistsContainer')) {
            loadOfflineChecklists();
        }
    } catch (error) {
        console.error('Error removing checklist from offline storage:', error);
    }
}

/**
 * Check if a checklist is saved for offline use
 * @param {string|number} checklistId - ID of the checklist to check
 * @returns {boolean} True if the checklist is saved offline
 */
function isChecklistSavedOffline(checklistId) {
    // Get existing saved checklists
    let savedChecklists = localStorage.getItem('offlineChecklists');
    
    if (!savedChecklists) return false;
    
    try {
        let checklists = JSON.parse(savedChecklists);
        return checklists.some(c => c.id == checklistId);
    } catch (error) {
        console.error('Error checking if checklist is saved offline:', error);
        return false;
    }
}

/**
 * Load and display checklists saved for offline use
 */
function loadOfflineChecklists() {
    const container = document.getElementById('offlineChecklistsContainer');
    const noMessage = document.getElementById('noOfflineChecklistsMessage');
    
    if (!container) return;
    
    // Get saved checklists
    let savedChecklists = localStorage.getItem('offlineChecklists');
    
    if (!savedChecklists) {
        noMessage.style.display = 'block';
        container.innerHTML = '';
        return;
    }
    
    try {
        let checklists = JSON.parse(savedChecklists);
        
        if (checklists.length === 0) {
            noMessage.style.display = 'block';
            container.innerHTML = '';
            return;
        }
        
        // Hide no checklists message
        noMessage.style.display = 'none';
        
        // Display saved checklists
        container.innerHTML = '';
        
        checklists.forEach(checklist => {
            const checklistItem = document.createElement('div');
            checklistItem.className = 'mb-2';
            checklistItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <div class="fw-bold">${checklist.name}</div>
                        <div class="small text-muted">${capitalizeFirstLetter(checklist.type)}</div>
                    </div>
                    <button class="btn btn-sm btn-outline-primary view-offline-checklist-btn" data-checklist-id="${checklist.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(checklistItem);
        });
        
        // Add event listeners
        document.querySelectorAll('.view-offline-checklist-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const checklistId = this.getAttribute('data-checklist-id');
                viewOfflineChecklist(checklistId);
            });
        });
        
        // Update the manage offline checklists modal if it exists
        updateManageOfflineChecklistsList(checklists);
        
    } catch (error) {
        console.error('Error loading offline checklists:', error);
        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i>
                Failed to load offline checklists. ${error.message}
            </div>
        `;
    }
}

/**
 * View a checklist from offline storage
 * @param {string|number} checklistId - ID of the checklist to view
 */
function viewOfflineChecklist(checklistId) {
    // Get saved checklists
    let savedChecklists = localStorage.getItem('offlineChecklists');
    
    if (!savedChecklists) return;
    
    try {
        let checklists = JSON.parse(savedChecklists);
        
        // Find the specific checklist
        const checklist = checklists.find(c => c.id == checklistId);
        
        if (!checklist) {
            throw new Error('Checklist not found in offline storage');
        }
        
        // Display in the modal
        const modalContent = document.getElementById('viewChecklistContent');
        modalContent.innerHTML = '';
        
        // Add checklist title and details
        const titleDiv = document.createElement('div');
        titleDiv.className = 'mb-3';
        titleDiv.innerHTML = `
            <h5>${checklist.name}</h5>
            <div class="small text-muted">Type: ${capitalizeFirstLetter(checklist.type)} (Offline)</div>
        `;
        modalContent.appendChild(titleDiv);
        
        // Add checklist items
        checklist.items.forEach(item => {
            const checklistItem = document.createElement('div');
            checklistItem.className = 'form-check checklist-item';
            checklistItem.innerHTML = `
                <input class="form-check-input" type="checkbox" id="view_item_${item.id}">
                <label class="form-check-label" for="view_item_${item.id}">${item.text}</label>
            `;
            modalContent.appendChild(checklistItem);
        });
        
        // Add remove from offline option
        const removeDiv = document.createElement('div');
        removeDiv.className = 'mt-3';
        removeDiv.innerHTML = `
            <button class="btn btn-sm btn-outline-danger" id="removeOfflineChecklistBtn">
                <i class="fas fa-trash me-1"></i>Remove from Offline Storage
            </button>
        `;
        modalContent.appendChild(removeDiv);
        
        // Add event listener for checkboxes
        modalContent.querySelectorAll('.form-check-input').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    this.closest('.checklist-item').classList.add('completed');
                } else {
                    this.closest('.checklist-item').classList.remove('completed');
                }
            });
        });
        
        // Add event listener for remove button
        document.getElementById('removeOfflineChecklistBtn').addEventListener('click', function() {
            removeChecklistFromOffline(checklistId);
            
            // Close the modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('viewChecklistModal'));
            if (modal) {
                modal.hide();
            }
            
            showAlert('Checklist removed from offline storage', 'success');
        });
        
        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('viewChecklistModal'));
        modal.show();
        
        // Set the current checklist ID for printing
        document.getElementById('printViewedChecklistBtn').setAttribute('data-checklist-id', checklistId);
        document.getElementById('printViewedChecklistBtn').setAttribute('data-offline', 'true');
        
    } catch (error) {
        console.error('Error viewing offline checklist:', error);
        showAlert(`Failed to view offline checklist: ${error.message}`, 'danger');
    }
}

/**
 * Show the manage offline checklists modal
 */
function showManageOfflineChecklistsModal() {
    // Get saved checklists
    let savedChecklists = localStorage.getItem('offlineChecklists');
    
    if (!savedChecklists) {
        document.getElementById('noOfflineChecklistsToManageMessage').style.display = 'block';
        document.getElementById('manageOfflineChecklistsList').innerHTML = '';
    } else {
        try {
            let checklists = JSON.parse(savedChecklists);
            
            if (checklists.length === 0) {
                document.getElementById('noOfflineChecklistsToManageMessage').style.display = 'block';
                document.getElementById('manageOfflineChecklistsList').innerHTML = '';
            } else {
                document.getElementById('noOfflineChecklistsToManageMessage').style.display = 'none';
                updateManageOfflineChecklistsList(checklists);
            }
        } catch (error) {
            console.error('Error loading offline checklists for management:', error);
            document.getElementById('manageOfflineChecklistsList').innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Failed to load offline checklists. ${error.message}
                </div>
            `;
        }
    }
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('manageOfflineModal'));
    modal.show();
}

/**
 * Update the list of checklists in the manage offline checklists modal
 * @param {Array} checklists - Array of checklist objects
 */
function updateManageOfflineChecklistsList(checklists) {
    const container = document.getElementById('manageOfflineChecklistsList');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    checklists.forEach(checklist => {
        const listItem = document.createElement('div');
        listItem.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
        listItem.innerHTML = `
            <div>
                <div class="fw-bold">${checklist.name}</div>
                <div class="small text-muted">${capitalizeFirstLetter(checklist.type)}</div>
            </div>
            <button class="btn btn-sm btn-outline-danger remove-offline-checklist-btn" data-checklist-id="${checklist.id}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        container.appendChild(listItem);
    });
    
    // Add event listeners
    document.querySelectorAll('.remove-offline-checklist-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const checklistId = this.getAttribute('data-checklist-id');
            removeChecklistFromOffline(checklistId);
            
            // Remove this item from the list
            this.closest('.list-group-item').remove();
            
            // Check if there are any items left
            if (container.children.length === 0) {
                document.getElementById('noOfflineChecklistsToManageMessage').style.display = 'block';
            }
        });
    });
}

/**
 * Clear all offline data
 */
function clearAllOfflineData() {
    if (confirm('Are you sure you want to clear all offline data? This cannot be undone.')) {
        // Clear all related localStorage items
        localStorage.removeItem('offlineChecklists');
        localStorage.removeItem('quickChecklistStates');
        localStorage.removeItem('savedDivePlans');
        
        // Update UI
        document.getElementById('noOfflineChecklistsToManageMessage').style.display = 'block';
        document.getElementById('manageOfflineChecklistsList').innerHTML = '';
        
        // If on the checklist page, update the offline checklists display
        if (document.getElementById('offlineChecklistsContainer')) {
            document.getElementById('noOfflineChecklistsMessage').style.display = 'block';
            document.getElementById('offlineChecklistsContainer').innerHTML = '';
        }
        
        showAlert('All offline data has been cleared', 'success');
    }
}

/**
 * Print a checklist
 * @param {Event} event - The event object
 */
function printChecklist(event) {
    const type = event.currentTarget.getAttribute('data-type');
    let title = '';
    let content = '';
    
    switch (type) {
        case 'pre-dive':
            title = 'Pre-Dive Checklist';
            content = document.getElementById('preChecklistItems').innerHTML;
            break;
        case 'post-dive':
            title = 'Post-Dive Checklist';
            content = document.getElementById('postChecklistItems').innerHTML;
            break;
        case 'emergency':
            title = 'Emergency Procedures Checklist';
            content = document.getElementById('emergencyChecklistItems').innerHTML;
            break;
        default:
            return;
    }
    
    // Set print content
    document.getElementById('printChecklistContent').innerHTML = `
        <div class="print-container">
            <h1>${title}</h1>
            <hr>
            <div class="print-checklist">
                ${preparePrintableChecklist(content)}
            </div>
            <div class="print-footer">
                <p>Generated with ScuPlan - Dive Planning Made Easy</p>
            </div>
        </div>
        <style>
            .print-container { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; }
            h1 { text-align: center; }
            .print-checklist { margin: 20px 0; }
            .print-checklist-item { display: flex; margin-bottom: 15px; }
            .print-checkbox { width: 20px; height: 20px; margin-right: 10px; font-size: 20px; }
            .print-checklist-text { font-size: 16px; }
            .print-footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
            
            @media print {
                body { margin: 0; padding: 20px; }
            }
        </style>
    `;
    
    // Print
    preparePrint('checklist');
}

/**
 * Print the currently viewed checklist
 */
function printViewedChecklist() {
    const content = document.getElementById('viewChecklistContent').innerHTML;
    const title = document.getElementById('viewChecklistContent').querySelector('h5').textContent;
    
    // Set print content
    document.getElementById('printChecklistContent').innerHTML = `
        <div class="print-container">
            <h1>${title}</h1>
            <hr>
            <div class="print-checklist">
                ${preparePrintableChecklist(content)}
            </div>
            <div class="print-footer">
                <p>Generated with ScuPlan - Dive Planning Made Easy</p>
            </div>
        </div>
        <style>
            .print-container { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; }
            h1 { text-align: center; }
            .print-checklist { margin: 20px 0; }
            .print-checklist-item { display: flex; margin-bottom: 15px; }
            .print-checkbox { width: 20px; height: 20px; margin-right: 10px; font-size: 20px; }
            .print-checklist-text { font-size: 16px; }
            .print-footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
            
            @media print {
                body { margin: 0; padding: 20px; }
            }
        </style>
    `;
    
    // Print
    preparePrint('checklist');
}

/**
 * Prepare a checklist for printing by converting interactive elements to static ones
 * @param {string} content - HTML content of the checklist
 * @returns {string} Printable HTML
 */
function preparePrintableChecklist(content) {
    // Create a temporary container
    const temp = document.createElement('div');
    temp.innerHTML = content;
    
    // Get all checklist items
    const items = temp.querySelectorAll('.checklist-item');
    let printableContent = '';
    
    // Convert each item to printable format
    items.forEach(item => {
        const label = item.querySelector('label');
        
        if (label) {
            printableContent += `
                <div class="print-checklist-item">
                    <div class="print-checkbox">□</div>
                    <div class="print-checklist-text">${label.textContent}</div>
                </div>
            `;
        }
    });
    
    return printableContent;
}
