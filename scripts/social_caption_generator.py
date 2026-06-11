#!/usr/bin/env python3
"""
ScuPlan social caption generator with built-in ScuPlan.com CTA hooks.

Designed to drop into the existing n8n + Ollama pipeline:
  - n8n "Execute Command" node runs this script; stdout is clean JSON.
  - Tries the local Ollama first (same instance the pipeline already uses),
    falls back to Groq, then to an offline template — so the pipeline NEVER
    stalls on a model outage.
  - Every caption gets a traffic-bridge CTA appended ("full guide & my gear
    at ScuPlan.com — link in bio") plus platform-tuned hashtags.

Usage:
    python scripts/social_caption_generator.py --topic "Night diving in Kaş" --platform reels
    python scripts/social_caption_generator.py --topic "Ear equalization trick" --platform shorts --lang tr

Output (stdout, JSON):
    {"title": ..., "caption": ..., "hashtags": [...], "cta": ..., "full_text": ...}

Env (.env, all optional):
    OLLAMA_URL=http://localhost:11434
    OLLAMA_MODEL=llama3.1
    GROQ_API_KEY=gsk_...
    GROQ_MODEL=llama-3.3-70b-versatile
"""

import os
import sys
import json
import argparse
from datetime import date
import urllib.request
import urllib.error

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
sys.path.insert(0, PROJECT_DIR)

from dotenv import load_dotenv
load_dotenv(os.path.join(PROJECT_DIR, '.env'))

# ── CTA hooks (rotated daily so feeds don't look copy-pasted) ────────────────
CTA_HOOKS = {
    "en": [
        "📖 Full guide + the exact gear I use → ScuPlan.com (link in bio 🔗)",
        "🤿 Plan this dive yourself for FREE → ScuPlan.com (link in bio)",
        "🎒 My complete gear list & detailed guide are on ScuPlan.com — link in bio!",
        "👉 Step-by-step guide + dive planner (free) at ScuPlan.com — link in bio 🔗",
        "💡 Want the full breakdown? It's on ScuPlan.com (link in bio) 🌊",
    ],
    "tr": [
        "📖 Detaylı rehber + kullandığım ekipmanlar ScuPlan.com'da (Link Bio'da 🔗)",
        "🤿 Bu dalışı kendin ÜCRETSİZ planla → ScuPlan.com (Link Bio'da)",
        "🎒 Tüm ekipman listem ve detaylı rehber ScuPlan.com'da — Link Bio'da!",
        "👉 Adım adım rehber + ücretsiz dalış planlayıcı: ScuPlan.com (Link Bio'da 🔗)",
    ],
}

BASE_HASHTAGS = {
    "reels": ["#scubadiving", "#diving", "#underwater", "#scuba", "#oceanlife",
              "#divetravel", "#scubadiver", "#uwphotography", "#divinglife", "#scuplan"],
    "shorts": ["#scubadiving", "#diving", "#shorts", "#ocean", "#scuba", "#scuplan"],
    "tiktok": ["#scubadiving", "#divetok", "#oceantok", "#scuba", "#underwater", "#scuplan"],
}

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


def _http_json(url, payload, headers, timeout=60):
    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"),
                                 headers={"Content-Type": "application/json", **headers},
                                 method="POST")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _build_prompt(topic, platform, lang):
    lang_name = "Turkish" if lang == "tr" else "English"
    return f"""You write viral {platform} captions for @scuplan, a scuba diving content brand.

Topic of today's video: "{topic}"

Return ONLY valid JSON:
{{
  "title": "Punchy video title, max 70 chars, curiosity hook",
  "caption": "2-4 short lines with emojis. Hook first line. NO hashtags, NO links — they are added separately.",
  "extra_hashtags": ["3-5 topic-specific hashtags without the # symbol"]
}}

Language: {lang_name}. Tone: energetic, expert but friendly."""


def generate_via_ollama(topic, platform, lang):
    url = os.environ.get("OLLAMA_URL", "http://localhost:11434").rstrip("/")
    model = os.environ.get("OLLAMA_MODEL", "llama3.1")
    result = _http_json(f"{url}/api/generate", {
        "model": model,
        "prompt": _build_prompt(topic, platform, lang),
        "stream": False,
        "format": "json",
    }, {}, timeout=120)
    return json.loads(result["response"])


def generate_via_groq(topic, platform, lang):
    api_key = os.environ.get("GROQ_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("GROQ_API_KEY not set")
    result = _http_json(GROQ_API_URL, {
        "model": os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile"),
        "messages": [{"role": "user", "content": _build_prompt(topic, platform, lang)}],
        "max_tokens": 500,
        "temperature": 0.8,
        "response_format": {"type": "json_object"},
    }, {"Authorization": f"Bearer {api_key}"})
    return json.loads(result["choices"][0]["message"]["content"])


def generate_offline(topic, platform, lang):
    """Template fallback — pipeline must never produce an empty post."""
    if lang == "tr":
        return {
            "title": f"{topic} 🤿",
            "caption": f"🌊 {topic}\n🤿 Bugünkü dalış içeriğimizde tüm detaylar!",
            "extra_hashtags": ["dalis", "sualti", "denizyasami"],
        }
    return {
        "title": f"{topic} 🤿",
        "caption": f"🌊 {topic}\n🤿 Everything you need to know in today's dive!",
        "extra_hashtags": ["divinglife", "marinelife", "oceanlover"],
    }


def main():
    parser = argparse.ArgumentParser(description="ScuPlan social caption generator")
    parser.add_argument("--topic", required=True, help="Video topic/subject")
    parser.add_argument("--platform", default="reels", choices=["reels", "shorts", "tiktok"])
    parser.add_argument("--lang", default="en", choices=["en", "tr"])
    args = parser.parse_args()

    data = None
    for generator in (generate_via_ollama, generate_via_groq, generate_offline):
        try:
            data = generator(args.topic, args.platform, args.lang)
            if data and data.get("caption"):
                break
        except Exception as e:
            print(f"[warn] {generator.__name__} failed: {e}", file=sys.stderr)
    if not data:
        data = generate_offline(args.topic, args.platform, args.lang)

    # Deterministic daily CTA rotation — the traffic bridge to scuplan.com
    hooks = CTA_HOOKS.get(args.lang, CTA_HOOKS["en"])
    cta = hooks[date.today().toordinal() % len(hooks)]

    hashtags = list(BASE_HASHTAGS.get(args.platform, BASE_HASHTAGS["reels"]))
    for tag in data.get("extra_hashtags", []):
        tag = "#" + str(tag).lstrip("#").replace(" ", "")
        if tag.lower() not in (h.lower() for h in hashtags):
            hashtags.append(tag)
    hashtags = hashtags[:15]

    caption = str(data.get("caption", "")).strip()
    full_text = f"{caption}\n\n{cta}\n\n{' '.join(hashtags)}"

    print(json.dumps({
        "title": str(data.get("title", args.topic))[:100],
        "caption": caption,
        "cta": cta,
        "hashtags": hashtags,
        "full_text": full_text,
        "platform": args.platform,
        "lang": args.lang,
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
