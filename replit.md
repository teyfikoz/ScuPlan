# ScuPlan - Advanced Dive Planning Application

## Project Overview
ScuPlan is a comprehensive diving application that provides advanced dive planning, safety tools, and community-driven features for divers of all skill levels, with enhanced international and technical diving capabilities.

## Current Technology Stack
- **Backend**: Flask (Python)
- **Frontend**: JavaScript (ES6+), HTML5, CSS3
- **Database**: PostgreSQL (with fallback mechanism)
- **Styling**: Bootstrap 5
- **Charts**: Chart.js
- **Icons**: Font Awesome
- **Deployment**: Gunicorn on Replit

## Current Features (Fully Working)
✓ **Dive Planner**: 
  - Decompression calculations
  - Descent, bottom, ascent time calculations
  - Dive Profile Chart (negative depth visualization)
  - Date/Time selection with calendar picker
  - Buddy information display

✓ **Checklist Module**: 
  - Pre-dive, Post-dive, Emergency, Custom checklists
  - Interactive checkbox system

✓ **Saved Dive Plans**: 
  - Local storage system for offline functionality
  - Plan retrieval and management

✓ **Gas Consumption Calculator**: 
  - Tank size, pressure, O₂ percentage calculations
  - Air consumption estimates

✓ **Technical Diving Module**: 
  - MOD (Maximum Operating Depth) calculations
  - END (Equivalent Narcotic Depth) calculations
  - CNS (Central Nervous System) oxygen toxicity tracking
  - Best Mix calculations for optimal gas mixtures
  - Multi-level dive planning

✓ **Cryptocurrency Donations**: 
  - XRP and USDT TRC20 addresses displayed on all pages
  - Copy-to-clipboard functionality

✓ **Print & Offline Support**: 
  - Printable dive plans
  - Offline functionality with localStorage

## Recent Technical Fixes (August 2025)
✓ Fixed Multi-Level Planning redirecting to MOD Calculation
✓ Fixed Saved Plans javascript:void(0) navigation error
✓ Translated all Turkish messages to English in calculators
✓ Fixed JavaScript errors causing Technical Diving issues
✓ Database fallback mechanism working properly

## Planned New Features (Current Development)

### 1. Decompression Calculation Explanation
- Add informational box below dive planner results
- Explain calculation methodology and limitations
- Note: No specific algorithm (Bühlmann, VPM) currently implemented

### 2. Metric/Imperial Unit System Toggle
- User-selectable unit system (Metric default, Imperial option)
- Conversions: meters ↔ feet, bar ↔ psi, liters ↔ cubic feet
- Dynamic chart axis updates
- Persistent user preference storage

### 3. Tank Air Remaining Simulation
- Real-time air consumption calculation
- Inputs: depth, SAC rate, bottom time, tank specifications
- Outputs: air used, remaining air, remaining pressure
- Integration with dive profile display

### 4. Run Time Table + Segment Consumption
- Detailed air consumption breakdown by dive segments
- Tabular display of time and air usage per phase
- Integration with existing dive profile calculations

### 5. Dive Routes Information Page
- New navigation tab: "Dive Routes"
- Curated list of world-famous dive sites
- Site information: location, country, difficulty rating
- Integration with Turkish Airlines dive packages

### 6. Interactive World Map with Dive Sites
- Leaflet.js implementation (API-free)
- Static JSON data source for dive locations
- Interactive markers with site information
- Integration with Dive Routes page

## Development Guidelines
- Preserve all existing functionality during feature additions
- Use modular, commented, testable code
- Implement progressive enhancement
- Maintain responsive design principles
- Follow existing code patterns and naming conventions

## File Structure
```
├── app.py                 # Main Flask application
├── models.py              # Database models
├── main.py               # Application entry point
├── technical_diving.py    # Technical diving calculations
├── templates/            # HTML templates
├── static/
│   ├── js/              # JavaScript modules
│   ├── css/             # Stylesheets
│   └── images/          # Static assets
└── attached_assets/     # User-provided assets
```

## User Preferences
- Language: English (translated from Turkish)
- Unit System: Metric (default), Imperial support needed
- Cryptocurrency addresses: XRP and USDT TRC20 visible on all pages
- Navigation: Functional Saved Plans and Technical Diving sections

## Recent Development Progress
✅ **Phase 1 Complete - Foundational Features:**
- Implemented complete Metric/Imperial unit toggle system
- Added decompression calculation explanations to dive results
- Developed tank air remaining simulation with detailed consumption tracking
- Built run time table showing segment-by-segment dive breakdown
- Created World Dive Routes page with 8+ famous dive sites
- Added dive site integration for seamless planning workflow

## Next Development Priority  
1. Integrate Leaflet.js interactive world map
2. Add marine life database with dive site species information
3. Implement weather integration for dive site conditions
4. Develop advanced gas mixture planning tools
5. Create dive log export functionality
6. Add social sharing features for dive plans

## Database Status
- PostgreSQL endpoint currently disabled (Neon.tech)
- Application runs successfully with database fallback mechanism
- Local storage used for offline functionality