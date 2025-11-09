# ScuPlan - Advanced Dive Planning Application

## Overview
ScuPlan is a comprehensive diving application designed for divers of all skill levels, offering advanced dive planning, safety tools, and community-driven features. It emphasizes international and technical diving capabilities, aiming to be a complete solution for dive planning and education. The project envisions significant market potential by providing a robust, PWA-ready platform with extensive offline support and a focus on user experience.

## User Preferences
- Language: English (translated from Turkish)
- Unit System: Metric (default), Imperial support needed
- Cryptocurrency addresses: XRP and USDT TRC20 visible on all pages
- Navigation: Functional Saved Plans and Technical Diving sections

## System Architecture
ScuPlan employs a hybrid architecture combining traditional multi-page Flask rendering, an original single-file SPA, and a modern multi-page SPA with client-side routing. The main application is a multi-page SPA utilizing Navigo for hash-based client-side routing, with separate HTML files for each major section (e.g., dive-planner, checklist, technical).

**UI/UX Decisions:**
- **Theming:** Three comprehensive themes (Light, Dark, Underwater) with WCAG AA/AAA contrast ratios, using CSS custom properties for dynamic updates.
- **Responsiveness:** Mobile-responsive design with fixed navigation and an accessible mobile menu.
- **Transitions:** Smooth fade-in transitions for page changes.
- **Localization:** Full i18n support for English and Turkish with a persistent language switcher, using a `data-i18n` system and offline dictionary caching.
- **Branding:** A white-label configuration system allows complete branding customization via environment variables and client-specific configurations.

**Technical Implementations & Features:**
- **Dive Planner:** Decompression calculations, descent/bottom/ascent time, dive profile charts, date/time selection, buddy information.
- **Checklist Module:** Interactive pre-dive, post-dive, emergency, and custom checklists.
- **Saved Dive Plans:** Local storage for offline plan management.
- **Gas Consumption:** Tank size, pressure, O₂ percentage, and air consumption estimates.
- **Technical Diving:** MOD, END, CNS tracking, Best Mix calculations, multi-level dive planning.
- **Dive Education & Calculations:** Interactive theory (Boyle's, Dalton's, Henry's, Archimedes), NDL tables, gas planning, emergency procedures, environmental awareness. Includes NDL, surface interval, buoyancy, gas mixture, and SAC rate calculators. Features a live dive simulator and an AI chatbot covering 100+ topics.
- **World Dive Routes:** Comprehensive database of 29 global dive locations with interactive Leaflet.js map, search, filtering, and detailed site information.
- **Unit System:** User-selectable Metric/Imperial toggle with live conversion for depth, pressure, and volume, updating charts and results (persistent preference).
- **SEO:** Dynamic meta tags, Open Graph, Twitter Cards, JSON-LD structured data, and sitemap.xml generation.
- **PWA & Offline Support:** Service worker caches all pages, manifest for PWA functionality, and local storage for offline data.
- **Print Functionality:** Printable dive plans.

**System Design Choices:**
- **Modularity:** Emphasizes modular, commented, and testable code.
- **Progressive Enhancement:** Built with progressive enhancement principles.
- **Scalability:** Extensible for additional languages and future features.

## External Dependencies
- **Backend Framework:** Flask (Python)
- **Frontend Libraries:**
    - Vanilla JavaScript (ES6+)
    - Navigo (lightweight hash router)
    - Chart.js
    - Leaflet.js
    - Font Awesome (icons)
- **Styling:**
    - Tailwind CSS (CDN)
    - Bootstrap 5
- **Database:** PostgreSQL (with fallback mechanism to local storage)
- **Deployment:** Gunicorn (on Replit)
- **Advertising:** Google AdSense
- **PWA:** Service Worker API, Web App Manifest