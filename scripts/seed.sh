#!/bin/bash
# Seed Memory Wiki via Supabase REST API directly
set -e

# Load environment variables
source /opt/data/memory-wiki/.env.local

URL="$NEXT_PUBLIC_SUPABASE_URL"
ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY"
SERVICE_KEY="$SUPABASE_SERVICE_ROLE_KEY"

# 1. Get User ID using service role key
echo "Fetching user ID..."
USER_RESPONSE=$(curl -s -X GET "$URL/auth/v1/admin/users" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY")

USER_ID=$(echo "$USER_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$USER_ID" ]; then
  echo "No users found! Please create a user in Supabase Auth first."
  echo "Raw response: $USER_RESPONSE"
  exit 1
fi
echo "Using user ID: $USER_ID"

# 2. Seed Topics
echo "Seeding topics..."
TOPICS_JSON='[
  {"user_id":"'"$USER_ID"'", "name":"PA Business Compliance", "slug":"pa-business-compliance", "description":"PA annual report filing service, Act 122 rules", "color":"#3b82f6", "icon":"🏛️"},
  {"user_id":"'"$USER_ID"'", "name":"Key My Ride", "slug":"key-my-ride", "description":"Automotive locksmith business", "color":"#f59e0b", "icon":"🔑"},
  {"user_id":"'"$USER_ID"'", "name":"Sports Betting", "slug":"sports-betting", "description":"NBA/NHL betting analysis", "color":"#10b981", "icon":"🏀"},
  {"user_id":"'"$USER_ID"'", "name":"AI Tools & Agents", "slug":"ai-tools-agents", "description":"AI browser agents", "color":"#8b5cf6", "icon":"🤖"},
  {"user_id":"'"$USER_ID"'", "name":"Hermes Agent", "slug":"hermes-agent", "description":"Hermes AI configuration", "color":"#ef4444", "icon":"⚡"},
  {"user_id":"'"$USER_ID"'", "name":"SaaS Development", "slug":"saas-development", "description":"Building SaaS products", "color":"#06b6d4", "icon":"💻"}
]'

TOPICS_RESULT=$(curl -s -X POST "$URL/rest/v1/topics" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d "$TOPICS_JSON")
echo "Topics result: $TOPICS_RESULT"

# 3. Get Topic IDs
get_topic_id() {
  local slug=$1
  curl -s "$URL/rest/v1/topics?select=id,slug&slug=eq.$slug" \
    -H "apikey: $SERVICE_KEY" \
    -H "Authorization: Bearer $SERVICE_KEY" | \
    grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4
}

PA_TOPIC=$(get_topic_id "pa-business-compliance")
BETTING_TOPIC=$(get_topic_id "sports-betting")
SAAS_TOPIC=$(get_topic_id "saas-development")
AI_TOPIC=$(get_topic_id "ai-tools-agents")
HERMES_TOPIC=$(get_topic_id "hermes-agent")

echo "Topic IDs: PA=$PA_TOPIC BETTING=$BETTING_TOPIC SAAS=$SAAS_TOPIC AI=$AI_TOPIC HERMES=$HERMES_TOPIC"

# 4. Seed Logs
echo "Seeding logs..."

LOG1_ID=$(curl -s -X POST "$URL/rest/v1/logs" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "user_id":"'"$USER_ID"'",
    "date":"2026-05-23",
    "title":"Memory Wiki — Building Conversation Archive",
    "summary":"Built personal wiki site to archive all daily conversations with Hermes.",
    "content":"## Session Summary\nStarted building with Next.js 14 + Supabase + Vercel.",
    "platform":"discord"
  }' | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

LOG2_ID=$(curl -s -X POST "$URL/rest/v1/logs" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "user_id":"'"$USER_ID"'",
    "date":"2026-05-23",
    "title":"Sports Betting — Cavs vs Knicks G3",
    "summary":"CLE 1H -2.5 fired at -110.",
    "content":"## Session Summary\nUser locked in CLE 1H -2.5.",
    "platform":"discord"
  }' | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

LOG3_ID=$(curl -s -X POST "$URL/rest/v1/logs" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "user_id":"'"$USER_ID"'",
    "date":"2026-05-22",
    "title":"PA Compliance — Email Notification Setup",
    "summary":"Resend email setup for PA Compliance SaaS.",
    "content":"## Session Summary\nEmail notifications configured.",
    "platform":"discord"
  }' | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "Log IDs: 1=$LOG1_ID 2=$LOG2_ID 3=$LOG3_ID"

# 5. Link Logs to Topics
echo "Linking topics..."
curl -s -X POST "$URL/rest/v1/log_topics" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"log_id\":\"$LOG1_ID\",\"topic_id\":\"$HERMES_TOPIC\"}" > /dev/null

curl -s -X POST "$URL/rest/v1/log_topics" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"log_id\":\"$LOG1_ID\",\"topic_id\":\"$SAAS_TOPIC\"}" > /dev/null

curl -s -X POST "$URL/rest/v1/log_topics" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"log_id\":\"$LOG2_ID\",\"topic_id\":\"$BETTING_TOPIC\"}" > /dev/null

curl -s -X POST "$URL/rest/v1/log_topics" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"log_id\":\"$LOG3_ID\",\"topic_id\":\"$PA_TOPIC\"}" > /dev/null

curl -s -X POST "$URL/rest/v1/log_topics" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"log_id\":\"$LOG3_ID\",\"topic_id\":\"$AI_TOPIC\"}" > /dev/null

echo "✅ Seeding complete!"
