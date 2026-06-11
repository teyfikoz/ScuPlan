"""
Affiliate configuration and product data for ScuPlan monetization.

Reads affiliate IDs from environment variables (.env) and exposes:
  - get_affiliate_context(): values injected into all templates
  - load_product_collections(): curated Amazon product showcases
  - amazon_url(): tagged Amazon links (direct ASIN or search fallback)
"""

import os
import json
import urllib.parse

STATIC_DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'data')
PRODUCTS_FILE = os.path.join(STATIC_DATA_DIR, 'affiliate_products.json')

_products_cache = None


def amazon_tag():
    """Amazon Associates tracking tag, e.g. scuplan-20."""
    return os.environ.get('AMAZON_AFFILIATE_TAG', 'scuplan-20').strip()


def amazon_url(product):
    """
    Build a tagged Amazon link for a product dict.
    Uses /dp/<ASIN> when an ASIN is configured; otherwise falls back to a
    search link (never 404s and still credits the 24h affiliate cookie).
    """
    tag = amazon_tag()
    asin = (product.get('asin') or '').strip()
    if asin:
        return f"https://www.amazon.com/dp/{asin}?tag={urllib.parse.quote(tag)}"
    query = product.get('search_query') or product.get('name', '')
    return ("https://www.amazon.com/s?k=" + urllib.parse.quote_plus(query)
            + "&tag=" + urllib.parse.quote(tag))


def liveaboard_url(path=''):
    """
    Tagged Liveaboard.com link. LIVEABOARD_AFFILIATE_ID is appended as a
    query param; leave it empty until your affiliate account is approved.
    """
    base = f"https://www.liveaboard.com/{path.lstrip('/')}"
    aff_id = os.environ.get('LIVEABOARD_AFFILIATE_ID', '').strip()
    if aff_id:
        sep = '&' if '?' in base else '?'
        base = f"{base}{sep}affiliate_id={urllib.parse.quote(aff_id)}"
    return base


def padi_url():
    """PADI eLearning affiliate deep link (Impact/CJ tracking URL)."""
    return os.environ.get(
        'PADI_AFFILIATE_URL',
        'https://www.padi.com/courses/open-water-diver'
    ).strip()


def load_product_collections():
    """Load curated product collections from static/data/affiliate_products.json."""
    global _products_cache
    if _products_cache is None:
        try:
            with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
                _products_cache = json.load(f)
        except Exception:
            _products_cache = {'collections': {}}
    return _products_cache


def get_collection(slug):
    """Return one collection (with tagged URLs resolved) or None."""
    data = load_product_collections()
    collection = data.get('collections', {}).get(slug)
    if not collection:
        return None
    resolved = dict(collection)
    resolved['slug'] = slug
    resolved['products'] = [
        {**p, 'url': amazon_url(p), 'go': f"/go/amazon/{slug}/{i}"}
        for i, p in enumerate(collection.get('products', []))
    ]
    return resolved


# Liveaboard destination slugs accepted by /go/liveaboard/<dest>
LIVEABOARD_DESTINATIONS = {
    'red-sea', 'maldives', 'indonesia', 'thailand', 'philippines',
    'galapagos-islands', 'australia', 'mexico', 'caribbean', 'egypt', 'turkey',
}


def resolve_outbound(target):
    """
    Map a named /go/<target> path to its affiliate URL.
    Only known targets resolve (never echoes user input) so the redirect
    route cannot be abused as an open redirect. Returns None when unknown.
    """
    if target == 'liveaboard':
        return liveaboard_url()
    if target == 'padi':
        return padi_url()
    if target.startswith('liveaboard/'):
        dest = target.split('/', 1)[1]
        if dest in LIVEABOARD_DESTINATIONS:
            return liveaboard_url(f'diving/{dest}')
        return liveaboard_url()
    if target.startswith('amazon/'):
        parts = target.split('/')
        if len(parts) == 3:
            collection = get_collection(parts[1])
            try:
                return collection['products'][int(parts[2])]['url'] if collection else None
            except (ValueError, IndexError):
                return None
    return None


def list_collections():
    """Return all collections with resolved URLs, sorted by configured order."""
    data = load_product_collections()
    slugs = sorted(
        data.get('collections', {}).keys(),
        key=lambda s: data['collections'][s].get('order', 99)
    )
    return [get_collection(slug) for slug in slugs]


def get_affiliate_context():
    """Template context: affiliate IDs and prebuilt high-ticket links."""
    return {
        'amazon_affiliate_tag': amazon_tag(),
        'liveaboard_url': liveaboard_url(),
        'liveaboard_search_base': liveaboard_url('diving'),
        'padi_affiliate_url': padi_url(),
        'affiliate_disclosure': (
            'ScuPlan is reader-supported. We may earn a commission when you '
            'buy through links on this page, at no extra cost to you.'
        ),
    }
