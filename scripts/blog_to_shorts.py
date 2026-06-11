#!/usr/bin/env python3
"""
ScuPlan blog → short-form video script generator (MoneyPrinterTurbo-style,
but zero-cost: local Ollama first, Groq free tier as fallback).

Closes the content loop: the Blog Writer Agent publishes an article, this
script turns it into a ready-to-shoot Reels/Shorts scenario for the existing
n8n + Ollama + Higgsfield pipeline — every article becomes a video that
drives traffic back to scuplan.com via the link-in-bio CTA.

Usage (n8n Execute Command node, or after each blog cron run):
    python scripts/blog_to_shorts.py                 # latest published post
    python scripts/blog_to_shorts.py --slug best-dive-sites-kas-turkey
    python scripts/blog_to_shorts.py --lang tr

Output (stdout, JSON):
    {
      "source_post": {slug, title, url},
      "video": {"title", "hook", "scenes": [{visual, voiceover, duration_sec}],
                "outro", "total_duration_sec"},
      "caption", "cta", "hashtags", "full_text"
    }

Env (.env, all optional): OLLAMA_URL, OLLAMA_MODEL, GROQ_API_KEY, GROQ_MODEL
"""

import os
import sys
import json
import argparse
import urllib.request

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
sys.path.insert(0, PROJECT_DIR)
sys.path.insert(0, SCRIPT_DIR)

from dotenv import load_dotenv
load_dotenv(os.path.join(PROJECT_DIR, '.env'))

# Reuse the caption generator's CTA rotation, hashtags and LLM fallback chain
import social_caption_generator as captions


def _build_prompt(post: dict, lang: str) -> str:
    lang_name = "Turkish" if lang == "tr" else "English"
    sections = "\n".join(f"- {s.get('heading', '')}: {s.get('content', '')[:200]}"
                         for s in post["sections"][:6])
    return f"""You are a short-form video director for @scuplan, a scuba diving brand.
Turn this blog article into a 30-45 second Reels/Shorts scenario.

ARTICLE: "{post['title']}"
KEY POINTS:
{sections}

Return ONLY valid JSON:
{{
  "title": "Video title, max 70 chars, strong curiosity hook",
  "hook": "First 2 seconds spoken line that stops the scroll",
  "scenes": [
    {{"visual": "What to show / generate (camera or AI-video direction)",
      "voiceover": "1-2 spoken sentences", "duration_sec": 5}}
  ],
  "outro": "Final spoken line teasing that the full guide is on ScuPlan.com"
}}

Requirements: 4-6 scenes, total 30-45 seconds, language: {lang_name},
energetic but accurate diving content. Return ONLY the JSON object."""


def _offline_video(post: dict, lang: str) -> dict:
    headings = [s.get("heading", "") for s in post["sections"][:4]]
    scenes = [{"visual": f"B-roll / AI underwater shot: {h}",
               "voiceover": h, "duration_sec": 7} for h in headings if h]
    if lang == "tr":
        return {"title": f"{post['title'][:60]} 🤿", "hook": "Bunu dalmadan önce izle!",
                "scenes": scenes, "outro": "Detaylı rehber ScuPlan.com'da — link bio'da!"}
    return {"title": f"{post['title'][:60]} 🤿", "hook": "Watch this before your next dive!",
            "scenes": scenes, "outro": "Full guide is on ScuPlan.com — link in bio!"}


def _generate(post: dict, lang: str) -> dict:
    prompt = _build_prompt(post, lang)
    # Ollama first (free, local), then Groq (free tier), then offline template
    try:
        url = os.environ.get("OLLAMA_URL", "http://localhost:11434").rstrip("/")
        model = os.environ.get("OLLAMA_MODEL", "llama3.1")
        result = captions._http_json(f"{url}/api/generate", {
            "model": model, "prompt": prompt, "stream": False, "format": "json",
        }, {}, timeout=120)
        data = json.loads(result["response"])
        if data.get("scenes"):
            return data
    except Exception as e:
        print(f"[warn] ollama failed: {e}", file=sys.stderr)
    try:
        api_key = os.environ.get("GROQ_API_KEY", "").strip()
        if api_key:
            result = captions._http_json(captions.GROQ_API_URL, {
                "model": os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile"),
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 1200, "temperature": 0.8,
                "response_format": {"type": "json_object"},
            }, {"Authorization": f"Bearer {api_key}"})
            data = json.loads(result["choices"][0]["message"]["content"])
            if data.get("scenes"):
                return data
    except Exception as e:
        print(f"[warn] groq failed: {e}", file=sys.stderr)
    return _offline_video(post, lang)


def main() -> int:
    parser = argparse.ArgumentParser(description="Blog post -> Reels/Shorts scenario")
    parser.add_argument("--slug", help="Blog post slug (default: latest published)")
    parser.add_argument("--platform", default="reels", choices=["reels", "shorts", "tiktok"])
    parser.add_argument("--lang", default="en", choices=["en", "tr"])
    args = parser.parse_args()

    from app import app
    from models import BlogPost
    with app.app_context():
        query = BlogPost.query.filter_by(published=True)
        row = (query.filter_by(slug=args.slug).first() if args.slug
               else query.order_by(BlogPost.created_at.desc()).first())
        if not row:
            print(json.dumps({"error": "no published post found"}))
            return 1
        post = {"slug": row.slug, "title": row.title, "sections": row.sections()}

    video = _generate(post, args.lang)

    # Same daily-rotating CTA + hashtag sets as the caption generator
    from datetime import date
    hooks = captions.CTA_HOOKS.get(args.lang, captions.CTA_HOOKS["en"])
    cta = hooks[date.today().toordinal() % len(hooks)]
    hashtags = list(captions.BASE_HASHTAGS.get(args.platform, captions.BASE_HASHTAGS["reels"]))

    total = sum(int(s.get("duration_sec", 6)) for s in video.get("scenes", []))
    caption_text = f"🤿 {video.get('title', post['title'])}"
    print(json.dumps({
        "source_post": {"slug": post["slug"], "title": post["title"],
                        "url": f"https://scuplan.com/blog/{post['slug']}"},
        "video": {**video, "total_duration_sec": total},
        "caption": caption_text,
        "cta": cta,
        "hashtags": hashtags,
        "full_text": f"{caption_text}\n\n{cta}\n\n{' '.join(hashtags)}",
        "platform": args.platform,
        "lang": args.lang,
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
