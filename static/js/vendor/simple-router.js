/**
 * SimpleRouter - Lightweight hash-based router (~50 lines)
 * A minimal client-side router for single-page applications
 */
class SimpleRouter {
  constructor() {
    this.routes = {};
    this.notFoundHandler = null;
    
    // Listen for hash changes
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  }

  /**
   * Register a route with a callback
   * @param {string} path - Route path (e.g., '/home', '/user/:id')
   * @param {function} callback - Function to call when route matches
   */
  on(path, callback) {
    this.routes[path] = callback;
    return this;
  }

  /**
   * Set a 404 handler
   * @param {function} callback - Function to call when no route matches
   */
  notFound(callback) {
    this.notFoundHandler = callback;
    return this;
  }

  /**
   * Navigate to a route programmatically
   * @param {string} path - Path to navigate to
   */
  navigate(path) {
    window.location.hash = path;
  }

  /**
   * Handle route matching and execution
   */
  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    let matchFound = false;

    for (const [route, callback] of Object.entries(this.routes)) {
      const params = this.matchRoute(route, hash);
      if (params !== null) {
        callback(params);
        matchFound = true;
        break;
      }
    }

    if (!matchFound && this.notFoundHandler) {
      this.notFoundHandler();
    }
  }

  /**
   * Match a route pattern against the current hash
   * @param {string} route - Route pattern
   * @param {string} hash - Current hash
   * @returns {object|null} - Parameters object or null if no match
   */
  matchRoute(route, hash) {
    const routeParts = route.split('/').filter(Boolean);
    const hashParts = hash.split('/').filter(Boolean);

    if (routeParts.length !== hashParts.length) return null;

    const params = {};
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        params[routeParts[i].slice(1)] = hashParts[i];
      } else if (routeParts[i] !== hashParts[i]) {
        return null;
      }
    }

    return params;
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SimpleRouter;
}
