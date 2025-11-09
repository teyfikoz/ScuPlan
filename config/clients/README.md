# Client-Specific Branding Configurations

This directory contains client-specific branding configurations for white-label deployments of ScuPlan.

## How It Works

The branding system loads configurations in the following priority order:

1. **Default Configuration** (`config/branding.json`) - Base configuration
2. **Client-Specific Configuration** (`config/clients/{client-name}.json`) - Client overrides
3. **Environment Variables** - Highest priority overrides

## Setting Up a Client Configuration

### Step 1: Create Client Config File

Create a new JSON file in this directory with your client's name:
```
config/clients/my-client.json
```

### Step 2: Define Client Branding

Copy the structure from `example-client.json` and customize:

```json
{
  "brandName": "YourBrand",
  "tagline": "Your Tagline",
  "copyright": "Your Company Name",
  "colors": {
    "primary": "#your-primary-color",
    "secondary": "#your-secondary-color"
  },
  "crypto": {
    "xrp": "your-xrp-address",
    "usdt": "your-usdt-address"
  },
  "contact": {
    "email": "your@email.com",
    "website": "https://yourwebsite.com"
  }
}
```

### Step 3: Set Environment Variable

Set the `CLIENT_NAME` environment variable to match your config filename (without .json):

```bash
export CLIENT_NAME=my-client
```

Or in Replit Secrets:
```
CLIENT_NAME = my-client
```

## Environment Variable Overrides

You can override specific branding elements using environment variables (highest priority):

### Available Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `CLIENT_NAME` | Client config file to load | `my-client` |
| `BRAND_NAME` | Brand name | `DivePro` |
| `BRAND_LOGO_URL` | Logo URL or data URI | `https://example.com/logo.png` |
| `BRAND_TAGLINE` | Tagline text | `Professional Dive Solutions` |
| `BRAND_COPYRIGHT` | Copyright text | `Example Corp` |
| `BRAND_COLOR_PRIMARY` | Primary color (hex) | `#1e40af` |
| `BRAND_COLOR_SECONDARY` | Secondary color (hex) | `#059669` |
| `BRAND_XRP_ADDRESS` | XRP crypto address | `rExample...` |
| `BRAND_USDT_ADDRESS` | USDT crypto address | `TExample...` |
| `BRAND_EMAIL` | Contact email | `info@example.com` |
| `BRAND_WEBSITE` | Website URL | `https://example.com` |

### Example Usage

```bash
# Use client config + override brand name
export CLIENT_NAME=my-client
export BRAND_NAME="Custom Name"
export BRAND_COLOR_PRIMARY="#ff0000"
```

## Configuration Priority

The system merges configurations with this priority (highest to lowest):

```
Environment Variables (highest)
    ↓
Client-Specific Config
    ↓
Default Config (lowest)
```

## Notes

- Only include the fields you want to override in client configs
- Missing fields will fall back to the default configuration
- Environment variables override everything
- Logo can be a URL or a data URI for inline SVG
- Colors must be valid hex color codes
- The system performs deep merging of nested objects

## Example Deployment Scenarios

### Scenario 1: Simple Client Override
```bash
export CLIENT_NAME=acme-diving
# Uses config/clients/acme-diving.json
```

### Scenario 2: Client Config + Color Override
```bash
export CLIENT_NAME=pro-divers
export BRAND_COLOR_PRIMARY="#0066cc"
# Uses pro-divers.json but overrides primary color
```

### Scenario 3: Environment Only (No Client File)
```bash
export BRAND_NAME="Custom Dive Planner"
export BRAND_COLOR_PRIMARY="#ff6600"
export BRAND_XRP_ADDRESS="rCustomAddress..."
# Uses default config with environment overrides
```

## Testing Your Configuration

1. Set your environment variables or CLIENT_NAME
2. Restart the application
3. Check browser console for branding logs
4. Verify the page displays your branding
5. Use `window.branding.getConfig()` in console to see active config

## Troubleshooting

- **Branding not loading:** Check that your JSON file is valid (use a JSON validator)
- **Some fields not updating:** Ensure field names match exactly (case-sensitive)
- **Colors not applying:** Verify hex color format (must include #)
- **Logo not showing:** Check that the URL is accessible or data URI is properly encoded
