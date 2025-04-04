/**
 * ScuPlan - Social Sharing Module
 * Provides functionality for sharing dive plans to social media
 * and generating shareable links
 */

/**
 * Initialize social sharing functionality
 */
function initSocialSharing() {
    // Add event listeners for share buttons
    document.addEventListener('click', function(e) {
        // Check for share button clicks
        if (e.target.matches('.share-btn, .share-btn *')) {
            const btn = e.target.closest('.share-btn');
            if (btn) {
                const platform = btn.getAttribute('data-platform');
                if (platform) {
                    handleShareClick(platform);
                }
            }
        }
        
        // Check for share link copy button
        if (e.target.matches('#copyShareLink, #copyShareLink *')) {
            copyShareLink();
        }
    });
    
    // Initialize share modals if they exist
    initShareModals();
    
    console.log('Social sharing module initialized');
}

/**
 * Initialize share modals
 */
function initShareModals() {
    // Check if the share modal already exists
    if (!document.getElementById('shareModal')) {
        // Create the share modal
        const modalHTML = `
            <div class="modal fade" id="shareModal" tabindex="-1" aria-labelledby="shareModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="shareModalLabel">Share Your Dive Plan</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>Share your dive plan with fellow divers:</p>
                            
                            <div class="share-link-container mb-3">
                                <label class="form-label">Share Link:</label>
                                <div class="input-group">
                                    <input type="text" class="form-control" id="shareLink" readonly>
                                    <button class="btn btn-primary" id="copyShareLink">
                                        <i class="fas fa-copy me-1"></i> Copy
                                    </button>
                                </div>
                                <small class="text-muted mt-1">This link will allow others to view your dive plan</small>
                            </div>
                            
                            <div class="share-qr-container text-center mb-3">
                                <div id="shareQRCode" class="d-inline-block p-2 bg-white rounded"></div>
                                <div class="mt-2">
                                    <small class="text-muted">Scan this QR code to open the dive plan</small>
                                </div>
                            </div>
                            
                            <div class="social-share-buttons d-flex justify-content-center gap-2 mt-4">
                                <button class="btn btn-outline-primary share-btn" data-platform="facebook">
                                    <i class="fab fa-facebook-f me-1"></i> Facebook
                                </button>
                                <button class="btn btn-outline-info share-btn" data-platform="twitter">
                                    <i class="fab fa-twitter me-1"></i> Twitter
                                </button>
                                <button class="btn btn-outline-success share-btn" data-platform="whatsapp">
                                    <i class="fab fa-whatsapp me-1"></i> WhatsApp
                                </button>
                                <button class="btn btn-outline-secondary share-btn" data-platform="email">
                                    <i class="fas fa-envelope me-1"></i> Email
                                </button>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Append to body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstElementChild);
    }
}

/**
 * Show the share modal with the given dive plan
 * @param {string} shareToken - Token for the shared dive plan
 * @param {Object} divePlan - The dive plan data to share
 */
function showShareModal(shareToken, divePlan) {
    // Create the share URL
    const shareUrl = getShareUrl(shareToken);
    
    // Set the share link input value
    const shareLinkInput = document.getElementById('shareLink');
    if (shareLinkInput) {
        shareLinkInput.value = shareUrl;
    }
    
    // Generate QR code
    generateQRCode(shareUrl);
    
    // Show the modal
    const shareModal = new bootstrap.Modal(document.getElementById('shareModal'));
    shareModal.show();
    
    // Update modal title with some dive plan details if available
    const modalTitle = document.getElementById('shareModalLabel');
    if (modalTitle && divePlan) {
        modalTitle.textContent = `Share: ${divePlan.depth}m dive at ${divePlan.location || 'Unknown location'}`;
    }
}

/**
 * Generate a QR code for the share URL
 * @param {string} url - The URL to encode in the QR code
 */
function generateQRCode(url) {
    const qrContainer = document.getElementById('shareQRCode');
    if (qrContainer && window.QRCode) {
        // Clear previous QR code
        qrContainer.innerHTML = '';
        
        // Generate new QR code
        new QRCode(qrContainer, {
            text: url,
            width: 128,
            height: 128,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

/**
 * Get the share URL for a dive plan
 * @param {string} shareToken - The share token for the dive plan
 * @returns {string} - The complete share URL
 */
function getShareUrl(shareToken) {
    // Create base URL from current location
    const baseUrl = window.location.origin;
    return `${baseUrl}/share/${shareToken}`;
}

/**
 * Copy the share link to clipboard
 */
function copyShareLink() {
    const shareLink = document.getElementById('shareLink');
    if (shareLink) {
        // Select and copy the text
        shareLink.select();
        shareLink.setSelectionRange(0, 99999); // For mobile devices
        
        navigator.clipboard.writeText(shareLink.value)
            .then(() => {
                // Show success feedback
                const copyBtn = document.getElementById('copyShareLink');
                if (copyBtn) {
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fas fa-check me-1"></i> Copied!';
                    copyBtn.classList.replace('btn-primary', 'btn-success');
                    
                    setTimeout(() => {
                        copyBtn.innerHTML = originalText;
                        copyBtn.classList.replace('btn-success', 'btn-primary');
                    }, 2000);
                }
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    }
}

/**
 * Handle share button clicks
 * @param {string} platform - The platform to share to
 */
function handleShareClick(platform) {
    const shareUrl = document.getElementById('shareLink').value;
    const title = document.getElementById('shareModalLabel').textContent;
    const text = "Check out my ScuPlan dive plan!";
    
    let shareWindow;
    
    switch (platform) {
        case 'facebook':
            shareWindow = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
            break;
            
        case 'twitter':
            shareWindow = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
            break;
            
        case 'whatsapp':
            shareWindow = `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`;
            break;
            
        case 'email':
            window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + shareUrl)}`;
            return;
    }
    
    // Open a popup window for social sharing
    if (shareWindow) {
        window.open(shareWindow, 'share-window', 'height=450, width=550, toolbar=0, menubar=0, directories=0, scrollbars=0');
    }
}

/**
 * Generate a share token for a dive plan (client-side function)
 * Note: In a real implementation, the token generation would be handled server-side
 * This is just a placeholder for the client-side implementation
 * 
 * @param {Object} divePlan - The dive plan to generate a token for
 * @returns {string} - A share token
 */
function generateShareToken(divePlan) {
    // This is just a simplified example - in a real app, token would be created server-side
    const randomStr = Math.random().toString(36).substring(2, 10);
    const timestamp = new Date().getTime().toString(36);
    return `${randomStr}-${timestamp}`;
}

/**
 * Create and show a simple share button
 * @param {string} containerId - ID of the container to add the share button to
 * @param {Object} divePlan - The dive plan data
 * @param {string} shareToken - Optional share token if already exists
 */
function createShareButton(containerId, divePlan, shareToken = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Create the share button
    const shareBtn = document.createElement('button');
    shareBtn.className = 'btn btn-primary mt-3';
    shareBtn.innerHTML = '<i class="fas fa-share-alt me-1"></i> Share Dive Plan';
    
    // Add click event
    shareBtn.addEventListener('click', function() {
        const token = shareToken || generateShareToken(divePlan);
        
        // If sharing from the results section, this should call the API to save the plan with a share token
        if (!shareToken) {
            // This would typically be an API call to save the plan for sharing
            // For now, we're just using the client-side token
            console.log('Generate server-side share token for:', divePlan);
        }
        
        showShareModal(token, divePlan);
    });
    
    // Add to container
    container.appendChild(shareBtn);
}

// Initialize social sharing when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initSocialSharing();
});

// Make functions available globally
window.socialSharing = {
    showShareModal,
    createShareButton
};
