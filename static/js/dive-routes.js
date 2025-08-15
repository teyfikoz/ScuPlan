/**
 * Enhanced World Dive Routes JavaScript
 * Comprehensive dive sites including Mediterranean, Turkish, and European locations
 */

// Enhanced dive sites data with comprehensive Mediterranean and European locations
const worldDiveSites = [
    // TURKEY - Aegean and Mediterranean
    {
        id: 1,
        name: "Bodrum Peninsula",
        country: "Turkey",
        lat: 37.0379,
        lng: 27.4241,
        region: "mediterranean",
        difficulty: "beginner",
        type: "reef",
        description: "Beautiful Aegean diving with ancient amphoras and diverse marine life.",
        depth: "5-40m",
        visibility: "15-25m",
        temperature: "16-26°C"
    },
    {
        id: 2,
        name: "Kas Diving Sites",
        country: "Turkey",
        lat: 36.2067,
        lng: 29.6403,
        region: "mediterranean",
        difficulty: "intermediate",
        type: "wall",
        description: "Stunning Mediterranean wall diving with groupers and sea turtles.",
        depth: "10-60m",
        visibility: "25-40m",
        temperature: "18-28°C"
    },
    {
        id: 3,
        name: "Antalya Underwater Museum",
        country: "Turkey", 
        lat: 36.8969,
        lng: 30.7133,
        region: "mediterranean",
        difficulty: "beginner",
        type: "wreck",
        description: "Artificial reef project with sunken aircraft and sculptures.",
        depth: "15-25m",
        visibility: "20-30m",
        temperature: "18-26°C"
    },
    {
        id: 4,
        name: "Gallipoli Peninsula",
        country: "Turkey",
        lat: 40.1553,
        lng: 26.6681,
        region: "mediterranean",
        difficulty: "advanced",
        type: "wreck",
        description: "Historic WWI wrecks with significant historical importance.",
        depth: "20-45m",
        visibility: "10-20m",
        temperature: "14-24°C"
    },
    
    // GREECE - Aegean and Ionian
    {
        id: 5,
        name: "Santorini Volcanic Reefs",
        country: "Greece",
        lat: 36.3932,
        lng: 25.4615,
        region: "mediterranean",
        difficulty: "intermediate",
        type: "wall",
        description: "Unique volcanic underwater landscape with dramatic drop-offs.",
        depth: "5-50m",
        visibility: "20-40m",
        temperature: "16-26°C"
    },
    {
        id: 6,
        name: "Zakynthos Marine Park",
        country: "Greece",
        lat: 37.7833,
        lng: 20.7333,
        region: "mediterranean",
        difficulty: "beginner",
        type: "reef",
        description: "Protected marine park home to loggerhead sea turtles.",
        depth: "5-30m",
        visibility: "15-30m",
        temperature: "18-26°C"
    },
    {
        id: 7,
        name: "Crete South Coast",
        country: "Greece",
        lat: 35.2401,
        lng: 24.8093,
        region: "mediterranean",
        difficulty: "intermediate",
        type: "cave",
        description: "Underwater caves and caverns in crystal clear waters.",
        depth: "5-40m",
        visibility: "25-45m",
        temperature: "18-26°C"
    },
    {
        id: 8,
        name: "Rhodes Diving Sites",
        country: "Greece",
        lat: 36.4341,
        lng: 28.2176,
        region: "mediterranean",
        difficulty: "beginner",
        type: "reef",
        description: "Ancient ruins underwater with rich marine biodiversity.",
        depth: "8-35m",
        visibility: "20-35m",
        temperature: "17-27°C"
    },

    // ITALY - Mediterranean
    {
        id: 9,
        name: "Ustica Island Marine Reserve",
        country: "Italy",
        lat: 38.7091,
        lng: 13.1774,
        region: "mediterranean",
        difficulty: "intermediate",
        type: "wall",
        description: "Volcanic island with spectacular wall diving and groupers.",
        depth: "10-60m",
        visibility: "25-50m",
        temperature: "16-26°C"
    },
    {
        id: 10,
        name: "Capri Blue Grotto Area",
        country: "Italy",
        lat: 40.5581,
        lng: 14.2043,
        region: "mediterranean",
        difficulty: "advanced",
        type: "cave",
        description: "Famous blue grotto and surrounding underwater caves.",
        depth: "5-45m",
        visibility: "20-40m",
        temperature: "16-25°C"
    },
    {
        id: 11,
        name: "Elba Island Wrecks",
        country: "Italy",
        lat: 42.7667,
        lng: 10.1667,
        region: "mediterranean",
        difficulty: "advanced",
        type: "wreck",
        description: "Multiple WWII wrecks including the Elviscot cargo ship.",
        depth: "25-60m",
        visibility: "15-30m",
        temperature: "14-24°C"
    },
    {
        id: 12,
        name: "Cinque Terre Marine Area",
        country: "Italy",
        lat: 44.1271,
        lng: 9.7237,
        region: "mediterranean",
        difficulty: "beginner",
        type: "reef",
        description: "Protected marine area with rich Mediterranean marine life.",
        depth: "5-40m",
        visibility: "15-25m",
        temperature: "14-24°C"
    },

    // SPAIN - Mediterranean and Atlantic
    {
        id: 13,
        name: "Costa Brava Marine Reserve",
        country: "Spain",
        lat: 42.1192,
        lng: 3.1755,
        region: "mediterranean",
        difficulty: "intermediate",
        type: "reef",
        description: "Rocky reefs with red coral and diverse Mediterranean species.",
        depth: "10-50m",
        visibility: "15-30m",
        temperature: "14-26°C"
    },
    {
        id: 14,
        name: "Ibiza Posidonia Meadows",
        country: "Spain",
        lat: 38.9067,
        lng: 1.4206,
        region: "mediterranean",
        difficulty: "beginner",
        type: "reef",
        description: "UNESCO World Heritage seagrass meadows with rich marine life.",
        depth: "5-35m",
        visibility: "20-40m",
        temperature: "16-26°C"
    },
    {
        id: 15,
        name: "Mallorca Cathedral Cave",
        country: "Spain",
        lat: 39.5696,
        lng: 2.6502,
        region: "mediterranean",
        difficulty: "advanced",
        type: "cave",
        description: "Spectacular underwater cathedral with stalactites and air pockets.",
        depth: "15-45m",
        visibility: "30-50m",
        temperature: "16-25°C"
    },

    // CROATIA - Adriatic Sea
    {
        id: 16,
        name: "Kornati Islands",
        country: "Croatia",
        lat: 43.8333,
        lng: 15.3167,
        region: "mediterranean",
        difficulty: "intermediate",
        type: "wall",
        description: "89 pristine islands with dramatic underwater walls and passages.",
        depth: "5-60m",
        visibility: "20-50m",
        temperature: "14-26°C"
    },
    {
        id: 17,
        name: "Vis Island Blue Cave",
        country: "Croatia",
        lat: 43.0333,
        lng: 16.0833,
        region: "mediterranean",
        difficulty: "intermediate",
        type: "cave",
        description: "Famous blue cave diving with incredible light effects.",
        depth: "5-25m",
        visibility: "30-50m",
        temperature: "16-26°C"
    },
    {
        id: 18,
        name: "Pula Wreck Alley",
        country: "Croatia",
        lat: 44.8667,
        lng: 13.8500,
        region: "mediterranean",
        difficulty: "advanced",
        type: "wreck",
        description: "Multiple Austrian-Hungarian Navy wrecks from WWI.",
        depth: "20-65m",
        visibility: "15-35m",
        temperature: "12-24°C"
    },

    // CYPRUS - Eastern Mediterranean
    {
        id: 19,
        name: "Zenobia Wreck",
        country: "Cyprus",
        lat: 34.9167,
        lng: 33.6500,
        region: "mediterranean",
        difficulty: "intermediate",
        type: "wreck",
        description: "One of the world's top 10 wreck dives, Swedish ferry.",
        depth: "16-42m",
        visibility: "20-40m",
        temperature: "18-27°C"
    },
    {
        id: 20,
        name: "Cape Greco",
        country: "Cyprus",
        lat: 34.9583,
        lng: 34.0833,
        region: "mediterranean",
        difficulty: "beginner",
        type: "reef",
        description: "Beautiful sea caves and underwater arches with clear waters.",
        depth: "5-30m",
        visibility: "25-45m",
        temperature: "18-27°C"
    },

    // MALTA - Central Mediterranean
    {
        id: 21,
        name: "Blue Hole Gozo",
        country: "Malta",
        lat: 36.0667,
        lng: 14.2000,
        region: "mediterranean",
        difficulty: "intermediate",
        type: "wall",
        description: "Famous natural rock formation leading to open sea.",
        depth: "6-60m",
        visibility: "30-50m",
        temperature: "16-26°C"
    },
    {
        id: 22,
        name: "Um El Faroud Wreck",
        country: "Malta",
        lat: 35.8167,
        lng: 14.4500,
        region: "mediterranean",
        difficulty: "advanced",
        type: "wreck",
        description: "110m tanker wreck, one of Malta's premier dive sites.",
        depth: "18-36m",
        visibility: "20-40m",
        temperature: "16-26°C"
    },

    // EGYPT - Red Sea (already popular)
    {
        id: 23,
        name: "SS Thistlegorm",
        country: "Egypt",
        lat: 27.8094,
        lng: 33.9242,
        region: "red-sea",
        difficulty: "intermediate",
        type: "wreck",
        description: "WWII British merchant ship wreck with historical artifacts.",
        depth: "16-32m",
        visibility: "20-40m",
        temperature: "22-28°C"
    },
    {
        id: 24,
        name: "Ras Mohammed",
        country: "Egypt",
        lat: 27.7333,
        lng: 34.2667,
        region: "red-sea",
        difficulty: "intermediate",
        type: "reef",
        description: "Pristine coral reefs at the southern tip of Sinai Peninsula.",
        depth: "5-50m",
        visibility: "20-50m",
        temperature: "22-28°C"
    },

    // FRANCE - Mediterranean
    {
        id: 25,
        name: "Port-Cros Marine Park",
        country: "France",
        lat: 43.0167,
        lng: 6.4000,
        region: "mediterranean",
        difficulty: "beginner",
        type: "reef",
        description: "Protected marine park with Posidonia meadows and groupers.",
        depth: "5-40m",
        visibility: "15-30m",
        temperature: "14-25°C"
    },
    {
        id: 26,
        name: "Corsica Scandola Reserve",
        country: "France",
        lat: 42.3667,
        lng: 8.5500,
        region: "mediterranean",
        difficulty: "intermediate",
        type: "wall",
        description: "UNESCO World Heritage volcanic landscape underwater.",
        depth: "10-50m",
        visibility: "20-40m",
        temperature: "14-26°C"
    },

    // FAMOUS INTERNATIONAL SITES
    {
        id: 27,
        name: "Great Barrier Reef",
        country: "Australia",
        lat: -16.4,
        lng: 145.7,
        region: "pacific",
        difficulty: "beginner",
        type: "reef",
        description: "World's largest coral reef system with incredible biodiversity.",
        depth: "5-40m",
        visibility: "15-30m",
        temperature: "22-28°C"
    },
    {
        id: 28,
        name: "Blue Hole",
        country: "Belize",
        lat: 17.3159,
        lng: -87.5348,
        region: "caribbean",
        difficulty: "advanced",
        type: "wall",
        description: "Famous circular sinkhole with crystal clear blue waters.",
        depth: "40-124m",
        visibility: "30-60m",
        temperature: "26-28°C"
    },
    {
        id: 29,
        name: "Maldives Atolls",
        country: "Maldives",
        lat: 3.2028,
        lng: 73.2207,
        region: "indian",
        difficulty: "beginner",
        type: "reef",
        description: "Pristine coral reefs with manta rays and whale sharks.",
        depth: "3-30m",
        visibility: "20-50m",
        temperature: "27-30°C"
    },
    {
        id: 30,
        name: "Cenote Dos Ojos",
        country: "Mexico",
        lat: 20.3281,
        lng: -87.4169,
        region: "caribbean",
        difficulty: "advanced",
        type: "cave",
        description: "Spectacular underwater cave system with crystal clear water.",
        depth: "1-10m",
        visibility: "100m+",
        temperature: "24-25°C"
    }
];

// Global variables
let worldMap;
let markersGroup;
let currentView = 'map';
let filteredSites = [...worldDiveSites];

/**
 * Initialize the dive routes page
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    initializeListView();
    setupEventListeners();
    filterDiveSites(); // Initial load
});

/**
 * Setup event listeners for filters and search
 */
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterDiveSites);
    }
    
    const filters = ['regionFilter', 'difficultyFilter', 'typeFilter'];
    filters.forEach(filterId => {
        const element = document.getElementById(filterId);
        if (element) {
            element.addEventListener('change', filterDiveSites);
        }
    });
}

/**
 * Initialize Leaflet map
 */
function initializeMap() {
    if (typeof L === 'undefined') {
        console.error('Leaflet not loaded');
        return;
    }

    // Initialize map centered on Mediterranean
    worldMap = L.map('worldMap').setView([40.0, 20.0], 4);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(worldMap);

    // Initialize marker cluster group
    markersGroup = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50
    });

    worldMap.addLayer(markersGroup);
}

/**
 * Toggle between map and list view
 */
function toggleView(view) {
    const mapContainer = document.getElementById('mapViewContainer');
    const listContainer = document.getElementById('listViewContainer');
    const mapBtn = document.getElementById('mapViewBtn');
    const listBtn = document.getElementById('listViewBtn');

    if (view === 'map') {
        mapContainer.style.display = 'block';
        listContainer.style.display = 'none';
        mapBtn.classList.add('active');
        listBtn.classList.remove('active');
        
        // Refresh map if needed
        setTimeout(() => {
            if (worldMap) {
                worldMap.invalidateSize();
            }
        }, 100);
    } else {
        mapContainer.style.display = 'none';
        listContainer.style.display = 'block';
        listBtn.classList.add('active');
        mapBtn.classList.remove('active');
    }
    
    currentView = view;
}

/**
 * Filter dive sites based on search and filters
 */
function filterDiveSites() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const regionFilter = document.getElementById('regionFilter').value;
    const difficultyFilter = document.getElementById('difficultyFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;

    // Filter sites
    filteredSites = worldDiveSites.filter(site => {
        const matchesSearch = !searchTerm || 
            site.name.toLowerCase().includes(searchTerm) ||
            site.country.toLowerCase().includes(searchTerm) ||
            site.description.toLowerCase().includes(searchTerm);
        
        const matchesRegion = !regionFilter || site.region === regionFilter;
        const matchesDifficulty = !difficultyFilter || site.difficulty === difficultyFilter;
        const matchesType = !typeFilter || site.type === typeFilter;

        return matchesSearch && matchesRegion && matchesDifficulty && matchesType;
    });

    // Update displays
    updateMapMarkers();
    updateListView();
    
    // Show no results message if needed
    showNoResultsMessage();
}

/**
 * Update map markers based on filtered sites
 */
function updateMapMarkers() {
    if (!markersGroup || !worldMap) return;

    // Clear existing markers
    markersGroup.clearLayers();

    // Add markers for filtered sites
    filteredSites.forEach(site => {
        const marker = L.marker([site.lat, site.lng]);
        
        const popupContent = `
            <div class="dive-site-popup">
                <h6 class="fw-bold">${site.name}</h6>
                <p class="text-muted mb-2">${site.country}</p>
                <div class="mb-2">
                    <small><strong>Type:</strong> ${site.type.charAt(0).toUpperCase() + site.type.slice(1)}</small><br>
                    <small><strong>Difficulty:</strong> ${site.difficulty.charAt(0).toUpperCase() + site.difficulty.slice(1)}</small><br>
                    <small><strong>Depth:</strong> ${site.depth}</small><br>
                    <small><strong>Visibility:</strong> ${site.visibility}</small><br>
                    <small><strong>Temperature:</strong> ${site.temperature}</small>
                </div>
                <p class="small">${site.description}</p>
                <button class="btn btn-sm btn-primary mt-2" onclick="planDiveForSite('${site.name}', '${site.depth.split('-')[1] || '30'}')">
                    <i class="fas fa-calculator me-1"></i> Plan Dive
                </button>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        markersGroup.addLayer(marker);
    });
}

/**
 * Update list view with filtered sites
 */
function updateListView() {
    const container = document.getElementById('diveSitesList');
    if (!container) return;

    if (filteredSites.length === 0) {
        container.innerHTML = '';
        return;
    }

    const listHTML = filteredSites.map(site => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <h5 class="card-title">${site.name}</h5>
                        <p class="card-text text-muted">${site.country}</p>
                        <p class="card-text">${site.description}</p>
                        <div class="row">
                            <div class="col-md-6">
                                <small><strong>Depth:</strong> ${site.depth}</small><br>
                                <small><strong>Visibility:</strong> ${site.visibility}</small>
                            </div>
                            <div class="col-md-6">
                                <small><strong>Temperature:</strong> ${site.temperature}</small><br>
                                <small><strong>Type:</strong> ${site.type.charAt(0).toUpperCase() + site.type.slice(1)}</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 text-end">
                        <span class="badge bg-${getDifficultyColor(site.difficulty)} mb-2">${site.difficulty.charAt(0).toUpperCase() + site.difficulty.slice(1)}</span><br>
                        <button class="btn btn-primary btn-sm" onclick="planDiveForSite('${site.name}', '${site.depth.split('-')[1] || '30'}')">
                            <i class="fas fa-calculator me-1"></i> Plan Dive
                        </button>
                        <button class="btn btn-outline-secondary btn-sm mt-1" onclick="showOnMap(${site.lat}, ${site.lng})">
                            <i class="fas fa-map-marker-alt me-1"></i> Show on Map
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = listHTML;
}

/**
 * Initialize list view
 */
function initializeListView() {
    updateListView();
}

/**
 * Show no results message
 */
function showNoResultsMessage() {
    const mapContainer = document.getElementById('worldMap');
    const listContainer = document.getElementById('diveSitesList');
    
    if (filteredSites.length === 0) {
        // Show no results in map view
        if (currentView === 'map' && mapContainer) {
            const noResultsDiv = document.getElementById('mapNoResults');
            if (!noResultsDiv) {
                const noResults = document.createElement('div');
                noResults.id = 'mapNoResults';
                noResults.className = 'text-center p-4';
                noResults.innerHTML = `
                    <div class="py-5">
                        <i class="fas fa-search fa-3x text-muted mb-3"></i>
                        <h5>No dive sites found</h5>
                        <p class="text-muted">Try adjusting your search criteria or filters.</p>
                        <button class="btn btn-outline-primary" onclick="clearAllFilters()">Clear All Filters</button>
                    </div>
                `;
                mapContainer.parentNode.appendChild(noResults);
            } else {
                noResultsDiv.style.display = 'block';
            }
        }
        
        // Show no results in list view
        if (currentView === 'list' && listContainer) {
            listContainer.innerHTML = `
                <div class="text-center p-4">
                    <div class="py-5">
                        <i class="fas fa-search fa-3x text-muted mb-3"></i>
                        <h5>No dive sites found</h5>
                        <p class="text-muted">Try adjusting your search criteria or filters.</p>
                        <button class="btn btn-outline-primary" onclick="clearAllFilters()">Clear All Filters</button>
                    </div>
                </div>
            `;
        }
    } else {
        // Hide no results message
        const noResultsDiv = document.getElementById('mapNoResults');
        if (noResultsDiv) {
            noResultsDiv.style.display = 'none';
        }
    }
}

/**
 * Clear all filters and search
 */
function clearAllFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('regionFilter').value = '';
    document.getElementById('difficultyFilter').value = '';
    document.getElementById('typeFilter').value = '';
    filterDiveSites();
}

/**
 * Get difficulty badge color
 */
function getDifficultyColor(difficulty) {
    switch(difficulty) {
        case 'beginner': return 'success';
        case 'intermediate': return 'warning';
        case 'advanced': return 'danger';
        case 'technical': return 'dark';
        default: return 'secondary';
    }
}

/**
 * Plan dive for selected site
 */
function planDiveForSite(siteName, maxDepth) {
    const depth = parseInt(maxDepth.replace('m', '')) || 30;
    const url = `/?site=${encodeURIComponent(siteName)}&depth=${depth}`;
    window.open(url, '_blank');
}

/**
 * Show site on map
 */
function showOnMap(lat, lng) {
    toggleView('map');
    setTimeout(() => {
        if (worldMap) {
            worldMap.setView([lat, lng], 10);
        }
    }, 100);
}