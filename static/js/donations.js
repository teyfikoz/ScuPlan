/**
 * ScuPlan - Donations Module
 * Handles cryptocurrency donation integration
 */

/**
 * Initialize donation features
 */
function initDonationFeatures() {
    console.log('Initializing donation features');
    
    // Generate QR codes for donation addresses
    generateDonationQRCodes();
    
    // Set up event listeners
    setupDonationEventListeners();
}

/**
 * No QR codes are needed anymore, just leaving a placeholder function
 */
function generateDonationQRCodes() {
    // Function kept for compatibility, but QR code generation has been removed
    console.log('QR code generation disabled as per user request');
}

/**
 * Set up event listeners for donation-related elements
 */
function setupDonationEventListeners() {
    // Set up copy buttons for crypto addresses
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const addressType = this.getAttribute('data-address');
            if (addressType === 'xrp') {
                copyAddressToClipboard('xrpAddress', 'XRP');
            } else if (addressType === 'usdt') {
                copyAddressToClipboard('usdtAddress', 'USDT (TRC20)');
            }
        });
    });
    
    // Set up donation info guide link
    const donationGuideLinks = document.querySelectorAll('#donationGuideLink');
    donationGuideLinks.forEach(link => {
        if (link) {
            link.addEventListener('click', showDonationInfo);
        }
    });
}

/**
 * Update the displayed address based on selected cryptocurrency
 * @param {string} cryptoType - The type of cryptocurrency selected
 */
function updateDisplayedAddress(cryptoType) {
    const addressDisplay = document.getElementById('cryptoAddress');
    const addressNote = document.getElementById('addressNote');
    const xamanAppLink = document.querySelector('a[href^="https://xaman.app"]');
    
    if (!addressDisplay) return;
    
    // Show/hide Xaman app link based on crypto type
    if (xamanAppLink) {
        if (cryptoType === 'xrp') {
            xamanAppLink.style.display = 'inline-block';
        } else {
            xamanAppLink.style.display = 'none';
        }
    }
    
    switch (cryptoType) {
        case 'xrp':
            addressDisplay.innerText = 'rPu9SuQBv9ZWXGBaUgaHJ1PauSj98arjbV';
            addressDisplay.setAttribute('data-crypto', 'XRP');
            if (addressNote) {
                addressNote.innerText = 'XRP (Ripple) address';
            }
            break;
        case 'usdt':
            addressDisplay.innerText = 'TJoUFBDEFXMPgdZ2yj8yBXCo7TURfiZ3hQ';
            addressDisplay.setAttribute('data-crypto', 'USDT (TRC20)');
            if (addressNote) {
                addressNote.innerText = 'USDT (TRC20) address - Tether on the TRON network';
            }
            break;
        default:
            addressDisplay.innerText = 'Please select a cryptocurrency';
            addressDisplay.setAttribute('data-crypto', '');
            if (addressNote) {
                addressNote.innerText = 'Please select a cryptocurrency';
            }
    }
}

/**
 * Copy specific cryptocurrency address to clipboard
 * @param {string} elementId - The ID of the element containing the address
 * @param {string} cryptoType - The type of cryptocurrency
 */
function copyAddressToClipboard(elementId, cryptoType) {
    const addressDisplay = document.getElementById(elementId);
    
    if (!addressDisplay || !addressDisplay.innerText) {
        showAlert('No cryptocurrency address found', 'warning');
        return;
    }
    
    // Create a temporary input element
    const tempInput = document.createElement('input');
    tempInput.value = addressDisplay.innerText;
    document.body.appendChild(tempInput);
    
    // Select the text
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // For mobile devices
    
    // Copy to clipboard
    document.execCommand('copy');
    
    // Remove the temporary element
    document.body.removeChild(tempInput);
    
    // Show success message
    showAlert(`${cryptoType} donation address copied to clipboard`, 'success');
}

/**
 * Show information about donation options
 */
function showDonationInfo(e) {
    e.preventDefault();
    
    // Create the modal if it doesn't exist
    if (!document.getElementById('donationInfoModal')) {
        const modalHtml = `
            <div class="modal fade" id="donationInfoModal" tabindex="-1" aria-labelledby="donationInfoModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="donationInfoModalLabel">Support ScuPlan</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>ScuPlan is a free dive planning tool. If you find it useful, please consider supporting the project with a cryptocurrency donation.</p>
                            
                            <h6 class="mt-3">Donation Options:</h6>
                            
                            <div class="card mb-3">
                                <div class="card-body">
                                    <h6 class="card-title"><i class="fas fa-coins me-2 text-info"></i>XRP</h6>
                                    <p class="small">Fast, low-cost cryptocurrency for payments and financial services.</p>
                                    <div class="crypto-address mb-2" id="xrpAddressModal">rPu9SuQBv9ZWXGBaUgaHJ1PauSj98arjbV</div>
                                    <div class="d-flex">
                                        <button class="btn btn-sm btn-info me-2 copy-address-btn" data-address="xrp">
                                            <i class="fas fa-copy me-1"></i>Copy Address
                                        </button>
                                        <a href="https://xaman.app/detect/request:rPu9SuQBv9ZWXGBaUgaHJ1PauSj98arjbV" target="_blank" class="btn btn-sm btn-outline-info">
                                            <i class="fas fa-external-link-alt me-1"></i>Open in Xaman App
                                        </a>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="card mb-3">
                                <div class="card-body">
                                    <h6 class="card-title"><i class="fas fa-dollar-sign me-2 text-success"></i>USDT (TRC20)</h6>
                                    <p class="small">Stablecoin backed by USD on the TRON network with lower fees and faster transactions.</p>
                                    <div class="crypto-address mb-2" id="usdtAddressModal">TJoUFBDEFXMPgdZ2yj8yBXCo7TURfiZ3hQ</div>
                                    <button class="btn btn-sm btn-success copy-address-btn" data-address="usdt">
                                        <i class="fas fa-copy me-1"></i>Copy Address
                                    </button>
                                </div>
                            </div>
                            
                            <p class="mt-3">Your donations help keep ScuPlan free and support ongoing development of new features and improvements.</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);
        
        // Add event listeners for copy buttons
        document.querySelectorAll('.copy-address-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const addressType = this.getAttribute('data-address');
                let addressElement;
                let successMessage;
                
                if (addressType === 'xrp') {
                    addressElement = document.getElementById('xrpAddressModal');
                    successMessage = 'XRP address copied to clipboard';
                } else if (addressType === 'usdt') {
                    addressElement = document.getElementById('usdtAddressModal');
                    successMessage = 'USDT (TRC20) address copied to clipboard';
                }
                
                if (addressElement) {
                    const tempInput = document.createElement('input');
                    tempInput.value = addressElement.innerText;
                    document.body.appendChild(tempInput);
                    tempInput.select();
                    document.execCommand('copy');
                    document.body.removeChild(tempInput);
                    
                    showAlert(successMessage, 'success');
                }
            });
        });
    }
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('donationInfoModal'));
    modal.show();
}
