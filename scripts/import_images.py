#!/usr/bin/env python3
"""Bulk-import images from session cache into Memory Wiki artifacts."""

import json
import glob
import os
import re
import subprocess
import base64
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

IMAGE_CACHE_DIR = "/opt/data/image_cache"
SESSION_DIR = "/opt/data/sessions"

def curl(method, path, data=None, extra_headers=None):
    """Helper to make Supabase API calls."""
    cmd = ["curl", "-s", "-X", method, f"{SUPABASE_URL}{path}"]
    cmd.extend(["-H", f"apikey: {SERVICE_KEY}"])
    cmd.extend(["-H", f"Authorization: Bearer {SERVICE_KEY}"])
    cmd.extend(["-H", "Content-Type: application/json"])
    cmd.extend(["-H", "Prefer: return=representation"])
    if extra_headers:
        for h in extra_headers:
            cmd.extend(["-H", h])
    if data is not None:
        if isinstance(data, dict):
            cmd.extend(["-d", json.dumps(data)])
        else:
            cmd.extend(["-d", data])
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    try:
        return json.loads(result.stdout), result.returncode
    except:
        return result.stdout, result.returncode

def get_mime_type(filepath):
    """Determine MIME type from file extension."""
    ext = os.path.splitext(filepath)[1].lower()
    return {
        ".webp": "image/webp",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
    }.get(ext, "application/octet-stream")

def map_session_images():
    """Find which session each image belongs to by scanning session files."""
    image_to_session = {}
    session_files = glob.glob(os.path.join(SESSION_DIR, "session_*.json"))
    
    for filepath in session_files:
        try:
            with open(filepath) as f:
                session_data = json.load(f)
            session_id = session_data.get("session_id", "")
            content = json.dumps(session_data)
            
            # Find image references in this session
            for img_file in os.listdir(IMAGE_CACHE_DIR):
                img_path = os.path.join(IMAGE_CACHE_DIR, img_file)
                if img_path in content:
                    image_to_session[img_file] = session_id
        except:
            continue
    
    return image_to_session

def get_log_id_by_session(session_id):
    """Find the log ID that corresponds to a session ID."""
    if not session_id:
        return None
    
    data, code = curl("GET", f"/rest/v1/logs?select=id,content&content=like.*{session_id}*&limit=1")
    if data and isinstance(data, list) and len(data) > 0:
        return data[0]["id"]
    return None

def main():
    # Step 1: Map images to sessions
    print("=== Step 1: Mapping images to sessions ===")
    image_to_session = map_session_images()
    
    # Step 2: Find all images in cache
    print("\n=== Step 2: Finding images ===")
    image_files = []
    for f in os.listdir(IMAGE_CACHE_DIR):
        ext = os.path.splitext(f)[1].lower()
        if ext in [".webp", ".png", ".jpg", ".jpeg", ".gif"]:
            image_files.append(f)
    
    print(f"Found {len(image_files)} images in cache")
    print(f"Mapped {len(image_to_session)} to sessions")
    
    # Step 3: Upload and create records
    print("\n=== Step 3: Uploading ===")
    uploaded = 0
    skipped = 0
    errors = 0
    
    for img_file in sorted(image_files):
        img_path = os.path.join(IMAGE_CACHE_DIR, img_file)
        mime_type = get_mime_type(img_path)
        file_size = os.path.getsize(img_path)
        
        # Get session ID
        session_id = image_to_session.get(img_file, "")
        log_id = get_log_id_by_session(session_id) if session_id else None
        
        # Upload to Supabase Storage
        storage_path = f"{USER_ID}/{img_file}"
        
        with open(img_path, "rb") as f:
            file_data = f.read()
        
        # Upload using curl with binary data
        cmd = [
            "curl", "-s", "-X", "POST",
            f"{SUPABASE_URL}/storage/v1/object/artifacts/{storage_path}",
            "-H", f"apikey: {SERVICE_KEY}",
            "-H", f"Authorization: Bearer {SERVICE_KEY}",
            "-H", f"Content-Type: {mime_type}",
            "--data-binary", "@-"
        ]
        
        result = subprocess.run(cmd, input=file_data, capture_output=True, timeout=30)
        
        try:
            upload_result = json.loads(result.stdout.decode() if isinstance(result.stdout, bytes) else result.stdout)
            if "error" in upload_result:
                print(f"  ✗ {img_file}: {upload_result.get('error', 'unknown')}")
                errors += 1
                continue
        except:
            err_msg = result.stdout.decode() if isinstance(result.stdout, bytes) else str(result.stdout)
            print(f"  ✗ {img_file}: upload failed - {err_msg[:100]}")
            errors += 1
            continue
        
        # Get public URL
        file_url = f"{SUPABASE_URL}/storage/v1/object/public/artifacts/{storage_path}"
        
        # Insert into attachments table
        description = f"Session: {session_id}" if session_id else "Imported from session cache"
        
        db_payload = {
            "user_id": USER_ID,
            "file_name": img_file,
            "file_type": "image",
            "file_url": file_url,
            "description": description,
            "file_size": file_size,
        }
        if log_id:
            db_payload["log_id"] = log_id
        
        db_result, db_code = curl("POST", "/rest/v1/attachments", db_payload)
        
        if db_code == 0 and db_result and isinstance(db_result, list):
            log_info = f" -> log {log_id[:8]}..." if log_id else " (no matching log)"
            print(f"  + {img_file} ({file_size/1024:.1f} KB){log_info}")
            uploaded += 1
        else:
            print(f"  ✗ {img_file}: DB error - {db_result if isinstance(db_result, str) else json.dumps(db_result)[:100]}")
            errors += 1
    
    print(f"\n=== Results ===")
    print(f"Uploaded: {uploaded}")
    print(f"Errors: {errors}")
    print(f"Total images processed: {len(image_files)}")

if __name__ == "__main__":
    main()
