/**
 * ScuPlan - Dive Sites Module
 * Handles all functionality related to dive sites database
 */

// Global variables
let map = null;
let markers = [];
let currentDiveSites = [];
let currentPage = 1;
let totalPages = 1;
let activeFilters = {};
let countriesList = [];
let selectedSiteId = null;
let currentGalleryIndex = 0;

/**
 * Initialize dive sites functionality
 */
function initDiveSites() {
    // Setup event listeners
    document.getElementById('addDiveSiteBtn').addEventListener('click', showAddDiveSiteModal);
    document.getElementById('toggleFiltersBtn').addEventListener('click', toggleFiltersPanel);
    document.getElementById('resetFiltersBtn').addEventListener('click', resetFilters);
    document.getElementById('applyFiltersBtn').addEventListener('click', applyFilters);
    document.getElementById('showListViewBtn').addEventListener('click', showListView);
    document.getElementById('showMapViewBtn').addEventListener('click', showMapView);
    document.getElementById('saveDiveSiteBtn').addEventListener('click', saveDiveSite);
    document.getElementById('addImageBtn').addEventListener('click', addImageField);
    
    // Initialize the first image field event listeners
    initImageFieldListeners(document.querySelector('.site-image-input'));
    
    // Load dive sites
    loadDiveSites();
    
    // Initialize map
    initMap();
}

/**
 * Initialize dive site detail page
 * @param {number} siteId - The ID of the dive site to display
 */
function initDiveSiteDetail(siteId) {
    // Store the site ID
    selectedSiteId = siteId;
    
    // Setup event listeners
    document.getElementById('backToDiveSitesBtn').addEventListener('click', function() {
        window.location.href = '/divesites';
    });
    document.getElementById('editThisDiveSiteBtn').addEventListener('click', function() {
        loadDiveSiteForEditing(siteId);
    });
    
    // Load dive site details
    loadDiveSiteDetails(siteId);
}

/**
 * Load dive sites with current filters
 * @param {number} page - Page number to load (optional)
 */
function loadDiveSites(page = 1) {
    currentPage = page;
    
    // Show loading indicator
    document.getElementById('loadingIndicator').style.display = 'block';
    document.getElementById('noResultsMessage').style.display = 'none';
    document.getElementById('diveSitesGrid').innerHTML = '';
    document.getElementById('paginationContainer').style.display = 'none';
    
    // Build query parameters
    let params = new URLSearchParams();
    params.append('page', page);
    params.append('per_page', 12);
    
    // Add filters if any
    if (activeFilters.search) params.append('search', activeFilters.search);
    if (activeFilters.country) params.append('country', activeFilters.country);
    if (activeFilters.difficulty) params.append('difficulty', activeFilters.difficulty);
    if (activeFilters.water_type) params.append('water_type', activeFilters.water_type);
    if (activeFilters.min_depth) params.append('min_depth', activeFilters.min_depth);
    if (activeFilters.max_depth) params.append('max_depth', activeFilters.max_depth);
    
    // Add sorting
    if (activeFilters.sort_by) {
        const [sortField, sortOrder] = activeFilters.sort_by.split('|');
        params.append('sort_by', sortField);
        if (sortOrder) params.append('sort_order', sortOrder);
    }
    
    // Fetch dive sites
    fetch(`/api/divesites?${params.toString()}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to load dive sites');
            return response.json();
        })
        .then(data => {
            currentDiveSites = data.dive_sites;
            totalPages = data.pages;
            
            // Update UI
            renderDiveSites(data.dive_sites);
            renderPagination(data.current_page, data.pages);
            updateMapMarkers(data.dive_sites);
            
            // Extract unique countries for filter dropdown if first page
            if (page === 1 && data.dive_sites.length > 0) {
                updateCountriesDropdown(data.dive_sites);
            }
            
            // Hide loading indicator
            document.getElementById('loadingIndicator').style.display = 'none';
            
            // Show no results message if needed
            if (data.dive_sites.length === 0) {
                document.getElementById('noResultsMessage').style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error loading dive sites:', error);
            document.getElementById('loadingIndicator').style.display = 'none';
            document.getElementById('noResultsMessage').style.display = 'block';
            document.getElementById('noResultsMessage').innerHTML = `
                <i class="fas fa-exclamation-circle fa-3x mb-3 text-danger"></i>
                <h5>Error Loading Dive Sites</h5>
                <p>${error.message}</p>
            `;
        });
}

/**
 * Render dive sites in the grid
 * @param {Array} diveSites - Array of dive site objects
 */
function renderDiveSites(diveSites) {
    const container = document.getElementById('diveSitesGrid');
    container.innerHTML = '';
    
    diveSites.forEach(site => {
        // Find primary image or use first available
        let imageUrl = '/static/images/default-dive-site.jpg';
        let imageCaption = '';
        
        if (site.images && site.images.length > 0) {
            const primaryImage = site.images.find(img => img.is_primary);
            if (primaryImage) {
                imageUrl = primaryImage.image_url;
                imageCaption = primaryImage.caption;
            } else {
                imageUrl = site.images[0].image_url;
                imageCaption = site.images[0].caption;
            }
        }
        
        // Create difficulty badge
        let difficultyClass = 'bg-info';
        if (site.difficulty === 'beginner') difficultyClass = 'bg-success';
        if (site.difficulty === 'advanced') difficultyClass = 'bg-warning';
        if (site.difficulty === 'expert') difficultyClass = 'bg-danger';
        
        // Create rating stars
        const rating = site.average_rating || 0;
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                starsHtml += '<i class="fas fa-star"></i>';
            } else if (i - 0.5 <= rating) {
                starsHtml += '<i class="fas fa-star-half-alt"></i>';
            } else {
                starsHtml += '<i class="far fa-star"></i>';
            }
        }
        
        // Create card
        const card = document.createElement('div');
        card.className = 'col-lg-4 col-md-6 mb-4';
        card.innerHTML = `
            <div class="card h-100 shadow-sm">
                <div style="height: 200px; overflow: hidden;">
                    <img src="${imageUrl}" class="card-img-top" alt="${site.name}" 
                        style="height: 100%; width: 100%; object-fit: cover;"
                        onerror="this.src='/static/images/default-dive-site.jpg'">
                </div>
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title mb-0">${site.name}</h5>
                        <span class="badge ${difficultyClass}">${capitalizeFirstLetter(site.difficulty)}</span>
                    </div>
                    <p class="card-text text-muted mb-1">
                        <i class="fas fa-map-marker-alt me-1"></i> ${site.location}, ${site.country || 'Unknown'}
                    </p>
                    <p class="card-text mb-1">
                        <i class="fas fa-water me-1 text-primary"></i> Depth: ${site.depth_max || 'N/A'}m
                    </p>
                    <div class="d-flex align-items-center mb-2">
                        <div class="rating-stars me-1">
                            ${starsHtml}
                        </div>
                        <small class="text-muted">(${site.ratings ? site.ratings.length : 0})</small>
                    </div>
                    <p class="card-text small text-truncate">${site.description || 'No description available.'}</p>
                </div>
                <div class="card-footer bg-transparent">
                    <div class="d-grid">
                        <button class="btn btn-outline-primary view-site-btn" 
                            data-site-id="${site.id}">View Details</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listener
        card.querySelector('.view-site-btn').addEventListener('click', function() {
            window.location.href = `/divesites/${site.id}`;
        });
        
        container.appendChild(card);
    });
}

/**
 * Render pagination controls
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total number of pages
 */
function renderPagination(currentPage, totalPages) {
    const container = document.getElementById('paginationLinks');
    container.innerHTML = '';
    
    if (totalPages <= 1) {
        document.getElementById('paginationContainer').style.display = 'none';
        return;
    }
    
    document.getElementById('paginationContainer').style.display = 'flex';
    
    // Previous button
    const prevItem = document.createElement('li');
    prevItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevItem.innerHTML = `<a class="page-link" href="#" aria-label="Previous">
        <span aria-hidden="true">&laquo;</span>
    </a>`;
    if (currentPage > 1) {
        prevItem.querySelector('a').addEventListener('click', function(e) {
            e.preventDefault();
            loadDiveSites(currentPage - 1);
        });
    }
    container.appendChild(prevItem);
    
    // Page numbers
    const maxPages = Math.min(totalPages, 5);
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        
        pageItem.querySelector('a').addEventListener('click', function(e) {
            e.preventDefault();
            loadDiveSites(i);
        });
        
        container.appendChild(pageItem);
    }
    
    // Next button
    const nextItem = document.createElement('li');
    nextItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextItem.innerHTML = `<a class="page-link" href="#" aria-label="Next">
        <span aria-hidden="true">&raquo;</span>
    </a>`;
    if (currentPage < totalPages) {
        nextItem.querySelector('a').addEventListener('click', function(e) {
            e.preventDefault();
            loadDiveSites(currentPage + 1);
        });
    }
    container.appendChild(nextItem);
}

/**
 * Initialize Leaflet map
 */
function initMap() {
    // Create map instance if not already created
    if (!map) {
        map = L.map('diveSitesMap').setView([20, 0], 2);
        
        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    }
}

/**
 * Update map markers with dive sites
 * @param {Array} diveSites - Array of dive site objects
 */
function updateMapMarkers(diveSites) {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Add markers for dive sites with coordinates
    diveSites.forEach(site => {
        if (site.latitude && site.longitude) {
            const marker = L.marker([site.latitude, site.longitude])
                .addTo(map)
                .bindPopup(`
                    <strong>${site.name}</strong><br>
                    ${site.location}, ${site.country || 'Unknown'}<br>
                    Depth: ${site.depth_max || 'N/A'}m<br>
                    <a href="/divesites/${site.id}">View Details</a>
                `);
            
            markers.push(marker);
        }
    });
    
    // Fit map to markers if any
    if (markers.length > 0) {
        const bounds = L.featureGroup(markers).getBounds();
        map.fitBounds(bounds);
    }
}

/**
 * Update countries dropdown with unique values
 * @param {Array} diveSites - Array of dive site objects
 */
function updateCountriesDropdown(diveSites) {
    const countryFilter = document.getElementById('countryFilter');
    
    // Extract unique countries
    const countries = [...new Set(diveSites.map(site => site.country).filter(Boolean))];
    countries.sort();
    
    // Store for later use
    countriesList = countries;
    
    // Clear existing options except first one
    countryFilter.innerHTML = '<option value="">All Countries</option>';
    
    // Add country options
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });
}

/**
 * Toggle filters panel visibility
 */
function toggleFiltersPanel() {
    const filtersPanel = document.getElementById('filtersPanel');
    const toggleBtn = document.getElementById('toggleFiltersBtn');
    
    if (filtersPanel.style.display === 'none') {
        filtersPanel.style.display = 'block';
        toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    } else {
        filtersPanel.style.display = 'none';
        toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
    }
}

/**
 * Reset all filters to default values
 */
function resetFilters() {
    document.getElementById('searchField').value = '';
    document.getElementById('countryFilter').value = '';
    document.getElementById('difficultyFilter').value = '';
    document.getElementById('waterTypeFilter').value = '';
    document.getElementById('minDepthFilter').value = '';
    document.getElementById('maxDepthFilter').value = '';
    document.getElementById('sortByFilter').value = 'name';
    
    // Clear active filters
    activeFilters = {};
    
    // Reload dive sites
    loadDiveSites();
}

/**
 * Apply selected filters
 */
function applyFilters() {
    // Get filter values
    const search = document.getElementById('searchField').value.trim();
    const country = document.getElementById('countryFilter').value;
    const difficulty = document.getElementById('difficultyFilter').value;
    const waterType = document.getElementById('waterTypeFilter').value;
    const minDepth = document.getElementById('minDepthFilter').value;
    const maxDepth = document.getElementById('maxDepthFilter').value;
    const sortBy = document.getElementById('sortByFilter').value;
    
    // Update active filters
    activeFilters = {};
    if (search) activeFilters.search = search;
    if (country) activeFilters.country = country;
    if (difficulty) activeFilters.difficulty = difficulty;
    if (waterType) activeFilters.water_type = waterType;
    if (minDepth) activeFilters.min_depth = minDepth;
    if (maxDepth) activeFilters.max_depth = maxDepth;
    if (sortBy) activeFilters.sort_by = sortBy;
    
    // Reload dive sites with first page
    loadDiveSites(1);
}

/**
 * Show list view
 */
function showListView() {
    document.getElementById('diveSitesMap').style.display = 'none';
    document.getElementById('diveSitesList').style.display = 'block';
    document.getElementById('showListViewBtn').classList.add('active');
    document.getElementById('showMapViewBtn').classList.remove('active');
}

/**
 * Show map view
 */
function showMapView() {
    document.getElementById('diveSitesList').style.display = 'none';
    document.getElementById('diveSitesMap').style.display = 'block';
    document.getElementById('showMapViewBtn').classList.add('active');
    document.getElementById('showListViewBtn').classList.remove('active');
    
    // Ensure map is initialized and refresh it
    if (map) {
        map.invalidateSize();
        if (markers.length > 0) {
            const bounds = L.featureGroup(markers).getBounds();
            map.fitBounds(bounds);
        }
    }
}

/**
 * Show modal to add a new dive site
 */
function showAddDiveSiteModal() {
    // Reset form
    document.getElementById('diveSiteForm').reset();
    document.getElementById('diveSiteId').value = '';
    
    // Reset images container
    const imagesContainer = document.getElementById('siteImagesContainer');
    imagesContainer.innerHTML = `
        <div class="site-image-input mb-2 d-flex align-items-center">
            <input type="text" class="form-control me-2" placeholder="Image URL">
            <input type="text" class="form-control me-2" placeholder="Caption (optional)">
            <div class="form-check me-2">
                <input class="form-check-input primary-image-checkbox" type="checkbox" value="">
                <label class="form-check-label">Primary</label>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger remove-image-btn">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Initialize image field listeners
    initImageFieldListeners(imagesContainer.querySelector('.site-image-input'));
    
    // Update modal title
    document.getElementById('diveSiteModalLabel').textContent = 'Add New Dive Site';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('diveSiteModal'));
    modal.show();
}

/**
 * Load dive site data for editing
 * @param {number} siteId - ID of the dive site to edit
 */
function loadDiveSiteForEditing(siteId) {
    fetch(`/api/divesites/${siteId}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to load dive site data');
            return response.json();
        })
        .then(site => {
            // Populate form fields
            document.getElementById('diveSiteId').value = site.id;
            document.getElementById('siteName').value = site.name || '';
            document.getElementById('siteLocation').value = site.location || '';
            document.getElementById('siteCountry').value = site.country || '';
            document.getElementById('siteDepthMax').value = site.depth_max || '';
            document.getElementById('siteDepthAvg').value = site.depth_avg || '';
            document.getElementById('siteDifficulty').value = site.difficulty || 'intermediate';
            document.getElementById('siteWaterType').value = site.water_type || 'salt';
            document.getElementById('siteVisibility').value = site.visibility || '';
            document.getElementById('siteCurrentStrength').value = site.current_strength || 'moderate';
            document.getElementById('siteTemperature').value = site.temperature_avg || '';
            document.getElementById('siteBestSeason').value = site.best_season || '';
            document.getElementById('siteLatitude').value = site.latitude || '';
            document.getElementById('siteLongitude').value = site.longitude || '';
            document.getElementById('siteEntryType').value = site.entry_type || '';
            document.getElementById('siteDescription').value = site.description || '';
            document.getElementById('siteSpecialFeatures').value = site.special_features || '';
            document.getElementById('siteRequirements').value = site.requirements || '';
            document.getElementById('siteHazards').value = site.hazards || '';
            document.getElementById('siteRegulations').value = site.regulations || '';
            document.getElementById('siteFacilities').value = site.facilities || '';
            
            // Populate images
            const imagesContainer = document.getElementById('siteImagesContainer');
            imagesContainer.innerHTML = '';
            
            if (site.images && site.images.length > 0) {
                site.images.forEach(image => {
                    const imageField = createImageField();
                    const inputs = imageField.querySelectorAll('input');
                    inputs[0].value = image.image_url || '';
                    inputs[1].value = image.caption || '';
                    inputs[2].checked = image.is_primary || false;
                    
                    imagesContainer.appendChild(imageField);
                    initImageFieldListeners(imageField);
                });
            } else {
                // Add one empty image field
                const imageField = createImageField();
                imagesContainer.appendChild(imageField);
                initImageFieldListeners(imageField);
            }
            
            // Update modal title
            document.getElementById('diveSiteModalLabel').textContent = 'Edit Dive Site';
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('diveSiteModal'));
            modal.show();
        })
        .catch(error => {
            console.error('Error loading dive site for editing:', error);
            alert('Failed to load dive site data for editing.');
        });
}

/**
 * Create a new image field element
 * @returns {HTMLElement} The created image field element
 */
function createImageField() {
    const imageField = document.createElement('div');
    imageField.className = 'site-image-input mb-2 d-flex align-items-center';
    imageField.innerHTML = `
        <input type="text" class="form-control me-2" placeholder="Image URL">
        <input type="text" class="form-control me-2" placeholder="Caption (optional)">
        <div class="form-check me-2">
            <input class="form-check-input primary-image-checkbox" type="checkbox" value="">
            <label class="form-check-label">Primary</label>
        </div>
        <button type="button" class="btn btn-sm btn-outline-danger remove-image-btn">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    return imageField;
}

/**
 * Initialize event listeners for an image field
 * @param {HTMLElement} imageField - The image field element
 */
function initImageFieldListeners(imageField) {
    const removeBtn = imageField.querySelector('.remove-image-btn');
    const checkbox = imageField.querySelector('.primary-image-checkbox');
    
    // Remove button event
    removeBtn.addEventListener('click', function() {
        if (document.querySelectorAll('.site-image-input').length > 1) {
            imageField.remove();
        } else {
            // Clear inputs instead of removing the last field
            const inputs = imageField.querySelectorAll('input');
            inputs[0].value = '';
            inputs[1].value = '';
            inputs[2].checked = false;
        }
    });
    
    // Primary checkbox event
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            // Uncheck all other primary checkboxes
            document.querySelectorAll('.primary-image-checkbox').forEach(cb => {
                if (cb !== this) cb.checked = false;
            });
        }
    });
}

/**
 * Add a new image field to the form
 */
function addImageField() {
    const imagesContainer = document.getElementById('siteImagesContainer');
    const imageField = createImageField();
    
    imagesContainer.appendChild(imageField);
    initImageFieldListeners(imageField);
}

/**
 * Save dive site data
 */
function saveDiveSite() {
    // Get form data
    const siteId = document.getElementById('diveSiteId').value;
    const name = document.getElementById('siteName').value.trim();
    const location = document.getElementById('siteLocation').value.trim();
    
    // Validate required fields
    if (!name || !location) {
        alert('Site name and location are required.');
        return;
    }
    
    // Collect data
    const siteData = {
        name: name,
        location: location,
        country: document.getElementById('siteCountry').value.trim(),
        depth_max: parseFloat(document.getElementById('siteDepthMax').value) || 0,
        depth_avg: parseFloat(document.getElementById('siteDepthAvg').value) || 0,
        difficulty: document.getElementById('siteDifficulty').value,
        description: document.getElementById('siteDescription').value.trim(),
        water_type: document.getElementById('siteWaterType').value,
        visibility: parseFloat(document.getElementById('siteVisibility').value) || 0,
        current_strength: document.getElementById('siteCurrentStrength').value,
        temperature_avg: parseFloat(document.getElementById('siteTemperature').value) || null,
        best_season: document.getElementById('siteBestSeason').value.trim(),
        latitude: parseFloat(document.getElementById('siteLatitude').value) || null,
        longitude: parseFloat(document.getElementById('siteLongitude').value) || null,
        entry_type: document.getElementById('siteEntryType').value.trim(),
        special_features: document.getElementById('siteSpecialFeatures').value.trim(),
        requirements: document.getElementById('siteRequirements').value.trim(),
        hazards: document.getElementById('siteHazards').value.trim(),
        regulations: document.getElementById('siteRegulations').value.trim(),
        facilities: document.getElementById('siteFacilities').value.trim(),
        images: []
    };
    
    // Collect images
    document.querySelectorAll('.site-image-input').forEach(field => {
        const inputs = field.querySelectorAll('input');
        const imageUrl = inputs[0].value.trim();
        
        if (imageUrl) {
            siteData.images.push({
                image_url: imageUrl,
                caption: inputs[1].value.trim(),
                is_primary: inputs[2].checked
            });
        }
    });
    
    // Ensure at least one image is marked as primary if there are images
    if (siteData.images.length > 0 && !siteData.images.some(img => img.is_primary)) {
        siteData.images[0].is_primary = true;
    }
    
    // Send data to server
    const url = siteId ? `/api/divesites/${siteId}` : '/api/divesites';
    const method = siteId ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(siteData)
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to save dive site');
        return response.json();
    })
    .then(data => {
        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('diveSiteModal')).hide();
        
        // Show success message
        alert(siteId ? 'Dive site updated successfully!' : 'New dive site added successfully!');
        
        // Reload page or dive sites
        if (window.location.pathname.includes('/divesites/')) {
            // We're on a detail page, reload it
            window.location.reload();
        } else {
            // We're on the list page, reload dive sites
            loadDiveSites(1);
        }
    })
    .catch(error => {
        console.error('Error saving dive site:', error);
        alert('Failed to save dive site. Please try again.');
    });
}

/**
 * Load dive site details for detail page
 * @param {number} siteId - ID of the dive site to display
 */
function loadDiveSiteDetails(siteId) {
    fetch(`/api/divesites/${siteId}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to load dive site details');
            return response.json();
        })
        .then(site => {
            // Update page title
            document.title = `ScuPlan - ${site.name} - Dive Site Details`;
            
            // Update breadcrumb and header
            document.getElementById('diveSiteBreadcrumb').textContent = site.name;
            document.getElementById('diveSiteTitle').textContent = site.name;
            document.getElementById('diveSiteLocation').textContent = `${site.location}${site.country ? ', ' + site.country : ''}`;
            
            // Update rating stars
            const rating = site.average_rating || 0;
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= Math.floor(rating)) {
                    starsHtml += '<i class="fas fa-star"></i>';
                } else if (i - 0.5 <= rating) {
                    starsHtml += '<i class="fas fa-star-half-alt"></i>';
                } else {
                    starsHtml += '<i class="far fa-star"></i>';
                }
            }
            document.getElementById('diveSiteRating').innerHTML = starsHtml;
            document.getElementById('diveSiteRatingCount').textContent = 
                `(${site.ratings ? site.ratings.length : 0} rating${site.ratings && site.ratings.length !== 1 ? 's' : ''})`;
            
            // Create details content
            const detailsContent = document.getElementById('diveSiteDetailsContent');
            detailsContent.innerHTML = '';
            
            // Gallery column
            const galleryCol = document.createElement('div');
            galleryCol.className = 'col-lg-6 mb-4';
            
            if (site.images && site.images.length > 0) {
                // Create gallery
                let galleryHtml = `
                    <div class="dive-site-gallery mb-2">
                        <img src="${site.images[0].image_url}" alt="${site.name}" id="mainGalleryImage"
                            onerror="this.src='/static/images/default-dive-site.jpg'">
                        <button type="button" class="gallery-nav-btn gallery-nav-prev" id="galleryPrevBtn">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button type="button" class="gallery-nav-btn gallery-nav-next" id="galleryNextBtn">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                    <div class="row g-2" id="galleryThumbnails">
                `;
                
                site.images.forEach((image, index) => {
                    galleryHtml += `
                        <div class="col-3">
                            <img src="${image.image_url}" alt="${image.caption || site.name}" 
                                class="dive-site-thumbnail ${index === 0 ? 'active' : ''}" 
                                data-index="${index}"
                                onerror="this.src='/static/images/default-dive-site.jpg'">
                        </div>
                    `;
                });
                
                galleryHtml += `
                    </div>
                    <p class="text-center text-muted mt-2" id="imageCaption">${site.images[0].caption || ''}</p>
                `;
                
                galleryCol.innerHTML = galleryHtml;
            } else {
                // No images placeholder
                galleryCol.innerHTML = `
                    <div class="dive-site-gallery mb-4">
                        <img src="/static/images/default-dive-site.jpg" alt="${site.name}">
                    </div>
                    <p class="text-center text-muted">No images available for this dive site.</p>
                `;
            }
            
            detailsContent.appendChild(galleryCol);
            
            // Info column
            const infoCol = document.createElement('div');
            infoCol.className = 'col-lg-6';
            
            infoCol.innerHTML = `
                <div class="property-group">
                    <h5 class="mb-3">Dive Site Information</h5>
                    <div class="row mb-2">
                        <div class="col-md-6">
                            <div class="property-label">Maximum Depth</div>
                            <div class="property-value">${site.depth_max || 'N/A'} meters</div>
                        </div>
                        <div class="col-md-6">
                            <div class="property-label">Average Depth</div>
                            <div class="property-value">${site.depth_avg || 'N/A'} meters</div>
                        </div>
                    </div>
                    <div class="row mb-2">
                        <div class="col-md-6">
                            <div class="property-label">Difficulty Level</div>
                            <div class="property-value">
                                ${getDifficultyBadge(site.difficulty)}
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="property-label">Water Type</div>
                            <div class="property-value">${capitalizeFirstLetter(site.water_type || 'N/A')}</div>
                        </div>
                    </div>
                    <div class="row mb-2">
                        <div class="col-md-6">
                            <div class="property-label">Visibility</div>
                            <div class="property-value">${site.visibility || 'N/A'} meters</div>
                        </div>
                        <div class="col-md-6">
                            <div class="property-label">Current Strength</div>
                            <div class="property-value">${getCurrentStrengthBadge(site.current_strength)}</div>
                        </div>
                    </div>
                    <div class="row mb-2">
                        <div class="col-md-6">
                            <div class="property-label">Water Temperature</div>
                            <div class="property-value">${site.temperature_avg ? site.temperature_avg + '°C' : 'N/A'}</div>
                        </div>
                        <div class="col-md-6">
                            <div class="property-label">Best Season</div>
                            <div class="property-value">${site.best_season || 'N/A'}</div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="property-label">Entry Type</div>
                            <div class="property-value">${site.entry_type || 'N/A'}</div>
                        </div>
                    </div>
                </div>
                
                <div class="property-group">
                    <h5 class="mb-3">Description</h5>
                    <p>${site.description || 'No description available for this dive site.'}</p>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="property-group">
                            <h5 class="mb-3">Special Features</h5>
                            <p>${site.special_features || 'None specified.'}</p>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="property-group">
                            <h5 class="mb-3">Requirements</h5>
                            <p>${site.requirements || 'No special requirements.'}</p>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="property-group">
                            <h5 class="mb-3">Potential Hazards</h5>
                            <p>${site.hazards || 'None specified.'}</p>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="property-group">
                            <h5 class="mb-3">Local Regulations</h5>
                            <p>${site.regulations || 'None specified.'}</p>
                        </div>
                    </div>
                </div>
                
                <div class="property-group">
                    <h5 class="mb-3">Available Facilities</h5>
                    <p>${site.facilities || 'None specified.'}</p>
                </div>
            `;
            
            detailsContent.appendChild(infoCol);
            
            // Add map and ratings in full width row
            const mapRatingsRow = document.createElement('div');
            mapRatingsRow.className = 'row';
            
            const mapCol = document.createElement('div');
            mapCol.className = 'col-lg-6 mb-4';
            mapCol.innerHTML = `
                <div class="property-group">
                    <h5 class="mb-3">Location</h5>
                    <div id="diveSiteMap"></div>
                </div>
            `;
            
            const ratingsCol = document.createElement('div');
            ratingsCol.className = 'col-lg-6 mb-4';
            
            let ratingsHtml = `
                <div class="property-group">
                    <div class="d-flex justify-content-between mb-3">
                        <h5 class="mb-0">Ratings & Reviews</h5>
                        <button class="btn btn-sm btn-outline-primary" id="addRatingBtn">
                            <i class="fas fa-star me-1"></i>Add Rating
                        </button>
                    </div>
                    
                    <div class="mb-3" id="ratingForm" style="display: none;">
                        <div class="card">
                            <div class="card-body">
                                <h6 class="card-title">Rate This Dive Site</h6>
                                <div class="mb-2">
                                    <div class="rating-form-stars" id="ratingStars">
                                        <i class="far fa-star" data-rating="1"></i>
                                        <i class="far fa-star" data-rating="2"></i>
                                        <i class="far fa-star" data-rating="3"></i>
                                        <i class="far fa-star" data-rating="4"></i>
                                        <i class="far fa-star" data-rating="5"></i>
                                    </div>
                                    <span class="ms-2" id="ratingValue">0 / 5</span>
                                </div>
                                <div class="mb-3">
                                    <label for="ratingComment" class="form-label">Your Comment (Optional)</label>
                                    <textarea class="form-control" id="ratingComment" rows="2"></textarea>
                                </div>
                                <div class="mb-3">
                                    <label for="ratingName" class="form-label">Your Name</label>
                                    <input type="text" class="form-control" id="ratingName" placeholder="Anonymous">
                                </div>
                                <div class="d-flex justify-content-end">
                                    <button type="button" class="btn btn-outline-secondary me-2" id="cancelRatingBtn">
                                        Cancel
                                    </button>
                                    <button type="button" class="btn btn-primary" id="submitRatingBtn">
                                        Submit Rating
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
            `;
            
            if (site.ratings && site.ratings.length > 0) {
                ratingsHtml += `<div class="row g-3" id="ratingsList">`;
                
                site.ratings.forEach(rating => {
                    let ratingStars = '';
                    for (let i = 1; i <= 5; i++) {
                        if (i <= rating.score) {
                            ratingStars += '<i class="fas fa-star"></i>';
                        } else if (i - 0.5 <= rating.score) {
                            ratingStars += '<i class="fas fa-star-half-alt"></i>';
                        } else {
                            ratingStars += '<i class="far fa-star"></i>';
                        }
                    }
                    
                    const ratingDate = new Date(rating.created_at);
                    const formattedDate = ratingDate.toLocaleDateString();
                    
                    ratingsHtml += `
                        <div class="col-md-6">
                            <div class="card rating-card h-100">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between mb-1">
                                        <div class="rating-stars">${ratingStars}</div>
                                        <small class="text-muted">${formattedDate}</small>
                                    </div>
                                    <h6 class="card-subtitle mb-2">${rating.user_name || 'Anonymous'}</h6>
                                    <p class="card-text small">${rating.comment || 'No comment provided.'}</p>
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                ratingsHtml += `</div>`;
            } else {
                ratingsHtml += `
                    <div class="text-center py-3" id="noRatingsMessage">
                        <p class="text-muted">No ratings yet. Be the first to rate this dive site!</p>
                    </div>
                `;
            }
            
            ratingsHtml += `</div>`;
            ratingsCol.innerHTML = ratingsHtml;
            
            mapRatingsRow.appendChild(mapCol);
            mapRatingsRow.appendChild(ratingsCol);
            detailsContent.appendChild(mapRatingsRow);
            
            // Hide loading indicator
            document.getElementById('loadingIndicator').style.display = 'none';
            
            // Initialize map if coordinates are available
            if (site.latitude && site.longitude) {
                initDetailMap(site);
            } else {
                document.getElementById('diveSiteMap').innerHTML = `
                    <div class="alert alert-info mb-0">
                        <i class="fas fa-info-circle me-2"></i>No map coordinates available for this dive site.
                    </div>
                `;
            }
            
            // Initialize gallery if images are available
            if (site.images && site.images.length > 0) {
                initGallery(site.images);
            }
            
            // Initialize rating form
            initRatingForm(site.id);
        })
        .catch(error => {
            console.error('Error loading dive site details:', error);
            document.getElementById('loadingIndicator').style.display = 'none';
            document.getElementById('diveSiteDetailsContent').innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-exclamation-circle fa-3x mb-3 text-danger"></i>
                    <h3>Error Loading Dive Site</h3>
                    <p>${error.message}</p>
                    <button type="button" class="btn btn-primary mt-3" id="backToDiveSitesListBtn">
                        <i class="fas fa-arrow-left me-2"></i>Back to Dive Sites
                    </button>
                </div>
            `;
            
            document.getElementById('backToDiveSitesListBtn').addEventListener('click', function() {
                window.location.href = '/divesites';
            });
        });
}

/**
 * Initialize map for dive site detail page
 * @param {Object} site - Dive site data
 */
function initDetailMap(site) {
    // Create map
    const detailMap = L.map('diveSiteMap').setView([site.latitude, site.longitude], 12);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(detailMap);
    
    // Add marker
    L.marker([site.latitude, site.longitude])
        .addTo(detailMap)
        .bindPopup(`
            <strong>${site.name}</strong><br>
            ${site.location}${site.country ? ', ' + site.country : ''}<br>
            Depth: ${site.depth_max || 'N/A'}m
        `)
        .openPopup();
}

/**
 * Initialize gallery functionality
 * @param {Array} images - Array of image objects
 */
function initGallery(images) {
    currentGalleryIndex = 0;
    
    // Get elements
    const mainImage = document.getElementById('mainGalleryImage');
    const caption = document.getElementById('imageCaption');
    const prevBtn = document.getElementById('galleryPrevBtn');
    const nextBtn = document.getElementById('galleryNextBtn');
    const thumbnails = document.querySelectorAll('.dive-site-thumbnail');
    
    // Update gallery functions
    function updateGallery(index) {
        currentGalleryIndex = index;
        mainImage.src = images[index].image_url;
        caption.textContent = images[index].caption || '';
        
        // Update thumbnails
        thumbnails.forEach((thumb, i) => {
            if (i === index) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
    }
    
    // Previous button
    prevBtn.addEventListener('click', function() {
        const newIndex = (currentGalleryIndex - 1 + images.length) % images.length;
        updateGallery(newIndex);
    });
    
    // Next button
    nextBtn.addEventListener('click', function() {
        const newIndex = (currentGalleryIndex + 1) % images.length;
        updateGallery(newIndex);
    });
    
    // Thumbnail clicks
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            updateGallery(index);
        });
    });
    
    // Hide navigation if only one image
    if (images.length <= 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    }
}

/**
 * Initialize rating form functionality
 * @param {number} siteId - Dive site ID
 */
function initRatingForm(siteId) {
    // Get elements
    const addRatingBtn = document.getElementById('addRatingBtn');
    const ratingForm = document.getElementById('ratingForm');
    const cancelRatingBtn = document.getElementById('cancelRatingBtn');
    const submitRatingBtn = document.getElementById('submitRatingBtn');
    const ratingStars = document.querySelectorAll('#ratingStars i');
    const ratingValue = document.getElementById('ratingValue');
    let selectedRating = 0;
    
    // Add rating button
    addRatingBtn.addEventListener('click', function() {
        ratingForm.style.display = 'block';
        addRatingBtn.style.display = 'none';
    });
    
    // Cancel rating button
    cancelRatingBtn.addEventListener('click', function() {
        ratingForm.style.display = 'none';
        addRatingBtn.style.display = 'block';
        
        // Reset form
        document.getElementById('ratingComment').value = '';
        document.getElementById('ratingName').value = '';
        resetStars();
    });
    
    // Rating stars
    ratingStars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            selectedRating = rating;
            updateStars(rating);
            ratingValue.textContent = `${rating} / 5`;
        });
        
        star.addEventListener('mouseover', function() {
            const rating = parseInt(this.dataset.rating);
            updateStars(rating);
        });
        
        star.addEventListener('mouseout', function() {
            updateStars(selectedRating);
        });
    });
    
    // Update stars display
    function updateStars(rating) {
        ratingStars.forEach((star, index) => {
            if (index < rating) {
                star.className = 'fas fa-star';
            } else {
                star.className = 'far fa-star';
            }
        });
    }
    
    // Reset stars display
    function resetStars() {
        selectedRating = 0;
        updateStars(0);
        ratingValue.textContent = '0 / 5';
    }
    
    // Submit rating button
    submitRatingBtn.addEventListener('click', function() {
        if (selectedRating === 0) {
            alert('Please select a rating between 1 and 5 stars.');
            return;
        }
        
        const ratingData = {
            score: selectedRating,
            comment: document.getElementById('ratingComment').value.trim(),
            user_name: document.getElementById('ratingName').value.trim() || 'Anonymous'
        };
        
        // Send rating to server
        fetch(`/api/divesites/${siteId}/ratings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ratingData)
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to submit rating');
            return response.json();
        })
        .then(data => {
            // Hide form
            ratingForm.style.display = 'none';
            addRatingBtn.style.display = 'block';
            
            // Reset form
            document.getElementById('ratingComment').value = '';
            document.getElementById('ratingName').value = '';
            resetStars();
            
            // Show success message
            alert('Thank you for your rating!');
            
            // Reload page to display new rating
            window.location.reload();
        })
        .catch(error => {
            console.error('Error submitting rating:', error);
            alert('Failed to submit rating. Please try again.');
        });
    });
}

/**
 * Get difficulty badge HTML
 * @param {string} difficulty - Difficulty level
 * @returns {string} HTML for difficulty badge
 */
function getDifficultyBadge(difficulty) {
    let badgeClass = 'bg-info';
    if (difficulty === 'beginner') badgeClass = 'bg-success';
    if (difficulty === 'advanced') badgeClass = 'bg-warning';
    if (difficulty === 'expert') badgeClass = 'bg-danger';
    
    return `<span class="badge ${badgeClass}">${capitalizeFirstLetter(difficulty || 'intermediate')}</span>`;
}

/**
 * Get current strength badge HTML
 * @param {string} strength - Current strength
 * @returns {string} HTML for current strength badge
 */
function getCurrentStrengthBadge(strength) {
    let badgeClass = 'bg-info';
    if (strength === 'none') badgeClass = 'bg-secondary';
    if (strength === 'mild') badgeClass = 'bg-success';
    if (strength === 'strong') badgeClass = 'bg-warning';
    if (strength === 'extreme') badgeClass = 'bg-danger';
    
    return `<span class="badge ${badgeClass}">${capitalizeFirstLetter(strength || 'moderate')}</span>`;
}

/**
 * Capitalize first letter of a string
 * @param {string} string - Input string
 * @returns {string} String with first letter capitalized
 */
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}
