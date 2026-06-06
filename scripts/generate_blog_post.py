#!/usr/bin/env python3
"""
Weekly blog post generator for ScuPlan.
Uses HuggingFace Inference API (Llama-3.1-8B-Instruct) to generate SEO-optimized
scuba diving articles and publishes them to the database.

Cron job (runs every Monday at 08:00 server time):
    0 8 * * 1 /var/www/scuplan/venv/bin/python /var/www/scuplan/scripts/generate_blog_post.py >> /var/log/scuplan-blog.log 2>&1
"""

import os
import sys
import json
import re
import logging
from datetime import datetime
import urllib.request
import urllib.error

# ── Path setup ────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
sys.path.insert(0, PROJECT_DIR)

from dotenv import load_dotenv
load_dotenv(os.path.join(PROJECT_DIR, '.env'))

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# ── Topic pool (slug, title) ──────────────────────────────────────────────────
# The script picks the first topic whose slug is not yet in the database.
# Add new topics here to keep the content pipeline filled.
TOPICS = [
    ("nitrox-diving-complete-guide",
     "Nitrox Diving: Complete Guide to Enriched Air Scuba Diving"),
    ("dive-computer-buying-guide-2026",
     "How to Choose a Dive Computer in 2026: Features, Brands & Price Ranges"),
    ("cold-water-scuba-diving-tips",
     "Cold Water Scuba Diving: Essential Safety Tips and Gear Guide"),
    ("buoyancy-control-mastery",
     "Mastering Buoyancy Control: The Key Skill Every Diver Must Develop"),
    ("best-dive-sites-red-sea",
     "Best Dive Sites in the Red Sea: A Diver's Complete Guide"),
    ("night-diving-guide",
     "Night Diving Guide: Techniques, Safety, and What to Expect"),
    ("padi-vs-ssi-vs-naui-certification",
     "PADI vs SSI vs NAUI: Which Scuba Certification Should You Get?"),
    ("underwater-photography-beginners",
     "Underwater Photography for Beginners: Getting Started Guide"),
    ("wreck-diving-introduction",
     "Introduction to Wreck Diving: Safety, Certification, and Top Wrecks"),
    ("freediving-vs-scuba-diving",
     "Freediving vs Scuba Diving: Key Differences and Which to Learn First"),
    ("coral-reef-conservation-divers",
     "How Scuba Divers Can Help Protect Coral Reefs"),
    ("deep-dive-planning-decompression",
     "Deep Dive Planning: Decompression Stops, Gas Management, and Safety Rules"),
    ("scuba-gear-maintenance-guide",
     "Scuba Gear Maintenance: Annual Service Checklist and DIY Care Tips"),
    ("altitude-diving-complete-guide",
     "Altitude Diving: Rules, Dive Tables, and Safety at High Elevation"),
    ("shark-diving-safety-guide",
     "Is Shark Diving Safe? Complete Guide for First-Time Shark Divers"),
    ("dry-suit-diving-beginners",
     "Dry Suit Diving: Beginner's Complete Guide to Cold Water Immersion Suits"),
    ("scuba-dive-insurance-guide",
     "Dive Insurance Guide: DAN, PADI DiveAssure, and What Coverage You Need"),
    ("seasickness-prevention-divers",
     "Seasickness for Scuba Divers: Prevention, Remedies, and What to Avoid"),
    ("marine-life-identification-guide",
     "Common Marine Life Identification Guide for Scuba Divers"),
    ("dive-travel-packing-list",
     "Ultimate Scuba Diving Travel Packing List: Gear, Documents, and Tips"),
    ("nitrogen-narcosis-diving",
     "Nitrogen Narcosis: Understanding the Risks of Deep Recreational Diving"),
    ("decompression-sickness-prevention",
     "Decompression Sickness: Causes, Prevention, and What To Do If It Happens"),
    ("cavern-vs-cave-diving",
     "Cavern vs Cave Diving: Differences, Training Requirements, and Safety"),
    ("scuba-fitness-requirements",
     "Scuba Diving Fitness: Medical Requirements and Physical Preparation"),
    ("liveaboard-diving-guide",
     "Liveaboard Diving Guide: What to Expect on Your First Dive Cruise"),
]

HF_API_URL = "https://router.huggingface.co/v1/chat/completions"
HF_MODEL = "meta-llama/Llama-3.1-8B-Instruct"


def get_next_topic(session) -> tuple[str, str] | tuple[None, None]:
    """Return the first unpublished topic from the pool."""
    from models import BlogPost
    existing = {row[0] for row in session.query(BlogPost.slug).all()}
    for slug, title in TOPICS:
        if slug not in existing:
            return slug, title
    # All topics covered — add year suffix for refresh cycle
    year = datetime.now().year
    for slug, title in TOPICS:
        refreshed = f"{slug}-{year}"
        if refreshed not in existing:
            return refreshed, f"{title} ({year} Update)"
    return None, None


def call_hf_api(title: str) -> dict | None:
    """
    Generate structured article JSON via HuggingFace Inference API.
    Returns parsed dict or None on failure.
    """
    token = os.environ.get("HF_API_TOKEN", "").strip()
    if not token:
        logger.error("HF_API_TOKEN is not set in .env")
        return None

    prompt = f"""You are an expert scuba diving content writer creating SEO-optimized articles for ScuPlan (scuplan.com), a free professional dive planning platform.

Write a comprehensive, high-quality, factually accurate article about:
"{title}"

Return your response as valid JSON with EXACTLY this structure (no other text):
{{
  "meta_description": "SEO description, max 155 characters",
  "keywords": "comma-separated SEO keywords, 8-12 terms",
  "read_time": "X min read",
  "category": "one of: Safety, Beginner, Equipment, Advanced, Travel, Conservation",
  "category_color": "one of: danger, primary, success, warning, info, secondary",
  "intro": "A 2-3 sentence introduction that hooks the reader and summarizes the article.",
  "sections": [
    {{
      "heading": "Section heading (use H2-level language)",
      "content": "3-5 sentences of accurate, practical content for scuba divers.",
      "tip": "A single short quick tip or key takeaway (optional, can be null)"
    }}
  ],
  "conclusion": "A 2-3 sentence conclusion that summarizes key takeaways and encourages safe diving.",
  "faq": [
    {{"q": "A frequently asked question about this topic?", "a": "A clear, helpful answer."}}
  ]
}}

Requirements:
- Include 5-7 sections
- Include 2-3 FAQ items
- All content must be safety-conscious, accurate, and practical for recreational and technical divers
- Do NOT include markdown formatting inside the JSON strings
- Return ONLY the JSON object, starting with {{ and ending with }}"""

    payload = json.dumps({
        "model": HF_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 2500,
        "temperature": 0.7,
        "stream": False
    }).encode("utf-8")

    req = urllib.request.Request(
        HF_API_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            raw = result["choices"][0]["message"]["content"].strip()
    except urllib.error.HTTPError as e:
        logger.error(f"HF API HTTP error {e.code}: {e.read().decode()[:300]}")
        return None
    except Exception as e:
        logger.error(f"HF API call failed: {e}")
        return None

    # Extract JSON if wrapped in markdown code blocks
    json_match = re.search(r'```(?:json)?\s*([\s\S]+?)\s*```', raw)
    if json_match:
        raw = json_match.group(1)
    # Find first { ... last } in case of surrounding text
    start = raw.find('{')
    end = raw.rfind('}')
    if start != -1 and end != -1:
        raw = raw[start:end + 1]

    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse failed: {e}\nRaw response (first 500 chars): {raw[:500]}")
        return None


def publish_post(title: str, slug: str, data: dict, session) -> None:
    """Insert a BlogPost row into the database."""
    from models import BlogPost

    post = BlogPost(
        slug=slug,
        title=title,
        meta_description=data.get("meta_description", "")[:160],
        keywords=data.get("keywords", ""),
        category=data.get("category", "General"),
        category_color=data.get("category_color", "primary"),
        read_time=data.get("read_time", "8 min read"),
        intro=data.get("intro", ""),
        sections_json=json.dumps(data.get("sections", []), ensure_ascii=False),
        conclusion=data.get("conclusion", ""),
        faq_json=json.dumps(data.get("faq", []), ensure_ascii=False),
        published=True,
        ai_generated=True,
        created_at=datetime.now(),
    )
    session.add(post)
    session.commit()
    logger.info(f"Published: /blog/{slug}")


def main() -> int:
    from app import app, db

    with app.app_context():
        slug, title = get_next_topic(db.session)
        if not slug:
            logger.info("All topics already published. Nothing to do.")
            return 0

        logger.info(f"Generating article: [{slug}] {title}")
        data = call_hf_api(title)

        if not data:
            logger.error("Article generation failed — aborting.")
            return 1

        # Validate minimal required fields
        if not data.get("sections"):
            logger.error("Generated article has no sections — aborting.")
            return 1

        publish_post(title, slug, data, db.session)
        logger.info(f"Done. New post live at: https://scuplan.com/blog/{slug}")
        return 0


if __name__ == "__main__":
    sys.exit(main())
