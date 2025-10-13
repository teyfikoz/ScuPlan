# ScuPlan SPA - Single Page Application

## 🚀 Overview

ScuPlan SPA is a modern, offline-first Progressive Web Application (PWA) for dive planning, built with pure HTML, Tailwind CSS, and Vanilla JavaScript - **zero backend dependencies**.

## ✨ Features

### Core Functionality
- ✅ **Dive Planner**: Calculate dive profiles with gas consumption, decompression stops
- ✅ **Technical Diving Calculators**: MOD, END, CNS, Best Mix
- ✅ **Multi-Tank Management**: Configure and track multiple gas mixes
- ✅ **Interactive Checklists**: Pre-dive, Post-dive, Emergency procedures
- ✅ **World Dive Routes**: Interactive Leaflet map with 8+ famous dive sites
- ✅ **Dive Education**: Physics laws, decompression theory, dive planning essentials
- ✅ **Offline Storage**: IndexedDB for saving dive plans locally

### Advanced Features
- ✅ **Metric ↔ Imperial Toggle**: Live unit conversion across entire app
- ✅ **PDF Export**: Download dive plans with jsPDF
- ✅ **QR Code Sharing**: Share plans via QR code
- ✅ **PWA Support**: Offline-first with service worker
- ✅ **Multi-Theme**: Light, Dark, Underwater themes
- ✅ **SEO Optimized**: Full meta tags, OpenGraph, Twitter Cards, JSON-LD
- ✅ **AdSense Ready**: Ad slot placeholders for monetization
- ✅ **White-Label Config**: Customizable via siteConfig object

## 📁 File Structure

```
.
├── spa.html              # Main SPA application (self-contained)
├── manifest.json         # PWA manifest
├── service-worker.js     # Offline caching service worker
└── SPA-README.md        # This file
```

## 🔧 Configuration

### White-Label Customization

Edit the `siteConfig` object in `spa.html`:

```javascript
window.siteConfig = {
    title: "ScuPlan",
    tagline: "Advanced Dive Planning",
    theme: {
        primary: "#0056b3",
        secondary: "#6c757d",
        accent: "#ffc107"
    },
    email: "your-email@example.com",
    linkedin: "https://linkedin.com/in/your-profile",
    wallets: {
        xrp: "your-xrp-address",
        usdt_trc20: "your-usdt-address"
    }
};
```

### AdSense Integration

Replace placeholder ad slots in the HTML:

```html
<div id="ad-header" data-ad-slot="YOUR-AD-SLOT-ID"></div>
```

## 📱 Usage

### Local Development

1. **Open directly in browser**:
   ```bash
   # Simply open spa.html in your browser
   open spa.html
   ```

2. **Use a local server** (recommended for PWA testing):
   ```bash
   # Python
   python -m http.server 8000
   
   # Node.js
   npx http-server
   
   # PHP
   php -S localhost:8000
   ```

3. **Access**: Navigate to `http://localhost:8000/spa.html`

### Deployment

#### Vercel
```bash
vercel --prod
```

#### Netlify
```bash
netlify deploy --prod --dir .
```

#### Replit
1. Upload `spa.html`, `manifest.json`, `service-worker.js`
2. Set index file to `spa.html`
3. Click Run

## 🧭 Navigation

### Hash-based Routing

All navigation uses hash anchors:
- `#dive-planner` - Main dive planning calculator
- `#checklist` - Dive checklists
- `#technical-diving` - MOD, END, CNS, Best Mix calculators
- `#dive-routes` - Interactive world map
- `#dive-education` - Diving theory and physics
- `#saved-plans` - Locally saved dive plans

### Deep Linking

Share specific sections:
```
https://yourdomain.com/spa.html#technical-diving
https://yourdomain.com/spa.html#dive-routes
```

## 🔄 Unit System

Toggle between Metric and Imperial:
- **Metric**: meters, bar, liters, kg
- **Imperial**: feet, psi, cubic feet, lbs

Units persist in localStorage and convert all inputs/outputs live.

## 💾 Offline Support

### Service Worker Caching

The app uses a **cache-first** strategy:
1. Critical files precached on install
2. External CDN resources cached on first use
3. Works completely offline after first load

### Clearing Cache

```javascript
// From browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.unregister());
});
```

## 📊 Data Management

### Embedded Data

All data is embedded in the HTML:
- **Dive Sites**: 8 famous locations worldwide
- **Checklists**: Pre/Post/Emergency procedures
- **Physics**: Boyle's, Dalton's, Henry's, Archimedes' laws
- **Conversions**: Metric/Imperial factors

### Storage

- **localStorage**: Unit preferences, theme, checklist states
- **IndexedDB**: Saved dive plans (offline persistent)

## 🎨 Themes

Three built-in themes:
1. **Light**: Default, clean white background
2. **Dark**: Dark mode with high contrast
3. **Underwater**: Blue gradient ocean theme

Toggle via dropdown in header, persists in localStorage.

## 📈 SEO & Meta Tags

Fully optimized for search engines:
- ✅ Title, description, keywords
- ✅ OpenGraph (Facebook)
- ✅ Twitter Cards
- ✅ JSON-LD structured data
- ✅ Canonical URL

## 🔐 Security

- No external API keys required
- All processing client-side
- No user data sent to servers
- Crypto wallet addresses display-only

## 🐛 Troubleshooting

### PWA Not Installing
1. Must use HTTPS (or localhost)
2. Check manifest.json is accessible
3. Verify service worker registration in DevTools

### Map Not Loading
- Check internet connection for initial tile download
- Tiles cached after first view for offline use

### Unit Conversion Issues
- Clear localStorage: `localStorage.clear()`
- Refresh page
- Toggle unit system twice

## 📝 Credits

**Developer**: Teyfik ÖZ  
**Email**: teyfikoz@yahoo.com  
**LinkedIn**: [linkedin.com/in/teyfik-ö-a3953935](https://linkedin.com/in/teyfik-ö-a3953935)

### Technologies Used
- Tailwind CSS (via CDN)
- Leaflet.js (mapping)
- Chart.js (dive profiles)
- jsPDF (PDF export)
- QRCode.js (sharing)
- Font Awesome (icons)

## ⚠️ Disclaimer

This application is for **planning purposes only**. Always:
- Use proper dive computers during dives
- Follow your certification training
- Plan with qualified dive professionals
- Never dive beyond your training level

## 📄 License

© 2025 ScuPlan. All rights reserved.

---

**Need help?** Contact: teyfikoz@yahoo.com