/**
 * ScuPlan - Augmented Reality Dive Site Preview Module
 * Provides basic AR functionality for dive site visualization
 */

/**
 * Initialize the AR module
 */
function initARModule() {
    // Add event listener for AR preview buttons
    document.addEventListener('click', function(e) {
        if (e.target.matches('.ar-preview-btn, .ar-preview-btn *')) {
            e.preventDefault();
            
            // Get dive site ID from button data attribute
            const siteId = e.target.closest('.ar-preview-btn').getAttribute('data-site-id');
            
            if (siteId) {
                showARPreview(e);
            }
        }
    });
    
    // Create AR modal if it doesn't exist
    createARModal();
    
    console.log('AR Preview module initialized');
}

/**
 * Show AR preview modal
 * @param {Event} event - The click event
 */
function showARPreview(event) {
    // Get the button that was clicked
    const button = event.target.closest('.ar-preview-btn');
    
    // Get dive site ID
    const siteId = button.getAttribute('data-site-id');
    
    // Show the modal
    const arModal = new bootstrap.Modal(document.getElementById('arPreviewModal'));
    arModal.show();
    
    // Load dive site data
    loadDiveSiteARData(siteId);
}

/**
 * Create the AR preview modal
 */
function createARModal() {
    // Check if the modal already exists
    if (!document.getElementById('arPreviewModal')) {
        // Create the modal HTML
        const modalHTML = `
            <div class="modal fade" id="arPreviewModal" tabindex="-1" aria-labelledby="arPreviewModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="arPreviewModalLabel">Dive Site AR Preview</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="ar-preview-container">
                                <div class="ar-status-message text-center mb-3" id="arStatusMessage">
                                    Loading AR preview...
                                </div>
                                
                                <div class="ar-permission-request d-none" id="arPermissionRequest">
                                    <p class="text-center">ScuPlan needs permission to access your camera and device orientation for AR view.</p>
                                    <div class="d-flex justify-content-center">
                                        <button id="arPermissionBtn" class="btn btn-primary">
                                            <i class="fas fa-camera me-1"></i> Allow Camera Access
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="ar-fallback-message d-none" id="arFallbackMessage">
                                    <p class="text-center">Your browser doesn't support AR features. Showing simulated preview instead.</p>
                                </div>
                                
                                <div class="ar-preview-content" id="arPreviewContent">
                                    <canvas id="arCanvas" width="640" height="480" class="w-100 rounded"></canvas>
                                </div>
                                
                                <div class="ar-site-details mt-3" id="arSiteDetails">
                                    <!-- Site details will be populated here -->
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add the modal to the body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstElementChild);
        
        // Add event listener for permission button
        document.getElementById('arPermissionBtn').addEventListener('click', function() {
            startARExperience();
        });
    }
}

/**
 * Load dive site data for AR preview
 * @param {string} siteId - The dive site ID
 */
function loadDiveSiteARData(siteId) {
    // In a real app, this would fetch data from an API
    // For now, we'll simulate with sample data
    
    // Show loading message
    document.getElementById('arStatusMessage').textContent = 'Loading dive site data...';
    document.getElementById('arStatusMessage').classList.remove('d-none');
    
    // Sample dive sites (in a real app, these would come from a database)
    const sampleSites = {
        'site1': {
            name: 'Blue Hole',
            depth: 40,
            difficulty: 'Advanced',
            features: ['Vertical wall', 'Cave system', 'Abundant marine life'],
            color: '#0077be',
            layout: 'circular',
            orientation: 180 // degrees
        },
        'site2': {
            name: 'Coral Garden',
            depth: 18,
            difficulty: 'Beginner',
            features: ['Vibrant coral reef', 'Gentle current', 'Tropical fish'],
            color: '#ff7f50',
            layout: 'linear',
            orientation: 90
        },
        'site3': {
            name: 'Wreck Dive',
            depth: 30,
            difficulty: 'Intermediate',
            features: ['Shipwreck', 'Artificial reef', 'Historical site'],
            color: '#8b4513',
            layout: 'complex',
            orientation: 45
        }
    };
    
    // Simulate API delay
    setTimeout(() => {
        // Check if site exists
        if (sampleSites[siteId]) {
            const siteData = sampleSites[siteId];
            
            // Update site details
            const detailsContainer = document.getElementById('arSiteDetails');
            detailsContainer.innerHTML = `
                <h4>${siteData.name}</h4>
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Max Depth:</strong> ${siteData.depth}m</p>
                        <p><strong>Difficulty:</strong> ${siteData.difficulty}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Features:</strong></p>
                        <ul>
                            ${siteData.features.map(f => `<li>${f}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
            
            // Check if device supports AR
            if ('DeviceOrientationEvent' in window && 'mediaDevices' in navigator) {
                // Show permission request
                document.getElementById('arStatusMessage').classList.add('d-none');
                document.getElementById('arPermissionRequest').classList.remove('d-none');
            } else {
                // Show fallback for unsupported devices
                document.getElementById('arStatusMessage').classList.add('d-none');
                document.getElementById('arFallbackMessage').classList.remove('d-none');
                
                // Start simulated AR experience
                simulateARExperience(siteData);
            }
        } else {
            // Site not found
            document.getElementById('arStatusMessage').textContent = 'Dive site not found';
            document.getElementById('arSiteDetails').innerHTML = '<p class="text-danger">The requested dive site could not be found.</p>';
        }
    }, 1000);
}

/**
 * Start the AR experience
 */
function startARExperience() {
    // In a real implementation, this would:
    // 1. Request camera permission
    // 2. Setup a WebXR or AR.js session
    // 3. Create an AR view with 3D models of the dive site
    
    // For now, we'll just hide the permission request and show a message
    document.getElementById('arPermissionRequest').classList.add('d-none');
    document.getElementById('arStatusMessage').textContent = 'AR features not fully implemented in this version.';
    document.getElementById('arStatusMessage').classList.remove('d-none');
    
    // Simulate with canvas
    simulateARExperience();
}

/**
 * Simulate AR experience with a canvas visualization
 */
function simulateARExperience(siteData = null) {
    // Default data if none provided
    if (!siteData) {
        siteData = {
            name: 'Sample Dive Site',
            depth: 25,
            difficulty: 'Intermediate',
            color: '#0077be',
            layout: 'circular',
            orientation: 0
        };
    }
    
    // Get canvas
    const canvas = document.getElementById('arCanvas');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Hide status message
    document.getElementById('arStatusMessage').classList.add('d-none');
    
    // Variable to track rotation
    let angle = siteData.orientation || 0;
    let scale = 1.0;
    let increasing = true;
    
    // Animation loop
    function animate() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw simulated AR view
        drawSimulatedARView(ctx, canvas.width, canvas.height, siteData, angle, scale);
        
        // Update animation variables
        angle = (angle + 0.5) % 360;
        
        if (increasing) {
            scale += 0.005;
            if (scale >= 1.2) increasing = false;
        } else {
            scale -= 0.005;
            if (scale <= 0.8) increasing = true;
        }
        
        // Continue animation if modal is visible
        if (document.getElementById('arPreviewModal').classList.contains('show')) {
            requestAnimationFrame(animate);
        }
    }
    
    // Start animation
    animate();
}

/**
 * Draw a simulated AR view
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Object} siteData - Dive site data
 * @param {number} angle - Rotation angle
 * @param {number} scale - Scale factor
 */
function drawSimulatedARView(ctx, width, height, siteData, angle, scale) {
    try {
        // Background - simulate a water background
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#0077be'); // Light blue at top
        gradient.addColorStop(1, '#00334e'); // Dark blue at bottom
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Draw underwater particles
        drawUnderwaterParticles(ctx, width, height);
        
        // Draw site visualization based on layout
        ctx.save();
        
        // Center the drawing
        ctx.translate(width / 2, height / 2);
        ctx.rotate(angle * Math.PI / 180);
        ctx.scale(scale, scale);
        
        switch (siteData.layout) {
            case 'circular':
                drawCircularSite(ctx, siteData);
                break;
            case 'linear':
                drawLinearSite(ctx, siteData);
                break;
            case 'complex':
                drawComplexSite(ctx, siteData);
                break;
            default:
                drawCircularSite(ctx, siteData);
        }
        
        ctx.restore();
        
        // Draw HUD elements
        drawARCompass(ctx, width - 60, 60, angle);
        drawARDepthIndicator(ctx, 60, height - 60, siteData.depth);
        
        // Draw site name
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(siteData.name, width / 2, 30);
        
        // Draw helpful message
        ctx.font = '12px Arial';
        ctx.fillText('Simulated AR View - Move your device to explore', width / 2, height - 20);
        
    } catch (error) {
        console.error('Error in AR drawing:', error);
        drawARError(ctx, width, height);
    }
}

/**
 * Draw underwater particles effect
 */
function drawUnderwaterParticles(ctx, width, height) {
    // Create particles based on timestamp for variation
    const time = Date.now() / 1000;
    const particleCount = 50;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    
    for (let i = 0; i < particleCount; i++) {
        // Use time and index to create pseudo-random positions
        const x = width * (0.1 + 0.8 * Math.sin(i * 0.1 + time * 0.2));
        const y = height * (0.1 + 0.8 * Math.cos(i * 0.2 + time * 0.1));
        const size = 1 + 2 * Math.sin(i + time);
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * Draw a circular dive site
 */
function drawCircularSite(ctx, siteData) {
    // Main feature - e.g., a circular reef or blue hole
    ctx.fillStyle = siteData.color || '#0077be';
    ctx.beginPath();
    ctx.arc(0, 0, 100, 0, Math.PI * 2);
    ctx.fill();
    
    // Detail features - e.g., coral formations
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 8; i++) {
        const angle = i * Math.PI / 4;
        const x = 80 * Math.cos(angle);
        const y = 80 * Math.sin(angle);
        
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw depth markers
    ctx.strokeStyle = '#ffffff';
    ctx.setLineDash([5, 5]);
    
    for (let depth = 10; depth <= siteData.depth; depth += 10) {
        const radius = 100 - (depth / siteData.depth) * 70;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Depth label
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${depth}m`, 5, -radius + 3);
    }
    
    ctx.setLineDash([]);
}

/**
 * Draw a linear dive site
 */
function drawLinearSite(ctx, siteData) {
    // Main feature - e.g., a reef wall
    ctx.fillStyle = siteData.color || '#ff7f50';
    ctx.fillRect(-140, -20, 280, 40);
    
    // Detail features - e.g., coral formations
    const coralCount = 20;
    
    for (let i = 0; i < coralCount; i++) {
        const x = -130 + i * 14;
        const height = 15 + Math.sin(i * 0.5) * 10;
        
        ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#ffcc00';
        
        // Draw coral shape
        ctx.beginPath();
        ctx.moveTo(x, -20);
        ctx.lineTo(x - 5, -20 - height);
        ctx.lineTo(x + 5, -20 - height);
        ctx.lineTo(x, -20);
        ctx.fill();
    }
    
    // Draw depth gradients
    const maxDepth = siteData.depth || 20;
    const depthSteps = 5;
    
    for (let i = 0; i < depthSteps; i++) {
        const y = 20 + i * 20;
        const depth = (i + 1) * maxDepth / depthSteps;
        
        // Depth area
        ctx.fillStyle = `rgba(0, 40, 70, ${0.3 + i * 0.1})`;
        ctx.fillRect(-140, y - 20, 280, 20);
        
        // Depth label
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${Math.round(depth)}m`, -135, y - 5);
    }
}

/**
 * Draw a complex dive site (e.g., wreck)
 */
function drawComplexSite(ctx, siteData) {
    // Draw ship outline
    ctx.fillStyle = siteData.color || '#8b4513';
    
    // Ship hull
    ctx.beginPath();
    ctx.moveTo(-100, 0);
    ctx.lineTo(-80, 30);
    ctx.lineTo(80, 30);
    ctx.lineTo(100, 0);
    ctx.lineTo(80, -30);
    ctx.lineTo(-80, -30);
    ctx.closePath();
    ctx.fill();
    
    // Ship superstructure
    ctx.fillRect(-60, -30, 40, -20);
    ctx.fillRect(0, -30, 20, -15);
    
    // Details
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    // Windows
    for (let i = -70; i < 70; i += 20) {
        ctx.strokeRect(i, 10, 10, 5);
    }
    
    // Deck lines
    ctx.beginPath();
    ctx.moveTo(-80, 0);
    ctx.lineTo(80, 0);
    ctx.stroke();
    
    // Draw depth markers
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    
    // Depth at top of wreck
    ctx.fillText(`${siteData.depth - 15}m`, -90, -40);
    
    // Depth at seabed
    ctx.fillText(`${siteData.depth}m`, -90, 50);
    
    // Scale indicator
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-120, 50);
    ctx.lineTo(-80, 50);
    ctx.stroke();
    
    ctx.fillText('10m', -110, 65);
}

/**
 * Draw an error message on the AR canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
function drawARError(ctx, width, height) {
    // Background
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, width, height);
    
    // Error message
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Error displaying AR preview', width / 2, height / 2 - 15);
    
    ctx.font = '16px Arial';
    ctx.fillText('Please try again later', width / 2, height / 2 + 15);
}

/**
 * Draw a compass on the AR view
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} angle - Current rotation angle
 */
function drawARCompass(ctx, x, y, angle) {
    const radius = 30;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Compass rose
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-angle * Math.PI / 180);
    
    // North direction
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -radius + 5);
    ctx.lineTo(0, -5);
    ctx.stroke();
    
    // North pointer
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.moveTo(0, -radius + 5);
    ctx.lineTo(-4, -radius + 12);
    ctx.lineTo(4, -radius + 12);
    ctx.closePath();
    ctx.fill();
    
    // Cardinal points
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillText('N', 0, -radius + 15);
    ctx.fillText('E', radius - 15, 0);
    ctx.fillText('S', 0, radius - 15);
    ctx.fillText('W', -radius + 15, 0);
    
    ctx.restore();
    
    // Outer ring
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
}

/**
 * Draw a depth indicator on the AR view
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} depth - Current depth
 */
function drawARDepthIndicator(ctx, x, y, depth) {
    const width = 30;
    const height = 100;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x - width / 2, y - height / 2, width, height);
    
    // Scale lines
    const maxDepth = Math.max(depth, 40); // Show at least 0-40m scale
    const depthIncrement = 10;
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.textAlign = 'left';
    ctx.font = '8px Arial';
    
    for (let d = 0; d <= maxDepth; d += depthIncrement) {
        const yPos = y - height / 2 + (d / maxDepth) * height;
        
        // Line
        ctx.beginPath();
        ctx.moveTo(x - width / 2, yPos);
        ctx.lineTo(x - width / 2 + 5, yPos);
        ctx.stroke();
        
        // Label
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${d}m`, x - width / 2 + 7, yPos + 3);
    }
    
    // Current depth indicator
    const currentDepthY = y - height / 2 + (depth / maxDepth) * height;
    
    // Pointer
    ctx.fillStyle = '#00ccff';
    ctx.beginPath();
    ctx.moveTo(x + width / 2, currentDepthY);
    ctx.lineTo(x + width / 2 - 10, currentDepthY - 5);
    ctx.lineTo(x + width / 2 - 10, currentDepthY + 5);
    ctx.closePath();
    ctx.fill();
    
    // Label
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText(`${depth}m`, x - width / 2 - 2, currentDepthY + 3);
    
    // Depth word
    ctx.save();
    ctx.translate(x, y - height / 2 - 15);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.font = '10px Arial';
    ctx.fillText('DEPTH', 0, 0);
    ctx.restore();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initARModule();
});

// Export functions for use in other modules
window.arPreview = {
    showARPreview
};
