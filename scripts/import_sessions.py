#!/usr/bin/env python3
"""Import all session transcripts into the Memory Wiki Supabase database."""

import json
import os
import glob
import subprocess
from datetime import datetime
from collections import defaultdict

# Load env
env_path = "/opt/data/memory-wiki/.env.local"
env = {}
with open(env_path) as f:
    for line in f:
        line = line.strip()
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip()

SUPABASE_URL = env["NEXT_PUBLIC_SUPABASE_URL"]
SERVICE_KEY = env["SUPABASE_SERVICE_ROLE_KEY"]
USER_ID = "7d6d6b24-4b89-407a-9091-700fc6ddd9df"

def supabase_post(table, payload):
    """POST to Supabase REST API using curl."""
    cmd = [
        "curl", "-s", "-X", "POST",
        f"{SUPABASE_URL}/rest/v1/{table}",
        "-H", f"apikey: {SERVICE_KEY}",
        "-H", f"Authorization: Bearer {SERVICE_KEY}",
        "-H", "Content-Type: application/json",
        "-H", "Prefer: return=representation",
        "-d", json.dumps(payload),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if result.returncode != 0:
        return None, f"curl error: {result.stderr}"
    try:
        data = json.loads(result.stdout)
        return data, None
    except json.JSONDecodeError:
        return None, f"invalid JSON response: {result.stdout[:200]}"

# Topic mapping
TOPIC_KEYWORDS = [
    {
        "slug": "pa-business-compliance",
        "keywords": ["pa business", "compliance", "annual report", "dos", "department of state", 
                      "act 122", "reinstatement", "dissolved", "entity", "corporation", "llc",
                      "global intelligence", "gi api", "filing", "good standing", "pabusinesscompliance",
                      "pennsylvania", "bureau of corporations", "dos.pa.gov"],
        "topic_id": "5d2a32c2-e46a-46c7-9ea9-d7736e47ef6c",
    },
    {
        "slug": "key-my-ride",
        "keywords": ["key my ride", "locksmith", "car key", "automotive", "keymyride",
                      "ignition", "transponder", "fob", "dealership", "mobile locksmith",
                      "chrysler", "dodge", "jeep", "ram", "key programming"],
        "topic_id": "946c13cf-8179-47c1-b4ff-7807e23318a6",
    },
    {
        "slug": "sports-betting",
        "keywords": ["betting", "nhl", "nba", "odds", "spread", "moneyline", "ev", "expected value",
                      "kelly", "bankroll", "slate", "pick", "handicap", "cavaliers", "knicks",
                      "thunder", "timberwolves", "under", "over", "parlay", "sports", "nfl",
                      "puck line", "total", "sharp", "clv"],
        "topic_id": "40ddab6b-6d1e-416b-acd3-4ea6573e7f0b",
    },
    {
        "slug": "ai-tools-agents",
        "keywords": ["firecrawl", "perplexity", "ai tool", "agent", "browser", "scraping",
                      "web research", "automation", "mcp", "model context protocol", "claude",
                      "opencode", "codex", "cursor", "ai agent"],
        "topic_id": "3b253443-08e3-4fa6-b47d-3a2774c147ab",
    },
    {
        "slug": "hermes-agent",
        "keywords": ["hermes", "cron job", "skill", "config", "gateway", "discord", "telegram",
                      "tts", "voice", "memory", "provider", "model", "system prompt",
                      "supabase auth", "auth setup", "middleware", "rls policy"],
        "topic_id": "6130b3b7-d70c-44d4-89d6-48087c3a628c",
    },
    {
        "slug": "saas-development",
        "keywords": ["saas", "next.js", "vercel", "supabase", "deploy", "database", "schema",
                      "migration", "api route", "frontend", "react", "tailwind", "shadcn",
                      "app router", "server component", "client component", "memory wiki",
                      "dashboard", "login", "seed"],
        "topic_id": "fa28493a-214d-403d-80b9-14f46607c528",
    },
    {
        "slug": "smart-morning-routine",
        "keywords": ["morning routine", "weather", "briefing", "traffic", "nazareth", "commute",
                      "morning assistant", "daily briefing"],
        "topic_id": "1d5cd43c-a1ca-41d6-a332-3189483991b6",
    },
    {
        "slug": "vapi-phone-system",
        "keywords": ["vapi", "phone", "voice", "call", "openphone", "quo", "twilio",
                      "ivr", "transfer", "sms", "assistant", "ai call", "outbound"],
        "topic_id": "a63298f2-5b71-43ea-966e-d65b10d66d2c",
    },
]


def categorate_session(text):
    """Match session text to topics based on keywords."""
    text_lower = text.lower()
    matches = []
    for t in TOPIC_KEYWORDS:
        score = sum(1 for kw in t["keywords"] if kw in text_lower)
        if score > 0:
            matches.append((t["slug"], score, t["topic_id"]))
    matches.sort(key=lambda x: -x[1])
    return matches


def extract_session_summary(session_data):
    """Extract a detailed summary from a session's messages."""
    messages = session_data.get("messages", [])
    session_id = session_data.get("session_id", "unknown")
    session_start = session_data.get("session_start", "")
    model = session_data.get("model", "unknown")
    platform = session_data.get("platform", "unknown")

    user_msgs = []
    assistant_msgs = []
    tool_uses = []

    for m in messages:
        role = m.get("role", "")
        content = m.get("content", "") or ""
        
        # Content can be a string or list (multi-part messages)
        if isinstance(content, list):
            content = " ".join(
                c.get("text", str(c)) if isinstance(c, dict) else str(c)
                for c in content
            )
        
        if role == "system" or len(content.strip()) < 10:
            continue
        if "CONTEXT COMPACTION" in content or "[IMPORTANT: You are running as a scheduled cron job" in content:
            continue
            
        if role == "user":
            user_msgs.append(content[:500])
        elif role == "assistant":
            tool_calls = m.get("tool_calls", [])
            if tool_calls and isinstance(tool_calls, list):
                for tc in tool_calls:
                    if isinstance(tc, dict):
                        func = tc.get("function", {})
                        tool_name = func.get("name", "unknown")
                        tool_uses.append(tool_name)
            elif len(content.strip()) > 50:
                assistant_msgs.append(content[:500])

    all_text = " ".join(user_msgs[:20]) + " " + " ".join(assistant_msgs[:10])
    
    # Generate title from first user message
    title = "Unknown Session"
    if user_msgs:
        title = user_msgs[0].replace("\n", " ").strip()[:120]

    # Build content
    content_parts = []
    content_parts.append(f"**Session:** {session_id}")
    content_parts.append(f"**Date:** {session_start[:19] if session_start else 'unknown'}")
    content_parts.append(f"**Model:** {model}")
    content_parts.append(f"**Platform:** {platform}")
    content_parts.append(f"**Total Messages:** {len(messages)}")
    content_parts.append("")
    
    if user_msgs:
        content_parts.append("## Conversation Highlights")
        for i, msg in enumerate(user_msgs[:6]):
            content_parts.append(f"**User {i+1}:** {msg}")
            content_parts.append("")
    
    if tool_uses:
        tool_counts = defaultdict(int)
        for t in tool_uses:
            tool_counts[t] += 1
        content_parts.append("## Tools Used")
        for tool, count in sorted(tool_counts.items(), key=lambda x: -x[1])[:12]:
            content_parts.append(f"- {tool}: {count}x")
        content_parts.append("")

    full_content = "\n".join(content_parts)
    
    # Parse date
    date_str = "2026-05-24"
    if session_start:
        date_str = session_start[:10]
        try:
            datetime.fromisoformat(date_str)
        except ValueError:
            date_str = "2026-05-24"

    return {
        "title": title,
        "date": date_str,
        "content": full_content,
        "session_id": session_id,
        "topics": categorate_session(all_text),
    }


def main():
    session_dir = "/opt/data/sessions"
    session_files = glob.glob(os.path.join(session_dir, "session_*.json"))
    session_files.sort(reverse=True)
    
    print(f"Found {len(session_files)} session files")
    
    imported = 0
    skipped = 0
    errors = 0
    
    for filepath in session_files:
        try:
            with open(filepath) as f:
                session_data = json.load(f)
            
            summary = extract_session_summary(session_data)
            
            msg_count = session_data.get("message_count", 0)
            if msg_count < 3:
                skipped += 1
                continue
            
            if not summary["topics"]:
                skipped += 1
                continue
            
            # Insert log
            log_payload = {
                "user_id": USER_ID,
                "title": summary["title"],
                "date": summary["date"],
                "content": summary["content"],
                "summary": summary["content"][:300] + "..." if len(summary["content"]) > 300 else summary["content"],
                "platform": session_data.get("platform", "discord"),
            }
            
            log_data, err = supabase_post("logs", log_payload)
            if err:
                print(f"  ERROR: {err}")
                errors += 1
                continue
            
            if isinstance(log_data, list) and log_data:
                log_id = log_data[0]["id"]
            elif isinstance(log_data, dict) and log_data.get("id"):
                log_id = log_data["id"]
            else:
                print(f"  ERROR: bad response for {summary['session_id']}")
                errors += 1
                continue
            
            # Create joins (top 2 topics)
            for slug, score, topic_id in summary["topics"][:2]:
                join_payload = {"log_id": log_id, "topic_id": topic_id}
                _, join_err = supabase_post("log_topics", join_payload)
                if join_err and "duplicate" not in join_err.lower():
                    print(f"  WARN: join failed for {slug}")
            
            topic_names = [t[0] for t in summary["topics"][:2]]
            title_short = summary["title"][:70]
            print(f"  + {title_short}... [{msg_count} msgs] -> {', '.join(topic_names)}")
            imported += 1
            
        except Exception as e:
            print(f"  ERROR processing {filepath}: {e}")
            errors += 1
    
    print(f"\nDone! Imported: {imported}, Skipped: {skipped}, Errors: {errors}")


if __name__ == "__main__":
    main()
