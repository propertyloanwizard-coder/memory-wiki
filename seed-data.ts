// Seed data for initial population
// Run this manually or via a setup endpoint

export const SEED_TOPICS = [
  {
    name: "PA Business Compliance",
    slug: "pa-business-compliance",
    description: "PA annual report filing service, Act 122 rules, entity search, filing forms, notifications",
    color: "#3b82f6",
    icon: "🏛️",
  },
  {
    name: "Key My Ride",
    slug: "key-my-ride",
    description: "Automotive locksmith business, car key replacement, Google reviews, Lehigh Valley & Poconos",
    color: "#f59e0b",
    icon: "🔑",
  },
  {
    name: "Sports Betting",
    slug: "sports-betting",
    description: "NBA/NHL betting analysis, sharp betting workflow, bankroll tracking, slate analysis",
    color: "#10b981",
    icon: "🏀",
  },
  {
    name: "AI Tools & Agents",
    slug: "ai-tools-agents",
    description: "AI browser agents, browser automation, agentic tools, Kimi WebBridge, Perplexity Comet",
    color: "#8b5cf6",
    icon: "🤖",
  },
  {
    name: "Hermes Agent",
    slug: "hermes-agent",
    description: "Hermes AI configuration, skills, cron jobs, kanban, memory management",
    color: "#ef4444",
    icon: "⚡",
  },
  {
    name: "SaaS Development",
    slug: "saas-development",
    description: "Building SaaS products, Next.js, Supabase, Vercel deployment, Readdy.ai",
    color: "#06b6d4",
    icon: "💻",
  },
  {
    name: "Vapi & Phone Systems",
    slug: "vapi-phone-systems",
    description: "Vapi AI voice assistants, Quo/OpenPhone integration, business phone systems",
    color: "#f97316",
    icon: "📞",
  },
  {
    name: "Smart Home",
    slug: "smart-home",
    description: "Philips Hue, OpenHue, home automation, smart devices",
    color: "#84cc16",
    icon: "🏠",
  },
];

export const SEED_LOGS = [
  {
    date: "2026-05-23",
    title: "PA Compliance SaaS — Annual Report Rules & Filing Flow",
    summary:
      "Reviewed PA Department of State business search limitations. Act 122 rules confirmed: Corps due Jun 30, LLCs Sep 30, LPs Dec 31. Built computeAnnualReportInfo logic for the SaaS. Internal routing to /file-annual-report set up. Email notifications configured with Resend.",
    content: `## Session Summary
User asked about PA DOS business search limitations for annual report data.

### Key Findings
- PA DOS doesn't publicly expose annual report filing dates
- "Next Report Due: Unknown" is a known PA DOS limitation
- Annual reports are always due Dec 31 for corporations
- Logic: next_due = Dec 31 of (last_filed_year + 1)

### Act 122 Rules (2025+)
- Corporations: January 1 – June 30
- LLCs: January 1 – September 30
- LPs: January 1 – December 31
- Fee: $7 each
- First filing year: 2025 for ALL pre-existing entities

### Work Completed
- Updated computeAnnualReportInfo with Act 122 rules
- Built /file-annual-report page with URL params
- Created /api/submit-filing endpoint with Resend integration
- Fixed field mismatch between API response and frontend
- Set up internal routing (no external state links)
- Configured email to info@PABusinessComplianceGroup.com
`,
    topics: ["PA Business Compliance", "SaaS Development"],
    platform: "discord",
  },
  {
    date: "2026-05-23",
    title: "Sports Betting — Cavs vs Knicks G3 Analysis",
    summary:
      "Cross-referenced Perplexity slate analysis on CLE/NYK G3. Confirmed CLE -2.5 edge at +5.5% EV. Recommended CLE 1H -2.5 derivative play for cleaner edge. Line moved from -105 to -110 but edge still positive. User fired 1u on CLE 1H -2.5.",
    content: `## Session Summary
User sent a Perplexity-generated slate analysis for Cavs vs Knicks G3.

### Game Details
- CLE -2.5 (-110) / NY +2.5 (-110)
- Total 214 (-110)
- CLE down 0-2 at home in Eastern Conference Finals
- Both teams healthy

### Analysis
- Home down 0-2 teams: historically 13-3 SU in G3
- Cavs 17-7 ATS off a loss this season
- EV calculation: +5.5% at -110
- Recommended 1H -2.5 as cleaner derivative play

### Decision
User locked in CLE 1H -2.5 at -110 for 1u ($110 to win $100).
`,
    topics: ["Sports Betting"],
    platform: "discord",
  },
  {
    date: "2026-05-23",
    title: "AI Browser Agents — Finding Comet Alternatives",
    summary:
      "User wanted an agentic browser similar to Perplexity Comet but less expensive. Researched alternatives: ChatGPT Atlas (Mac-only, $20/mo), Opera Neon (free), BrowserOS (open source), Harpa AI (extension, use own API key). Also reviewed Kimi WebBridge installation on Linux.",
    content: `## Session Summary
User was looking for cost-effective agentic browser alternatives to Perplexity Comet.

### Tools Researched
- ChatGPT Atlas: OpenAI's browser agent, Mac-only, $20/mo for Agent Mode
- Opera Neon: Free, dual agent modes, Card system for tasks
- BrowserOS: Open-source Comet alternative, self-hostable
- Harpa AI: Chrome extension, connect own API key (pay-per-use)
- Kimi WebBridge: Local-first browser automation, free but needs desktop app

### Recommendation
- For Mac users: ChatGPT Atlas
- For Windows/Linux: Opera Neon or Harpa AI extension
- For self-hosting: BrowserOS
`,
    topics: ["AI Tools & Agents"],
    platform: "discord",
  },
  {
    date: "2026-05-23",
    title: "Memory Wiki — Building Conversation Archive",
    summary:
      "User wants a personal wiki site to archive all daily conversations with Hermes. Started building with Next.js 14 + Supabase + Vercel. Database schema includes logs, topics, log_topics, files, and decisions tables. Built landing page, auth, dashboard, logs, and topics pages.",
    content: `## Session Summary
User requested a Memory Wiki — a site to browse daily conversation logs and topic archives.

### Architecture
- Next.js 14 App Router
- Supabase (PostgreSQL + Auth + RLS)
- Vercel hosting
- React Markdown for conversation rendering

### Database Schema
- logs: date, title, summary, content (markdown), platform
- topics: name, slug, description, color, icon
- log_topics: many-to-many relationship
- files: tracked files/artifacts
- decisions: key decisions made

### Pages Built
- Landing page with features
- Login (password + magic link)
- Dashboard with stats and recent activity
- Daily Logs list and detail views
- Topics list and detail views
- Sidebar navigation
- API route for log imports

### Next Steps
- Deploy to Supabase
- Push to GitHub → deploy on Vercel
- Seed with conversation history
`,
    topics: ["SaaS Development", "Hermes Agent"],
    platform: "discord",
  },
  {
    date: "2026-05-22",
    title: "PA Compliance — Email Notification Setup & Kimi Install",
    summary:
      "Worked on Resend email integration for filing submissions. User pasted Windows PowerShell command for Kimi WebBridge install — clarified Linux incompatibility. Explained Kimi WebBridge is a local browser extension + desktop app for AI agent browser automation.",
    content: `## Session Summary
User needed email notifications for PA Compliance SaaS filing submissions.

### Email Setup
- Resend integration code provided in /api/submit-filing/route.ts
- Notifications to info@PABusinessComplianceGroup.com
- Customer confirmation email included
- Requires RESEND_API_KEY in Vercel + resend npm package

### Kimi WebBridge Discussion
- User pasted Windows PowerShell install command
- Explained Linux incompatibility
- Kimi WebBridge = browser extension + local desktop app
- Runs via Chrome DevTools Protocol, data stays local
- Supports Claude Code, Cursor, Codex, Hermes
`,
    topics: ["PA Business Compliance", "AI Tools & Agents"],
    platform: "discord",
  },
];
