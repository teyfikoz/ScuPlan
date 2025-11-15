/**
 * Theme Management System for ScuPlan
 * Handles light/dark theme switching with smooth transitions
 */

class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.initializeTheme();
        this.createThemeToggle();
    }

    /**
     * Initialize theme on page load
     */
    initializeTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeIcon();
    }

    /**
     * Create theme toggle button
     */
    createThemeToggle() {
        // Remove existing toggle if present
        const existingToggle = document.getElementById('themeToggle');
        if (existingToggle) {
            existingToggle.remove();
        }

        // Create new toggle button
        const toggleButton = document.createElement('button');
        toggleButton.id = 'themeToggle';
        toggleButton.className = 'theme-toggle';
        toggleButton.innerHTML = '<i class="fas fa-moon"></i>';
        toggleButton.title = 'Toggle Dark Mode';
        
        // Add event listener
        toggleButton.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Add to body
        document.body.appendChild(toggleButton);
        
        // Update icon based on current theme
        this.updateThemeIcon();
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.currentTheme);
        
        // Add transition class
        document.documentElement.style.transition = 'all 0.3s ease';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        this.updateThemeIcon();
        this.triggerThemeChange();

        // Remove transition after animation
        setTimeout(() => {
            document.documentElement.style.transition = '';
        }, 300);
    }

    /**
     * Update theme toggle icon
     */
    updateThemeIcon() {
        const toggleButton = document.getElementById('themeToggle');
        if (toggleButton) {
            const icon = toggleButton.querySelector('i');
            if (icon) {
                icon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            }
            toggleButton.title = this.currentTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
        }
    }

    /**
     * Trigger custom event when theme changes
     */
    triggerThemeChange() {
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: this.currentTheme }
        }));
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Set theme programmatically
     */
    setTheme(theme) {
        if (['light', 'dark'].includes(theme)) {
            this.currentTheme = theme;
            localStorage.setItem('theme', theme);
            document.documentElement.setAttribute('data-theme', theme);
            this.updateThemeIcon();
            this.triggerThemeChange();
        }
    }
}

// Initialize theme manager only (Imperial system completely removed)
document.addEventListener('DOMContentLoaded', function() {
    window.themeManager = new ThemeManager();
    
    // Add smooth transitions to elements that might change with theme
    const elementsToAnimate = document.querySelectorAll('.card, .btn, .form-control, .navbar');
    elementsToAnimate.forEach(element => {
        element.style.transition = 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease';
    });
});