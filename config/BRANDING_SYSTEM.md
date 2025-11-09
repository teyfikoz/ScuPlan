# ScuPlan White Label Branding System

## Overview

The ScuPlan white label branding system allows complete customization of the application's appearance and branding without touching any code. This system supports:

- **Default configuration** from `config/branding.json`
- **Client-specific configurations** from `config/clients/{client-name}.json`
- **Environment variable overrides** for deployment-specific settings
- **Runtime API access** via `window.branding` in JavaScript

## Architecture

### Configuration Priority (Highest to Lowest)

```
Environment Variables
        ↓
Client-Specific Config (config/clients/{client-name}.json)
        ↓
Default Config (config/branding.json)
```

### System Components

1. **config/branding.json** - Default branding configuration
2. **static/js/branding.js** - Client-side branding loader and applier
3. **app.py** - Server-side branding config loader and injector
4. **config/clients/** - Directory for client-specific configurations

## Quick Start

### Option 1: Environment Variables Only

Set environment variables to customize branding:

```bash
export BRAND_NAME="DivePro"
export BRAND_COLOR_PRIMARY="#1e40af"
export BRAND_COLOR_SECONDARY="#059669"
export BRAND_XRP_ADDRESS="rYourXRPAddress..."
```

Restart the application and your branding is applied!

### Option 2: Client-Specific Configuration

1. Create a client config file:

```bash
# Create config/clients/acme-diving.json
{
  "brandName": "ACME Diving",
  "tagline": "Professional Dive Solutions",
  "colors": {
    "primary": "#1e40af",
    "secondary": "#059669"
  },
  "copyright": "ACME Corp"
}
```

2. Set the CLIENT_NAME environment variable:

```bash
export CLIENT_NAME=acme-diving
```

3. Restart the application.

### Option 3: Hybrid Approach

Combine client config with environment overrides:

```bash
export CLIENT_NAME=acme-diving
export BRAND_COLOR_PRIMARY="#ff0000"  # Override just the primary color
```

## Configuration Reference

### Complete Branding Configuration Structure

```json
{
  "brandName": "ScuPlan",
  "logo": "data:image/svg+xml,...",
  "tagline": "Advanced Dive Planning",
  "copyright": "Teyfik ÖZ",
  "colors": {
    "primary": "#0b6bff",
    "secondary": "#00a6c7",
    "primaryHover": "#0952cc",
    "secondaryHover": "#008fa8"
  },
  "crypto": {
    "xrp": "rPu9SuQBv9ZWXGBaUgaHJ1PauSj98arjbV",
    "usdt": "TJoUFBDEFXMPgdZ2yj8yBXCo7TURfiZ3hQ"
  },
  "contact": {
    "email": "info@example.com",
    "website": "https://example.com"
  },
  "meta": {
    "title": "ScuPlan - Advanced Dive Planning",
    "description": "Professional dive planning application",
    "keywords": "dive planner, scuba diving, technical diving"
  },
  "social": {
    "twitter": "@ScuPlan",
    "linkedin": "https://linkedin.com/in/username"
  }
}
```

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `CLIENT_NAME` | Client config file to load | `acme-diving` |
| `BRAND_NAME` | Brand name | `DivePro` |
| `BRAND_LOGO_URL` | Logo URL or data URI | `https://example.com/logo.png` |
| `BRAND_TAGLINE` | Tagline text | `Professional Dive Solutions` |
| `BRAND_COPYRIGHT` | Copyright text | `ACME Corp` |
| `BRAND_COLOR_PRIMARY` | Primary color (hex) | `#1e40af` |
| `BRAND_COLOR_SECONDARY` | Secondary color (hex) | `#059669` |
| `BRAND_XRP_ADDRESS` | XRP crypto address | `rExample...` |
| `BRAND_USDT_ADDRESS` | USDT crypto address | `TExample...` |
| `BRAND_EMAIL` | Contact email | `info@example.com` |
| `BRAND_WEBSITE` | Website URL | `https://example.com` |

## How It Works

### Server-Side (Flask)

1. **Load Default Config** - Reads `config/branding.json`
2. **Apply Client Config** - If `CLIENT_NAME` is set, loads and merges `config/clients/{CLIENT_NAME}.json`
3. **Apply Environment Overrides** - Merges environment variables with highest priority
4. **Inject into HTML** - Injects final config as `window.__SCUPLAN_CONFIG__` in the HTML

### Client-Side (JavaScript)

1. **Load branding.js** - Script loads before router initialization
2. **Fetch Default Config** - Makes request to `/config/branding.json`
3. **Merge Server Config** - Merges `window.__SCUPLAN_CONFIG__` if present
4. **Apply Branding** - Updates:
   - CSS custom properties (colors)
   - DOM elements (brand name, logo, footer)
   - Meta tags (title, description)
   - Crypto addresses
5. **Expose API** - Makes branding accessible via `window.branding`

## JavaScript API

### Accessing Branding Configuration

```javascript
// Get entire config
const config = window.branding.getConfig();

// Get specific value
const brandName = window.branding.get('brandName');
const primaryColor = window.branding.get('colors.primary');
const xrpAddress = window.branding.get('crypto.xrp');
```

### Updating Branding at Runtime

```javascript
// Update a single value
window.branding.update('brandName', 'New Brand');

// Update nested value
window.branding.update('colors.primary', '#ff0000');

// Updates are automatically applied to the page
```

### Reset to Defaults

```javascript
// Reset all branding to default configuration
window.branding.reset();
```

### Listen for Branding Events

```javascript
// Listen for when branding is loaded
window.addEventListener('brandingLoaded', (event) => {
  console.log('Branding loaded:', event.detail.config);
});
```

## Customization Examples

### Example 1: Blue Theme with Custom Logo

```json
{
  "brandName": "BlueDive",
  "logo": "https://example.com/logo.png",
  "colors": {
    "primary": "#0066cc",
    "secondary": "#0099ff"
  }
}
```

### Example 2: Green Conservation Theme

```json
{
  "brandName": "EcoDive",
  "tagline": "Sustainable Diving Solutions",
  "colors": {
    "primary": "#059669",
    "secondary": "#10b981"
  },
  "copyright": "EcoDive Conservation"
}
```

### Example 3: Professional Dark Theme

```json
{
  "brandName": "ProDive",
  "colors": {
    "primary": "#1e40af",
    "secondary": "#1e3a8a",
    "primaryHover": "#1e3a8a",
    "secondaryHover": "#1e3a7a"
  }
}
```

## Deployment Scenarios

### Scenario 1: Single Client Deployment

For a single client, use environment variables in production:

```bash
# Set in Replit Secrets or .env
BRAND_NAME=ClientName
BRAND_COLOR_PRIMARY=#customcolor
BRAND_XRP_ADDRESS=rClientAddress
```

### Scenario 2: Multi-Client Deployment

For multiple clients on the same codebase:

1. Create client configs in `config/clients/`
2. Set `CLIENT_NAME` environment variable per deployment
3. Deploy same codebase to different environments

### Scenario 3: Development vs Production

Use environment variables to override config per environment:

```bash
# Development
export BRAND_NAME="ScuPlan DEV"
export BRAND_COLOR_PRIMARY="#ff6600"

# Production
export BRAND_NAME="ScuPlan"
export BRAND_COLOR_PRIMARY="#0b6bff"
```

## Testing Your Configuration

### 1. Verify Config Loading

Check browser console for branding logs:

```
Branding script loaded
Initializing BrandingManager...
Default branding config loaded: {...}
Merging server-injected config: {...}
Applying branding...
Theme colors updated: {...}
Brand name updated to: YourBrand
Branding applied successfully
```

### 2. Test Config Endpoint

```bash
curl http://localhost:5000/config/branding.json
```

Should return your merged configuration.

### 3. Inspect in Browser Console

```javascript
// Check loaded config
window.branding.getConfig()

// Check specific values
window.branding.get('brandName')
window.branding.get('colors.primary')
```

### 4. Visual Verification

- Check that brand name appears in header
- Verify colors are applied to buttons and theme
- Confirm crypto addresses in footer
- Verify logo is displayed (if configured)

## Troubleshooting

### Issue: Branding not loading

**Solution:** Check browser console for errors. Verify:
- `branding.js` is loaded before router initialization
- `/config/branding.json` route returns valid JSON
- `window.__SCUPLAN_CONFIG__` is injected in HTML

### Issue: Some fields not updating

**Solution:** Ensure:
- Field names match exactly (case-sensitive)
- JSON is valid (use a validator)
- Configuration priority is correct (env vars override everything)

### Issue: Colors not applying

**Solution:** Verify:
- Hex color format includes `#`
- CSS custom properties are defined in styles
- Page is refreshed after config changes

### Issue: Logo not showing

**Solution:** Check:
- URL is accessible (CORS enabled if external)
- Data URI is properly encoded
- Logo elements exist in DOM with correct selectors

## Advanced Usage

### Custom Logo with SVG Data URI

Generate SVG data URI for inline logos:

```javascript
// SVG content
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="#0066cc"/>
</svg>`;

// Encode to data URI
const dataUri = `data:image/svg+xml,${encodeURIComponent(svg)}`;

// Use in config
{
  "logo": dataUri
}
```

### Dynamic Branding Updates

For applications that need to change branding at runtime:

```javascript
// Load different client config
async function switchBranding(clientName) {
  const response = await fetch(`/config/clients/${clientName}.json`);
  const clientConfig = await response.json();
  
  // Apply each config value
  Object.keys(clientConfig).forEach(key => {
    window.branding.update(key, clientConfig[key]);
  });
}

// Switch to different client
switchBranding('acme-diving');
```

### Integration with Theme Manager

The branding system works seamlessly with the existing ThemeManager:

```javascript
// Branding updates CSS custom properties
// ThemeManager can still switch between light/dark/underwater themes
window.themeManager.setTheme('dark'); // Works with custom brand colors
```

## Best Practices

1. **Keep client configs minimal** - Only include fields that differ from defaults
2. **Use environment variables for secrets** - Don't commit sensitive data to client configs
3. **Test locally first** - Verify config before deploying to production
4. **Document custom configs** - Add comments to client configs explaining choices
5. **Version control** - Keep client configs in version control for tracking
6. **Use consistent naming** - Follow naming conventions for client config files
7. **Validate colors** - Ensure hex colors are accessible and meet contrast requirements

## Security Notes

- Client configs are publicly accessible via `/config/branding.json`
- Do not store sensitive data in branding configs
- Logo URLs should be HTTPS to avoid mixed content warnings
- Validate all user-provided branding data before applying

## Support

For issues or questions about the branding system:
- Check browser console for error messages
- Verify configuration files are valid JSON
- Test with default config first, then add customizations
- Review this documentation for common scenarios

## License

This branding system is part of ScuPlan and follows the same license.
