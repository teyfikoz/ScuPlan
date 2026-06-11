#!/usr/bin/env python3
"""
ScuPlan Blog Writer Agent — fully autonomous SEO article generator.

Pipeline (one run = one published article):
  1. Picks the next unpublished long-tail SEO topic from the pool below.
  2. Generates a structured article via Groq API (llama-3.3-70b-versatile).
  3. Weaves ScuPlan affiliate hooks into the content (Amazon gear mentions,
     Liveaboard/PADI CTAs are rendered by the site templates per category).
  4. Publishes to the database (instantly live at scuplan.com/blog/<slug>)
     and writes a Markdown archive copy to content/posts/.
  5. Optionally commits & pushes the Markdown archive (--push).

Cron (twice a week — Monday & Thursday 09:00):
    0 9 * * 1,4 /var/www/scuplan/venv/bin/python /var/www/scuplan/scripts/blog_writer_agent.py --push >> /var/log/scuplan-blog.log 2>&1

Required .env:
    GROQ_API_KEY=gsk_...        (free tier: console.groq.com)
Optional .env:
    GROQ_MODEL=llama-3.3-70b-versatile
    AMAZON_AFFILIATE_TAG, LIVEABOARD_AFFILIATE_ID, PADI_AFFILIATE_URL

Usage:
    python scripts/blog_writer_agent.py            # generate + publish next topic
    python scripts/blog_writer_agent.py --dry-run  # generate only, print JSON
    python scripts/blog_writer_agent.py --topic "Best Dive Sites in Kas Turkey"
    python scripts/blog_writer_agent.py --push     # also git-commit/push the .md archive
"""

import os
import sys
import json
import re
import argparse
import logging
import subprocess
from datetime import datetime
import urllib.request
import urllib.error

# ── Path setup ────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
sys.path.insert(0, PROJECT_DIR)

from dotenv import load_dotenv
load_dotenv(os.path.join(PROJECT_DIR, '.env'))

import affiliates  # noqa: E402  (after sys.path insert)

CONTENT_DIR = os.path.join(PROJECT_DIR, 'content', 'posts')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")

# ── Long-tail SEO topic pool ─────────────────────────────────────────────────
# (slug, title, category, intent)
# intent drives which affiliate block the site renders inside the article:
#   Travel    -> Liveaboard search box        ($100-300/sale)
#   Equipment -> Amazon product strip
#   Beginner  -> PADI eLearning CTA
TOPICS = [
    ("best-dive-sites-kas-turkey",
     "Best Dive Sites in Kaş, Turkey: A Complete Local Guide", "Travel"),
    ("ear-equalization-problems-scuba",
     "Ear Equalization Problems in Scuba Diving: Causes and Proven Fixes", "Beginner"),
    ("best-time-to-dive-red-sea",
     "Best Time of Year to Dive the Red Sea: Month-by-Month Guide", "Travel"),
    ("how-much-does-scuba-certification-cost",
     "How Much Does Scuba Certification Really Cost in 2026?", "Beginner"),
    ("dive-computer-vs-dive-tables",
     "Dive Computer vs Dive Tables: Which Should New Divers Learn?", "Equipment"),
    ("scuba-diving-with-glasses-contacts",
     "Scuba Diving with Glasses or Contact Lenses: All Your Options", "Beginner"),
    ("best-liveaboard-maldives-budget",
     "Best Budget Liveaboards in the Maldives: What $200/Day Gets You", "Travel"),
    ("how-deep-can-you-dive-open-water",
     "How Deep Can You Dive with an Open Water Certification?", "Beginner"),
    ("wetsuit-thickness-water-temperature-chart",
     "Wetsuit Thickness Guide: What to Wear at Every Water Temperature", "Equipment"),
    ("scuba-diving-after-flying-rules",
     "Flying After Diving: The Real Rules for Safe Surface Intervals", "Safety"),
    ("best-dive-sites-komodo-liveaboard",
     "Diving Komodo by Liveaboard: Sites, Seasons and Costs", "Travel"),
    ("mask-fogging-prevention-tricks",
     "Why Your Dive Mask Fogs (and 7 Fixes That Actually Work)", "Equipment"),
    ("scuba-air-consumption-improve",
     "How to Improve Your Air Consumption: 9 Habits of Low-SAC Divers", "Education"),
    ("first-liveaboard-trip-what-to-expect",
     "Your First Liveaboard Trip: What to Expect Day by Day", "Travel"),
    ("scuba-diving-anxiety-tips",
     "Scuba Diving Anxiety: How to Stay Calm Underwater as a Beginner", "Beginner"),
    ("snorkeling-vs-scuba-which-first",
     "Snorkeling vs Scuba Diving: Which Should You Try First?", "Beginner"),
    ("best-dive-sites-egypt-hurghada-sharm",
     "Hurghada vs Sharm El-Sheikh: Where Should You Dive in Egypt?", "Travel"),
    ("scuba-weight-calculator-how-much-lead",
     "How Much Weight Do You Need for Scuba? Complete Weighting Guide", "Education"),
    ("night-dive-first-time-tips",
     "Your First Night Dive: Gear, Signals and What It's Really Like", "Equipment"),
    ("dive-insurance-worth-it",
     "Is Dive Insurance Worth It? DAN vs DiveAssure Compared", "Safety"),
    ("socorro-liveaboard-giant-mantas",
     "Diving Socorro: Giant Mantas, Sharks and How to Book the Trip", "Travel"),
    ("scuba-refresher-course-after-break",
     "Haven't Dived in Years? How a Scuba Refresher Course Works", "Beginner"),
    ("underwater-camera-settings-beginners",
     "Underwater Camera Settings for Beginners: GoPro and Compact Guide", "Equipment"),
    ("raja-ampat-diving-guide-budget",
     "Raja Ampat on a Budget: Homestays vs Liveaboards for Divers", "Travel"),
    ("decompression-stop-vs-safety-stop",
     "Safety Stop vs Decompression Stop: What's the Difference?", "Education"),
]

CATEGORY_COLORS = {
    "Safety": "danger", "Beginner": "primary", "Equipment": "warning",
    "Travel": "info", "Education": "success", "Advanced": "secondary",
    "Conservation": "success",
}


def get_next_topic(session, forced_topic=None):
    """Return (slug, title, category) for the next unpublished topic."""
    if forced_topic:
        slug = re.sub(r'[^a-z0-9]+', '-', forced_topic.lower()).strip('-')[:80]
        return slug, forced_topic, "Education"

    from models import BlogPost
    existing = {row[0] for row in session.query(BlogPost.slug).all()}
    for slug, title, category in TOPICS:
        if slug not in existing:
            return slug, title, category
    # Pool exhausted — refresh oldest topics with a year suffix
    year = datetime.now().year
    for slug, title, category in TOPICS:
        refreshed = f"{slug}-{year}"
        if refreshed not in existing:
            return refreshed, f"{title} ({year} Update)", category
    return None, None, None


def call_groq(title: str, category: str) -> dict | None:
    """Generate structured article JSON via Groq chat completions API."""
    api_key = os.environ.get("GROQ_API_KEY", "").strip()
    if not api_key:
        logger.error("GROQ_API_KEY is not set in .env — get one free at console.groq.com")
        return None

    affiliate_hint = {
        "Travel": "Naturally mention that liveaboard trips can be compared and booked online, and that booking early secures the best cabins.",
        "Equipment": "Naturally mention 1-2 specific well-known gear models (e.g. Shearwater Peregrine, Cressi Leonardo, Scubapro Hydros Pro) where relevant.",
        "Beginner": "Naturally mention that PADI Open Water eLearning lets readers start the theory online before their trip.",
    }.get(category, "Where natural, mention that proper gear and training are worth investing in.")

    prompt = f"""You are an expert scuba diving content writer creating SEO-optimized articles for ScuPlan (scuplan.com), a free professional dive planning platform.

Write a comprehensive, factually accurate, long-tail SEO article about:
"{title}"

Return your response as valid JSON with EXACTLY this structure (no other text):
{{
  "meta_description": "SEO description, max 155 characters, include the main keyword",
  "keywords": "comma-separated SEO keywords, 8-12 long-tail terms",
  "read_time": "X min read",
  "intro": "A 2-3 sentence introduction that hooks the reader and contains the main keyword.",
  "sections": [
    {{
      "heading": "Section heading phrased like a search query where possible",
      "content": "4-6 sentences of accurate, practical, specific content for divers.",
      "tip": "A single short quick tip or key takeaway (optional, can be null)"
    }}
  ],
  "conclusion": "A 2-3 sentence conclusion with a clear takeaway.",
  "faq": [
    {{"q": "A real question people search for about this topic?", "a": "A direct, helpful answer in 2-3 sentences."}}
  ]
}}

Requirements:
- Include 6-8 sections covering the topic exhaustively
- Include 3-4 FAQ items targeting 'People Also Ask' queries
- {affiliate_hint}
- All safety content must be accurate and conservative
- Do NOT include markdown formatting or HTML inside the JSON strings
- Return ONLY the JSON object, starting with {{ and ending with }}"""

    payload = json.dumps({
        "model": GROQ_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 4000,
        "temperature": 0.7,
        "response_format": {"type": "json_object"},
    }).encode("utf-8")

    req = urllib.request.Request(
        GROQ_API_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            raw = result["choices"][0]["message"]["content"].strip()
    except urllib.error.HTTPError as e:
        logger.error(f"Groq API HTTP error {e.code}: {e.read().decode()[:300]}")
        return None
    except Exception as e:
        logger.error(f"Groq API call failed: {e}")
        return None

    # Strip code fences / surrounding prose if the model added any
    fence = re.search(r'```(?:json)?\s*([\s\S]+?)\s*```', raw)
    if fence:
        raw = fence.group(1)
    start, end = raw.find('{'), raw.rfind('}')
    if start != -1 and end != -1:
        raw = raw[start:end + 1]

    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse failed: {e}\nRaw (first 500 chars): {raw[:500]}")
        return None


def inject_affiliate_tips(data: dict, category: str) -> dict:
    """
    Weave affiliate hooks into section tips. The site templates already render
    rich affiliate widgets (Liveaboard search box, PADI CTA, Amazon product
    strip) inside every dynamic post based on category — these plain-text tips
    reinforce them with direct, clickable context in the Markdown archive.
    """
    hooks = {
        "Travel": "Compare liveaboard prices early — the best cabins sell out months ahead: "
                  + affiliates.liveaboard_url(),
        "Equipment": "See our current top-rated picks (with prices): "
                     "https://scuplan.com/gear/best-dive-gear-2026",
        "Beginner": "Start your PADI Open Water theory online today: " + affiliates.padi_url(),
        "Safety": "Plan every dive for free with the ScuPlan calculator: https://scuplan.com/",
        "Education": "Practice these numbers with the free ScuPlan planner: https://scuplan.com/",
    }
    hook = hooks.get(category, hooks["Education"])
    sections = data.get("sections", [])
    if sections:
        # Attach the hook to the last section that has no tip (or override the last one)
        target = next((s for s in reversed(sections) if not s.get("tip")), sections[-1])
        target["tip"] = hook
    return data


def to_markdown(title: str, slug: str, category: str, data: dict) -> str:
    """Render the article as a Markdown archive file with front matter."""
    lines = [
        "---",
        f'title: "{title}"',
        f"slug: {slug}",
        f"date: {datetime.now().strftime('%Y-%m-%d')}",
        f"category: {category}",
        f'description: "{data.get("meta_description", "")}"',
        f'keywords: "{data.get("keywords", "")}"',
        "ai_generated: true",
        "---",
        "",
        f"# {title}",
        "",
        data.get("intro", ""),
        "",
    ]
    for section in data.get("sections", []):
        lines += [f"## {section.get('heading', '')}", "", section.get("content", ""), ""]
        if section.get("tip"):
            lines += [f"> 💡 **Tip:** {section['tip']}", ""]
    if data.get("conclusion"):
        lines += ["## Conclusion", "", data["conclusion"], ""]
    if data.get("faq"):
        lines += ["## FAQ", ""]
        for item in data["faq"]:
            lines += [f"**{item.get('q', '')}**", "", item.get("a", ""), ""]
    lines += [
        "---",
        "*This article may contain affiliate links. ScuPlan earns a small commission "
        "at no extra cost to you — it keeps our dive planning tools free.*",
        "",
        f"*Read online: https://scuplan.com/blog/{slug}*",
    ]
    return "\n".join(lines)


def save_markdown(title: str, slug: str, category: str, data: dict) -> str:
    os.makedirs(CONTENT_DIR, exist_ok=True)
    path = os.path.join(CONTENT_DIR, f"{datetime.now().strftime('%Y-%m-%d')}-{slug}.md")
    with open(path, 'w', encoding='utf-8') as f:
        f.write(to_markdown(title, slug, category, data))
    logger.info(f"Markdown archive: {path}")
    return path


def git_push_markdown(path: str) -> None:
    """Commit and push the Markdown archive (best-effort, never fatal)."""
    rel = os.path.relpath(path, PROJECT_DIR)
    try:
        subprocess.run(['git', 'add', rel], cwd=PROJECT_DIR, check=True)
        subprocess.run(
            ['git', 'commit', '-m', f"content: auto-publish {os.path.basename(path)}"],
            cwd=PROJECT_DIR, check=True)
        subprocess.run(['git', 'push'], cwd=PROJECT_DIR, check=True, timeout=120)
        logger.info("Markdown archive pushed to git.")
    except Exception as e:
        logger.warning(f"git push skipped/failed (article is still live in DB): {e}")


def publish_post(title: str, slug: str, category: str, data: dict, session) -> None:
    from models import BlogPost
    post = BlogPost(
        slug=slug,
        title=title,
        meta_description=data.get("meta_description", "")[:160],
        keywords=data.get("keywords", ""),
        category=category,
        category_color=CATEGORY_COLORS.get(category, "primary"),
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
    logger.info(f"Published: https://scuplan.com/blog/{slug}")


def main() -> int:
    parser = argparse.ArgumentParser(description="ScuPlan autonomous blog writer agent")
    parser.add_argument('--topic', help='Force a specific article title')
    parser.add_argument('--dry-run', action='store_true',
                        help='Generate and print, do not save anywhere')
    parser.add_argument('--push', action='store_true',
                        help='git commit+push the Markdown archive after publishing')
    args = parser.parse_args()

    from app import app, db

    with app.app_context():
        slug, title, category = get_next_topic(db.session, args.topic)
        if not slug:
            logger.info("Topic pool exhausted. Add new topics to TOPICS.")
            return 0

        logger.info(f"Generating [{category}] {title}  -> /blog/{slug}")
        data = call_groq(title, category)
        if not data or not data.get("sections"):
            logger.error("Article generation failed — aborting (will retry on next cron run).")
            return 1

        data = inject_affiliate_tips(data, category)

        if args.dry_run:
            print(json.dumps(data, indent=2, ensure_ascii=False))
            return 0

        publish_post(title, slug, category, data, db.session)
        md_path = save_markdown(title, slug, category, data)
        if args.push:
            git_push_markdown(md_path)

        logger.info("Done. Article is live and archived.")
        return 0


if __name__ == "__main__":
    sys.exit(main())
