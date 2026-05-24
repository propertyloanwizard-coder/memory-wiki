#!/bin/bash
# Full import of conversation history into Memory Wiki
set -e

source /opt/data/memory-wiki/.env.local

URL="$NEXT_PUBLIC_SUPABASE_URL"
SERVICE_KEY="$SUPABASE_SERVICE_ROLE_KEY"

# 1. Get User ID
echo "Fetching user ID..."
USER_RESPONSE=$(curl -s -X GET "$URL/auth/v1/admin/users" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY")

USER_ID=$(echo "$USER_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "User ID: $USER_ID"

# 2. Seed Topics
echo "Seeding topics..."
TOPICS_JSON='[
  {"user_id":"'"$USER_ID"'", "name":"PA Business Compliance", "slug":"pa-business-compliance", "description":"PA annual report filing service, Act 122 compliance rules", "color":"#3b82f6", "icon":"🏛️"},
  {"user_id":"'"$USER_ID"'", "name":"Key My Ride", "slug":"key-my-ride", "description":"Automotive locksmith business — Lehigh Valley & Poconos", "color":"#f59e0b", "icon":"🔑"},
  {"user_id":"'"$USER_ID"'", "name":"Sports Betting", "slug":"sports-betting", "description":"NBA/NHL betting analysis, EV math, injury research", "color":"#10b981", "icon":"🏀"},
  {"user_id":"'"$USER_ID"'", "name":"AI Tools & Agents", "slug":"ai-tools-agents", "description":"AI browser agents, web research, automation tools", "color":"#8b5cf6", "icon":"🤖"},
  {"user_id":"'"$USER_ID"'", "name":"Hermes Agent", "slug":"hermes-agent", "description":"Hermes AI configuration, skills, cron jobs", "color":"#ef4444", "icon":"⚡"},
  {"user_id":"'"$USER_ID"'", "name":"SaaS Development", "slug":"saas-development", "description":"Building and deploying SaaS products on Vercel", "color":"#06b6d4", "icon":"💻"},
  {"user_id":"'"$USER_ID"'", "name":"Smart Morning Routine", "slug":"smart-morning-routine", "description":"Daily briefing assistant — weather, traffic, sports schedule", "color":"#f97316", "icon":"☀️"},
  {"user_id":"'"$USER_ID"'", "name":"Vapi Phone System", "slug":"vapi-phone-system", "description":"AI voice agent for Key My Ride calls via Vapi + Quo OpenPhone", "color":"#a855f7", "icon":"📞"}
]'

curl -s -X POST "$URL/rest/v1/topics" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d "$TOPICS_JSON" > /dev/null

echo "Topics seeded."

# 3. Get Topic IDs
get_topic_id() {
  curl -s "$URL/rest/v1/topics?select=id,slug&slug=eq.$1" \
    -H "apikey: $SERVICE_KEY" \
    -H "Authorization: Bearer $SERVICE_KEY" | \
    grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4
}

PA_TOPIC=$(get_topic_id "pa-business-compliance")
KMR_TOPIC=$(get_topic_id "key-my-ride")
BETTING_TOPIC=$(get_topic_id "sports-betting")
AI_TOPIC=$(get_topic_id "ai-tools-agents")
HERMES_TOPIC=$(get_topic_id "hermes-agent")
SAAS_TOPIC=$(get_topic_id "saas-development")
MORNING_TOPIC=$(get_topic_id "smart-morning-routine")
VAPI_TOPIC=$(get_topic_id "vapi-phone-system")

echo "Topic IDs: PA=$PA_TOPIC KMR=$KMR_TOPIC BETTING=$BETTING_TOPIC AI=$AI_TOPIC HERMES=$HERMES_TOPIC SAAS=$SAAS_TOPIC MORNING=$MORNING_TOPIC VAPI=$VAPI_TOPIC"

# 4. Seed Logs
echo "Seeding conversation logs..."

# Log 1: Memory Wiki Build (May 23, 2026)
curl -s -X POST "$URL/rest/v1/logs" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"'"$USER_ID"'","date":"2026-05-23","title":"Memory Wiki — Building Conversation Archive","summary":"Built and deployed personal wiki site to archive all daily conversations with Hermes. Next.js 14 + Supabase + Vercel. Fixed middleware crash, deployed via CLI.","content":"## Session Summary\nBuilt Memory Wiki from scratch to archive daily AI conversations.\n\n### Tech Stack\n- Next.js 14 App Router + TypeScript\n- Supabase (PostgreSQL + Auth)\n- Vercel deployment\n\n### Challenges\n- NPM corrupt package-lock.json on Node 20\n- @supabase/ssr middleware crashed in edge runtime\n- Vercel SSO protection gate blocked access\n- Supabase env vars missing in Vercel (ANON_KEY)\n- Magic links redirecting to localhost instead of production URL\n\n### Resolutions\n- Deployed via Vercel CLI bypassing org protection\n- Stripped middleware to simple cookie check\n- Added NEXT_PUBLIC_SUPABASE_ANON_KEY to Vercel env vars\n- Fixed Supabase URL Configuration for production redirects\n\n### Deployment\n- URL: https://memory-wiki-rho.vercel.app\n- Repository: github.com/propertyloanwizard-coder/memory-wiki","platform":"discord"}' > /dev/null

# Log 2: PA Compliance SaaS (May 2026)
curl -s -X POST "$URL/rest/v1/logs" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"'"$USER_ID"'","date":"2026-05-20","title":"PA Compliance SaaS — Global Intelligence API Integration","summary":"Integrated Global Intelligence API for PA entity search. Updated from decennial rules to Act 122 annual report requirements (2025+).","content":"## PA Business Compliance Group SaaS\n\n### Act 122 Rules (2025+)\n- **Corporations**: Annual report due June 30 ($7)\n- **LLCs**: Annual report due September 30 ($7)\n- **LPs/LLPs**: Annual report due December 31 ($7)\n\n### Key Decisions\n- Filing forms now point to INTERNAL SaaS flow, NOT state website\n- Notifications sent to info@PABusinessComplianceGroup.com\n- Readdy.ai embeds wizard via iframe\n- Target: 2.4M+ PA entities, $99-$199/yr subscription model\n\n### App: pa-compliance-saas.vercel.app\n- Entity search via Global Intelligence API\n- Compliance status derived from entity_type + last_annual_report\n- Automatic deadline calculation based on entity type\n- Built on Readdy.ai (SPA architecture)","platform":"discord"}' > /dev/null

# Log 3: Key My Ride Business
curl -s -X POST "$URL/rest/v1/logs" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"'"$USER_ID"'","date":"2026-05-19","title":"Key My Ride — Automotive Locksmith Business","summary":"Key My Ride locksmith business overview: 586+ 5-star Google reviews, serves Lehigh Valley & Poconos. Critical: NO pricing on website.","content":"## Key My Ride Business Profile\n\n### Overview\n- Website: keymyride.com (built on Readdy.ai)\n- Phone: 484-293-1717\n- Service area: Lehigh Valley & Poconos, PA\n- 586+ five-star Google reviews\n\n### Critical Marketing Rule\n- **NO pricing on website** (no dollar amounts, no ranges, no estimates)\n- Google penalizes locksmiths for price displays\n- Use educational \"What to Expect\" pages explaining cost variables\n- Add disclaimer to call for free quote\n\n### Note\n- Both keymyride.com and pabusinesscompliancegroup.com are Readdy.ai SPAs\n- SPAs struggle with AI search indexing\n- User performs automotive diagnostics on 2015 Chrysler 200 with Autel IM608","platform":"discord"}' > /dev/null

# Log 4: Sports Betting — Cavs vs Knicks G3
curl -s -X POST "$URL/rest/v1/logs" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"'"$USER_ID"'","date":"2026-05-23","title":"Sports Betting — Cavs vs Knicks G3 Analysis","summary":"CLE 1H -2.5 fired at -110. Risk $110 to win $100. Convergence between Perplexity analysis and Hermes cross-reference.","content":"## NBA Betting: CLE vs NYK G3\n\n### Bet Placed\n- **Play**: CLE 1H -2.5 at -110\n- **Stake**: Risk $110 to Win $100\n- **Unit**: 1u ($110 risk at -110)\n\n### Analysis Workflow\n1. Perplexity generated slate analysis\n2. Hermes cross-referenced: injuries, line movement, EV math, traps\n3. Converged on CLE 1H -2.5\n4. Line moved to -110, locked in\n\n### Betting Rules\n- Bankroll: Started $1K → ~$1,921 (May 2026, +92.1% ROI)\n- Target: 1-3 plays/slate max\n- Rule 13: \"Convergence ≠ insurance\"\n- Perplexity generates analysis → Hermes validates with structural fades\n- Live injury research required before any recommendation","platform":"discord"}' > /dev/null

# Log 5: AI Tools & Agents Research
curl -s -X POST "$URL/rest/v1/logs" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"'"$USER_ID"'","date":"2026-05-23","title":"AI Tools Research — 2026 Landscape","summary":"Researched latest AI tools: GPT-5.4, Claude Opus 4.7, Perplexity Comet, agentic browsers (ChatGPT Atlas, Opera Neon, BrowserOS, Harpa AI).","content":"## AI Tools Landscape 2026\n\n### Latest Models\n- GPT-5.4 (OpenAI)\n- Claude Opus 4.7 (Anthropic)\n- Perplexity Comet\n\n### Agentic Browser Alternatives\n- **ChatGPT Atlas**: OpenAI agentic browser\n- **Opera Neon**: Concept browser with AI integration\n- **BrowserOS**: Cloud browser with agent capabilities\n- **Harpa AI**: Chrome extension with own API key\n\n### Kimi WebBridge\n- Linux install: .AppImage local backend + Chrome extension\n- User declined due to cost\n\n### Note\n- Both Key My Ride and PA Compliance built on Readdy.ai\n- SPAs struggle with AI search indexing\n- Need SEO optimization strategy for both sites","platform":"discord"}' > /dev/null

# Log 6: Hermes Agent Configuration
curl -s -X POST "$URL/rest/v1/logs" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"'"$USER_ID"'","date":"2026-05-22","title":"Hermes Agent — Cron Jobs & Configuration","summary":"Hermes Agent setup with cron jobs, messaging gateway, skills. Google OAuth project: valiant-carrier-496519-i2.","content":"## Hermes Agent Configuration\n\n### Infrastructure\n- Google OAuth: project valiant-carrier-496519-i2\n- Token: /opt/data/google_token.json\n- All Google APIs enabled\n\n### Cron Jobs\n- Automated tasks running on schedule\n- Delivery to Discord home channel\n\n### Skills\n- 80+ skills available covering devops, creative, data science, gaming, mlops, research, etc.\n\n### Messaging\n- Connected: Discord (Home channel)\n- Delivery targets: origin, local, discord\n\n### User Preferences\n- Full name: Gregory Vassilatos\n- Customers address as \"Greg\"\n- Prefers step-by-step execution plans\n- Demands math-focused ROI breakdowns\n- Wants specific parameters, not general guidance","platform":"discord"}' > /dev/null

# Log 7: Vapi Phone System Setup
curl -s -X POST "$URL/rest/v1/logs" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"'"$USER_ID"'","date":"2026-05-21","title":"Vapi AI + Quo OpenPhone — Business Comms Setup","summary":"Vapi AI voice agent integrated with Quo OpenPhone for Key My Ride. API raw key auth, masks participant numbers.","content":"## Vapi + Quo OpenPhone Setup\n\n### Vapi Configuration\n- Phone: +14845589479\n\n### Quo OpenPhone\n- Login: keymyride@gmail.com\n- Auth: raw key auth, masks participant numbers\n- MCP: /opt/data/armavita-quo-mcp\n\n### Phone Numbers\n- **Key My Ride**: (484) 293-1717 (PNTJp9MZ2j)\n- **Compliance**: (717) 255-4201 (PNK5EvZzVl)\n\n### Integration\n- Vapi handles AI voice calls\n- Quo handles SMS/text messaging\n- Both integrated for business communication automation","platform":"discord"}' > /dev/null

echo "Logs seeded."

# 5. Link Logs to Topics
echo "Linking topics..."

# Memory Wiki log → Hermes + SaaS
curl -s -X POST "$URL/rest/v1/log_topics" -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" -H "Content-Type: application/json" -d '{"topic_id":"'"$HERMES_TOPIC"'"}' > /dev/null
curl -s -X POST "$URL/rest/v1/log_topics" -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" -H "Content-Type: application/json" -d '{"topic_id":"'"$SAAS_TOPIC"'"}' > /dev/null

# PA Compliance log → PA Compliance
curl -s -X POST "$URL/rest/v1/log_topics" -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" -H "Content-Type: application/json" -d '{"topic_id":"'"$PA_TOPIC"'"}' > /dev/null

# Key My Ride log → KMR
curl -s -X POST "$URL/rest/v1/log_topics" -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" -H "Content-Type: application/json" -d '{"topic_id":"'"$KMR_TOPIC"'"}' > /dev/null

# Betting log → Betting
curl -s -X POST "$URL/rest/v1/log_topics" -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" -H "Content-Type: application/json" -d '{"topic_id":"'"$BETTING_TOPIC"'"}' > /dev/null

# AI Tools log → AI
curl -s -X POST "$URL/rest/v1/log_topics" -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" -H "Content-Type: application/json" -d '{"topic_id":"'"$AI_TOPIC"'"}' > /dev/null

# Hermes Config log → Hermes
curl -s -X POST "$URL/rest/v1/log_topics" -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" -H "Content-Type: application/json" -d '{"topic_id":"'"$HERMES_TOPIC"'"}' > /dev/null

# Vapi log → VAPI
curl -s -X POST "$URL/rest/v1/log_topics" -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" -H "Content-Type: application/json" -d '{"topic_id":"'"$VAPI_TOPIC"'"}' > /dev/null

echo "✅ Full import complete!"
