/**
 * World Dive Routes JavaScript
 * Handles interactive map, search functionality, and dive site data
 */

// World-famous dive sites data (29 comprehensive locations)
const worldDiveSites = [
    {
        id: 1,
        name: "Great Barrier Reef",
        country: "Australia",
        lat: -16.4,
        lng: 145.7,
        region: "pacific",
        difficulty: "beginner",
        type: "reef",
        description: "The world's largest coral reef system with incredible biodiversity.",
        depth: "5-40m",
        visibility: "15-30m",
        temperature: "22-28°C"
    },
    {
        id: 2,
        name: "Blue Hole",
        country: "Belize",
        lat: 17.3,
        lng: -87.5,
        region: "caribbean",
        difficulty: "advanced",
        type: "wall",
        description: "Famous circular sinkhole with crystal clear blue waters.",
        depth: "40-124m",
        visibility: "30-60m",
        temperature: "26-28°C"
    },
    {
        id: 3,
        name: "SS Thistlegorm",
        country: "Egypt",
        lat: 27.8,
        lng: 33.9,
        region: "red-sea",
        difficulty: "intermediate",
        type: "wreck",
        description: "WWII British merchant ship wreck with historical artifacts.",
        depth: "16-32m",
        visibility: "20-40m",
        temperature: "22-28°C"
    },
    {
        id: 4,
        name: "Maldives Atolls",
        country: "Maldives",
        lat: 3.2,
        lng: 73.2,
        region: "indian",
        difficulty: "beginner",
        type: "reef",
        description: "Pristine coral reefs with manta rays and whale sharks.",
        depth: "3-30m",
        visibility: "20-50m",
        temperature: "27-30°C"
    },
    {
        id: 5,
        name: "Cenote Dos Ojos",
        country: "Mexico",
        lat: 20.3,
        lng: -87.4,
        region: "caribbean",
        difficulty: "advanced",
        type: "cave",
        description: "Spectacular underwater cave system with crystal clear water.",
        depth: "1-10m",
        visibility: "100m+",
        temperature: "24-25°C"
    },
    {
        id: 6,
        name: "Poor Knights Islands",
        country: "New Zealand",
        lat: -35.5,
        lng: 174.7,
        region: "pacific",
        difficulty: "intermediate",
        type: "wall",
        description: "Subtropical marine reserve with unique underwater topography.",
        depth: "5-40m",
        visibility: "15-30m",
        temperature: "16-22°C"
    },
    {
        id: 7,
        name: "Sipadan Island",
        country: "Malaysia",
        lat: 4.1,
        lng: 118.6,
        region: "pacific",
        difficulty: "intermediate",
        type: "wall",
        description: "Pristine island diving with green and hawksbill turtles.",
        depth: "5-40m",
        visibility: "20-40m",
        temperature: "27-30°C"
    },
    {
        id: 8,
        name: "Crystal Bay",
        country: "Indonesia",
        lat: -8.7,
        lng: 115.4,
        region: "pacific",
        difficulty: "intermediate",
        type: "drift",
        description: "Famous for Mola Mola sightings and strong currents.",
        depth: "10-30m",
        visibility: "10-30m",
        temperature: "22-28°C"
    },
    {
        id: 9,
        name: "Richelieu Rock",
        country: "Thailand",
        lat: 9.6,
        lng: 98.2,
        region: "pacific",
        difficulty: "advanced",
        type: "drift",
        description: "Pinnacle dive site famous for whale shark encounters.",
        depth: "8-35m",
        visibility: "15-30m",
        temperature: "27-30°C"
    },
    {
        id: 10,
        name: "Palau Blue Corner",
        country: "Palau",
        lat: 7.3,
        lng: 134.5,
        region: "pacific",
        difficulty: "advanced",
        type: "drift",
        description: "World-renowned drift dive with massive schools of fish.",
        depth: "5-40m",
        visibility: "30-50m",
        temperature: "27-30°C"
    },
    {
        id: 11,
        name: "Gozo Azure Window",
        country: "Malta",
        lat: 36.1,
        lng: 14.2,
        region: "mediterranean",
        difficulty: "beginner",
        type: "reef",
        description: "Mediterranean diving with historical underwater sites.",
        depth: "5-40m",
        visibility: "20-40m",
        temperature: "15-26°C"
    },
    {
        id: 12,
        name: "Sardine Run",
        country: "South Africa",
        lat: -30.8,
        lng: 30.3,
        region: "indian",
        difficulty: "advanced",
        type: "drift",
        description: "Annual migration creating massive bait balls.",
        depth: "5-25m",
        visibility: "10-20m",
        temperature: "18-22°C"
    },
    {
        id: 13,
        name: "Cocos Island",
        country: "Costa Rica",
        lat: 5.5,
        lng: -87.1,
        region: "pacific",
        difficulty: "advanced",
        type: "wall",
        description: "Remote island famous for hammerhead shark encounters.",
        depth: "5-40m",
        visibility: "20-40m",
        temperature: "24-28°C"
    },
    {
        id: 14,
        name: "Galapagos Islands",
        country: "Ecuador",
        lat: -0.7,
        lng: -91.1,
        region: "pacific",
        difficulty: "advanced",
        type: "wall",
        description: "Unique marine life and endemic species.",
        depth: "5-40m",
        visibility: "15-25m",
        temperature: "18-26°C"
    },
    {
        id: 15,
        name: "Silfra Fissure",
        country: "Iceland",
        lat: 64.3,
        lng: -20.1,
        region: "atlantic",
        difficulty: "intermediate",
        type: "cave",
        description: "Diving between tectonic plates in crystal clear water.",
        depth: "7-18m",
        visibility: "100m+",
        temperature: "2-4°C"
    },
    {
        id: 16,
        name: "Komodo National Park",
        country: "Indonesia",
        lat: -8.6,
        lng: 119.9,
        region: "pacific",
        difficulty: "intermediate",
        type: "drift",
        description: "Strong currents and diverse marine life including manta rays.",
        depth: "5-40m",
        visibility: "15-30m",
        temperature: "25-29°C"
    },
    {
        id: 17,
        name: "Liberty Wreck",
        country: "Indonesia",
        lat: -8.3,
        lng: 115.6,
        region: "pacific",
        difficulty: "beginner",
        type: "wreck",
        description: "Accessible shore dive on a WWII cargo ship.",
        depth: "5-30m",
        visibility: "15-30m",
        temperature: "26-29°C"
    },
    {
        id: 18,
        name: "Rainbow Reef",
        country: "Fiji",
        lat: -16.8,
        lng: 179.9,
        region: "pacific",
        difficulty: "intermediate",
        type: "reef",
        description: "Vibrant soft corals and diverse marine life.",
        depth: "5-40m",
        visibility: "20-40m",
        temperature: "25-29°C"
    },
    {
        id: 19,
        name: "Blue Holes",
        country: "Bahamas",
        lat: 25.0,
        lng: -77.2,
        region: "atlantic",
        difficulty: "advanced",
        type: "cave",
        description: "Deep blue holes with unique cave systems.",
        depth: "10-60m",
        visibility: "30-50m",
        temperature: "24-28°C"
    },
    {
        id: 20,
        name: "Hin Daeng",
        country: "Thailand",
        lat: 7.0,
        lng: 99.1,
        region: "pacific",
        difficulty: "advanced",
        type: "wall",
        description: "Underwater pinnacle with manta ray cleaning stations.",
        depth: "8-40m",
        visibility: "15-30m",
        temperature: "27-30°C"
    },
    {
        id: 21,
        name: "Yongala Wreck",
        country: "Australia",
        lat: -19.3,
        lng: 147.6,
        region: "pacific",
        difficulty: "advanced",
        type: "wreck",
        description: "Historic passenger ship wreck with abundant marine life.",
        depth: "15-28m",
        visibility: "10-25m",
        temperature: "22-28°C"
    },
    {
        id: 22,
        name: "Coral Triangle",
        country: "Philippines",
        lat: 9.8,
        lng: 124.1,
        region: "pacific",
        difficulty: "intermediate",
        type: "reef",
        description: "Center of marine biodiversity with pristine reefs.",
        depth: "3-40m",
        visibility: "15-30m",
        temperature: "26-30°C"
    },
    {
        id: 23,
        name: "Devil's Den",
        country: "USA",
        lat: 29.5,
        lng: -82.6,
        region: "atlantic",
        difficulty: "beginner",
        type: "cave",
        description: "Underground spring with prehistoric cave formations.",
        depth: "6-16m",
        visibility: "50m+",
        temperature: "22°C"
    },
    {
        id: 24,
        name: "Protea Banks",
        country: "South Africa",
        lat: -30.9,
        lng: 30.5,
        region: "indian",
        difficulty: "advanced",
        type: "wall",
        description: "Deep offshore reefs with big pelagic species.",
        depth: "20-40m",
        visibility: "15-30m",
        temperature: "18-24°C"
    },
    {
        id: 25,
        name: "Cathedral",
        country: "Russia",
        lat: 61.7,
        lng: 34.3,
        region: "atlantic",
        difficulty: "technical",
        type: "cave",
        description: "Deep freshwater cave diving with challenging conditions.",
        depth: "20-80m",
        visibility: "10-30m",
        temperature: "4-8°C"
    },
    {
        id: 26,
        name: "Brother Islands",
        country: "Egypt",
        lat: 26.3,
        lng: 35.7,
        region: "red-sea",
        difficulty: "advanced",
        type: "wall",
        description: "Remote islands with pristine walls and sharks.",
        depth: "5-40m",
        visibility: "30-50m",
        temperature: "22-28°C"
    },
    {
        id: 27,
        name: "Andaman Sea",
        country: "Myanmar",
        lat: 12.5,
        lng: 98.0,
        region: "pacific",
        difficulty: "intermediate",
        type: "reef",
        description: "Untouched reefs with excellent macro photography.",
        depth: "5-40m",
        visibility: "20-30m",
        temperature: "27-30°C"
    },
    {
        id: 28,
        name: "Socorro Island",
        country: "Mexico",
        lat: 18.8,
        lng: -110.9,
        region: "pacific",
        difficulty: "advanced",
        type: "wall",
        description: "Giant manta rays and unique marine encounters.",
        depth: "5-40m",
        visibility: "20-40m",
        temperature: "22-26°C"
    },
    {
        id: 29,
        name: "Fernando de Noronha",
        country: "Brazil",
        lat: -3.8,
        lng: -32.4,
        region: "atlantic",
        difficulty: "intermediate",
        type: "reef",
        description: "Volcanic island with dolphins and pristine reefs.",
        depth: "5-40m",
        visibility: "30-50m",
        temperature: "26-28°C"
    }
];

let map;
let markersLayer;
let filteredSites = [...worldDiveSites];

// Initialize the dive routes functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    populateListView();
    console.log('World Dive Routes initialized with', worldDiveSites.length, 'dive sites');
});

/**
 * Initialize the Leaflet map with markers
 */
function initializeMap() {
    // Initialize map
    map = L.map('worldMap').setView([20, 0], 2);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Initialize marker cluster group
    markersLayer = L.markerClusterGroup();
    
    // Add markers for all dive sites
    updateMapMarkers();
    
    console.log('Map initialized with', filteredSites.length, 'markers');
}

/**
 * Update map markers based on filtered sites
 */
function updateMapMarkers() {
    // Clear existing markers
    markersLayer.clearLayers();
    
    // Add markers for filtered sites
    filteredSites.forEach(site => {
        const marker = L.marker([site.lat, site.lng]);
        
        // Create popup content
        const popupContent = `
            <div class="dive-site-popup">
                <h6><strong>${site.name}</strong></h6>
                <p><i class="fas fa-map-marker-alt me-1"></i>${site.country}</p>
                <p><i class="fas fa-water me-1"></i>Type: ${capitalizeFirst(site.type)}</p>
                <p><i class="fas fa-chart-bar me-1"></i>Difficulty: ${capitalizeFirst(site.difficulty)}</p>
                <p><i class="fas fa-thermometer-half me-1"></i>Temp: ${site.temperature}</p>
                <p><i class="fas fa-eye me-1"></i>Visibility: ${site.visibility}</p>
                <p><i class="fas fa-ruler-vertical me-1"></i>Depth: ${site.depth}</p>
                <p class="small">${site.description}</p>
                <button class="btn btn-primary btn-sm" onclick="planDiveForSite('${site.name}', '${site.depth}')">
                    <i class="fas fa-calculator me-1"></i>Plan Dive
                </button>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        markersLayer.addLayer(marker);
    });
    
    // Add marker cluster to map
    map.addLayer(markersLayer);
}

/**
 * Filter dive sites based on user selections and search
 */
function filterDiveSites() {
    const regionFilter = document.getElementById('regionFilter').value.toLowerCase();
    const difficultyFilter = document.getElementById('difficultyFilter').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value.toLowerCase();
    const searchInput = document.getElementById('searchInput').value.toLowerCase().trim();
    
    console.log('Filtering with:', { regionFilter, difficultyFilter, typeFilter, searchInput });
    
    // Filter the dive sites
    filteredSites = worldDiveSites.filter(site => {
        const matchesRegion = !regionFilter || site.region === regionFilter;
        const matchesDifficulty = !difficultyFilter || site.difficulty === difficultyFilter;
        const matchesType = !typeFilter || site.type === typeFilter;
        const matchesSearch = !searchInput || 
            site.name.toLowerCase().includes(searchInput) ||
            site.country.toLowerCase().includes(searchInput) ||
            site.description.toLowerCase().includes(searchInput);
        
        return matchesRegion && matchesDifficulty && matchesType && matchesSearch;
    });
    
    console.log('Filtered to', filteredSites.length, 'sites');
    
    // Update display
    if (document.getElementById('mapViewContainer').style.display !== 'none') {
        updateMapMarkers();
    } else {
        populateListView();
    }
    
    // Show no results message if needed
    if (filteredSites.length === 0) {
        showNoResultsMessage();
    }
}

/**
 * Show no results message
 */
function showNoResultsMessage() {
    const message = `
        <div class="text-center py-5">
            <i class="fas fa-search fa-3x text-muted mb-3"></i>
            <h5>No dive sites found</h5>
            <p class="text-muted">Try adjusting your search criteria or filters.</p>
            <button class="btn btn-primary" onclick="clearFilters()">Clear All Filters</button>
        </div>
    `;
    
    if (document.getElementById('mapViewContainer').style.display !== 'none') {
        // For map view, show overlay
        const mapContainer = document.getElementById('worldMap');
        const overlay = document.createElement('div');
        overlay.id = 'noResultsOverlay';
        overlay.className = 'position-absolute w-100 h-100 bg-white d-flex align-items-center justify-content-center';
        overlay.style.zIndex = '1000';
        overlay.innerHTML = message;
        mapContainer.appendChild(overlay);
    } else {
        // For list view, replace content
        document.getElementById('diveSitesList').innerHTML = message;
    }
}

/**
 * Clear all filters
 */
function clearFilters() {
    document.getElementById('regionFilter').value = '';
    document.getElementById('difficultyFilter').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('searchInput').value = '';
    
    // Remove no results overlay if it exists
    const overlay = document.getElementById('noResultsOverlay');
    if (overlay) overlay.remove();
    
    filterDiveSites();
}

/**
 * Populate list view with dive sites
 */
function populateListView() {
    const listContainer = document.getElementById('diveSitesList');
    
    if (filteredSites.length === 0) {
        showNoResultsMessage();
        return;
    }
    
    let html = '';
    filteredSites.forEach(site => {
        html += `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <h5 class="card-title">${site.name}</h5>
                            <p class="card-text">${site.description}</p>
                            <div class="row">
                                <div class="col-sm-6">
                                    <small class="text-muted">
                                        <i class="fas fa-map-marker-alt me-1"></i>${site.country}<br>
                                        <i class="fas fa-water me-1"></i>Type: ${capitalizeFirst(site.type)}<br>
                                        <i class="fas fa-chart-bar me-1"></i>Difficulty: ${capitalizeFirst(site.difficulty)}
                                    </small>
                                </div>
                                <div class="col-sm-6">
                                    <small class="text-muted">
                                        <i class="fas fa-thermometer-half me-1"></i>Temp: ${site.temperature}<br>
                                        <i class="fas fa-eye me-1"></i>Visibility: ${site.visibility}<br>
                                        <i class="fas fa-ruler-vertical me-1"></i>Depth: ${site.depth}
                                    </small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4 d-flex align-items-center justify-content-end">
                            <div>
                                <button class="btn btn-primary btn-sm mb-2 w-100" onclick="planDiveForSite('${site.name}', '${site.depth}')">
                                    <i class="fas fa-calculator me-1"></i>Plan Dive
                                </button>
                                <button class="btn btn-outline-secondary btn-sm w-100" onclick="showOnMap(${site.lat}, ${site.lng})">
                                    <i class="fas fa-map me-1"></i>Show on Map
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    listContainer.innerHTML = html;
}

/**
 * Toggle between list and map view
 */
function toggleView(view) {
    const listView = document.getElementById('listViewContainer');
    const mapView = document.getElementById('mapViewContainer');
    const listBtn = document.getElementById('listViewBtn');
    const mapBtn = document.getElementById('mapViewBtn');
    
    if (view === 'list') {
        listView.style.display = 'block';
        mapView.style.display = 'none';
        listBtn.classList.add('active');
        mapBtn.classList.remove('active');
        populateListView();
    } else {
        listView.style.display = 'none';
        mapView.style.display = 'block';
        listBtn.classList.remove('active');
        mapBtn.classList.add('active');
        // Refresh map after making it visible
        setTimeout(() => {
            if (map) {
                map.invalidateSize();
                updateMapMarkers();
            }
        }, 100);
    }
}

/**
 * Show specific location on map
 */
function showOnMap(lat, lng) {
    toggleView('map');
    setTimeout(() => {
        if (map) {
            map.setView([lat, lng], 8);
        }
    }, 200);
}

/**
 * Plan dive for specific site
 */
function planDiveForSite(siteName, depthRange) {
    // Extract approximate depth from range
    const depth = depthRange.split('-')[1]?.replace('m', '') || depthRange.replace('m', '');
    const numericDepth = parseInt(depth) || 18;
    
    // Store site info and redirect to dive planner
    localStorage.setItem('plannerSiteName', siteName);
    localStorage.setItem('plannerDepth', numericDepth);
    
    // Navigate to dive planner
    window.location.href = '/';
    
    // Set values after navigation (will be handled by main.js)
    setTimeout(() => {
        const locationInput = document.getElementById('diveLocation');
        const depthInput = document.getElementById('diveDepth');
        
        if (locationInput) locationInput.value = siteName;
        if (depthInput) depthInput.value = numericDepth;
    }, 500);
}

/**
 * Utility function to capitalize first letter
 */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Export for global use
window.filterDiveSites = filterDiveSites;
window.toggleView = toggleView;
window.showOnMap = showOnMap;
window.planDiveForSite = planDiveForSite;
window.clearFilters = clearFilters;