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

✓ **Dive Education & Calculations**: 
  - Interactive dive theory education with collapsible accordions
  - Complete physics of diving (Boyle's, Dalton's, Henry's Laws, Archimedes)
  - Decompression theory and safety stop explanations
  - Dive planning essentials with NDL tables and gas planning
  - Emergency procedures and equipment protocols
  - Environmental awareness and marine conservation
  - NDL time calculator with residual nitrogen tracking
  - Surface interval calculator for repetitive dives
  - Buoyancy weight calculator (fresh vs salt water)
  - Gas mixture calculators with MOD calculations
  - SAC rate and gas consumption calculators
  - Live dive simulator with profile visualization
  - Comprehensive zero-cost AI chatbot (100+ diving topics)
  - Full metric/imperial unit system support throughout

✓ **World Dive Routes**: 
  - 29 comprehensive dive locations worldwide
  - Interactive Leaflet.js map with clustering
  - Advanced search and filtering system
  - Detailed site information and planning integration

✓ **Metric/Imperial Unit System**: 
  - User-selectable toggle (persistent preference)
  - Live conversion of input values when toggling
  - Chart axis and result display updates
  - Comprehensive depth, pressure, and volume conversions

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
✓ **SIMPLIFIED: Removed metric/imperial unit toggle for better UX consistency**
✓ **FIXED: Date field initialization with English format (dd.mm.yyyy)**
✓ **UPDATED: Comprehensive 29 world-famous dive locations dataset**
✓ **ENHANCED: Interactive map with all new dive sites and proper clustering**
✓ **FIXED: Map search functionality now working with live filtering**
✓ **IMPLEMENTED: Complete "Dive Education & Calculations" section with zero-cost AI**
✓ **ENHANCED: Decompression stops display with proper debugging and unit formatting**
✓ **OPTIMIZED: SEO settings for better search engine discoverability**

## Latest Enhancements (August 15, 2025)
✓ **SIMPLIFIED: Removed metric/imperial toggle - system now uses metric units only**
✓ **FIXED: Decompression stops display with proper console logging and unit formatting**  
✓ **ENHANCED: Unit converter with cubic feet ↔ liters conversion capability**
✓ **IMPLEMENTED: Comprehensive SEO optimization with meta tags, Open Graph, Twitter Cards**
✓ **ADDED: JSON-LD structured data for better search engine understanding**
✓ **IMPROVED: Enhanced dive profile chart with decompression stop annotations**
✓ **COMPLETED: All calculator default values now use metric system (18m depth, 20L SAC rate)**
✓ **FIXED: Clean dive routes template with working interactive map functionality**
✓ **ENHANCED: Comprehensive AI assistant with technical diving knowledge base**
✓ **REMOVED: Imperial system completely eliminated - only metric system supported**
✓ **FIXED: All unit conversion dependencies removed from codebase**
✓ **EXPANDED: Comprehensive Mediterranean dive sites database (30 locations)**
✓ **ADDED: Turkish dive sites (Bodrum, Kas, Antalya, Gallipoli)**
✓ **ADDED: Greek dive sites (Santorini, Zakynthos, Crete, Rhodes)**
✓ **ADDED: Italian dive sites (Ustica, Capri, Elba, Cinque Terre)**
✓ **ADDED: Spanish dive sites (Costa Brava, Ibiza, Mallorca)**
✓ **ADDED: Croatian Adriatic sites (Kornati, Vis, Pula wrecks)**
✓ **ADDED: Cyprus, Malta, French dive sites**
✓ **FIXED: Map search functionality with proper no-results handling**
✓ **ENHANCED: Interactive map with clustering and detailed popups**
✓ **NEW: 🐠 Playful Marine Life Interaction Tooltips**
✓ **NEW: 🎧 Underwater Ambient Sound Customization**
✓ **ADDED: 6 immersive sound themes (tropical, deep ocean, cave, wreck, night dive, current)**
✓ **ADDED: Interactive marine creatures with educational facts**
✓ **ADDED: Random marine life appearances with sound effects**

## Zero-Cost Offline Education Features (August 2025)
✓ **Comprehensive Dive Theory**: 6 major sections with interactive accordions
✓ **Advanced Calculators**: NDL, surface interval, buoyancy, gas mix, SAC rate
✓ **Zero-Cost AI Chatbot**: 100+ rule-based responses covering all diving topics
✓ **Physics Simulations**: Interactive pressure simulator with real-time visualization  
✓ **Live Dive Simulator**: Animated dive profiles with air consumption tracking
✓ **Complete Offline Capability**: Works without internet after initial load
✓ **Full Unit System Support**: Metric/Imperial toggle throughout education module

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