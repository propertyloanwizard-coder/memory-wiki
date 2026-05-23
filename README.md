# Memory Wiki

Your personal archive of daily conversations, decisions, and work with Hermes AI.

## Features

- **Daily Logs**: Every conversation session archived with date, summary, and full transcript
- **Topic Index**: Click any topic (PA Compliance, Betting, AI Tools, etc.) to see all related conversations
- **Search & Filter**: Find anything by topic, date, or keyword
- **Markdown Rendering**: Conversations rendered with full markdown support
- **Private & Secure**: Authenticated access via Supabase Auth with RLS policies

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React + Tailwind CSS
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Auth**: Supabase Auth (email/password + magic links)
- **Hosting**: Vercel (free tier)
- **Rendering**: React Markdown + GFM support

## Getting Started

### 1. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and paste the contents of `schema.sql`
3. Run the SQL to create all tables and RLS policies

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
APP_URL=http://localhost:3000
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Create Your Account

1. Go to Supabase Dashboard → Authentication → Users
2. Create a new user with your email and password
3. Sign in at [http://localhost:3000/login](http://localhost:3000/login)

### 6. Seed Initial Data

Run the seed script to populate your wiki with conversation history:

```bash
# You can run this via Supabase SQL Editor or a script
# The seed data is in seed-data.ts
```

## Deploying to Vercel

1. Push this repo to GitHub
2. Create a new project on Vercel, connect your repo
3. Add environment variables in Vercel settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `APP_URL` (your Vercel URL)
4. Deploy

## Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (auto-created on signup) |
| `logs` | Daily conversation sessions |
| `topics` | Subject categories (PA Compliance, Betting, etc.) |
| `log_topics` | Many-to-many: which topics each log covers |
| `files` | Files/artifacts mentioned in conversations |
| `decisions` | Key decisions made during conversations |

### Row Level Security

All tables are protected by RLS policies. Users can only see their own data.

## API Endpoints

### POST /api/logs/import

Import a new conversation log. Requires `CRON_SECRET` header.

```json
{
  "date": "2026-05-23",
  "title": "PA Compliance SaaS — Annual Report Rules",
  "summary": "Reviewed Act 122 rules...",
  "content": "# Full markdown...",
  "topics": ["PA Business Compliance", "SaaS Development"],
  "platform": "discord"
}
```

## Project Structure

```
memory-wiki/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout
│   ├── login/page.tsx           # Auth login
│   ├── dashboard/
│   │   ├── layout.tsx           # Dashboard layout + auth check
│   │   ├── page.tsx             # Dashboard home
│   │   ├── logs/page.tsx        # All logs list
│   │   ├── logs/[id]/page.tsx   # Single log detail
│   │   ├── topics/page.tsx      # All topics list
│   │   └── topics/[slug]/page.tsx # Single topic detail
│   └── api/
│       ├── logs/import/route.ts # Import API
│       └── topics/route.ts      # Topics API
├── components/
│   └── dashboard/
│       ├── header.tsx           # Top navigation
│       └── sidebar.tsx          # Side navigation
├── lib/supabase/
│   ├── client.ts                # Browser client
│   └── server.ts                # Server + admin clients
├── middleware.ts                # Auth route protection
├── schema.sql                   # Database schema
└── seed-data.ts                 # Initial seed data
```

## Future Enhancements

- [ ] Search functionality (full-text search across logs)
- [ ] File upload support for attachments
- [ ] Timeline view of conversations
- [ ] Export logs as PDF/Markdown
- [ ] Auto-import from session transcripts
- [ ] Topic suggestions via AI
- [ ] Decision tracking with status updates
