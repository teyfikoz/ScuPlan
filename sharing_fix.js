/**
 * Get the share URL for a dive plan
 * @param {string} shareToken - The share token for the dive plan
 * @returns {string} - The complete share URL
 */
function getShareUrl(shareToken) {
    // Create base URL from current location (ensuring it doesn't end with /)
    let baseUrl = window.location.origin;
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
    }
    
    // Add the route for the share feature
    return `${baseUrl}/share/${shareToken}`;
}
