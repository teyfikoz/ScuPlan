# ScuPlan - Advanced Dive Planning Application

## Overview
ScuPlan is a comprehensive diving application designed for advanced dive planning, safety, and community interaction, catering to all skill levels with a focus on international and technical diving. Its purpose is to provide divers with robust tools for planning, education, and exploration, including features like decompression calculations, technical diving modules, and a global dive site directory. The project aims to enhance diving safety and enjoyment through technology.

## User Preferences
- Language: English (translated from Turkish)
- Unit System: Metric (default), Imperial support needed
- Cryptocurrency addresses: XRP and USDT TRC20 visible on all pages
- Navigation: Functional Saved Plans and Technical Diving sections
- I prefer clear, concise explanations.
- I appreciate iterative development with frequent updates.
- Please ensure all new features maintain existing functionality.
- I expect modular, commented, and testable code.
- Responsive design principles should always be followed.
- Adhere to existing code patterns and naming conventions.

## System Architecture
ScuPlan utilizes a Flask (Python) backend with a JavaScript (ES6+), HTML5, and CSS3 frontend, styled with Bootstrap 5. Data is managed via PostgreSQL with a fallback mechanism and local storage for offline capabilities. Chart.js is used for data visualization, and Font Awesome for iconography. The application is deployed with Gunicorn on Replit.

**UI/UX Decisions:**
- **Color Palette:** Standardized using `:root` variables in CSS with a primary color of `#0077b6`.
- **Navigation:** Unified structure across all pages using `layout.html`, with a consistent order and unit toggle at the end.
- **Responsiveness:** Designed with responsive containers for elements like charts to ensure adaptability across devices.
- **Interactive Elements:** Features interactive checklists, collapsible accordions for education, and Leaflet.js for interactive maps.

**Technical Implementations:**
- **Dive Planner:** Includes decompression, descent, bottom, and ascent time calculations, and a negative depth dive profile chart.
- **Technical Diving Module:** Calculates MOD, END, CNS oxygen toxicity, and best mix for gas.
- **Unit System:** Comprehensive metric/imperial toggle with live conversion for inputs, charts, and results, persistent via local storage.
- **Offline Support:** Utilizes `localStorage` for saved dive plans and educational content.
- **AI Chatbot:** A zero-cost, rule-based AI chatbot provides information on over 100 diving topics.
- **World Dive Routes:** Features an interactive Leaflet.js map with clustering for 29 global dive locations, supported by static JSON data.
- **Education Module:** Comprehensive dive theory, advanced calculators (NDL, surface interval, buoyancy, gas mix, SAC rate), and physics simulations.

**Feature Specifications:**
- **Dive Planner:** Decompression, timing, buddy info, profile chart, date/time picker.
- **Checklist Module:** Pre-dive, post-dive, emergency, custom checklists.
- **Gas Consumption Calculator:** Tank size, pressure, O₂ percentage, air consumption estimates.
- **Dive Education:** Interactive theory, physics, decompression, emergency procedures, environmental awareness.
- **Unit Conversion:** Full metric/imperial support for depth, pressure, volume, with chart axis and result updates.
- **Donations:** Cryptocurrency (XRP, USDT TRC20) donation addresses displayed.
- **Print Support:** Printable dive plans.

**System Design Choices:**
- **Modular Codebase:** Organized into `app.py`, `models.py`, `main.py`, `technical_diving.py`, and separate `templates`, `static/js`, `static/css` directories.
- **Database Fallback:** Designed to run without an active PostgreSQL connection using a fallback mechanism and local storage.

## External Dependencies
- **Database:** PostgreSQL (with a fallback mechanism for local storage)
- **Frontend Framework:** Bootstrap 5
- **Charting Library:** Chart.js
- **Icons:** Font Awesome
- **Mapping Library:** Leaflet.js (API-free, using static JSON data)
- **Deployment:** Gunicorn (on Replit)