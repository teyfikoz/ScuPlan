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
 * Generate QR codes for cryptocurrency donation addresses
 */
function generateDonationQRCodes() {
    // Bitcoin QR code
    const btcAddress = document.getElementById('btcAddress').innerText;
    
    if (btcAddress && typeof QRCode !== 'undefined') {
        new QRCode(document.getElementById('donationQR'), {
            text: 'bitcoin:' + btcAddress,
            width: 128,
            height: 128,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

/**
 * Set up event listeners for donation-related elements
 */
function setupDonationEventListeners() {
    // Copy donation address to clipboard
    document.getElementById('copyDonationBtn').addEventListener('click', copyDonationAddress);
}

/**
 * Copy the selected cryptocurrency donation address to clipboard
 */
function copyDonationAddress() {
    // Default to BTC
    const btcAddress = document.getElementById('btcAddress').innerText;
    const ethAddress = document.getElementById('ethAddress').innerText;
    
    // Create a temporary input element
    const tempInput = document.createElement('input');
    tempInput.value = btcAddress; // Default to BTC
    document.body.appendChild(tempInput);
    
    // Select the text
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // For mobile devices
    
    // Copy to clipboard
    document.execCommand('copy');
    
    // Remove the temporary element
    document.body.removeChild(tempInput);
    
    // Show success message
    showAlert('Bitcoin donation address copied to clipboard', 'success');
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
                            <p>ScuPlan is a free, open-source dive planning tool. If you find it useful, please consider supporting the project with a cryptocurrency donation.</p>
                            
                            <h6 class="mt-3">Donation Options:</h6>
                            
                            <div class="card mb-3">
                                <div class="card-body">
                                    <h6 class="card-title"><i class="fab fa-bitcoin me-2 text-warning"></i>Bitcoin (BTC)</h6>
                                    <p class="small">Bitcoin is the original cryptocurrency that operates on a global peer-to-peer network.</p>
                                    <div class="crypto-address mb-2" id="btcAddressModal">${document.getElementById('btcAddress').innerText}</div>
                                    <button class="btn btn-sm btn-warning copy-address-btn" data-address="btc">
                                        <i class="fas fa-copy me-1"></i>Copy Address
                                    </button>
                                </div>
                            </div>
                            
                            <div class="card mb-3">
                                <div class="card-body">
                                    <h6 class="card-title"><i class="fab fa-ethereum me-2 text-primary"></i>Ethereum (ETH)</h6>
                                    <p class="small">Ethereum is a decentralized platform that supports smart contracts and applications.</p>
                                    <div class="crypto-address mb-2" id="ethAddressModal">${document.getElementById('ethAddress').innerText}</div>
                                    <button class="btn btn-sm btn-primary copy-address-btn" data-address="eth">
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
                
                if (addressType === 'btc') {
                    addressElement = document.getElementById('btcAddressModal');
                    successMessage = 'Bitcoin address copied to clipboard';
                } else if (addressType === 'eth') {
                    addressElement = document.getElementById('ethAddressModal');
                    successMessage = 'Ethereum address copied to clipboard';
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
