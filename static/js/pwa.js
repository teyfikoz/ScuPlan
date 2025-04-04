/**
 * ScuPlan - Progressive Web App Module
 * Provides PWA functionality, service worker registration,
 * offline support, and app installation
 */

let deferredPrompt;

/**
 * Initialize PWA functionality
 */
function initPWA() {
    // Register service worker
    registerServiceWorker();
    
    // Setup install prompt
    setupInstallPrompt();
    
    // Setup offline detection
    setupOfflineDetection();
    
    console.log('PWA module initialized');
}

/**
 * Register the service worker
 */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/service-worker.js')
                .then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(function(error) {
                    console.log('ServiceWorker registration failed: ', error);
                });
        });
    }
}

/**
 * Setup the PWA install prompt
 */
function setupInstallPrompt() {
    // Store the install prompt event for later use
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the default browser prompt
        e.preventDefault();
        
        // Store the event for later use
        deferredPrompt = e;
        
        // Show custom install UI
        showInstallBanner();
    });
    
    // Listen for app installed event
    window.addEventListener('appinstalled', (e) => {
        // Hide the install banner if it's visible
        hideInstallBanner();
        
        // Log the installation
        console.log('PWA installed successfully');
    });
    
    // Add event listener for install button
    document.addEventListener('click', function(e) {
        if (e.target.matches('#installPwaButton, #installPwaButton *')) {
            promptInstall();
        }
        
        if (e.target.matches('#closePwaBanner, #closePwaBanner *')) {
            hideInstallBanner();
        }
    });
}

/**
 * Show the install banner
 */
function showInstallBanner() {
    const banner = document.getElementById('pwaBanner');
    if (banner) {
        banner.style.display = 'flex';
    }
}

/**
 * Hide the install banner
 */
function hideInstallBanner() {
    const banner = document.getElementById('pwaBanner');
    if (banner) {
        banner.style.display = 'none';
    }
    
    // Store in local storage that user has seen the banner
    localStorage.setItem('pwaBannerClosed', 'true');
}

/**
 * Prompt the user to install the PWA
 */
function promptInstall() {
    if (deferredPrompt) {
        // Show the browser install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the PWA installation');
            } else {
                console.log('User declined the PWA installation');
            }
            
            // Clear the deferred prompt
            deferredPrompt = null;
            
            // Hide the install banner
            hideInstallBanner();
        });
    }
}

/**
 * Setup offline detection
 */
function setupOfflineDetection() {
    // Update UI when offline status changes
    window.addEventListener('online', updateOfflineStatus);
    window.addEventListener('offline', updateOfflineStatus);
    
    // Initial check
    updateOfflineStatus();
}

/**
 * Update the UI based on offline status
 */
function updateOfflineStatus() {
    const indicator = document.getElementById('offlineIndicator');
    if (!indicator) return;
    
    if (navigator.onLine) {
        indicator.classList.remove('active');
    } else {
        indicator.classList.add('active');
        
        // Show offline notification
        showOfflineNotification();
    }
}

/**
 * Show a notification when the app goes offline
 */
function showOfflineNotification() {
    // Only show the notification if available in the browser
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('ScuPlan - Offline Mode', {
            body: 'You are currently offline. Some features may be limited.',
            icon: '/static/images/icon-192x192.png'
        });
    }
}

/**
 * Request notification permission
 */
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
}

// Initialize PWA functionality when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initPWA();
    
    // Request notification permission after a user interaction
    document.body.addEventListener('click', function() {
        requestNotificationPermission();
    }, { once: true });
});

// Make functions available globally
window.pwa = {
    promptInstall,
    requestNotificationPermission
};
