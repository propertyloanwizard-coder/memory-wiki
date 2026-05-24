#!/bin/bash
# Fix log_topics join table entries
set -e

source /opt/data/memory-wiki/.env.local

URL="$NEXT_PUBLIC_SUPABASE_URL"
SERVICE_KEY="$SUPABASE_SERVICE_ROLE_KEY"

# Get user ID
USER_ID=$(curl -s "$URL/auth/v1/admin/users" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" | \
  python3 -c "import json,sys; d=json.load(sys.stdin); print(d['users'][0]['id'])")

echo "User: $USER_ID"

# Get all topic IDs
declare -A TOPICS
while IFS='|' read -r id name; do
  TOPICS["$name"]="$id"
done < <(curl -s "$URL/rest/v1/topics?select=id,name" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" | \
  python3 -c "import json,sys; [print(f\"{d['id']}|{d['name']}\") for d in json.load(sys.stdin)]")

echo "Topics: ${!TOPICS[@]}"

# Get all log IDs
declare -A LOGS
while IFS='|' read -r id title; do
  LOGS["$title"]="$id"
done < <(curl -s "$URL/rest/v1/logs?select=id,title" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" | \
  python3 -c "import json,sys; [print(f\"{d['id']}|{d['title']}\") for d in json.load(sys.stdin)]")

echo "Logs: ${!LOGS[@]}"

# Create join entries
echo "Creating log_topics joins..."

# Memory Wiki → Hermes + SaaS
curl -s -X POST "$URL/rest/v1/log_topics" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"log_id\":\"${LOGS[Memory Wiki — Building Conversation Archive]}\",\"topic_id\":\"${TOPICS[Hermes Agent]}\"}" > /dev/null
curl -s -X POST "$URL/rest/v1/log_topics" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"log_id\":\"${LOGS[Memory Wiki — Building Conversation Archive]}\",\"topic_id\":\"${TOPICS[SaaS Development]}\"}" > /dev/null

# PA Compliance → PA Business Compliance
curl -s -X POST "$URL/rest/v1/log_topics" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"log_id\":\"${LOGS[PA Compliance SaaS — Global Intelligence API Integration]}\",\"topic_id\":\"${TOPICS[PA Business Compliance]}\"}" > /dev/null

# Key My Ride → Key My Ride
curl -s -X POST "$URL/rest/v1/log_topics" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"log_id\":\"${LOGS[Key My Ride — Automotive Locksmith Business]}\",\"topic_id\":\"${TOPICS[Key My Ride]}\"}" > /dev/null

# Sports Betting → Sports Betting
curl -s -X POST "$URL/rest/v1/log_topics" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"log_id\":\"${LOGS[Sports Betting — Cavs vs Knicks G3 Analysis]}\",\"topic_id\":\"${TOPICS[Sports Betting]}\"}" > /dev/null

# AI Tools → AI Tools & Agents
curl -s -X POST "$URL/rest/v1/log_topics" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"log_id\":\"${LOGS[AI Tools Research — 2026 Landscape]}\",\"topic_id\":\"${TOPICS[AI Tools & Agents]}\"}" > /dev/null

# Hermes Config → Hermes Agent
curl -s -X POST "$URL/rest/v1/log_topics" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"log_id\":\"${LOGS[Hermes Agent — Cron Jobs & Configuration]}\",\"topic_id\":\"${TOPICS[Hermes Agent]}\"}" > /dev/null

# Vapi → Vapi Phone System
curl -s -X POST "$URL/rest/v1/log_topics" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"log_id\":\"${LOGS[Vapi AI + Quo OpenPhone — Business Comms Setup]}\",\"topic_id\":\"${TOPICS[Vapi Phone System]}\"}" > /dev/null

echo "✅ Join entries created!"

# Verify
echo "Verifying joins..."
curl -s "$URL/rest/v1/log_topics?select=*,topics(name),logs(title)" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" | \
  python3 -c "
import json, sys
data = json.load(sys.stdin)
for d in data:
    print(f\"  {d['logs']['title'][:40]}... → {d['topics']['name']}\")
print(f\"Total joins: {len(data)}\")
"
