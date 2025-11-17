"""
White Label Configuration for ScuPlan
Allows customization of branding, colors, and monetization features
"""

import os
import json

class WhiteLabelConfig:
    """White label configuration manager"""

    def __init__(self):
        self.config_file = 'whitelabel_settings.json'
        self.config = self.load_config()

    def load_config(self):
        """Load white label configuration from file"""
        default_config = {
            # Branding
            'app_name': 'ScuPlan',
            'app_tagline': 'Free Scuba Diving Planner & Calculator',
            'logo_url': '/static/images/logo.png',
            'favicon_url': '/static/images/favicon.ico',

            # Colors
            'primary_color': '#0066cc',
            'secondary_color': '#00aaff',
            'accent_color': '#ff6600',

            # Footer
            'show_footer_credits': True,
            'footer_text': 'ScuPlan. All rights reserved.',
            'custom_footer_html': '',

            # Monetization
            'adsense_enabled': False,  # Set to True when you have a real AdSense account
            'adsense_client_id': 'ca-pub-XXXXXXXXXXXXXXXXX',
            'adsense_slots': {
                'main_content': '1234567890',
                'footer': '0987654321',
                'sidebar': '1122334455'
            },

            # White Label Features (Premium)
            'white_label_enabled': False,
            'remove_branding': False,
            'custom_domain': '',

            # Analytics
            'google_analytics_id': '',

            # Contact & Support
            'support_email': 'teyfikoz@yahoo.com',
            'social_links': {
                'linkedin': 'https://www.linkedin.com/in/teyfikoz',
                'twitter': '',
                'facebook': ''
            },

            # API Keys (for premium features)
            'api_keys': {
                'weather': '',
                'maps': '',
                'marine_life': ''
            }
        }

        # Try to load from file
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r') as f:
                    loaded_config = json.load(f)
                    # Merge with defaults
                    default_config.update(loaded_config)
            except Exception as e:
                print(f"Error loading white label config: {e}")

        return default_config

    def save_config(self):
        """Save configuration to file"""
        try:
            with open(self.config_file, 'w') as f:
                json.dump(self.config, f, indent=4)
            return True
        except Exception as e:
            print(f"Error saving white label config: {e}")
            return False

    def get(self, key, default=None):
        """Get a configuration value"""
        keys = key.split('.')
        value = self.config

        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default

        return value

    def set(self, key, value):
        """Set a configuration value"""
        keys = key.split('.')
        config = self.config

        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]

        config[keys[-1]] = value
        return self.save_config()

    def to_dict(self):
        """Return configuration as dictionary"""
        return self.config.copy()

# Global instance
whitelabel_config = WhiteLabelConfig()

def get_config():
    """Get the global white label configuration"""
    return whitelabel_config
