#!/usr/bin/env python3
"""Deduplicate logs in Supabase — keep only the most complete version of each session."""

import json
import subprocess
import re
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

def supabase_get(url_params=""):
    cmd = ["curl", "-s", f"{SUPABASE_URL}/rest/v1/logs?select=*{url_params}",
           "-H", f"apikey: {SERVICE_KEY}",
           "-H", f"Authorization: Bearer {SERVICE_KEY}"]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    return json.loads(result.stdout) if result.stdout else []

def supabase_delete(log_id):
    cmd = ["curl", "-s", "-X", "DELETE",
           f"{SUPABASE_URL}/rest/v1/logs?id=eq.{log_id}",
           "-H", f"apikey: {SERVICE_KEY}",
           "-H", f"Authorization: Bearer {SERVICE_KEY}"]
    subprocess.run(cmd, capture_output=True, text=True, timeout=10)

def extract_session_id(content):
    """Extract session ID from log content."""
    m = re.search(r'\*\*Session:\*\*\s*(\S+)', content)
    if m:
        return m.group(1)
    # For old-format logs, try to find session_id pattern
    m = re.search(r'([0-9]{8}_[0-9]{6}_[0-9a-f]+)', content)
    if m:
        return m.group(1)
    return None

def main():
    logs = supabase_get()
    print(f"Total logs: {len(logs)}")
    
    # Group by session_id
    groups = defaultdict(list)
    no_id = []
    
    for log in logs:
        sid = extract_session_id(log.get("content", ""))
        if sid:
            groups[sid].append(log)
        else:
            no_id.append(log)
    
    print(f"Unique sessions: {len(groups)}")
    print(f"Logs without session ID: {len(no_id)}")
    
    deleted = 0
    kept = 0
    
    for sid, entries in groups.items():
        if len(entries) == 1:
            kept += 1
            continue
        
        # Keep the one with the longest content
        entries.sort(key=lambda x: len(x.get("content", "")), reverse=True)
        keeper = entries[0]
        
        for entry in entries[1:]:
            supabase_delete(entry["id"])
            deleted += 1
        
        kept += 1
    
    # Keep all no_id logs (can't dedup without session_id)
    kept += len(no_id)
    
    print(f"\nKept: {kept} logs")
    print(f"Deleted: {deleted} duplicates")


if __name__ == "__main__":
    main()
